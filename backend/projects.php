<?php

require_once __DIR__ . "/session-config.php";

header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . "/config.php";


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
// UTILISATEUR CONNECTÉ
// ============================================================

$userId =
    $_SESSION["user_id"] ?? null;


if ($userId === null) {

    repondre([
        "erreur" =>
            "Vous devez être connecté."
    ], 401);

}


$userId = (int) $userId;


// ============================================================
// LIRE LE JSON
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


    if (
        !is_array($donnees)
    ) {

        repondre([
            "erreur" =>
                "Données invalides."
        ], 400);

    }


    return $donnees;
}


// ============================================================
// MÉTHODE
// ============================================================

$method =
    $_SERVER["REQUEST_METHOD"];


// ============================================================
// GET — LISTE DES PROJETS
// ============================================================

if ($method === "GET") {

    try {

        $requete =
            $pdo->prepare(

                "SELECT
                    p.id,
                    p.nom,
                    p.description,
                    p.couleur,
                    p.created_at,
                    p.updated_at,

                    COUNT(t.id) AS nombre_taches,

                    COALESCE(
                        SUM(
                            CASE
                                WHEN t.terminee = 1
                                THEN 1
                                ELSE 0
                            END
                        ),
                        0
                    ) AS taches_terminees

                FROM projects p

                LEFT JOIN tasks t
                    ON t.project_id = p.id
                    AND t.user_id = p.user_id

                WHERE p.user_id = :user_id

                GROUP BY
                    p.id,
                    p.nom,
                    p.description,
                    p.couleur,
                    p.created_at,
                    p.updated_at

                ORDER BY
                    p.created_at DESC"

            );


        $requete->execute([
            ":user_id" => $userId
        ]);


        $projets =
            $requete->fetchAll(
                PDO::FETCH_ASSOC
            );


        foreach ($projets as &$projet) {

            $projet["id"] =
                (int) $projet["id"];

            $projet["nombre_taches"] =
                (int) $projet["nombre_taches"];

            $projet["taches_terminees"] =
                (int) $projet["taches_terminees"];


            if (
                $projet["nombre_taches"] > 0
            ) {

                $projet["progression"] =
                    (int) round(

                        (
                            $projet["taches_terminees"] /
                            $projet["nombre_taches"]
                        ) * 100

                    );

            } else {

                $projet["progression"] = 0;

            }

        }

        unset($projet);


        repondre([
            "succes" => true,
            "projets" => $projets
        ]);

    }

    catch (PDOException $erreur) {

        error_log(
            "SEDAKOR PROJECTS GET ERROR : " .
            $erreur->getMessage()
        );


        repondre([
            "erreur" =>
                "Impossible de charger les projets."
        ], 500);

    }

}


// ============================================================
// POST — CRÉER UN PROJET
// ============================================================

if ($method === "POST") {

    $donnees =
        lireJSON();


    $nom =
        trim(
            $donnees["nom"] ?? ""
        );


    $description =
        trim(
            $donnees["description"] ?? ""
        );


    $couleur =
        trim(
            $donnees["couleur"] ??
            "#6366f1"
        );


    if ($nom === "") {

        repondre([
            "erreur" =>
                "Le nom du projet est obligatoire."
        ], 400);

    }


    if (
        mb_strlen($nom) > 150
    ) {

        repondre([
            "erreur" =>
                "Le nom du projet est trop long."
        ], 400);

    }


    if (
        !preg_match(
            '/^#[0-9A-Fa-f]{6}$/',
            $couleur
        )
    ) {

        repondre([
            "erreur" =>
                "Couleur invalide."
        ], 400);

    }


    try {

        $requete =
            $pdo->prepare(

                "INSERT INTO projects
                (
                    user_id,
                    nom,
                    description,
                    couleur
                )

                VALUES
                (
                    :user_id,
                    :nom,
                    :description,
                    :couleur
                )"

            );


        $requete->execute([

            ":user_id" =>
                $userId,

            ":nom" =>
                $nom,

            ":description" =>
                $description !== ""
                    ? $description
                    : null,

            ":couleur" =>
                $couleur

        ]);


        $projectId =
            (int) $pdo->lastInsertId();


        repondre([

            "succes" => true,

            "message" =>
                "Projet créé.",

            "projet" => [

                "id" =>
                    $projectId,

                "nom" =>
                    $nom,

                "description" =>
                    $description,

                "couleur" =>
                    $couleur,

                "nombre_taches" =>
                    0,

                "taches_terminees" =>
                    0,

                "progression" =>
                    0

            ]

        ], 201);

    }

    catch (PDOException $erreur) {

        error_log(
            "SEDAKOR PROJECTS POST ERROR : " .
            $erreur->getMessage()
        );


        repondre([
            "erreur" =>
                "Impossible de créer le projet."
        ], 500);

    }

}


// ============================================================
// PUT — MODIFIER UN PROJET
// ============================================================

if ($method === "PUT") {

    $donnees =
        lireJSON();


    $projectId =
        (int) (
            $donnees["id"] ?? 0
        );


    if ($projectId <= 0) {

        repondre([
            "erreur" =>
                "Projet invalide."
        ], 400);

    }


    $nom =
        trim(
            $donnees["nom"] ?? ""
        );


    $description =
        trim(
            $donnees["description"] ?? ""
        );


    $couleur =
        trim(
            $donnees["couleur"] ??
            "#6366f1"
        );


    if ($nom === "") {

        repondre([
            "erreur" =>
                "Le nom du projet est obligatoire."
        ], 400);

    }


    if (
        !preg_match(
            '/^#[0-9A-Fa-f]{6}$/',
            $couleur
        )
    ) {

        repondre([
            "erreur" =>
                "Couleur invalide."
        ], 400);

    }


    try {

        $requete =
            $pdo->prepare(

                "UPDATE projects

                 SET
                    nom = :nom,
                    description = :description,
                    couleur = :couleur

                 WHERE id = :id
                   AND user_id = :user_id"

            );


        $requete->execute([

            ":id" =>
                $projectId,

            ":user_id" =>
                $userId,

            ":nom" =>
                $nom,

            ":description" =>
                $description !== ""
                    ? $description
                    : null,

            ":couleur" =>
                $couleur

        ]);


        if (
            $requete->rowCount() === 0
        ) {

            repondre([
                "erreur" =>
                    "Projet introuvable."
            ], 404);

        }


        repondre([

            "succes" => true,

            "message" =>
                "Projet modifié."

        ]);

    }

    catch (PDOException $erreur) {

        error_log(
            "SEDAKOR PROJECTS PUT ERROR : " .
            $erreur->getMessage()
        );


        repondre([
            "erreur" =>
                "Impossible de modifier le projet."
        ], 500);

    }

}


// ============================================================
// DELETE — SUPPRIMER UN PROJET
// ============================================================

if ($method === "DELETE") {

    $donnees =
        lireJSON();


    $projectId =
        (int) (
            $donnees["id"] ?? 0
        );


    if ($projectId <= 0) {

        repondre([
            "erreur" =>
                "Projet invalide."
        ], 400);

    }


    try {

        $requete =
            $pdo->prepare(

                "DELETE FROM projects

                 WHERE id = :id
                   AND user_id = :user_id"

            );


        $requete->execute([

            ":id" =>
                $projectId,

            ":user_id" =>
                $userId

        ]);


        if (
            $requete->rowCount() === 0
        ) {

            repondre([
                "erreur" =>
                    "Projet introuvable."
            ], 404);

        }


        repondre([

            "succes" => true,

            "message" =>
                "Projet supprimé."

        ]);

    }

    catch (PDOException $erreur) {

        error_log(
            "SEDAKOR PROJECTS DELETE ERROR : " .
            $erreur->getMessage()
        );


        repondre([
            "erreur" =>
                "Impossible de supprimer le projet."
        ], 500);

    }

}


// ============================================================
// MÉTHODE INCONNUE
// ============================================================

repondre([
    "erreur" =>
        "Méthode HTTP non autorisée."
], 405);
