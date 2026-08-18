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
// V16 — CRÉER UNE NOTIFICATION
// ============================================================

function creerNotification(
    $pdo,
    $userId,
    $taskId,
    $type,
    $message
) {
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
            $userId,

        ":task_id" =>
            $taskId,

        ":type" =>
            $type,

        ":message" =>
            $message
    ]);
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
// LIRE JSON
// ============================================================

function lireJSON()
{

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


    if (
        !is_array($donnees)
    ) {

        repondre(
            [
                "erreur" =>
                    "Les données reçues sont invalides."
            ],
            400
        );

    }


    return $donnees;

}


// ============================================================
// VALIDATION ID
// ============================================================

function idValide(
    $id
) {

    return (
        is_numeric($id) &&
        (int) $id > 0
    );

}


// ============================================================
// RÉCUPÉRER UNE TÂCHE
// ============================================================

function recupererTache(
    PDO $pdo,
    int $taskId
) {

    $stmt =
        $pdo->prepare(
            "
            SELECT
                id,
                user_id,
                titre
            FROM tasks
            WHERE id = :id
            LIMIT 1
            "
        );


    $stmt->execute(
        [
            ":id" =>
                $taskId
        ]
    );


    $tache =
        $stmt->fetch(
            PDO::FETCH_ASSOC
        );


    return $tache ?: null;

}


// ============================================================
// VÉRIFIER LE PROPRIÉTAIRE
// ============================================================

function verifierProprietaire(
    PDO $pdo,
    int $taskId,
    int $userId
) {

    $stmt =
        $pdo->prepare(
            "
            SELECT id
            FROM tasks
            WHERE id = :task_id
              AND user_id = :user_id
            LIMIT 1
            "
        );


    $stmt->execute(
        [
            ":task_id" =>
                $taskId,

            ":user_id" =>
                $userId
        ]
    );


    return
        (bool)
        $stmt->fetchColumn();

}


// ============================================================
// GET
// Voir les membres d'une tâche
// ============================================================

if (
    $method === "GET"
) {

    $taskId =
        $_GET["task_id"] ??
        null;


    if (
        !idValide($taskId)
    ) {

        repondre(
            [
                "erreur" =>
                    "Identifiant de tâche invalide."
            ],
            400
        );

    }


    $taskId =
        (int) $taskId;


    /*
     * Un utilisateur peut consulter
     * les membres s'il est :
     *
     * - propriétaire
     * - membre de la tâche
     */

    $stmt =
        $pdo->prepare(
            "
            SELECT id
            FROM tasks
            WHERE id = :task_id
              AND user_id = :user_id

            UNION

            SELECT task_id
            FROM task_members
            WHERE task_id = :task_id_member
              AND user_id = :user_id_member

            LIMIT 1
            "
        );


    $stmt->execute(
        [
            ":task_id" =>
                $taskId,

            ":user_id" =>
                $userId,

            ":task_id_member" =>
                $taskId,

            ":user_id_member" =>
                $userId
        ]
    );


    if (
        !$stmt->fetchColumn()
    ) {

        repondre(
            [
                "erreur" =>
                    "Vous n'avez pas accès à cette tâche."
            ],
            403
        );

    }


    $stmt =
        $pdo->prepare(
            "
            SELECT
                tm.task_id,
                tm.user_id,
                tm.role,
                tm.created_at,
                u.nom,
                u.email
            FROM task_members tm
            INNER JOIN users u
                ON u.id = tm.user_id
            WHERE tm.task_id = :task_id
            ORDER BY u.nom ASC
            "
        );


    $stmt->execute(
        [
            ":task_id" =>
                $taskId
        ]
    );


    $membres =
        $stmt->fetchAll(
            PDO::FETCH_ASSOC
        );


    repondre(
        [
            "succes" =>
                true,

            "task_id" =>
                $taskId,

            "membres" =>
                $membres
        ]
    );

}


// ============================================================
// POST
// Ajouter un membre à une tâche
// ============================================================

if (
    $method === "POST"
) {

    $donnees =
        lireJSON();


    $taskId =
        $donnees["task_id"] ??
        null;

    $membreId =
        $donnees["user_id"] ??
        null;


    if (
        !idValide($taskId)
    ) {

        repondre(
            [
                "erreur" =>
                    "Identifiant de tâche invalide."
            ],
            400
        );

    }


    if (
        !idValide($membreId)
    ) {

        repondre(
            [
                "erreur" =>
                    "Identifiant utilisateur invalide."
            ],
            400
        );

    }


    $taskId =
        (int) $taskId;

    $membreId =
        (int) $membreId;


    /*
     * Seul le propriétaire peut
     * partager une tâche.
     */

    if (
        !verifierProprietaire(
            $pdo,
            $taskId,
            $userId
        )
    ) {

        repondre(
            [
                "erreur" =>
                    "Seul le propriétaire peut partager cette tâche."
            ],
            403
        );

    }


    /*
     * Vérifier que la tâche existe.
     */

    $tache =
        recupererTache(
            $pdo,
            $taskId
        );


    if (
        !$tache
    ) {

        repondre(
            [
                "erreur" =>
                    "Tâche introuvable."
            ],
            404
        );

    }


    /*
     * On ne partage pas une tâche
     * avec son propre propriétaire.
     */

    if (
        $membreId ===
        (int) $tache["user_id"]
    ) {

        repondre(
            [
                "erreur" =>
                    "Le propriétaire possède déjà cette tâche."
            ],
            400
        );

    }


    /*
     * Vérifier que l'utilisateur
     * destinataire existe.
     */

    $stmt =
        $pdo->prepare(
            "
            SELECT
                id,
                nom,
                email
            FROM users
            WHERE id = :id
            LIMIT 1
            "
        );


    $stmt->execute(
        [
            ":id" =>
                $membreId
        ]
    );


    $utilisateur =
        $stmt->fetch(
            PDO::FETCH_ASSOC
        );


    if (
        !$utilisateur
    ) {

        repondre(
            [
                "erreur" =>
                    "Utilisateur introuvable."
            ],
            404
        );

    }


    /*
     * Vérifier si le partage existe
     * déjà.
     */

    $stmt =
        $pdo->prepare(
            "
            SELECT 1
            FROM task_members
            WHERE task_id = :task_id
              AND user_id = :user_id
            LIMIT 1
            "
        );


    $stmt->execute(
        [
            ":task_id" =>
                $taskId,

            ":user_id" =>
                $membreId
        ]
    );


    if (
        $stmt->fetchColumn()
    ) {

        repondre(
            [
                "erreur" =>
                    "Cet utilisateur est déjà membre de la tâche."
            ],
            409
        );

    }


    /*
     * Ajouter le membre.
     */

    $stmt =
        $pdo->prepare(
            "
            INSERT INTO task_members
            (
                task_id,
                user_id,
                role
            )
            VALUES
            (
                :task_id,
                :user_id,
                'member'
            )
            "
        );


    $stmt->execute(
        [
            ":task_id" =>
                $taskId,

            ":user_id" =>
                $membreId
        ]
    );

creerNotification(
    $pdo,
    $membreId,
    $taskId,
    "tache_partagee",
    "Une tâche vous a été partagée."
);

    repondre(
        [
            "succes" =>
                true,

            "message" =>
                "Utilisateur ajouté à la tâche.",

            "task_id" =>
                $taskId,

            "user" =>
                $utilisateur
        ],
        201
    );

}


// ============================================================
// DELETE
// Retirer un membre d'une tâche
// ============================================================

if (
    $method === "DELETE"
) {

    $donnees =
        lireJSON();


    $taskId =
        $donnees["task_id"] ??
        null;

    $membreId =
        $donnees["user_id"] ??
        null;


    if (
        !idValide($taskId)
    ) {

        repondre(
            [
                "erreur" =>
                    "Identifiant de tâche invalide."
            ],
            400
        );

    }


    if (
        !idValide($membreId)
    ) {

        repondre(
            [
                "erreur" =>
                    "Identifiant utilisateur invalide."
            ],
            400
        );

    }


    $taskId =
        (int) $taskId;

    $membreId =
        (int) $membreId;


    /*
     * Seul le propriétaire peut
     * retirer un membre.
     */

    if (
        !verifierProprietaire(
            $pdo,
            $taskId,
            $userId
        )
    ) {

        repondre(
            [
                "erreur" =>
                    "Seul le propriétaire peut retirer un membre."
            ],
            403
        );

    }


    /*
     * Vérifier que le membre existe
     * sur cette tâche.
     */

    $stmt =
        $pdo->prepare(
            "
            DELETE FROM task_members
            WHERE task_id = :task_id
              AND user_id = :user_id
            "
        );


    $stmt->execute(
        [
            ":task_id" =>
                $taskId,

            ":user_id" =>
                $membreId
        ]
    );


    if (
        $stmt->rowCount() === 0
    ) {

        repondre(
            [
                "erreur" =>
                    "Cet utilisateur n'est pas membre de cette tâche."
            ],
            404
        );

    }


    repondre(
        [
            "succes" =>
                true,

            "message" =>
                "Utilisateur retiré de la tâche.",

            "task_id" =>
                $taskId,

            "user_id" =>
                $membreId
        ]
    );

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
