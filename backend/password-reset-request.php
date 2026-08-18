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

$email = trim(
    $donnees["email"] ?? ""
);

if (
    $email === "" ||
    !filter_var(
        $email,
        FILTER_VALIDATE_EMAIL
    )
) {
    repondre([
        "erreur" => "Adresse email invalide."
    ], 400);
}

try {

    /*
     * Recherche du compte.
     */

    $requete = $pdo->prepare(
        "SELECT id
         FROM users
         WHERE email = :email
         LIMIT 1"
    );

    $requete->execute([
        ":email" => $email
    ]);

    $utilisateur = $requete->fetch();

    /*
     * Réponse volontairement générique.
     *
     * On ne révèle pas si l'adresse existe.
     */

    if (!$utilisateur) {
        repondre([
            "succes" => true,
            "message" =>
                "Si un compte correspond à cette adresse, un lien de réinitialisation sera généré."
        ]);
    }

    $userId = (int) $utilisateur["id"];

    /*
     * Invalider les anciens tokens.
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

    /*
     * Générer le token.
     *
     * Le token en clair ne sera jamais stocké en BDD.
     */

    $token = bin2hex(
        random_bytes(32)
    );

    $tokenHash = hash(
        "sha256",
        $token
    );

    $requete = $pdo->prepare(
    "INSERT INTO password_resets
    (
        user_id,
        token_hash,
        expires_at
    )
    VALUES
    (
        :user_id,
        :token_hash,
        DATE_ADD(NOW(), INTERVAL 30 MINUTE)
    )"
);

$requete->execute([
    ":user_id" => $userId,
    ":token_hash" => $tokenHash
]);


    /*
     * MODE TEST LOCAL
     *
     * En production, ce token devra être envoyé
     * uniquement par email.
     */

    $lien =

        "http://localhost/TaskFlow/reinitialiser-mot-de-passe.html?token=" .
        urlencode($token);

    repondre([
        "succes" => true,
        "message" =>
            "Si un compte correspond à cette adresse, un lien de réinitialisation sera généré.",
        "lien_test" => $lien
    ]);

}
catch (PDOException $erreur) {

    error_log(
        "SEDAKOR PASSWORD RESET REQUEST ERROR : " .
        $erreur->getMessage()
    );

    repondre([
        "erreur" =>
            "Impossible de traiter la demande."
    ], 500);
}
