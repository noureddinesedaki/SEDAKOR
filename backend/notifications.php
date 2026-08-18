<?php

ini_set("display_errors", "1");
ini_set("display_startup_errors", "1");
error_reporting(E_ALL);

require_once __DIR__ . "/session-config.php";
require_once __DIR__ . "/config.php";

header("Content-Type: application/json; charset=UTF-8");


// ============================================================
// RÉPONSE JSON
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

$userId =
    (int) $_SESSION["user_id"];

$method =
    $_SERVER["REQUEST_METHOD"] ?? "GET";


// ============================================================
// GET — NOTIFICATIONS
// ============================================================

if ($method === "GET") {

    try {

        $limite =
            isset($_GET["limite"])
                ? (int) $_GET["limite"]
                : 50;

        if ($limite < 1) {
            $limite = 1;
        }

        if ($limite > 100) {
            $limite = 100;
        }


        $requete =
            $pdo->prepare(
                "SELECT
                    n.id,
                    n.user_id,
                    n.task_id,
                    n.type,
                    n.message,
                    n.lue,
                    n.created_at,
                    t.titre
                 FROM notifications n
                 LEFT JOIN tasks t
                    ON t.id = n.task_id
                 WHERE n.user_id = :user_id
                 ORDER BY n.lue ASC,
                          n.created_at DESC,
                          n.id DESC
                 LIMIT $limite"
            );

        $requete->execute([
            ":user_id" =>
                $userId
        ]);

        $notifications =
            $requete->fetchAll();


        $notifications =
            array_map(
                function ($notification) {

                    return [
                        "id" =>
                            (int) $notification["id"],

                        "user_id" =>
                            (int) $notification["user_id"],

                        "task_id" =>
                            $notification["task_id"] !== null
                                ? (int) $notification["task_id"]
                                : null,

                        "type" =>
                            $notification["type"],

                        "message" =>
                            $notification["message"],

                        "lue" =>
                            (bool) $notification["lue"],

                        "created_at" =>
                            $notification["created_at"],

                        "tache" =>
                            $notification["titre"]
                    ];
                },
                $notifications
            );


        // ----------------------------------------------------
        // COMPTEUR NON LUES
        // ----------------------------------------------------

        $requete =
            $pdo->prepare(
                "SELECT COUNT(*)
                 FROM notifications
                 WHERE user_id = :user_id
                   AND lue = 0"
            );

        $requete->execute([
            ":user_id" =>
                $userId
        ]);

        $nonLues =
            (int) $requete->fetchColumn();


        repondre([
            "succes" =>
                true,

            "notifications" =>
                $notifications,

            "non_lues" =>
                $nonLues
        ]);

    } catch (PDOException $erreur) {

        error_log(
            "Erreur GET notifications.php : " .
            $erreur->getMessage()
        );

        repondre(
            ["erreur" => "Erreur serveur."],
            500
        );
    }
}


// ============================================================
// POST — CRÉER UNE NOTIFICATION
// ============================================================

if ($method === "POST") {

    $contenu =
        file_get_contents(
            "php://input"
        );

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
        json_decode(
            $contenu,
            true
        );

    if (
        json_last_error() !==
        JSON_ERROR_NONE
    ) {
        repondre(
            ["erreur" => "JSON invalide."],
            400
        );
    }


    $notificationUserId =
    isset($donnees["user_id"])
        ? (int) $donnees["user_id"]
        : $userId;

    $taskId =
        isset($donnees["task_id"]) &&
        $donnees["task_id"] !== null
            ? (int) $donnees["task_id"]
            : null;

    $type =
        trim(
            $donnees["type"] ?? "systeme"
        );

    $message =
        trim(
            $donnees["message"] ?? ""
        );


    if ($notificationUserId <= 0) {
        repondre(
            ["erreur" => "Utilisateur invalide."],
            400
        );
    }

    if ($message === "") {
        repondre(
            ["erreur" => "Le message est obligatoire."],
            400
        );
    }

    if (mb_strlen($message) > 500) {
        repondre(
            [
                "erreur" =>
                    "Le message ne peut pas dépasser 500 caractères."
            ],
            400
        );
    }


    $typesAutorises = [
        "tache_partagee",
        "commentaire",
        "rappel",
        "echeance",
        "systeme"
    ];

    if (
        !in_array(
            $type,
            $typesAutorises,
            true
        )
    ) {
        repondre(
            ["erreur" => "Type de notification invalide."],
            400
        );
    }


    try {

        // ----------------------------------------------------
        // VÉRIFIER L'UTILISATEUR DESTINATAIRE
        // ----------------------------------------------------

        $requete =
            $pdo->prepare(
                "SELECT id
                 FROM users
                 WHERE id = :id
                 LIMIT 1"
            );

        $requete->execute([
            ":id" =>
                $notificationUserId
        ]);

        if (!$requete->fetch()) {
            repondre(
                ["erreur" => "Utilisateur introuvable."],
                404
            );
        }


        // ----------------------------------------------------
        // VÉRIFIER LA TÂCHE
        // ----------------------------------------------------

        if ($taskId !== null) {

            if ($taskId <= 0) {
                repondre(
                    ["erreur" => "Identifiant de tâche invalide."],
                    400
                );
            }

            $requete =
                $pdo->prepare(
                    "SELECT id
                     FROM tasks
                     WHERE id = :id
                     LIMIT 1"
                );

            $requete->execute([
                ":id" =>
                    $taskId
            ]);

            if (!$requete->fetch()) {
                repondre(
                    ["erreur" => "Tâche introuvable."],
                    404
                );
            }
        }


        // ----------------------------------------------------
        // CRÉATION
        // ----------------------------------------------------

        $requete =
            $pdo->prepare(
                "INSERT INTO notifications
                (
                    user_id,
                    task_id,
                    type,
                    message
                )
                VALUES
                (
                    :user_id,
                    :task_id,
                    :type,
                    :message
                )"
            );

        $requete->execute([
            ":user_id" =>
                $notificationUserId,

            ":task_id" =>
                $taskId,

            ":type" =>
                $type,

            ":message" =>
                $message
        ]);

        $notificationId =
            (int) $pdo->lastInsertId();


        repondre([
            "succes" =>
                true,

            "message" =>
                "Notification créée.",

            "notification" => [
                "id" =>
                    $notificationId,

                "user_id" =>
                    $notificationUserId,

                "task_id" =>
                    $taskId,

                "type" =>
                    $type,

                "message" =>
                    $message,

                "lue" =>
                    false
            ]
        ], 201);

    } catch (PDOException $erreur) {

        error_log(
            "Erreur POST notifications.php : " .
            $erreur->getMessage()
        );

        repondre(
            ["erreur" => "Impossible de créer la notification."],
            500
        );
    }
}


// ============================================================
// PUT — MARQUER COMME LUE
// ============================================================

if ($method === "PUT") {

    $contenu =
        file_get_contents(
            "php://input"
        );

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
        json_decode(
            $contenu,
            true
        );

    if (
        json_last_error() !==
        JSON_ERROR_NONE
    ) {
        repondre(
            ["erreur" => "JSON invalide."],
            400
        );
    }


    $notificationId =
        isset($donnees["notification_id"])
            ? (int) $donnees["notification_id"]
            : 0;


    // --------------------------------------------------------
    // TOUT MARQUER COMME LU
    // --------------------------------------------------------

    if (
        isset($donnees["toutes"])
        &&
        $donnees["toutes"] === true
    ) {

        try {

            $requete =
                $pdo->prepare(
                    "UPDATE notifications
                     SET lue = 1
                     WHERE user_id = :user_id
                       AND lue = 0"
                );

            $requete->execute([
                ":user_id" =>
                    $userId
            ]);

            repondre([
                "succes" =>
                    true,

                "message" =>
                    "Toutes les notifications ont été marquées comme lues.",

                "modifiees" =>
                    $requete->rowCount()
            ]);

        } catch (PDOException $erreur) {

            error_log(
                "Erreur PUT notifications.php : " .
                $erreur->getMessage()
            );

            repondre(
                ["erreur" => "Impossible de modifier les notifications."],
                500
            );
        }
    }


    // --------------------------------------------------------
    // UNE NOTIFICATION
    // --------------------------------------------------------

    if ($notificationId <= 0) {
        repondre(
            ["erreur" => "Identifiant de notification invalide."],
            400
        );
    }


    try {

        $requete =
            $pdo->prepare(
                "UPDATE notifications
                 SET lue = 1
                 WHERE id = :id
                   AND user_id = :user_id"
            );

        $requete->execute([
            ":id" =>
                $notificationId,

            ":user_id" =>
                $userId
        ]);

        if (
            $requete->rowCount() === 0
        ) {

            $verification =
                $pdo->prepare(
                    "SELECT id
                     FROM notifications
                     WHERE id = :id
                       AND user_id = :user_id
                     LIMIT 1"
                );

            $verification->execute([
                ":id" =>
                    $notificationId,

                ":user_id" =>
                    $userId
            ]);

            if (!$verification->fetch()) {
                repondre(
                    ["erreur" => "Notification introuvable."],
                    404
                );
            }
        }


        repondre([
            "succes" =>
                true,

            "message" =>
                "Notification marquée comme lue.",

            "notification_id" =>
                $notificationId
        ]);

    } catch (PDOException $erreur) {

        error_log(
            "Erreur PUT notifications.php : " .
            $erreur->getMessage()
        );

        repondre(
            ["erreur" => "Impossible de modifier la notification."],
            500
        );
    }
}


// ============================================================
// DELETE — SUPPRIMER
// ============================================================

if ($method === "DELETE") {

    $contenu =
        file_get_contents(
            "php://input"
        );

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
        json_decode(
            $contenu,
            true
        );

    if (
        json_last_error() !==
        JSON_ERROR_NONE
    ) {
        repondre(
            ["erreur" => "JSON invalide."],
            400
        );
    }


    $notificationId =
        isset($donnees["notification_id"])
            ? (int) $donnees["notification_id"]
            : 0;


    // --------------------------------------------------------
    // SUPPRIMER TOUTES LES NOTIFICATIONS
    // --------------------------------------------------------

    if (
        isset($donnees["toutes"])
        &&
        $donnees["toutes"] === true
    ) {

        try {

            $requete =
                $pdo->prepare(
                    "DELETE FROM notifications
                     WHERE user_id = :user_id"
                );

            $requete->execute([
                ":user_id" =>
                    $userId
            ]);

            repondre([
                "succes" =>
                    true,

                "message" =>
                    "Toutes les notifications ont été supprimées.",

                "supprimees" =>
                    $requete->rowCount()
            ]);

        } catch (PDOException $erreur) {

            error_log(
                "Erreur DELETE notifications.php : " .
                $erreur->getMessage()
            );

            repondre(
                ["erreur" => "Impossible de supprimer les notifications."],
                500
            );
        }
    }


    if ($notificationId <= 0) {
        repondre(
            ["erreur" => "Identifiant de notification invalide."],
            400
        );
    }


    try {

        $requete =
            $pdo->prepare(
                "DELETE FROM notifications
                 WHERE id = :id
                   AND user_id = :user_id"
            );

        $requete->execute([
            ":id" =>
                $notificationId,

            ":user_id" =>
                $userId
        ]);

        if (
            $requete->rowCount() === 0
        ) {
            repondre(
                ["erreur" => "Notification introuvable."],
                404
            );
        }

        repondre([
            "succes" =>
                true,

            "message" =>
                "Notification supprimée.",

            "notification_id" =>
                $notificationId
        ]);

    } catch (PDOException $erreur) {

        error_log(
            "Erreur DELETE notifications.php : " .
            $erreur->getMessage()
        );

        repondre(
            ["erreur" =>
                "Impossible de supprimer la notification."
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
