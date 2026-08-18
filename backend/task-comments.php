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
    echo json_encode($donnees, JSON_UNESCAPED_UNICODE);
    exit;
}

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
$method = $_SERVER["REQUEST_METHOD"] ?? "GET";


// ============================================================
// VÉRIFIER L'ACCÈS À LA TÂCHE
// ============================================================

function accesTache($pdo, $taskId, $userId)
{
    $requete = $pdo->prepare(
        "SELECT
            t.id,
            t.user_id
         FROM tasks t
         WHERE t.id = :task_id
           AND (
                t.user_id = :user_id
                OR EXISTS (
                    SELECT 1
                    FROM task_members tm
                    WHERE tm.task_id = t.id
                      AND tm.user_id = :member_id
                )
           )
         LIMIT 1"
    );

    $requete->execute([
        ":task_id" => $taskId,
        ":user_id" => $userId,
        ":member_id" => $userId
    ]);

    return $requete->fetch();
}


// ============================================================
// GET — COMMENTAIRES
// ============================================================

if ($method === "GET") {

    $taskId =
        isset($_GET["task_id"])
            ? (int) $_GET["task_id"]
            : 0;

    if ($taskId <= 0) {
        repondre(
            ["erreur" => "Identifiant de tâche invalide."],
            400
        );
    }

    try {

        if (!accesTache($pdo, $taskId, $userId)) {
            repondre(
                ["erreur" => "Vous n'avez pas accès à cette tâche."],
                403
            );
        }

        $requete = $pdo->prepare(
            "SELECT
                c.id,
                c.task_id,
                c.user_id,
                c.contenu,
                c.created_at,
                c.updated_at,
                u.nom,
                u.email
             FROM task_comments c
             INNER JOIN users u
                ON u.id = c.user_id
             WHERE c.task_id = :task_id
             ORDER BY c.created_at ASC, c.id ASC"
        );

        $requete->execute([
            ":task_id" => $taskId
        ]);

        $commentaires = $requete->fetchAll();

        $commentaires = array_map(
            function ($commentaire) {
                return [
                    "id" => (int) $commentaire["id"],
                    "task_id" => (int) $commentaire["task_id"],
                    "user_id" => (int) $commentaire["user_id"],
                    "nom" => $commentaire["nom"],
                    "email" => $commentaire["email"],
                    "contenu" => $commentaire["contenu"],
                    "created_at" => $commentaire["created_at"],
                    "updated_at" => $commentaire["updated_at"]
                ];
            },
            $commentaires
        );

        repondre([
            "succes" => true,
            "task_id" => $taskId,
            "commentaires" => $commentaires
        ]);

    } catch (PDOException $erreur) {

        error_log(
            "Erreur GET task-comments.php : " .
            $erreur->getMessage()
        );

        repondre(
            ["erreur" => "Erreur serveur."],
            500
        );
    }
}


// ============================================================
// POST — AJOUTER UN COMMENTAIRE
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

    $taskId =
        isset($donnees["task_id"])
            ? (int) $donnees["task_id"]
            : 0;

    $texte =
        trim($donnees["contenu"] ?? "");

    if ($taskId <= 0) {
        repondre(
            ["erreur" => "Identifiant de tâche invalide."],
            400
        );
    }

    if ($texte === "") {
        repondre(
            ["erreur" => "Le commentaire est obligatoire."],
            400
        );
    }

    if (mb_strlen($texte) > 5000) {
        repondre(
            ["erreur" => "Le commentaire ne peut pas dépasser 5000 caractères."],
            400
        );
    }

    try {

        if (!accesTache($pdo, $taskId, $userId)) {
            repondre(
                ["erreur" => "Vous n'avez pas accès à cette tâche."],
                403
            );
        }

        $requete = $pdo->prepare(
            "INSERT INTO task_comments
            (
                task_id,
                user_id,
                contenu
            )
            VALUES
            (
                :task_id,
                :user_id,
                :contenu
            )"
        );

        $requete->execute([
            ":task_id" => $taskId,
            ":user_id" => $userId,
            ":contenu" => $texte
        ]);

        $commentId =
            (int) $pdo->lastInsertId();

        repondre([
            "succes" => true,
            "message" => "Commentaire ajouté.",
            "commentaire" => [
                "id" => $commentId,
                "task_id" => $taskId,
                "user_id" => $userId,
                "contenu" => $texte
            ]
        ], 201);

    } catch (PDOException $erreur) {

        error_log(
            "Erreur POST task-comments.php : " .
            $erreur->getMessage()
        );

        repondre(
            ["erreur" => "Impossible d'ajouter le commentaire."],
            500
        );
    }
}


// ============================================================
// DELETE — SUPPRIMER SON COMMENTAIRE
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

    $commentId =
        isset($donnees["comment_id"])
            ? (int) $donnees["comment_id"]
            : 0;

    if ($commentId <= 0) {
        repondre(
            ["erreur" => "Identifiant de commentaire invalide."],
            400
        );
    }

    try {

        $requete = $pdo->prepare(
            "SELECT id, user_id
             FROM task_comments
             WHERE id = :id
             LIMIT 1"
        );

        $requete->execute([
            ":id" => $commentId
        ]);

        $commentaire =
            $requete->fetch();

        if (!$commentaire) {
            repondre(
                ["erreur" => "Commentaire introuvable."],
                404
            );
        }

        if (
            (int) $commentaire["user_id"] !== $userId
        ) {
            repondre(
                ["erreur" => "Vous ne pouvez supprimer que vos propres commentaires."],
                403
            );
        }

        $requete = $pdo->prepare(
            "DELETE FROM task_comments
             WHERE id = :id
               AND user_id = :user_id"
        );

        $requete->execute([
            ":id" => $commentId,
            ":user_id" => $userId
        ]);

        repondre([
            "succes" => true,
            "message" => "Commentaire supprimé.",
            "comment_id" => $commentId
        ]);

    } catch (PDOException $erreur) {

        error_log(
            "Erreur DELETE task-comments.php : " .
            $erreur->getMessage()
        );

        repondre(
            ["erreur" => "Impossible de supprimer le commentaire."],
            500
        );
    }
}


repondre(
    ["erreur" => "Méthode HTTP non autorisée."],
    405
);
