<?php

header("Content-Type: application/json; charset=UTF-8");

require_once "config.php";


try {

    // =========================
    // CONNEXION À MYSQL
    // =========================

    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $username,
        $password
    );

    $pdo->setAttribute(
        PDO::ATTR_ERRMODE,
        PDO::ERRMODE_EXCEPTION
    );


    // =========================
    // MÉTHODE HTTP
    // =========================

    $method = $_SERVER["REQUEST_METHOD"];


    // =========================================================
    // GET : récupérer toutes les tâches
    // =========================================================

    if ($method === "GET") {

        $requete = $pdo->query(
            "SELECT
                id,
                user_id,
                titre,
                priorite,
                categorie,
                date_echeance,
                heure_rappel,
                rappel_active,
                recurrence,
                terminee,
                sous_taches,
                created_at,
                updated_at
             FROM tasks
             ORDER BY id DESC"
        );


        $taches = $requete->fetchAll(
            PDO::FETCH_ASSOC
        );


        /*
         * Conversion des données MySQL
         * vers les noms utilisés par JavaScript.
         */

        foreach ($taches as &$tache) {

            $tache["id"] =
                (int) $tache["id"];

            if ($tache["user_id"] !== null) {

                $tache["user_id"] =
                    (int) $tache["user_id"];
            }


            $tache["terminee"] =
                (bool) $tache["terminee"];


            $tache["rappel_active"] =
                (bool) $tache["rappel_active"];


            /*
             * MySQL stocke les sous-tâches
             * en JSON.
             */

            if (
                !empty($tache["sous_taches"])
            ) {

                $sousTaches =
                    json_decode(
                        $tache["sous_taches"],
                        true
                    );

                if (
                    is_array($sousTaches)
                ) {

                    $tache["sous_taches"] =
                        $sousTaches;

                } else {

                    $tache["sous_taches"] =
                        [];
                }

            } else {

                $tache["sous_taches"] =
                    [];
            }


            /*
             * Le JavaScript utilise
             * sousTaches.
             */

            $tache["sousTaches"] =
                $tache["sous_taches"];

            unset(
                $tache["sous_taches"]
            );
        }

        unset($tache);


        echo json_encode(
            $taches,
            JSON_UNESCAPED_UNICODE
        );

        exit;
    }


    // =========================================================
    // POST : créer une nouvelle tâche
    // =========================================================

    if ($method === "POST") {

        $donnees = json_decode(
            file_get_contents("php://input"),
            true
        );


        if (!$donnees) {

            http_response_code(400);

            echo json_encode([
                "erreur" =>
                    "Données invalides."
            ]);

            exit;
        }


        // -------------------------
        // Récupération des données
        // -------------------------

        $titre =
            trim(
                $donnees["texte"] ?? ""
            );


        $priorite =
            $donnees["priorite"]
            ?? "moyenne";


        $categorie =
            $donnees["categorie"]
            ?? "autre";


        $dateEcheance =
            $donnees["dateEcheance"]
            ?? null;


        $heureRappel =
            $donnees["heureRappel"]
            ?? null;


        $recurrence =
            $donnees["recurrence"]
            ?? "aucune";


        $terminee =
            !empty(
                $donnees["terminee"]
            )
                ? 1
                : 0;


        $sousTaches =
            $donnees["sousTaches"]
            ?? [];


        // -------------------------
        // Vérification du titre
        // -------------------------

        if ($titre === "") {

            http_response_code(400);

            echo json_encode([
                "erreur" =>
                    "Le titre est obligatoire."
            ]);

            exit;
        }


        // -------------------------
        // Conversion sous-tâches
        // -------------------------

        $sousTachesJson =
            json_encode(
                $sousTaches,
                JSON_UNESCAPED_UNICODE
            );


        // -------------------------
        // INSERT
        // -------------------------

        $requete =
            $pdo->prepare(
                "INSERT INTO tasks
                (
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


        // -------------------------
        // Réponse
        // -------------------------

        echo json_encode([

            "succes" =>
                true,

            "id" =>
                (int)
                $pdo->lastInsertId()

        ]);


        exit;
    }


    // =========================================================
    // PUT : modifier une tâche
    // =========================================================

    if ($method === "PUT") {

        $donnees = json_decode(
            file_get_contents("php://input"),
            true
        );


        // -------------------------
        // Vérification des données
        // -------------------------

        if (!$donnees) {

            http_response_code(400);

            echo json_encode([
                "erreur" =>
                    "Données invalides."
            ]);

            exit;
        }


        // -------------------------
        // ID obligatoire
        // -------------------------

        $id =
            $donnees["id"]
            ?? null;


        if (!$id) {

            http_response_code(400);

            echo json_encode([
                "erreur" =>
                    "L'identifiant de la tâche est obligatoire."
            ]);

            exit;
        }


        // -------------------------
        // Champs à modifier
        // -------------------------

        $champs = [];


        $parametres = [
            ":id" => $id
        ];


        // -------------------------
        // TITRE
        // -------------------------

        if (
            array_key_exists(
                "texte",
                $donnees
            )
        ) {

            $champs[] =
                "titre = :titre";


            $parametres[":titre"] =
                trim(
                    $donnees["texte"]
                );
        }


        // -------------------------
        // PRIORITÉ
        // -------------------------

        if (
            array_key_exists(
                "priorite",
                $donnees
            )
        ) {

            $champs[] =
                "priorite = :priorite";


            $parametres[":priorite"] =
                $donnees["priorite"];
        }


        // -------------------------
        // CATÉGORIE
        // -------------------------

        if (
            array_key_exists(
                "categorie",
                $donnees
            )
        ) {

            $champs[] =
                "categorie = :categorie";


            $parametres[":categorie"] =
                $donnees["categorie"];
        }


        // -------------------------
        // DATE D'ÉCHÉANCE
        // -------------------------

        if (
            array_key_exists(
                "dateEcheance",
                $donnees
            )
        ) {

            $champs[] =
                "date_echeance = :date_echeance";


            $parametres[":date_echeance"] =
                $donnees["dateEcheance"]
                ?: null;
        }


        // -------------------------
        // HEURE DU RAPPEL
        // -------------------------

        if (
            array_key_exists(
                "heureRappel",
                $donnees
            )
        ) {

            $champs[] =
                "heure_rappel = :heure_rappel";


            $parametres[":heure_rappel"] =
                $donnees["heureRappel"]
                ?: null;


            $champs[] =
                "rappel_active = :rappel_active";


            $parametres[":rappel_active"] =
                !empty(
                    $donnees["heureRappel"]
                )
                    ? 1
                    : 0;
        }


        // -------------------------
        // RÉCURRENCE
        // -------------------------

        if (
            array_key_exists(
                "recurrence",
                $donnees
            )
        ) {

            $champs[] =
                "recurrence = :recurrence";


            $parametres[":recurrence"] =
                $donnees["recurrence"];
        }


        // -------------------------
        // TÂCHE TERMINÉE
        // -------------------------

        if (
            array_key_exists(
                "terminee",
                $donnees
            )
        ) {

            $champs[] =
                "terminee = :terminee";


            $parametres[":terminee"] =
                !empty(
                    $donnees["terminee"]
                )
                    ? 1
                    : 0;
        }


        // -------------------------
        // SOUS-TÂCHES
        // -------------------------

        if (
            array_key_exists(
                "sousTaches",
                $donnees
            )
        ) {

            $champs[] =
                "sous_taches = :sous_taches";


            $parametres[":sous_taches"] =
                json_encode(
                    $donnees["sousTaches"],
                    JSON_UNESCAPED_UNICODE
                );
        }


        // -------------------------
        // Rien à modifier
        // -------------------------

        if (
            empty($champs)
        ) {

            http_response_code(400);

            echo json_encode([
                "erreur" =>
                    "Aucune donnée à modifier."
            ]);

            exit;
        }


        // -------------------------
        // UPDATE
        // -------------------------

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


        // -------------------------
        // Vérification existence
        // -------------------------

        if (
            $requete->rowCount() === 0
        ) {

            $verification =
                $pdo->prepare(
                    "SELECT id
                     FROM tasks
                     WHERE id = :id"
                );


            $verification->execute([
                ":id" => $id
            ]);


            if (
                !$verification->fetch()
            ) {

                http_response_code(404);

                echo json_encode([
                    "erreur" =>
                        "Tâche introuvable."
                ]);

                exit;
            }
        }


        // -------------------------
        // Réponse
        // -------------------------

        echo json_encode([

            "succes" =>
                true,

            "id" =>
                (int) $id

        ]);


        exit;
    }

    // =========================
// DELETE : supprimer une tâche
// =========================

if ($method === "DELETE") {

    $donnees = json_decode(
        file_get_contents("php://input"),
        true
    );

    $id = $donnees["id"] ?? $_GET["id"] ?? null;

    if (!$id || !is_numeric($id)) {

        http_response_code(400);

        echo json_encode([
            "erreur" => "ID de tâche invalide."
        ]);

        exit;
    }

    $requete = $pdo->prepare(
        "DELETE FROM tasks WHERE id = :id"
    );

    $requete->execute([
        ":id" => $id
    ]);

    if ($requete->rowCount() === 0) {

        http_response_code(404);

        echo json_encode([
            "erreur" => "Tâche introuvable."
        ]);

        exit;
    }

    echo json_encode([
        "succes" => true,
        "message" => "Tâche supprimée.",
        "id" => (int) $id
    ]);

    exit;
}

    // =========================================================
    // MÉTHODE HTTP INCONNUE
    // =========================================================

    http_response_code(405);


    echo json_encode([
        "erreur" =>
            "Méthode HTTP non autorisée."
    ]);
}


catch (PDOException $e) {

    http_response_code(500);


    echo json_encode([

        "erreur" =>
            $e->getMessage()

    ]);
}