<?php

header("Content-Type: application/json; charset=UTF-8");

require_once "config.php";


// ============================================================
// FONCTION DE RÉPONSE JSON
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
// AUTORISER UNIQUEMENT POST
// ============================================================

if (
    $_SERVER["REQUEST_METHOD"] !== "POST"
) {

    repondre([
        "erreur" =>
            "Méthode HTTP non autorisée."
    ], 405);

}


// ============================================================
// RÉCUPÉRER LES DONNÉES JSON
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
// RÉCUPÉRER NOM / EMAIL / MOT DE PASSE
// ============================================================

$nom =
    trim(
        $donnees["nom"] ?? ""
    );


$email =
    trim(
        $donnees["email"] ?? ""
    );


$password =
    $donnees["password"] ?? "";


// ============================================================
// VALIDATION DU NOM
// ============================================================

if (
    $nom === ""
) {

    repondre([
        "erreur" =>
            "Le nom est obligatoire."
    ], 400);

}


if (
    mb_strlen($nom) > 100
) {

    repondre([
        "erreur" =>
            "Le nom ne peut pas dépasser 100 caractères."
    ], 400);

}


// ============================================================
// VALIDATION DE L'EMAIL
// ============================================================

if (
    $email === ""
) {

    repondre([
        "erreur" =>
            "L'adresse email est obligatoire."
    ], 400);

}


if (
    !filter_var(
        $email,
        FILTER_VALIDATE_EMAIL
    )
) {

    repondre([
        "erreur" =>
            "L'adresse email est invalide."
    ], 400);

}


if (
    mb_strlen($email) > 255
) {

    repondre([
        "erreur" =>
            "L'adresse email est trop longue."
    ], 400);

}


// ============================================================
// VALIDATION DU MOT DE PASSE
// ============================================================

if (
    !is_string($password)
) {

    repondre([
        "erreur" =>
            "Le mot de passe est invalide."
    ], 400);

}


if (
    strlen($password) < 8
) {

    repondre([
        "erreur" =>
            "Le mot de passe doit contenir au moins 8 caractères."
    ], 400);

}


if (
    strlen($password) > 72
) {

    repondre([
        "erreur" =>
            "Le mot de passe ne peut pas dépasser 72 caractères."
    ], 400);

}


// ============================================================
// VÉRIFIER SI L'EMAIL EXISTE DÉJÀ
// ============================================================

try {

    $verification =
        $pdo->prepare(
            "SELECT id
             FROM users
             WHERE email = :email
             LIMIT 1"
        );


    $verification->execute([
        ":email" =>
            $email
    ]);


    if (
        $verification->fetch()
    ) {

        repondre([
            "erreur" =>
                "Cette adresse email est déjà utilisée."
        ], 409);

    }


    // ========================================================
    // HASH DU MOT DE PASSE
    // ========================================================

    $passwordHash =
        password_hash(
            $password,
            PASSWORD_DEFAULT
        );


    if (
        $passwordHash === false
    ) {

        repondre([
            "erreur" =>
                "Impossible de sécuriser le mot de passe."
        ], 500);

    }


    // ========================================================
    // CRÉER LE COMPTE
    // ========================================================

    $requete =
        $pdo->prepare(
            "INSERT INTO users
            (
                nom,
                email,
                password
            )
            VALUES
            (
                :nom,
                :email,
                :password
            )"
        );


    $requete->execute([

        ":nom" =>
            $nom,

        ":email" =>
            $email,

        ":password" =>
            $passwordHash

    ]);


    // ========================================================
    // RÉPONSE
    // ========================================================

    repondre([

        "succes" =>
            true,

        "message" =>
            "Compte créé avec succès.",

        "id" =>
            (int)
            $pdo->lastInsertId()

    ], 201);


}
catch (
    PDOException $e
) {

    error_log(
        "SEDAKOR REGISTER PDO ERROR: " .
        $e->getMessage()
    );


    repondre([
        "erreur" =>
            "Impossible de créer le compte."
    ], 500);

}