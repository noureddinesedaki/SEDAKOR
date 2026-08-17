<?php

session_start();

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
// RÉCUPÉRER EMAIL / MOT DE PASSE
// ============================================================

$email =
    trim(
        $donnees["email"] ?? ""
    );


$password =
    $donnees["password"] ?? "";


// ============================================================
// VALIDATION EMAIL
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


// ============================================================
// VALIDATION MOT DE PASSE
// ============================================================

if (
    !is_string($password) ||
    $password === ""
) {

    repondre([
        "erreur" =>
            "Le mot de passe est obligatoire."
    ], 400);

}


// ============================================================
// RECHERCHER L'UTILISATEUR
// ============================================================

try {

    $requete =
        $pdo->prepare(
            "SELECT
                id,
                nom,
                email,
                password
             FROM users
             WHERE email = :email
             LIMIT 1"
        );


    $requete->execute([
        ":email" =>
            $email
    ]);


    $utilisateur =
        $requete->fetch();


    // ========================================================
    // VÉRIFIER LE COMPTE ET LE MOT DE PASSE
    // ========================================================

    if (
        !$utilisateur ||
        !password_verify(
            $password,
            $utilisateur["password"]
        )
    ) {

        repondre([
            "erreur" =>
                "Email ou mot de passe incorrect."
        ], 401);

    }


    // ========================================================
    // RÉGÉNÉRER L'IDENTIFIANT DE SESSION
    // ========================================================

    session_regenerate_id(true);


    // ========================================================
    // ENREGISTRER L'UTILISATEUR EN SESSION
    // ========================================================

    $_SESSION["user_id"] =
        (int)
        $utilisateur["id"];


    $_SESSION["user_nom"] =
        $utilisateur["nom"];


    $_SESSION["user_email"] =
        $utilisateur["email"];


    // ========================================================
    // RÉPONSE
    // ========================================================

    repondre([

        "succes" =>
            true,

        "message" =>
            "Connexion réussie.",

        "utilisateur" => [

            "id" =>
                (int)
                $utilisateur["id"],

            "nom" =>
                $utilisateur["nom"],

            "email" =>
                $utilisateur["email"]

        ]

    ]);

}
catch (
    PDOException $e
) {

    error_log(
        "SEDAKOR LOGIN PDO ERROR: " .
        $e->getMessage()
    );


    repondre([
        "erreur" =>
            "Impossible de se connecter."
    ], 500);

}