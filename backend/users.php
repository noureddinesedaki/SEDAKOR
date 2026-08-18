<?php

require_once __DIR__ . "/session-config.php";

header(
    "Content-Type: application/json; charset=UTF-8"
);

require_once __DIR__ . "/config.php";


// ============================================================
// RÉPONSE JSON
// ============================================================

function repondre(
    $donnees,
    $code = 200
) {

    http_response_code($code);

    echo json_encode(
        $donnees,
        JSON_UNESCAPED_UNICODE
    );

    exit;
}


// ============================================================
// VÉRIFIER LA SESSION
// ============================================================

if (
    !isset($_SESSION["user_id"]) ||
    !is_numeric($_SESSION["user_id"]) ||
    (int) $_SESSION["user_id"] <= 0
) {

    repondre(
        [
            "erreur" =>
                "Utilisateur non connecté."
        ],
        401
    );

}


$userId =
    (int) $_SESSION["user_id"];


// ============================================================
// MÉTHODE HTTP
// ============================================================

if (
    ($_SERVER["REQUEST_METHOD"] ?? "GET")
    !== "GET"
) {

    repondre(
        [
            "erreur" =>
                "Méthode HTTP non autorisée."
        ],
        405
    );

}


// ============================================================
// RECHERCHE
// ============================================================

$recherche =
    trim(
        $_GET["recherche"] ??
        ""
    );


// ============================================================
// VALIDATION
// ============================================================

if (
    mb_strlen($recherche) < 2
) {

    repondre(
        [
            "succes" =>
                true,

            "utilisateurs" =>
                []
        ]
    );

}


if (
    mb_strlen($recherche) > 100
) {

    repondre(
        [
            "erreur" =>
                "La recherche ne peut pas dépasser 100 caractères."
        ],
        400
    );

}


// ============================================================
// RECHERCHER LES UTILISATEURS
// ============================================================

try {

    $motif =
        "%" .
        $recherche .
        "%";


    $requete =
        $pdo->prepare(
            "
            SELECT
                id,
                nom,
                email
            FROM users
            WHERE id <> :user_id
              AND (
                    nom LIKE :recherche_nom
                    OR email LIKE :recherche_email
              )
            ORDER BY nom ASC
            LIMIT 10
            "
        );


    $requete->execute(
        [
            ":user_id" =>
                $userId,

            ":recherche_nom" =>
                $motif,

            ":recherche_email" =>
                $motif
        ]
    );


    $utilisateurs =
        $requete->fetchAll(
            PDO::FETCH_ASSOC
        );


    foreach (
        $utilisateurs
        as &$utilisateur
    ) {

        $utilisateur["id"] =
            (int)
            $utilisateur["id"];

    }

    unset(
        $utilisateur
    );


    repondre(
        [
            "succes" =>
                true,

            "utilisateurs" =>
                $utilisateurs
        ]
    );

}
catch (
    PDOException $erreur
) {

    error_log(
        "Erreur recherche utilisateurs : " .
        $erreur->getMessage()
    );


    repondre(
        [
            "erreur" =>
                "Erreur serveur."
        ],
        500
    );

}
