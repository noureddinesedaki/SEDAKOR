<?php

ini_set("display_errors", "1");
ini_set("display_startup_errors", "1");
error_reporting(E_ALL);

require_once __DIR__ . "/session-config.php";
require_once __DIR__ . "/config.php";

header(
    "Content-Type: application/json; charset=UTF-8"
);


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
// SESSION
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

$method =
    $_SERVER["REQUEST_METHOD"] ?? "GET";


// ============================================================
// GET — LISTE DES ESPACES
// ============================================================

if (
    $method === "GET"
) {

    try {

        $requete =
            $pdo->prepare(
                "SELECT
                    w.id,
                    w.nom,
                    w.owner_id,
                    w.created_at,
                    wm.role
                 FROM workspaces w
                 INNER JOIN workspace_members wm
                    ON wm.workspace_id = w.id
                 WHERE wm.user_id = :user_id
                 ORDER BY w.id DESC"
            );

        $requete->execute(
            [
                ":user_id" =>
                    $userId
            ]
        );

        $espaces =
            $requete->fetchAll();

        $espaces = array_map(
            function ($espace) {

                return [
                    "id" =>
                        (int) $espace["id"],

                    "nom" =>
                        $espace["nom"],

                    "owner_id" =>
                        (int) $espace["owner_id"],

                    "role" =>
                        $espace["role"],

                    "created_at" =>
                        $espace["created_at"]
                ];

            },
            $espaces
        );

        repondre(
            [
                "succes" =>
                    true,

                "espaces" =>
                    $espaces
            ]
        );

    }
    catch (
        PDOException $erreur
    ) {

        error_log(
            "Erreur GET workspaces.php : " .
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

}


// ============================================================
// POST — CRÉER UN ESPACE
// ============================================================

if (
    $method === "POST"
) {

    $contenu =
        file_get_contents(
            "php://input"
        );

    if (
        $contenu === false ||
        trim($contenu) === ""
    ) {

        repondre(
            [
                "erreur" =>
                    "Aucune donnée reçue."
            ],
            400
        );

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

        repondre(
            [
                "erreur" =>
                    "JSON invalide."
            ],
            400
        );

    }


    $nom =
        trim(
            $donnees["nom"] ?? ""
        );


    if (
        $nom === ""
    ) {

        repondre(
            [
                "erreur" =>
                    "Le nom de l'espace est obligatoire."
            ],
            400
        );

    }


    if (
        mb_strlen($nom) < 2
    ) {

        repondre(
            [
                "erreur" =>
                    "Le nom doit contenir au moins 2 caractères."
            ],
            400
        );

    }


    if (
        mb_strlen($nom) > 100
    ) {

        repondre(
            [
                "erreur" =>
                    "Le nom ne peut pas dépasser 100 caractères."
            ],
            400
        );

    }


    try {

        $pdo->beginTransaction();


        // ----------------------------------------------------
        // CRÉER L'ESPACE
        // ----------------------------------------------------

        $requete =
            $pdo->prepare(
                "INSERT INTO workspaces
                (
                    nom,
                    owner_id
                )
                VALUES
                (
                    :nom,
                    :owner_id
                )"
            );

        $requete->execute(
            [
                ":nom" =>
                    $nom,

                ":owner_id" =>
                    $userId
            ]
        );


        $workspaceId =
            (int) $pdo->lastInsertId();


        // ----------------------------------------------------
        // AJOUTER LE PROPRIÉTAIRE
        // ----------------------------------------------------

        $requete =
            $pdo->prepare(
                "INSERT INTO workspace_members
                (
                    workspace_id,
                    user_id,
                    role
                )
                VALUES
                (
                    :workspace_id,
                    :user_id,
                    'owner'
                )"
            );

        $requete->execute(
            [
                ":workspace_id" =>
                    $workspaceId,

                ":user_id" =>
                    $userId
            ]
        );


        $pdo->commit();


        repondre(
            [
                "succes" =>
                    true,

                "message" =>
                    "Espace créé avec succès.",

                "espace" =>
                    [
                        "id" =>
                            $workspaceId,

                        "nom" =>
                            $nom,

                        "owner_id" =>
                            $userId,

                        "role" =>
                            "owner"
                    ]
            ],
            201
        );

    }
    catch (
        PDOException $erreur
    ) {

        if (
            $pdo->inTransaction()
        ) {

            $pdo->rollBack();

        }


        error_log(
            "Erreur POST workspaces.php : " .
            $erreur->getMessage()
        );


        repondre(
            [
                "erreur" =>
                    "Impossible de créer l'espace."
            ],
            500
        );

    }

}


// ============================================================
// DELETE — SUPPRIMER UN ESPACE
// ============================================================

if (
    $method === "DELETE"
) {

    $contenu =
        file_get_contents(
            "php://input"
        );


    if (
        $contenu === false ||
        trim($contenu) === ""
    ) {

        repondre(
            [
                "erreur" =>
                    "Aucune donnée reçue."
            ],
            400
        );

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

        repondre(
            [
                "erreur" =>
                    "JSON invalide."
            ],
            400
        );

    }


    $workspaceId =
        isset($donnees["workspace_id"])
            ? (int) $donnees["workspace_id"]
            : 0;


    if (
        $workspaceId <= 0
    ) {

        repondre(
            [
                "erreur" =>
                    "Identifiant d'espace invalide."
            ],
            400
        );

    }


    try {

        // ----------------------------------------------------
        // VÉRIFIER LE PROPRIÉTAIRE
        // ----------------------------------------------------

        $requete =
            $pdo->prepare(
                "SELECT id
                 FROM workspaces
                 WHERE id = :id
                   AND owner_id = :owner_id
                 LIMIT 1"
            );

        $requete->execute(
            [
                ":id" =>
                    $workspaceId,

                ":owner_id" =>
                    $userId
            ]
        );


        if (
            !$requete->fetch()
        ) {

            repondre(
                [
                    "erreur" =>
                        "Seul le propriétaire peut supprimer cet espace."
                ],
                403
            );

        }


        // ----------------------------------------------------
        // SUPPRESSION
        // ----------------------------------------------------

        $requete =
            $pdo->prepare(
                "DELETE FROM workspaces
                 WHERE id = :id
                   AND owner_id = :owner_id"
            );

        $requete->execute(
            [
                ":id" =>
                    $workspaceId,

                ":owner_id" =>
                    $userId
            ]
        );


        repondre(
            [
                "succes" =>
                    true,

                "message" =>
                    "Espace supprimé.",

                "workspace_id" =>
                    $workspaceId
            ]
        );

    }
    catch (
        PDOException $erreur
    ) {

        error_log(
            "Erreur DELETE workspaces.php : " .
            $erreur->getMessage()
        );

        repondre(
            [
                "erreur" =>
                    "Impossible de supprimer l'espace."
            ],
            500
        );

    }

}


// ============================================================
// MÉTHODE NON AUTORISÉE
// ============================================================

repondre(
    [
        "erreur" =>
            "Méthode HTTP non autorisée."
    ],
    405
);
