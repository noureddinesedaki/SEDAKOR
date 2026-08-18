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
// MÉTHODE HTTP
// ============================================================

$method =
    $_SERVER["REQUEST_METHOD"];


if ($method === "GET") {

    try {

        $requete =
            $pdo->prepare(
                "SELECT
                    id,
                    nom,
                    email
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


        repondre([
            "succes" => true,
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
    catch (PDOException $erreur) {

        error_log(
            "Erreur GET account.php : " .
            $erreur->getMessage()
        );

        repondre([
            "erreur" =>
                "Erreur serveur."
        ], 500);

    }

}


// ============================================================
// MODIFICATION DU PROFIL
// ============================================================

if ($method !== "PUT") {

    repondre([
        "erreur" =>
            "Méthode HTTP non autorisée."
    ], 405);

}


$contenu =
    file_get_contents(
        "php://input"
    );


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
// NOM
// ============================================================

$nom =
    trim(
        $donnees["nom"] ?? ""
    );


if ($nom === "") {

    repondre([
        "erreur" =>
            "Le nom est obligatoire."
    ], 400);

}


if (mb_strlen($nom) < 2) {

    repondre([
        "erreur" =>
            "Le nom doit contenir au moins 2 caractères."
    ], 400);

}


if (mb_strlen($nom) > 100) {

    repondre([
        "erreur" =>
            "Le nom ne peut pas dépasser 100 caractères."
    ], 400);

}


// ============================================================
// EMAIL
// ============================================================

$email =
    trim(
        $donnees["email"] ?? ""
    );


if ($email === "") {

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


$email =
    strtolower($email);


// ============================================================
// VÉRIFIER SI L'EMAIL EST DÉJÀ UTILISÉ
// ============================================================

try {

    $requete =
        $pdo->prepare(
            "SELECT id
             FROM users
             WHERE email = :email
             AND id != :id
             LIMIT 1"
        );

    $requete->execute([
        ":email" => $email,
        ":id" => $userId
    ]);


    if ($requete->fetch()) {

        repondre([
            "erreur" =>
                "Cette adresse email est déjà utilisée."
        ], 409);

    }


    // ========================================================
    // METTRE À JOUR LE PROFIL
    // ========================================================

    $requete =
        $pdo->prepare(
            "UPDATE users
             SET
                nom = :nom,
                email = :email
             WHERE id = :id"
        );


    $requete->execute([
        ":nom" => $nom,
        ":email" => $email,
        ":id" => $userId
    ]);


    // ========================================================
    // METTRE À JOUR LA SESSION
    // ========================================================

    $_SESSION["user_nom"] =
        $nom;

    $_SESSION["user_email"] =
        $email;


    // ========================================================
    // RÉPONSE
    // ========================================================

    repondre([
        "succes" => true,

        "message" =>
            "Profil modifié avec succès.",

        "utilisateur" => [
            "id" =>
                (int)
                $userId,

            "nom" =>
                $nom,

            "email" =>
                $email
        ]
    ]);

}
catch (PDOException $erreur) {

    error_log(
        "Erreur PUT account.php : " .
        $erreur->getMessage()
    );

    repondre([
        "erreur" =>
            "Impossible de modifier le profil."
    ], 500);

}