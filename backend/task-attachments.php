<?php

ini_set("display_errors", "1");
ini_set("display_startup_errors", "1");
error_reporting(E_ALL);

require_once __DIR__ . "/session-config.php";
require_once __DIR__ . "/config.php";

header("Content-Type: application/json; charset=UTF-8");

const MAX_FILE_SIZE = 10485760; // 10 Mo


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

$userId = (int) $_SESSION["user_id"];

$method =
    $_SERVER["REQUEST_METHOD"] ?? "GET";


// ============================================================
// VÉRIFIER L'ACCÈS À LA TÂCHE
// ============================================================

function accesTache($pdo, $taskId, $userId)
{
    $requete = $pdo->prepare(
        "SELECT t.id
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
// DOSSIER DES FICHIERS
// ============================================================

$dossierUpload =
    dirname(__DIR__) . "/uploads/tasks/";


// ============================================================
// GET — LISTE DES PIÈCES JOINTES
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
                a.id,
                a.task_id,
                a.user_id,
                a.nom_fichier,
                a.chemin,
                a.type_mime,
                a.taille,
                a.created_at,
                u.nom
             FROM task_attachments a
             INNER JOIN users u
                ON u.id = a.user_id
             WHERE a.task_id = :task_id
             ORDER BY a.created_at DESC, a.id DESC"
        );

        $requete->execute([
            ":task_id" => $taskId
        ]);

        $fichiers =
            $requete->fetchAll();

        $fichiers =
            array_map(
                function ($fichier) {

                    return [
                        "id" =>
                            (int) $fichier["id"],

                        "task_id" =>
                            (int) $fichier["task_id"],

                        "user_id" =>
                            (int) $fichier["user_id"],

                        "nom_fichier" =>
                            $fichier["nom_fichier"],

                        "chemin" =>
                            $fichier["chemin"],

                        "type_mime" =>
                            $fichier["type_mime"],

                        "taille" =>
                            (int) $fichier["taille"],

                        "created_at" =>
                            $fichier["created_at"],

                        "auteur" =>
                            $fichier["nom"]
                    ];
                },
                $fichiers
            );

        repondre([
            "succes" => true,
            "task_id" => $taskId,
            "fichiers" => $fichiers
        ]);

    } catch (PDOException $erreur) {

        error_log(
            "Erreur GET task-attachments.php : " .
            $erreur->getMessage()
        );

        repondre(
            ["erreur" => "Erreur serveur."],
            500
        );
    }
}


// ============================================================
// POST — UPLOAD
// ============================================================

if ($method === "POST") {

    $taskId =
        isset($_POST["task_id"])
            ? (int) $_POST["task_id"]
            : 0;

    if ($taskId <= 0) {
        repondre(
            ["erreur" => "Identifiant de tâche invalide."],
            400
        );
    }

    if (!accesTache($pdo, $taskId, $userId)) {
        repondre(
            ["erreur" => "Vous n'avez pas accès à cette tâche."],
            403
        );
    }

    if (
        !isset($_FILES["fichier"]) ||
        !is_array($_FILES["fichier"])
    ) {
        repondre(
            ["erreur" => "Aucun fichier reçu."],
            400
        );
    }

    $fichier =
        $_FILES["fichier"];

    if (
        !isset(
            $fichier["error"],
            $fichier["tmp_name"],
            $fichier["name"],
            $fichier["size"]
        )
    ) {
        repondre(
            ["erreur" => "Fichier invalide."],
            400
        );
    }

    if (
        $fichier["error"] !==
        UPLOAD_ERR_OK
    ) {

        $messages = [
            UPLOAD_ERR_INI_SIZE =>
                "Le fichier dépasse la limite du serveur.",

            UPLOAD_ERR_FORM_SIZE =>
                "Le fichier est trop volumineux.",

            UPLOAD_ERR_PARTIAL =>
                "Le fichier a été reçu partiellement.",

            UPLOAD_ERR_NO_FILE =>
                "Aucun fichier reçu."
        ];

        repondre(
            [
                "erreur" =>
                    $messages[$fichier["error"]]
                    ?? "Erreur lors de l'upload."
            ],
            400
        );
    }

    $taille =
        (int) $fichier["size"];

    if ($taille <= 0) {
        repondre(
            ["erreur" => "Le fichier est vide."],
            400
        );
    }

    if ($taille > MAX_FILE_SIZE) {
        repondre(
            [
                "erreur" =>
                    "Le fichier ne peut pas dépasser 10 Mo."
            ],
            400
        );
    }


    // ========================================================
    // NOM DU FICHIER
    // ========================================================

    $nomOriginal =
        basename(
            $fichier["name"]
        );

    $nomOriginal =
        preg_replace(
            "/[^A-Za-z0-9._ -]/u",
            "_",
            $nomOriginal
        );

    $nomOriginal =
        trim($nomOriginal);

    if ($nomOriginal === "") {
        repondre(
            ["erreur" => "Nom de fichier invalide."],
            400
        );
    }


    // ========================================================
    // MIME RÉEL
    // ========================================================

    $finfo =
        new finfo(FILEINFO_MIME_TYPE);

    $mime =
        $finfo->file(
            $fichier["tmp_name"]
        );

    if (!$mime) {
        repondre(
            ["erreur" => "Type de fichier impossible à déterminer."],
            400
        );
    }


    // ========================================================
    // TYPES AUTORISÉS
    // ========================================================

    $typesAutorises = [

        "pdf" => [
            "application/pdf"
        ],

        "txt" => [
            "text/plain"
        ],

        "csv" => [
            "text/plain",
            "text/csv",
            "application/csv",
            "application/vnd.ms-excel"
        ],

        "jpg" => [
            "image/jpeg"
        ],

        "jpeg" => [
            "image/jpeg"
        ],

        "png" => [
            "image/png"
        ],

        "gif" => [
            "image/gif"
        ],

        "webp" => [
            "image/webp"
        ],

        "doc" => [
            "application/msword"
        ],

        "docx" => [
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ],

        "xls" => [
            "application/vnd.ms-excel"
        ],

        "xlsx" => [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ]
    ];

    $extension =
        strtolower(
            pathinfo(
                $nomOriginal,
                PATHINFO_EXTENSION
            )
        );

    if (
        !isset(
            $typesAutorises[$extension]
        )
    ) {
        repondre(
            ["erreur" => "Type de fichier non autorisé."],
            400
        );
    }

    if (
        !in_array(
            $mime,
            $typesAutorises[$extension],
            true
        )
    ) {
        repondre(
            [
                "erreur" =>
                    "Le contenu du fichier ne correspond pas à son extension."
            ],
            400
        );
    }


    // ========================================================
    // NOM INTERNE UNIQUE
    // ========================================================

    $nomInterne =
        bin2hex(
            random_bytes(16)
        ) .
        "." .
        $extension;

    if (!is_dir($dossierUpload)) {

        if (
            !mkdir(
                $dossierUpload,
                0755,
                true
            )
        ) {
            repondre(
                [
                    "erreur" =>
                        "Impossible de créer le dossier d'upload."
                ],
                500
            );
        }
    }

    $cheminAbsolu =
        $dossierUpload .
        $nomInterne;

    $cheminPublic =
        "/TaskFlow/uploads/tasks/" .
        $nomInterne;

    if (
        !move_uploaded_file(
            $fichier["tmp_name"],
            $cheminAbsolu
        )
    ) {
        repondre(
            [
                "erreur" =>
                    "Impossible d'enregistrer le fichier."
            ],
            500
        );
    }


    // ========================================================
    // ENREGISTRER EN BASE
    // ========================================================

    try {

        $requete =
            $pdo->prepare(
                "INSERT INTO task_attachments
                (
                    task_id,
                    user_id,
                    nom_fichier,
                    chemin,
                    type_mime,
                    taille
                )
                VALUES
                (
                    :task_id,
                    :user_id,
                    :nom_fichier,
                    :chemin,
                    :type_mime,
                    :taille
                )"
            );

        $requete->execute([
            ":task_id" =>
                $taskId,

            ":user_id" =>
                $userId,

            ":nom_fichier" =>
                $nomOriginal,

            ":chemin" =>
                $cheminPublic,

            ":type_mime" =>
                $mime,

            ":taille" =>
                $taille
        ]);

        $attachmentId =
            (int) $pdo->lastInsertId();

        repondre([
            "succes" => true,
            "message" => "Fichier ajouté.",
            "fichier" => [
                "id" =>
                    $attachmentId,

                "task_id" =>
                    $taskId,

                "user_id" =>
                    $userId,

                "nom_fichier" =>
                    $nomOriginal,

                "chemin" =>
                    $cheminPublic,

                "type_mime" =>
                    $mime,

                "taille" =>
                    $taille
            ]
        ], 201);

    } catch (PDOException $erreur) {

        if (
            is_file($cheminAbsolu)
        ) {
            unlink($cheminAbsolu);
        }

        error_log(
            "Erreur POST task-attachments.php : " .
            $erreur->getMessage()
        );

        repondre(
            [
                "erreur" =>
                    "Impossible d'enregistrer la pièce jointe."
            ],
            500
        );
    }
}


// ============================================================
// DELETE — SUPPRIMER SON FICHIER
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

    $attachmentId =
        isset($donnees["attachment_id"])
            ? (int) $donnees["attachment_id"]
            : 0;

    if ($attachmentId <= 0) {
        repondre(
            [
                "erreur" =>
                    "Identifiant de fichier invalide."
            ],
            400
        );
    }

    try {

        $requete =
            $pdo->prepare(
                "SELECT
                    id,
                    user_id,
                    chemin
                 FROM task_attachments
                 WHERE id = :id
                 LIMIT 1"
            );

        $requete->execute([
            ":id" =>
                $attachmentId
        ]);

        $fichier =
            $requete->fetch();

        if (!$fichier) {
            repondre(
                [
                    "erreur" =>
                        "Fichier introuvable."
                ],
                404
            );
        }

        if (
            (int) $fichier["user_id"] !==
            $userId
        ) {
            repondre(
                [
                    "erreur" =>
                        "Vous ne pouvez supprimer que vos propres fichiers."
                ],
                403
            );
        }

        $cheminRelatif =
            parse_url(
                $fichier["chemin"],
                PHP_URL_PATH
            );

        $cheminAbsolu =
            dirname(__DIR__) .
            $cheminRelatif;

        if (
            is_file($cheminAbsolu)
        ) {
            unlink($cheminAbsolu);
        }

        $requete =
            $pdo->prepare(
                "DELETE FROM task_attachments
                 WHERE id = :id
                   AND user_id = :user_id"
            );

        $requete->execute([
            ":id" =>
                $attachmentId,

            ":user_id" =>
                $userId
        ]);

        repondre([
            "succes" =>
                true,

            "message" =>
                "Fichier supprimé.",

            "attachment_id" =>
                $attachmentId
        ]);

    } catch (PDOException $erreur) {

        error_log(
            "Erreur DELETE task-attachments.php : " .
            $erreur->getMessage()
        );

        repondre(
            [
                "erreur" =>
                    "Impossible de supprimer le fichier."
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
