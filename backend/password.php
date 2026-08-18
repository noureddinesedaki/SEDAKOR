<?php

require_once __DIR__ . "/session-config.php";

header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . "/config.php";


// ============================================================
// FONCTION DE RÉPONSE
// ============================================================

function repondre($donnees, $code = 200)
{
    http_response_code($code);

    echo json_encode(
        $donnees,
        JSON_UNESCAPED_UNICODE
    );

    exit;
}


// ============================================================
// VÉRIFIER LA CONNEXION
// ============================================================

$userId =
    $_SESSION["user_id"] ??
    null;


if ($userId === null) {

    repondre([
        "erreur" =>
            "Vous devez être connecté."
    ], 401);

}


// ============================================================
// AUTORISER UNIQUEMENT PUT
// ============================================================

if (
    $_SERVER["REQUEST_METHOD"] !== "PUT"
) {

    repondre([
        "erreur" =>
            "Méthode HTTP non autorisée."
    ], 405);

}


// ============================================================
// RÉCUPÉRER LE JSON
// ============================================================

$contenu =
    file_get_contents("php://input");


if (
    $contenu === false ||
    trim($contenu) === ""
) {

    repondre([
        "erreur" =>
            "Aucune donnée reçue."
    ], 400);

}


$donnees =
    json_decode(
        $contenu,
        true
    );


if (
    json_last_error() !==
    JSON_ERROR_NONE
) {

    repondre([
        "erreur" =>
            "JSON invalide."
    ], 400);

}


// ============================================================
// RÉCUPÉRER LES MOTS DE PASSE
// ============================================================

$ancienMotDePasse =
    $donnees["ancien_mot_de_passe"] ??
    "";

$nouveauMotDePasse =
    $donnees["nouveau_mot_de_passe"] ??
    "";

$confirmation =
    $donnees["confirmation"] ??
    "";


// ============================================================
// VALIDATION
// ============================================================

if (
    !is_string($ancienMotDePasse) ||
    $ancienMotDePasse === ""
) {

    repondre([
        "erreur" =>
            "L'ancien mot de passe est obligatoire."
    ], 400);

}


if (
    !is_string($nouveauMotDePasse) ||
    $nouveauMotDePasse === ""
) {

    repondre([
        "erreur" =>
            "Le nouveau mot de passe est obligatoire."
    ], 400);

}


if (
    !is_string($confirmation) ||
    $confirmation === ""
) {

    repondre([
        "erreur" =>
            "La confirmation du mot de passe est obligatoire."
    ], 400);

}


// ============================================================
// LONGUEUR DU NOUVEAU MOT DE PASSE
// ============================================================

if (
    strlen($nouveauMotDePasse) < 8
) {

    repondre([
        "erreur" =>
            "Le nouveau mot de passe doit contenir au moins 8 caractères."
    ], 400);

}


if (
    strlen($nouveauMotDePasse) > 255
) {

    repondre([
        "erreur" =>
            "Le nouveau mot de passe est trop long."
    ], 400);

}


// ============================================================
// CONFIRMATION
// ============================================================

if (
    !hash_equals(
        $nouveauMotDePasse,
        $confirmation
    )
) {

    repondre([
        "erreur" =>
            "Les nouveaux mots de passe ne correspondent pas."
    ], 400);

}


// ============================================================
// RÉCUPÉRER LE MOT DE PASSE ACTUEL
// ============================================================

try {

    $requete =
        $pdo->prepare(
            "SELECT password
             FROM users
             WHERE id = :id
             LIMIT 1"
        );

    $requete->execute([
        ":id" => $userId
    ]);


    $utilisateur =
        $requete->fetch();


    if (!$utilisateur) {

        repondre([
            "erreur" =>
                "Utilisateur introuvable."
        ], 404);

    }


    // ========================================================
    // VÉRIFIER L'ANCIEN MOT DE PASSE
    // ========================================================

    if (
        !password_verify(
            $ancienMotDePasse,
            $utilisateur["password"]
        )
    ) {

        repondre([
            "erreur" =>
                "L'ancien mot de passe est incorrect."
        ], 401);

    }


    // ========================================================
    // EMPÊCHER DE RÉUTILISER LE MÊME MOT DE PASSE
    // ========================================================

    if (
        password_verify(
            $nouveauMotDePasse,
            $utilisateur["password"]
        )
    ) {

        repondre([
            "erreur" =>
                "Le nouveau mot de passe doit être différent de l'ancien."
        ], 400);

    }


    // ========================================================
    // CRÉER LE NOUVEAU HASH
    // ========================================================

    $nouveauHash =
        password_hash(
            $nouveauMotDePasse,
            PASSWORD_DEFAULT
        );


    if (
        $nouveauHash === false
    ) {

        repondre([
            "erreur" =>
                "Impossible de sécuriser le nouveau mot de passe."
        ], 500);

    }


    // ========================================================
    // METTRE À JOUR LA BASE
    // ========================================================

    $requete =
        $pdo->prepare(
            "UPDATE users
             SET password = :password
             WHERE id = :id"
        );


    $requete->execute([
        ":password" => $nouveauHash,
        ":id" => $userId
    ]);


    // ========================================================
    // RÉGÉNÉRER LA SESSION
    // ========================================================

    session_regenerate_id(true);


    // ========================================================
    // RÉPONSE
    // ========================================================

    repondre([
        "succes" =>
            true,

        "message" =>
            "Mot de passe modifié avec succès."
    ]);

}
catch (PDOException $erreur) {

    error_log(
        "Erreur password.php : " .
        $erreur->getMessage()
    );

    repondre([
        "erreur" =>
            "Impossible de modifier le mot de passe."
    ], 500);

}