<?php

require_once __DIR__ . "/config.php";

header("Content-Type: application/json; charset=UTF-8");

function repondre($donnees, $code = 200)
{
    http_response_code($code);

    echo json_encode(
        $donnees,
        JSON_UNESCAPED_UNICODE
    );

    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    repondre([
        "erreur" => "Méthode HTTP non autorisée."
    ], 405);
}

$contenu = file_get_contents("php://input");

if (
    $contenu === false ||
    trim($contenu) === ""
) {
    repondre([
        "erreur" => "Aucune donnée reçue."
    ], 400);
}

$donnees = json_decode(
    $contenu,
    true
);

if (
    json_last_error() !== JSON_ERROR_NONE ||
    !is_array($donnees)
) {
    repondre([
        "erreur" => "JSON invalide."
    ], 400);
}

$token = trim(
    $donnees["token"] ?? ""
);

$nouveauMotDePasse =
    $donnees["nouveau_mot_de_passe"] ?? "";

$confirmation =
    $donnees["confirmation"] ?? "";

if ($token === "") {
    repondre([
        "erreur" => "Token de réinitialisation manquant."
    ], 400);
}

if (
    !is_string($nouveauMotDePasse) ||
    $nouveauMotDePasse === ""
) {
    repondre([
        "erreur" => "Le nouveau mot de passe est obligatoire."
    ], 400);
}

if (
    strlen($nouveauMotDePasse) < 8
) {
    repondre([
        "erreur" =>
            "Le nouveau mot de passe doit contenir au moins 8 caractères."
    ], 400);
}

if (
    $nouveauMotDePasse !== $confirmation
) {
    repondre([
        "erreur" =>
            "Les mots de passe ne correspondent pas."
    ], 400);
}

$tokenHash = hash(
    "sha256",
    $token
);

try {

    $pdo->beginTransaction();

    /*
     * Vérifier le token.
     *
     * Il doit :
     * - exister ;
     * - ne pas avoir été utilisé ;
     * - ne pas être expiré.
     */

    $requete = $pdo->prepare(
        "SELECT
            id,
            user_id
         FROM password_resets
         WHERE token_hash = :token_hash
           AND used_at IS NULL
           AND expires_at > NOW()
         LIMIT 1
         FOR UPDATE"
    );

    $requete->execute([
        ":token_hash" => $tokenHash
    ]);

    $reset = $requete->fetch();

    if (!$reset) {

        $pdo->rollBack();

        repondre([
            "erreur" =>
                "Le lien de réinitialisation est invalide ou expiré."
        ], 400);
    }

    $userId = (int) $reset["user_id"];

    /*
     * Nouveau hash du mot de passe.
     */

    $passwordHash = password_hash(
        $nouveauMotDePasse,
        PASSWORD_DEFAULT
    );

    if ($passwordHash === false) {

        $pdo->rollBack();

        repondre([
            "erreur" =>
                "Impossible de sécuriser le nouveau mot de passe."
        ], 500);
    }

    /*
     * Mettre à jour le mot de passe.
     */

    $requete = $pdo->prepare(
        "UPDATE users
         SET password = :password
         WHERE id = :user_id"
    );

    $requete->execute([
        ":password" => $passwordHash,
        ":user_id" => $userId
    ]);

    /*
     * Invalider le token utilisé.
     */

    $requete = $pdo->prepare(
        "UPDATE password_resets
         SET used_at = NOW()
         WHERE id = :id"
    );

    $requete->execute([
        ":id" => (int) $reset["id"]
    ]);

    /*
     * Invalider également les autres anciens tokens
     * de cet utilisateur.
     */

    $requete = $pdo->prepare(
        "UPDATE password_resets
         SET used_at = NOW()
         WHERE user_id = :user_id
           AND used_at IS NULL"
    );

    $requete->execute([
        ":user_id" => $userId
    ]);

    $pdo->commit();

    repondre([
        "succes" => true,
        "message" =>
            "Votre mot de passe a été réinitialisé. Vous pouvez maintenant vous connecter."
    ]);

}
catch (PDOException $erreur) {

    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    error_log(
        "SEDAKOR PASSWORD RESET ERROR : " .
        $erreur->getMessage()
    );

    repondre([
        "erreur" =>
            "Impossible de réinitialiser le mot de passe."
    ], 500);
}
