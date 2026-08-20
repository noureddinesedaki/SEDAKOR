<?php

ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

require_once __DIR__ . "/session-config.php";

header("Content-Type: application/json; charset=UTF-8");

require_once "config.php";

$userId = isset($_SESSION["user_id"])
    ? (int) $_SESSION["user_id"]
    : null;

// ============================================================
// FONCTIONS UTILITAIRES
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


function lireJSON()
{
    $contenu =
        file_get_contents("php://input");

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
                "Les données reçues sont invalides."
        ], 400);

    }


    return $donnees;
}


function valeurAutorisee(

    $valeur,

    $valeurs

) {

    return in_array(

        $valeur,

        $valeurs,

        true

    );

}


// ============================================================
// V23.2 — VÉRIFIER LES PERMISSIONS D'UNE TÂCHE
// ============================================================

function obtenirPermissionTache(

    PDO $pdo,

    int $taskId,

    int $userId

) {

    // Propriétaire = tous les droits

    $stmt = $pdo->prepare(

        "

        SELECT user_id

        FROM tasks

        WHERE id = :task_id

        LIMIT 1

        "

    );


    $stmt->execute([

        ":task_id" =>

            $taskId

    ]);


    $proprietaireId =

        $stmt->fetchColumn();


    if (

        $proprietaireId === false

    ) {

        return null;

    }


    if (

        (int) $proprietaireId ===

        $userId

    ) {

        return "owner";

    }


    // Vérifier le partage

    $stmt = $pdo->prepare(

        "

        SELECT role

        FROM task_members

        WHERE task_id = :task_id

          AND user_id = :user_id

        LIMIT 1

        "

    );


    $stmt->execute([

        ":task_id" =>

            $taskId,

        ":user_id" =>

            $userId

    ]);


    $role =

        $stmt->fetchColumn();


    if (

        $role === false

    ) {

        return null;

    }


    return $role;

}


function dateValide(
    $date
) {

    if (
        $date === null ||
        $date === ""
    ) {

        return true;

    }


    if (
        !is_string($date)
    ) {

        return false;

    }


    $objetDate =
        DateTime::createFromFormat(
            "Y-m-d",
            $date
        );


    return (
        $objetDate !== false &&
        $objetDate->format("Y-m-d") ===
        $date
    );

}


function heureValide(
    $heure
) {

    if (
        $heure === null ||
        $heure === ""
    ) {

        return true;

    }


    if (
        !is_string($heure)
    ) {

        return false;

    }


    $objetHeure =
        DateTime::createFromFormat(
            "H:i",
            $heure
        );


    return (
        $objetHeure !== false &&
        $objetHeure->format("H:i") ===
        $heure
    );

}


function validerSousTaches(
    $sousTaches
) {

    if (
        !is_array($sousTaches)
    ) {

        return false;

    }


    foreach (
        $sousTaches as $sousTache
    ) {

        if (
            !is_array($sousTache)
        ) {

            return false;

        }


        if (
            !array_key_exists(
                "id",
                $sousTache
            )
        ) {

            return false;

        }


        if (
            !array_key_exists(
                "texte",
                $sousTache
            )
        ) {

            return false;

        }


        if (
            !is_scalar(
                $sousTache["id"]
            )
        ) {

            return false;

        }


        if (
            !is_string(
                $sousTache["texte"]
            )
        ) {

            return false;

        }


        $texte =
            trim(
                $sousTache["texte"]
            );


        if (
            $texte === ""
        ) {

            return false;

        }


        if (
            strlen($texte) >
            500
        ) {

            return false;

        }


        if (
            isset(
                $sousTache["terminee"]
            ) &&
            !is_bool(
                $sousTache["terminee"]
            ) &&
            !in_array(
                $sousTache["terminee"],
                [0, 1, "0", "1"],
                true
            )
        ) {

            return false;

        }

    }


    return true;

}


// ============================================================
// CONNEXION MYSQL
// ============================================================

try {

    $pdo =
        new PDO(
            "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
            $username,
            $password
        );


    $pdo->setAttribute(
        PDO::ATTR_ERRMODE,
        PDO::ERRMODE_EXCEPTION
    );


    $pdo->setAttribute(
        PDO::ATTR_DEFAULT_FETCH_MODE,
        PDO::FETCH_ASSOC
    );


    // ========================================================
    // MÉTHODE HTTP
    // ========================================================

    $method =
        $_SERVER["REQUEST_METHOD"];


    // ========================================================
    // VALEURS AUTORISÉES
    // ========================================================

    $prioritesAutorisees = [
        "basse",
        "moyenne",
        "haute"
    ];


    $categoriesAutorisees = [
        "travail",
        "etudes",
        "personnel",
        "projets",
        "autre"
    ];


    $recurrencesAutorisees = [
        "aucune",
        "quotidienne",
        "hebdomadaire",
        "mensuelle"
    ];


    // ========================================================
// GET
// RÉCUPÉRER LES TÂCHES
// ========================================================

if (
    $method === "GET"
) {

    // ----------------------------------------------------
    // UTILISATEUR NON CONNECTÉ
    // AUCUNE TÂCHE ACCESSIBLE
    // ----------------------------------------------------

    if (
        $userId === null
    ) {

        repondre([]);

    }


    // ----------------------------------------------------
    // UTILISATEUR CONNECTÉ
    // UNIQUEMENT SES TÂCHES
    // ----------------------------------------------------

    $requete =
    $pdo->prepare(
        "SELECT
	    t.id,
	    t.user_id,
	    t.titre,
	    t.project_id,
	    t.priorite,
	    t.categorie,
	    t.date_echeance,
            t.heure_rappel,
            t.rappel_active,
            t.recurrence,
            t.terminee,
            t.sous_taches,
            t.project_id,
            p.nom AS project_nom,
            p.couleur AS project_couleur,
            t.created_at,
            t.updated_at

        FROM tasks t

        LEFT JOIN projects p
            ON p.id = t.project_id

        WHERE
            t.user_id = :user_id
            OR EXISTS (
                SELECT 1
                FROM task_members tm
                WHERE tm.task_id = t.id
                  AND tm.user_id = :member_id
            )

        ORDER BY t.id DESC"
    );


    $requete->execute([
    ":user_id" =>
        $userId,

    ":member_id" =>
        $userId
]);


    $taches =
        $requete->fetchAll();


    foreach (
        $taches as &$tache
    ) {

        $tache["id"] =
            (int)
            $tache["id"];


        if (
            $tache["user_id"] !==
            null
        ) {

            $tache["user_id"] =
                (int)
                $tache["user_id"];

        }


        $tache["terminee"] =
            (bool)
            $tache["terminee"];


        $tache["rappel_active"] =
            (bool)
            $tache["rappel_active"];


        // -----------------------------------------------
        // Sous-tâches JSON
        // -----------------------------------------------

        if (
            !empty(
                $tache["sous_taches"]
            )
        ) {

            $sousTaches =
                json_decode(
                    $tache["sous_taches"],
                    true
                );


            if (
                is_array(
                    $sousTaches
                )
            ) {

                $tache["sousTaches"] =
                    $sousTaches;

            } else {

                $tache["sousTaches"] =
                    [];

            }

        } else {

            $tache["sousTaches"] =
                [];

        }


        unset(
            $tache["sous_taches"]
        );

    }


    unset($tache);


    repondre(
        $taches
    );

}


    // ========================================================
    // POST
    // CRÉER UNE TÂCHE
    // ========================================================

    if (
        $method === "POST"
    ) {

        $donnees =
            lireJSON();


        // ----------------------------------------------------
        // TITRE
        // ----------------------------------------------------

        $titre =
            trim(
                $donnees["texte"] ?? ""
            );


        if (
            $titre === ""
        ) {

            repondre([
                "erreur" =>
                    "Le titre est obligatoire."
            ], 400);

        }


        if (
            mb_strlen($titre) >
            500
        ) {

            repondre([
                "erreur" =>
                    "Le titre ne peut pas dépasser 500 caractères."
            ], 400);

        }


        // ----------------------------------------------------
        // PRIORITÉ
        // ----------------------------------------------------

        $priorite =
            $donnees["priorite"] ??
            "moyenne";


        if (
            !valeurAutorisee(
                $priorite,
                $prioritesAutorisees
            )
        ) {

            repondre([
                "erreur" =>
                    "Priorité invalide."
            ], 400);

        }


        // ----------------------------------------------------
        // CATÉGORIE
        // ----------------------------------------------------

        $categorie =
            $donnees["categorie"] ??
            "autre";


        if (
            !valeurAutorisee(
                $categorie,
                $categoriesAutorisees
            )
        ) {

            repondre([
                "erreur" =>
                    "Catégorie invalide."
            ], 400);

        }


        // ----------------------------------------------------
        // DATE
        // ----------------------------------------------------

        $dateEcheance =
            $donnees["dateEcheance"] ??
            null;


        if (
            !dateValide(
                $dateEcheance
            )
        ) {

            repondre([
                "erreur" =>
                    "Date d'échéance invalide."
            ], 400);

        }


        // ----------------------------------------------------
        // HEURE
        // ----------------------------------------------------

        $heureRappel =
            $donnees["heureRappel"] ??
            null;


        if (
            !heureValide(
                $heureRappel
            )
        ) {

            repondre([
                "erreur" =>
                    "Heure de rappel invalide."
            ], 400);

        }


        // ----------------------------------------------------
        // RÉCURRENCE
        // ----------------------------------------------------

        $recurrence =
            $donnees["recurrence"] ??
            "aucune";


        if (
            !valeurAutorisee(
                $recurrence,
                $recurrencesAutorisees
            )
        ) {

            repondre([
                "erreur" =>
                    "Type de récurrence invalide."
            ], 400);

        }


        // ----------------------------------------------------
        // STATUT
        // ----------------------------------------------------

        $terminee =
            !empty(
                $donnees["terminee"]
            )
                ? 1
                : 0;


        // ----------------------------------------------------
        // SOUS-TÂCHES
        // ----------------------------------------------------

        $sousTaches =
            $donnees["sousTaches"] ??
            [];


        if (
            !validerSousTaches(
                $sousTaches
            )
        ) {

            repondre([
                "erreur" =>
                    "Les sous-tâches sont invalides."
            ], 400);

        }

        // ----------------------------------------------------
// PROJET
// ----------------------------------------------------

$projectId =
    $donnees["projectId"] ?? null;

if (
    $projectId !== null &&
    $projectId !== ""
) {

    $projectId =
        (int) $projectId;

    if ($projectId <= 0) {

        repondre([
            "erreur" =>
                "Projet invalide."
        ], 400);

    }

    // Vérifier que le projet appartient
    // bien à l'utilisateur connecté.

    $requeteProjet =
        $pdo->prepare(
            "SELECT id
             FROM projects
             WHERE id = :id
               AND user_id = :user_id
             LIMIT 1"
        );

    $requeteProjet->execute([
        ":id" =>
            $projectId,

        ":user_id" =>
            $userId
    ]);

    if (
        !$requeteProjet->fetch()
    ) {

        repondre([
            "erreur" =>
                "Projet introuvable."
        ], 404);

    }

} else {

    $projectId = null;

}

        $sousTachesJson =
            json_encode(
                $sousTaches,
                JSON_UNESCAPED_UNICODE
            );


        if (
            $sousTachesJson === false
        ) {

            repondre([
                "erreur" =>
                    "Impossible d'enregistrer les sous-tâches."
            ], 400);

        }


        // ----------------------------------------------------
        // INSERT
        // ----------------------------------------------------

        $requete =
    $pdo->prepare(
        "INSERT INTO tasks
        (
            user_id,
            project_id,
            titre,
            priorite,
            categorie,
            date_echeance,
            heure_rappel,
            rappel_active,
            recurrence,
            terminee,
            sous_taches
        )
        VALUES
        (
            :user_id,
            :project_id,
            :titre,
            :priorite,
            :categorie,
            :date_echeance,
            :heure_rappel,
            :rappel_active,
            :recurrence,
            :terminee,
            :sous_taches
        )"
    );

        $requete->execute([

            ":user_id" =>
                $userId,

            ":project_id" =>
                $projectId,

            ":titre" =>
                $titre,

            ":priorite" =>
                $priorite,

            ":categorie" =>
                $categorie,

            ":date_echeance" =>
                $dateEcheance ?: null,

            ":heure_rappel" =>
                $heureRappel ?: null,

            ":rappel_active" =>
                $heureRappel
                    ? 1
                    : 0,

            ":recurrence" =>
                $recurrence,

            ":terminee" =>
                $terminee,

            ":sous_taches" =>
                $sousTachesJson

        ]);


        repondre([

            "succes" =>
                true,

            "id" =>
                (int)
                $pdo->lastInsertId()

        ], 201);

    }


    // ========================================================
    // PUT
    // MODIFIER UNE TÂCHE
    // ========================================================

    if (
        $method === "PUT"
    ) {

        $donnees =
            lireJSON();


        // ----------------------------------------------------
        // ID
        // ----------------------------------------------------

        $id =
            $donnees["id"] ??
            null;


        if (
            !is_numeric($id) ||
            (int)$id <= 0
        ) {

            repondre([
                "erreur" =>
                    "Identifiant de tâche invalide."
            ], 400);

        }


        $id =
            (int)$id;


        // ----------------------------------------------------
        // VÉRIFIER QUE LA TÂCHE EXISTE
        // ----------------------------------------------------

        $verification =
    $pdo->prepare(
        "SELECT id, user_id
         FROM tasks
         WHERE id = :id"
    );


        $verification->execute([
            ":id" =>
                $id
        ]);


        $tacheExistante = $verification->fetch();

if (
    !$tacheExistante
) {

    repondre([
        "erreur" =>
            "Tâche introuvable."
    ], 404);

}

$permission =
    obtenirPermissionTache(
        $pdo,
        $id,
        $userId
    );

if (
    $permission !== "owner" &&
    $permission !== "member_edit"
) {
    repondre([
        "erreur" =>
            "Vous n'avez pas la permission de modifier cette tâche."
    ], 403);
}


        $champs = [];

        $parametres = [
            ":id" =>
                $id
        ];


        // ----------------------------------------------------
        // TITRE
        // ----------------------------------------------------

        if (
            array_key_exists(
                "texte",
                $donnees
            )
        ) {

            $titre =
                trim(
                    $donnees["texte"]
                );


            if (
                $titre === ""
            ) {

                repondre([
                    "erreur" =>
                        "Le titre ne peut pas être vide."
                ], 400);

            }


            if (
                mb_strlen($titre) >
                500
            ) {

                repondre([
                    "erreur" =>
                        "Le titre ne peut pas dépasser 500 caractères."
                ], 400);

            }


            $champs[] =
                "titre = :titre";


            $parametres[":titre"] =
                $titre;

        }


        // ----------------------------------------------------
        // PRIORITÉ
        // ----------------------------------------------------

        if (
            array_key_exists(
                "priorite",
                $donnees
            )
        ) {

            if (
                !valeurAutorisee(
                    $donnees["priorite"],
                    $prioritesAutorisees
                )
            ) {

                repondre([
                    "erreur" =>
                        "Priorité invalide."
                ], 400);

            }


            $champs[] =
                "priorite = :priorite";


            $parametres[":priorite"] =
                $donnees["priorite"];

        }


        // ----------------------------------------------------
        // CATÉGORIE
        // ----------------------------------------------------

        if (
            array_key_exists(
                "categorie",
                $donnees
            )
        ) {

            if (
                !valeurAutorisee(
                    $donnees["categorie"],
                    $categoriesAutorisees
                )
            ) {

                repondre([
                    "erreur" =>
                        "Catégorie invalide."
                ], 400);

            }


            $champs[] =
                "categorie = :categorie";


            $parametres[":categorie"] =
                $donnees["categorie"];

        }

        // ----------------------------------------------------
// PROJET
// ----------------------------------------------------

if (
    array_key_exists(
        "projectId",
        $donnees
    )
) {

    $projectId =
        $donnees["projectId"];


    // Autoriser explicitement
    // l'absence de projet.

    if (
        $projectId === null ||
        $projectId === ""
    ) {

        $champs[] =
            "project_id = :project_id";

        $parametres[
            ":project_id"
        ] = null;

    } else {

        if (
            !is_numeric($projectId) ||
            (int) $projectId <= 0
        ) {

            repondre([
                "erreur" =>
                    "Projet invalide."
            ], 400);

        }


        $projectId =
            (int) $projectId;


        // Vérifier que le projet
        // appartient à l'utilisateur.

        $verificationProjet =
            $pdo->prepare(
                "SELECT id
                 FROM projects
                 WHERE id = :id
                   AND user_id = :user_id
                 LIMIT 1"
            );


        $verificationProjet->execute([

            ":id" =>
                $projectId,

            ":user_id" =>
                $userId

        ]);


        if (
            !$verificationProjet->fetch()
        ) {

            repondre([
                "erreur" =>
                    "Projet introuvable."
            ], 404);

        }


        $champs[] =
            "project_id = :project_id";


        $parametres[
            ":project_id"
        ] =
            $projectId;

    }

}

        // ----------------------------------------------------
        // DATE
        // ----------------------------------------------------

        if (
            array_key_exists(
                "dateEcheance",
                $donnees
            )
        ) {

            if (
                !dateValide(
                    $donnees["dateEcheance"]
                )
            ) {

                repondre([
                    "erreur" =>
                        "Date d'échéance invalide."
                ], 400);

            }


            $champs[] =
                "date_echeance = :date_echeance";


            $parametres[
                ":date_echeance"
            ] =
                $donnees["dateEcheance"]
                ?: null;

        }


        // ----------------------------------------------------
        // RAPPEL
        // ----------------------------------------------------

        if (
            array_key_exists(
                "heureRappel",
                $donnees
            )
        ) {

            if (
                !heureValide(
                    $donnees["heureRappel"]
                )
            ) {

                repondre([
                    "erreur" =>
                        "Heure de rappel invalide."
                ], 400);

            }


            $champs[] =
                "heure_rappel = :heure_rappel";


            $parametres[
                ":heure_rappel"
            ] =
                $donnees["heureRappel"]
                ?: null;


            $champs[] =
                "rappel_active = :rappel_active";


            $parametres[
                ":rappel_active"
            ] =
                !empty(
                    $donnees["heureRappel"]
                )
                    ? 1
                    : 0;

        }


        // ----------------------------------------------------
        // RÉCURRENCE
        // ----------------------------------------------------

        if (
            array_key_exists(
                "recurrence",
                $donnees
            )
        ) {

            if (
                !valeurAutorisee(
                    $donnees["recurrence"],
                    $recurrencesAutorisees
                )
            ) {

                repondre([
                    "erreur" =>
                        "Type de récurrence invalide."
                ], 400);

            }


            $champs[] =
                "recurrence = :recurrence";


            $parametres[
                ":recurrence"
            ] =
                $donnees["recurrence"];

        }


        // ----------------------------------------------------
        // TERMINÉE
        // ----------------------------------------------------

        if (
            array_key_exists(
                "terminee",
                $donnees
            )
        ) {

            $terminee =
                !empty(
                    $donnees["terminee"]
                )
                    ? 1
                    : 0;


            $champs[] =
                "terminee = :terminee";


            $parametres[
                ":terminee"
            ] =
                $terminee;

        }


        // ----------------------------------------------------
        // SOUS-TÂCHES
        // ----------------------------------------------------

        if (
            array_key_exists(
                "sousTaches",
                $donnees
            )
        ) {

            if (
                !validerSousTaches(
                    $donnees["sousTaches"]
                )
            ) {

                repondre([
                    "erreur" =>
                        "Les sous-tâches sont invalides."
                ], 400);

            }


            $sousTachesJson =
                json_encode(
                    $donnees["sousTaches"],
                    JSON_UNESCAPED_UNICODE
                );


            if (
                $sousTachesJson === false
            ) {

                repondre([
                    "erreur" =>
                        "Impossible d'enregistrer les sous-tâches."
                ], 400);

            }


            $champs[] =
                "sous_taches = :sous_taches";


            $parametres[
                ":sous_taches"
            ] =
                $sousTachesJson;

        }


        // ----------------------------------------------------
        // RIEN À MODIFIER
        // ----------------------------------------------------

        if (
            empty($champs)
        ) {

            repondre([
                "erreur" =>
                    "Aucune donnée à modifier."
            ], 400);

        }


        // ----------------------------------------------------
        // UPDATE
        // ----------------------------------------------------

        $sql =
            "UPDATE tasks SET " .
            implode(
                ", ",
                $champs
            ) .
            " WHERE id = :id";


        $requete =
            $pdo->prepare(
                $sql
            );


        $requete->execute(
            $parametres
        );


        repondre([

            "succes" =>
                true,

            "id" =>
                $id

        ]);

    }


    // ========================================================
    // DELETE
    // SUPPRIMER UNE TÂCHE
    // ========================================================

   if (
    $method === "DELETE"
) {

    $donnees =
        lireJSON();


    $id =
        $donnees["id"] ??
        $_GET["id"] ??
        null;


    if (
        !is_numeric($id) ||
        (int)$id <= 0
    ) {

        repondre([
            "erreur" =>
                "ID de tâche invalide."
        ], 400);

    }


    $id =
        (int)$id;


    if ($userId === null) {
    repondre([
        "erreur" =>
            "Vous devez être connecté."
    ], 401);
}

$requete =
    $pdo->prepare(
        "
        DELETE FROM tasks
        WHERE id = :id
          AND user_id = :user_id
        "
    );

$requete->execute([
    ":id" =>
        $id,

    ":user_id" =>
        $userId
]);


    // ----------------------------------------------------
    // VÉRIFICATION
    // ----------------------------------------------------

    if (
        $requete->rowCount() === 0
    ) {

        repondre([
            "erreur" =>
                "Tâche introuvable ou non autorisée."
        ], 404);

    }


    repondre([

        "succes" =>
            true,

        "message" =>
            "Tâche supprimée.",

        "id" =>
            $id

    ]);

}


    // ========================================================
    // MÉTHODE INCONNUE
    // ========================================================

    repondre([
        "erreur" =>
            "Méthode HTTP non autorisée."
    ], 405);


}
catch (
    PDOException $e
) {

    error_log(
        "SEDAKOR PDO ERROR: " .
        $e->getMessage()
    );


    repondre([
        "erreur" =>
            "Erreur interne de la base de données."
    ], 500);

}
catch (
    Throwable $e
) {

    error_log(
        "SEDAKOR API ERROR: " .
        $e->getMessage()
    );


    repondre([
        "erreur" =>
            "Une erreur interne est survenue."
    ], 500);

}
