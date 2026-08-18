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
// MÉTHODE HTTP
// ============================================================

$method =
    $_SERVER["REQUEST_METHOD"];


// ============================================================
// RÉCUPÉRER LE CONTEXTE SEDAKOR
// ============================================================

function recupererContexte(
    $pdo,
    $userId
) {

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


    return [

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

    ];

}


// ============================================================
// GET — CONTEXTE IA
// ============================================================

if ($method === "GET") {

    try {

        $contexte =
            recupererContexte(
                $pdo,
                $userId
            );


        repondre(
            [
                "succes" =>
                    true,

                "contexte" =>
                    $contexte
            ]
        );

    }

    catch (PDOException $erreur) {

        error_log(
            "SEDAKOR ASSISTANT GET ERROR : " .
            $erreur->getMessage()
        );


        repondre(
            [
                "erreur" =>
                    "Impossible de récupérer le contexte SEDAKOR."
            ],
            500
        );

    }

}


// ============================================================
// POST — ASSISTANT IA
// ============================================================

if ($method === "POST") {

    // ========================================================
    // LIRE LA REQUÊTE
    // ========================================================

    $corps =
        file_get_contents(
            "php://input"
        );


    $donnees =
        json_decode(
            $corps,
            true
        );


    if (
        !is_array($donnees)
    ) {

        repondre(
            [
                "erreur" =>
                    "Requête JSON invalide."
            ],
            400
        );

    }


    $message =
        trim(
            $donnees["message"] ??
            ""
        );


    if ($message === "") {

        repondre(
            [
                "erreur" =>
                    "Le message est obligatoire."
            ],
            400
        );

    }


    // ========================================================
    // CLÉ GEMINI
    // ========================================================

    /*
     * La clé doit rester côté serveur.
     *
     * On essaie d'abord la variable d'environnement.
     * Puis la variable définie dans config.local.php.
     */

    $geminiApiKey =
        getenv(
            "GEMINI_API_KEY"
        );


    if (
        !$geminiApiKey &&
        isset($GEMINI_API_KEY)
    ) {

        $geminiApiKey =
            $GEMINI_API_KEY;

    }


    if (
        !$geminiApiKey
    ) {

        repondre(
            [
                "erreur" =>
                    "La clé Gemini n'est pas configurée sur le serveur."
            ],
            500
        );

    }


    try {

        // ====================================================
        // RÉCUPÉRER LE CONTEXTE SEDAKOR
        // ====================================================

        $contexte =
            recupererContexte(
                $pdo,
                $userId
            );


        // ====================================================
        // INSTRUCTIONS DE SEDAKOR
        // ====================================================

        $instructions = <<<PROMPT

Tu es l'assistant IA intégré à SEDAKOR.

SEDAKOR est une application d'organisation personnelle permettant
à l'utilisateur de gérer ses tâches, ses projets, ses échéances
et sa productivité.

Ton rôle est d'aider l'utilisateur à mieux s'organiser.

Tu dois :

- répondre en français ;
- être clair, naturel et concis ;
- utiliser les données SEDAKOR fournies dans le contexte ;
- ne jamais inventer une tâche, un projet ou une information ;
- signaler clairement lorsqu'une information n'est pas disponible ;
- donner des conseils pratiques et directement applicables ;
- tenir compte des tâches terminées et non terminées ;
- tenir compte des échéances et des tâches en retard ;
- utiliser les projets lorsque cela est pertinent.

FORMAT DES RÉPONSES :

Utilise Markdown pour structurer tes réponses.

- Utilise des titres avec ### lorsque cela améliore la lisibilité.
- Utilise **gras** pour les informations importantes.
- Utilise des listes numérotées pour les plans d'action.
- Utilise des listes à puces pour les informations secondaires.
- Utilise des paragraphes courts.
- Utilise des emojis avec modération.
- Évite les gros blocs de texte.
- Pour une recommandation d'organisation, présente clairement les priorités.
- Explique brièvement le pourquoi de chaque recommandation.
- N'utilise jamais de HTML.

IMPORTANT :

Pour cette première version, tu ne modifies aucune donnée.
Tu analyses uniquement les informations et tu réponds à l'utilisateur.

Voici le contexte actuel de l'utilisateur :

PROMPT;


        $prompt =
            $instructions .
            "\n\n" .
            json_encode(
                $contexte,
                JSON_UNESCAPED_UNICODE |
                JSON_PRETTY_PRINT
            ) .
            "\n\nMessage de l'utilisateur :\n" .
            $message;


        // ====================================================
        // APPEL GEMINI
        // ====================================================

        $url =
            "https://generativelanguage.googleapis.com/" .
            "v1beta/models/gemini-3.6-flash:generateContent";


        $payload = [

    "contents" => [

        [

            "parts" => [

                [

                    "text" =>
                        $prompt

                ]

            ]

        ]

    ],

    "generationConfig" => [

        "thinkingConfig" => [

            "thinkingLevel" =>
                "low"

        ]

    ]

];


        $ch =
            curl_init(
                $url
            );


        curl_setopt_array(
            $ch,
            [

                CURLOPT_POST =>
                    true,

                CURLOPT_RETURNTRANSFER =>
                    true,

                CURLOPT_HTTPHEADER => [

                    "x-goog-api-key: " .
                    $geminiApiKey,

                    "Content-Type: application/json"

                ],

                CURLOPT_POSTFIELDS =>
                    json_encode(
                        $payload,
                        JSON_UNESCAPED_UNICODE
                    ),

                CURLOPT_TIMEOUT =>
                    60

            ]
        );


        $reponse =
            curl_exec(
                $ch
            );


        $httpCode =
            curl_getinfo(
                $ch,
                CURLINFO_HTTP_CODE
            );


        $curlErreur =
            curl_error(
                $ch
            );


        curl_close(
            $ch
        );


        // ====================================================
        // ERREUR CURL
        // ====================================================

        if (
            $reponse === false
        ) {

            error_log(
                "SEDAKOR GEMINI CURL ERROR : " .
                $curlErreur
            );


            repondre(
                [
                    "erreur" =>
                        "Impossible de contacter Gemini."
                ],
                502
            );

        }


        // ====================================================
        // RÉPONSE GEMINI
        // ====================================================

        $resultat =
            json_decode(
                $reponse,
                true
            );


        if (
            $httpCode < 200 ||
            $httpCode >= 300
        ) {

            error_log(
                "SEDAKOR GEMINI HTTP " .
                $httpCode .
                " : " .
                $reponse
            );


            $messageErreur =
                $resultat["error"]["message"] ??
                "Erreur lors de la communication avec Gemini.";


            repondre(
                [
                    "erreur" =>
                        $messageErreur,

                    "code" =>
                        $httpCode
                ],
                502
            );

        }


        $texte =
            $resultat["candidates"][0]["content"]["parts"][0]["text"]
            ?? null;


        if (
            !$texte
        ) {

            error_log(
                "SEDAKOR GEMINI RESPONSE INVALID : " .
                $reponse
            );


            repondre(
                [
                    "erreur" =>
                        "Gemini n'a pas retourné de réponse exploitable."
                ],
                502
            );

        }


        // ====================================================
        // RÉPONSE FINALE
        // ====================================================

        repondre(
            [

                "succes" =>
                    true,

                "reponse" =>
                    trim($texte)

            ]
        );

    }

    catch (PDOException $erreur) {

        error_log(
            "SEDAKOR ASSISTANT POST DB ERROR : " .
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