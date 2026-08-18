<?php

ini_set("display_errors", "1");
ini_set("display_startup_errors", "1");
error_reporting(E_ALL);

require_once __DIR__ . "/session-config.php";
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


// ============================================================
// SESSION
// ============================================================

if (
    !isset($_SESSION["user_id"]) ||
    !is_numeric($_SESSION["user_id"]) ||
    (int) $_SESSION["user_id"] <= 0
) {
    repondre(
        ["erreur" => "Utilisateur non connecté."],
        401
    );
}

$userId = (int) $_SESSION["user_id"];

$method =
    $_SERVER["REQUEST_METHOD"] ?? "GET";


// ============================================================
// VÉRIFIER L'APPARTENANCE À L'ESPACE
// ============================================================

function membreEspace($pdo, $workspaceId, $userId)
{
    $requete = $pdo->prepare(
        "SELECT
            wm.user_id,
            wm.role,
            w.owner_id
         FROM workspace_members wm
         INNER JOIN workspaces w
            ON w.id = wm.workspace_id
         WHERE wm.workspace_id = :workspace_id
           AND wm.user_id = :user_id
         LIMIT 1"
    );

    $requete->execute([
        ":workspace_id" => $workspaceId,
        ":user_id" => $userId
    ]);

    return $requete->fetch();
}


// ============================================================
// GET — LISTE DES MEMBRES
// ============================================================

if ($method === "GET") {

    $workspaceId =
        isset($_GET["workspace_id"])
            ? (int) $_GET["workspace_id"]
            : 0;

    if ($workspaceId <= 0) {
        repondre(
            ["erreur" => "Identifiant d'espace invalide."],
            400
        );
    }

    try {

        $membre =
            membreEspace(
                $pdo,
                $workspaceId,
                $userId
            );

        if (!$membre) {
            repondre(
                ["erreur" => "Vous n'avez pas accès à cet espace."],
                403
            );
        }

        $requete = $pdo->prepare(
            "SELECT
                wm.user_id,
                wm.role,
                wm.created_at,
                u.nom,
                u.email
             FROM workspace_members wm
             INNER JOIN users u
                ON u.id = wm.user_id
             WHERE wm.workspace_id = :workspace_id
             ORDER BY
                CASE wm.role
                    WHEN 'owner' THEN 1
                    WHEN 'admin' THEN 2
                    ELSE 3
                END,
                u.nom ASC"
        );

        $requete->execute([
            ":workspace_id" => $workspaceId
        ]);

        $membres = $requete->fetchAll();

        $membres = array_map(
            function ($membre) {
                return [
                    "user_id" =>
                        (int) $membre["user_id"],

                    "nom" =>
                        $membre["nom"],

                    "email" =>
                        $membre["email"],

                    "role" =>
                        $membre["role"],

                    "created_at" =>
                        $membre["created_at"]
                ];
            },
            $membres
        );

        repondre([
            "succes" => true,
            "workspace_id" => $workspaceId,
            "membres" => $membres
        ]);

    } catch (PDOException $erreur) {

        error_log(
            "Erreur GET workspace-members.php : " .
            $erreur->getMessage()
        );

        repondre(
            ["erreur" => "Erreur serveur."],
            500
        );
    }
}


// ============================================================
// POST — AJOUTER UN MEMBRE
// ============================================================

if ($method === "POST") {

    $contenu =
        file_get_contents("php://input");

    if (
        $contenu === false ||
        trim($contenu) === ""
    ) {
        repondre(
            ["erreur" => "Aucune donnée reçue."],
            400
        );
    }

    $donnees =
        json_decode($contenu, true);

    if (
        json_last_error() !== JSON_ERROR_NONE
    ) {
        repondre(
            ["erreur" => "JSON invalide."],
            400
        );
    }

    $workspaceId =
        isset($donnees["workspace_id"])
            ? (int) $donnees["workspace_id"]
            : 0;

    $membreId =
        isset($donnees["user_id"])
            ? (int) $donnees["user_id"]
            : 0;

    if (
        $workspaceId <= 0 ||
        $membreId <= 0
    ) {
        repondre(
            ["erreur" => "Identifiants invalides."],
            400
        );
    }

    try {

        // ----------------------------------------------------
        // SEUL OWNER / ADMIN PEUT AJOUTER
        // ----------------------------------------------------

        $membreActuel =
            membreEspace(
                $pdo,
                $workspaceId,
                $userId
            );

        if (!$membreActuel) {
            repondre(
                ["erreur" => "Vous n'avez pas accès à cet espace."],
                403
            );
        }

        if (
            !in_array(
                $membreActuel["role"],
                ["owner", "admin"],
                true
            )
        ) {
            repondre(
                ["erreur" => "Seul le propriétaire ou un administrateur peut ajouter un membre."],
                403
            );
        }


        // ----------------------------------------------------
        // VÉRIFIER L'UTILISATEUR
        // ----------------------------------------------------

        $requete = $pdo->prepare(
            "SELECT id, nom, email
             FROM users
             WHERE id = :id
             LIMIT 1"
        );

        $requete->execute([
            ":id" => $membreId
        ]);

        $utilisateur =
            $requete->fetch();

        if (!$utilisateur) {
            repondre(
                ["erreur" => "Utilisateur introuvable."],
                404
            );
        }


        // ----------------------------------------------------
        // ÉVITER LE DOUBLON
        // ----------------------------------------------------

        $requete = $pdo->prepare(
            "SELECT user_id
             FROM workspace_members
             WHERE workspace_id = :workspace_id
               AND user_id = :user_id
             LIMIT 1"
        );

        $requete->execute([
            ":workspace_id" => $workspaceId,
            ":user_id" => $membreId
        ]);

        if ($requete->fetch()) {
            repondre(
                ["erreur" => "Cet utilisateur est déjà membre de cet espace."],
                409
            );
        }


        // ----------------------------------------------------
        // AJOUT
        // ----------------------------------------------------

        $requete = $pdo->prepare(
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
                'member'
            )"
        );

        $requete->execute([
            ":workspace_id" => $workspaceId,
            ":user_id" => $membreId
        ]);

        repondre([
            "succes" => true,
            "message" => "Utilisateur ajouté à l'espace.",
            "workspace_id" => $workspaceId,
            "user" => [
                "id" =>
                    (int) $utilisateur["id"],

                "nom" =>
                    $utilisateur["nom"],

                "email" =>
                    $utilisateur["email"],

                "role" =>
                    "member"
            ]
        ], 201);

    } catch (PDOException $erreur) {

        error_log(
            "Erreur POST workspace-members.php : " .
            $erreur->getMessage()
        );

        repondre(
            ["erreur" => "Impossible d'ajouter le membre."],
            500
        );
    }
}


// ============================================================
// DELETE — RETIRER UN MEMBRE
// ============================================================

if ($method === "DELETE") {

    $contenu =
        file_get_contents("php://input");

    if (
        $contenu === false ||
        trim($contenu) === ""
    ) {
        repondre(
            ["erreur" => "Aucune donnée reçue."],
            400
        );
    }

    $donnees =
        json_decode($contenu, true);

    if (
        json_last_error() !== JSON_ERROR_NONE
    ) {
        repondre(
            ["erreur" => "JSON invalide."],
            400
        );
    }

    $workspaceId =
        isset($donnees["workspace_id"])
            ? (int) $donnees["workspace_id"]
            : 0;

    $membreId =
        isset($donnees["user_id"])
            ? (int) $donnees["user_id"]
            : 0;

    if (
        $workspaceId <= 0 ||
        $membreId <= 0
    ) {
        repondre(
            ["erreur" => "Identifiants invalides."],
            400
        );
    }

    try {

        $membreActuel =
            membreEspace(
                $pdo,
                $workspaceId,
                $userId
            );

        if (!$membreActuel) {
            repondre(
                ["erreur" => "Vous n'avez pas accès à cet espace."],
                403
            );
        }


        // Seul owner/admin peut retirer
        if (
            !in_array(
                $membreActuel["role"],
                ["owner", "admin"],
                true
            )
        ) {
            repondre(
                ["erreur" => "Vous n'avez pas les droits pour retirer un membre."],
                403
            );
        }


        // Le propriétaire ne peut pas être retiré
        $requete = $pdo->prepare(
            "SELECT owner_id
             FROM workspaces
             WHERE id = :id
             LIMIT 1"
        );

        $requete->execute([
            ":id" => $workspaceId
        ]);

        $workspace =
            $requete->fetch();

        if (!$workspace) {
            repondre(
                ["erreur" => "Espace introuvable."],
                404
            );
        }

        if (
            (int) $workspace["owner_id"] === $membreId
        ) {
            repondre(
                ["erreur" => "Le propriétaire ne peut pas être retiré de son espace."],
                403
            );
        }


        $requete = $pdo->prepare(
            "DELETE FROM workspace_members
             WHERE workspace_id = :workspace_id
               AND user_id = :user_id"
        );

        $requete->execute([
            ":workspace_id" => $workspaceId,
            ":user_id" => $membreId
        ]);

        if ($requete->rowCount() === 0) {
            repondre(
                ["erreur" => "Cet utilisateur n'est pas membre de cet espace."],
                404
            );
        }

        repondre([
            "succes" => true,
            "message" => "Utilisateur retiré de l'espace.",
            "workspace_id" => $workspaceId,
            "user_id" => $membreId
        ]);

    } catch (PDOException $erreur) {

        error_log(
            "Erreur DELETE workspace-members.php : " .
            $erreur->getMessage()
        );

        repondre(
            ["erreur" => "Impossible de retirer le membre."],
            500
        );
    }
}


// ============================================================
// MÉTHODE NON AUTORISÉE
// ============================================================

repondre(
    ["erreur" => "Méthode HTTP non autorisée."],
    405
);
