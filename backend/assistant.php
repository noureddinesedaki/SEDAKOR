<?php

require_once __DIR__ . "/session-config.php";

header(
    "Content-Type: application/json; charset=UTF-8"
);

require_once __DIR__ . "/config.php";


// ============================================================
// FONCTION DE RÉPONSE
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
// UTILISATEUR CONNECTÉ
// ============================================================

$userId =
    $_SESSION["user_id"] ??
    null;


if ($userId === null) {

    repondre(
        [
            "erreur" =>
                "Vous devez être connecté."
        ],
        401
    );

}


// ============================================================
// GET — CONTEXTE IA
// ============================================================

if (
    $_SERVER["REQUEST_METHOD"] !==
    "GET"
) {

    repondre(
        [
            "erreur" =>
                "Méthode HTTP non autorisée."
        ],
        405
    );

}


try {

    // ========================================================
    // TÂCHES
    // ========================================================

    $requeteTaches =
        $pdo->prepare(

            "SELECT

                t.id,
                t.titre,
                t.priorite,
                t.categorie,
                t.date_echeance,
                t.heure_rappel,
                t.recurrence,
                t.terminee,
                t.project_id,

                p.nom AS project_nom

            FROM tasks t

            LEFT JOIN projects p
                ON p.id = t.project_id

            WHERE t.user_id = :user_id

            ORDER BY
                t.terminee ASC,
                t.date_echeance ASC,
                t.id DESC"

        );


    $requeteTaches->execute(
        [
            ":user_id" =>
                $userId
        ]
    );


    $taches =
        $requeteTaches->fetchAll(
            PDO::FETCH_ASSOC
        );


    // ========================================================
    // PROJETS
    // ========================================================

    $requeteProjets =
        $pdo->prepare(

            "SELECT

                p.id,
                p.nom,
                p.description,
                p.couleur

            FROM projects p

            WHERE p.user_id = :user_id

            ORDER BY p.created_at DESC"

        );


    $requeteProjets->execute(
        [
            ":user_id" =>
                $userId
        ]
    );


    $projets =
        $requeteProjets->fetchAll(
            PDO::FETCH_ASSOC
        );


    // ========================================================
    // NORMALISATION
    // ========================================================

    foreach (
        $taches as &$tache
    ) {

        $tache["id"] =
            (int)
            $tache["id"];

        $tache["terminee"] =
            (bool)
            $tache["terminee"];

        if (
            $tache["project_id"] !==
            null
        ) {

            $tache["project_id"] =
                (int)
                $tache["project_id"];

        }

    }

    unset($tache);


    foreach (
        $projets as &$projet
    ) {

        $projet["id"] =
            (int)
            $projet["id"];

    }

    unset($projet);


    // ========================================================
    // STATISTIQUES
    // ========================================================

    $total =
        count($taches);


    $terminees =
        count(
            array_filter(
                $taches,
                function ($tache) {

                    return
                        $tache["terminee"];

                }
            )
        );


    $enCours =
        $total -
        $terminees;


    $aujourdHui =
        date("Y-m-d");


    $echeancesAujourdHui =
        count(
            array_filter(
                $taches,
                function ($tache)
                    use ($aujourdHui) {

                    return
                        !$tache["terminee"] &&
                        $tache["date_echeance"] ===
                        $aujourdHui;

                }
            )
        );


    $enRetard =
        count(
            array_filter(
                $taches,
                function ($tache)
                    use ($aujourdHui) {

                    return
                        !$tache["terminee"] &&
                        !empty(
                            $tache["date_echeance"]
                        ) &&
                        $tache["date_echeance"] <
                        $aujourdHui;

                }
            )
        );


    // ========================================================
    // RÉPONSE
    // ========================================================

    repondre(
        [

            "succes" =>
                true,

            "contexte" => [

                "date" =>
                    $aujourdHui,

                "statistiques" => [

                    "total" =>
                        $total,

                    "terminees" =>
                        $terminees,

                    "enCours" =>
                        $enCours,

                    "echeancesAujourdHui" =>
                        $echeancesAujourdHui,

                    "enRetard" =>
                        $enRetard

                ],

                "taches" =>
                    $taches,

                "projets" =>
                    $projets

            ]

        ]
    );

}
catch (
    PDOException $erreur
) {

    error_log(
        "SEDAKOR ASSISTANT ERROR : " .
        $erreur->getMessage()
    );


    repondre(
        [
            "erreur" =>
                "Impossible de récupérer les données SEDAKOR."
        ],
        500
    );

}