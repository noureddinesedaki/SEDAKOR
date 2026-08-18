// ============================================================
// SEDAKOR — V8.2
// Synchronisation complète avec MySQL
// ============================================================


// ============================================================
// ÉLÉMENTS HTML
// ============================================================

const formulaire =
    document.querySelector("#formulaire-tache");

const champTache =
    document.querySelector("#tache");

const priorite =
    document.querySelector("#priorite");

const categorie =
    document.querySelector("#categorie");

const dateEcheance =
    document.querySelector("#date-echeance");

const recurrence =
    document.querySelector("#recurrence");

const heureRappel =
    document.querySelector("#heure-rappel");

const boutonNotifications =
    document.querySelector("#bouton-notifications");

const statutNotifications =
    document.querySelector("#statut-notifications");

const listeTaches =
    document.querySelector("#taches");

const recherche =
    document.querySelector("#recherche");

const boutonsFiltres =
    document.querySelectorAll("#filtres button");

const compteurTaches =
    document.querySelector("#compteur-taches");

const triTaches =
    document.querySelector("#tri-taches");

const filtreCategories =
    document.querySelector("#filtre-categories");

const statTotal =
    document.querySelector("#stat-total");

const statEnCours =
    document.querySelector("#stat-en-cours");

const statTerminees =
    document.querySelector("#stat-terminees");

const statEnRetard =
    document.querySelector("#stat-en-retard");

const pourcentageProgression =
    document.querySelector("#pourcentage-progression");

const progression =
    document.querySelector("#progression");

    const dashboardDate =
    document.querySelector(
        "#dashboard-date"
    );

const dashboardMessage =
    document.querySelector(
        "#dashboard-message"
    );

const dashboardAujourdHui =
    document.querySelector(
        "#dashboard-aujourd-hui"
    );

const dashboardCompteurAujourdHui =
    document.querySelector(
        "#dashboard-compteur-aujourd-hui"
    );

const dashboardPrioriteHaute =
    document.querySelector(
        "#dashboard-priorite-haute"
    );

const dashboardPrioriteMoyenne =
    document.querySelector(
        "#dashboard-priorite-moyenne"
    );

const dashboardPrioriteBasse =
    document.querySelector(
        "#dashboard-priorite-basse"
    );

const dashboardCategories =
    document.querySelector(
        "#dashboard-categories"
    );


// ============================================================
// VARIABLES
// ============================================================

let taches = [];

let filtreActuel = "toutes";

let filtreCategorieActuel = "toutes";

let triActuel = "recentes";


// ============================================================
// API
// ============================================================

const API_URL =
    "/TaskFlow/backend/tasks.php";


// ============================================================
// CHARGER LES TÂCHES DEPUIS MYSQL
// ============================================================

async function chargerTaches() {

    try {

        const reponse =
            await fetch(API_URL);

        if (!reponse.ok) {

            throw new Error(
                "Erreur HTTP : " +
                reponse.status
            );

        }

        const donnees =
            await reponse.json();

        if (!Array.isArray(donnees)) {

            throw new Error(
                "La réponse du serveur n'est pas valide."
            );

        }

        taches =
            donnees.map(function (tache) {

                return {

                    id:
                        Number(tache.id),

                    user_id:
                        tache.user_id ?? null,

                    texte:
                        tache.titre || "",

                    terminee:
                        Boolean(
                            Number(
                                tache.terminee
                            )
                        ),

                    priorite:
                        tache.priorite ||
                        "moyenne",

                    categorie:
                        tache.categorie ||
                        "autre",

                    dateEcheance:
                        tache.date_echeance ||
                        "",

                    heureRappel:
                        tache.heure_rappel ||
                        "",

                    rappelActive:
                        Boolean(
                            Number(
                                tache.rappel_active
                            )
                        ),

                    recurrence:
                        tache.recurrence ||
                        "aucune",

                    sousTaches:
                        Array.isArray(
                            tache.sousTaches
                        )
                            ? tache.sousTaches
                            : []

                };

            });

        normaliserTaches();

        afficherTaches();

    } catch (erreur) {

        console.error(
            "Erreur chargement des tâches :",
            erreur
        );

        alert(
            "Impossible de charger les tâches depuis le serveur."
        );

    }

}


// ============================================================
// NORMALISER LES TÂCHES
// ============================================================

function normaliserTaches() {

    taches.forEach(
        function (tache) {

            if (!tache.priorite) {

                tache.priorite =
                    "moyenne";

            }

            if (!tache.categorie) {

                tache.categorie =
                    "autre";

            }

            if (!tache.recurrence) {

                tache.recurrence =
                    "aucune";

            }

            if (
                typeof tache.heureRappel !==
                "string"
            ) {

                tache.heureRappel =
                    "";

            }

            if (
                !Array.isArray(
                    tache.sousTaches
                )
            ) {

                tache.sousTaches =
                    [];

            }

            tache.sousTaches.forEach(
                function (sousTache) {

                    sousTache.terminee =
                        Boolean(
                            sousTache.terminee
                        );

                }
            );

        }
    );

}


// ============================================================
// CRÉER UNE TÂCHE LOCALE
// ============================================================

function creerTache(
    texte,
    prioriteTache,
    categorieTache,
    date,
    recurrenceTache,
    heure
) {

    return {

        id: null,

        user_id: null,

        texte:
            texte,

        terminee:
            false,

        priorite:
            prioriteTache ||
            "moyenne",

        categorie:
            categorieTache ||
            "autre",

        dateEcheance:
            date ||
            "",

        heureRappel:
            heure ||
            "",

        rappelActive:
            Boolean(heure),

        recurrence:
            recurrenceTache ||
            "aucune",

        sousTaches:
            []

    };

}


// ============================================================
// CRÉER UNE SOUS-TÂCHE
// ============================================================

function creerSousTache(
    texte
) {

    return {

        id:
            Date.now(),

        texte:
            texte,

        terminee:
            false

    };

}


// ============================================================
// POST — CRÉER UNE TÂCHE MYSQL
// ============================================================

async function creerTacheAPI(
    tache
) {

    const reponse =
        await fetch(
            API_URL,
            {

                method:
                    "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({

                        texte:
                            tache.texte,

                        priorite:
                            tache.priorite,

                        categorie:
                            tache.categorie,

                        dateEcheance:
                            tache.dateEcheance ||
                            null,

                        heureRappel:
                            tache.heureRappel ||
                            null,

                        recurrence:
                            tache.recurrence ||
                            "aucune",

                        terminee:
                            tache.terminee,

                        sousTaches:
                            tache.sousTaches ||
                            []

                    })

            }
        );

    const resultat =
        await reponse.json();

    if (!reponse.ok) {

        throw new Error(
            resultat.erreur ||
            "Impossible de créer la tâche."
        );

    }

    return resultat;

}


// ============================================================
// PUT — MODIFIER UNE TÂCHE MYSQL
// ============================================================

async function sauvegarderTache(
    tache
) {

    const reponse =
        await fetch(
            API_URL,
            {

                method:
                    "PUT",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({

                        id:
                            tache.id,

                        texte:
                            tache.texte,

                        priorite:
                            tache.priorite,

                        categorie:
                            tache.categorie,

                        dateEcheance:
                            tache.dateEcheance ||
                            null,

                        heureRappel:
                            tache.heureRappel ||
                            null,

                        recurrence:
                            tache.recurrence ||
                            "aucune",

                        terminee:
                            Boolean(
                                tache.terminee
                            ),

                        sousTaches:
                            tache.sousTaches ||
                            []

                    })

            }
        );

    const resultat =
        await reponse.json();

    if (!reponse.ok) {

        throw new Error(
            resultat.erreur ||
            "Impossible de sauvegarder la tâche."
        );

    }

    return resultat;

}


// ============================================================
// DELETE — SUPPRIMER UNE TÂCHE MYSQL
// ============================================================

async function supprimerTacheAPI(
    id
) {

    const reponse =
        await fetch(
            API_URL,
            {

                method:
                    "DELETE",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({
                        id: id
                    })

            }
        );

    const resultat =
        await reponse.json();

    if (!reponse.ok) {

        throw new Error(
            resultat.erreur ||
            "Impossible de supprimer la tâche."
        );

    }

    return resultat;

}


// ============================================================
// RÉCURRENCE
// ============================================================

function calculerProchaineDate(
    date,
    typeRecurrence
) {

    if (
        !date ||
        typeRecurrence ===
        "aucune"
    ) {

        return "";

    }

    const prochaineDate =
        new Date(
            date +
            "T00:00:00"
        );

    if (
        typeRecurrence ===
        "quotidienne"
    ) {

        prochaineDate.setDate(
            prochaineDate.getDate() +
            1
        );

    }

    if (
        typeRecurrence ===
        "hebdomadaire"
    ) {

        prochaineDate.setDate(
            prochaineDate.getDate() +
            7
        );

    }

    if (
        typeRecurrence ===
        "mensuelle"
    ) {

        const jour =
            prochaineDate.getDate();

        prochaineDate.setMonth(
            prochaineDate.getMonth() +
            1
        );

        if (
            prochaineDate.getDate() !==
            jour
        ) {

            prochaineDate.setDate(0);

        }

    }

    const annee =
        prochaineDate.getFullYear();

    const mois =
        String(
            prochaineDate.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const jour =
        String(
            prochaineDate.getDate()
        ).padStart(
            2,
            "0"
        );

    return (
        annee +
        "-" +
        mois +
        "-" +
        jour
    );

}


function nomRecurrence(
    typeRecurrence
) {

    if (
        typeRecurrence ===
        "quotidienne"
    ) {

        return "🔄 Tous les jours";

    }

    if (
        typeRecurrence ===
        "hebdomadaire"
    ) {

        return "🔄 Chaque semaine";

    }

    if (
        typeRecurrence ===
        "mensuelle"
    ) {

        return "🔄 Chaque mois";

    }

    return "";

}


// ============================================================
// NOTIFICATIONS
// ============================================================

function notificationsDisponibles() {

    return "Notification" in window;

}


function mettreAJourStatutNotifications() {

    if (
        !notificationsDisponibles()
    ) {

        statutNotifications.textContent =
            "Les notifications ne sont pas disponibles dans ce navigateur.";

        boutonNotifications.disabled =
            true;

        return;

    }

    if (
        Notification.permission ===
        "granted"
    ) {

        statutNotifications.textContent =
            "Les notifications sont activées.";

        boutonNotifications.textContent =
            "Notifications activées";

        boutonNotifications.disabled =
            true;

        return;

    }

    if (
        Notification.permission ===
        "denied"
    ) {

        statutNotifications.textContent =
            "Notifications bloquées. Autorisez-les dans les réglages du navigateur.";

        boutonNotifications.textContent =
            "Notifications bloquées";

        boutonNotifications.disabled =
            true;

        return;

    }

    statutNotifications.textContent =
        "Activez les notifications pour recevoir les rappels.";

}


async function demanderAutorisationNotifications() {

    if (
        !notificationsDisponibles()
    ) {

        mettreAJourStatutNotifications();

        return;

    }

    try {

        const permission =
            await Notification.requestPermission();

        mettreAJourStatutNotifications();

        if (
            permission ===
            "granted"
        ) {

            new Notification(
                "SEDAKOR",
                {
                    body:
                        "Les notifications sont maintenant activées."
                }
            );

        }

    } catch (erreur) {

        console.error(
            "Erreur notifications :",
            erreur
        );

    }

}


// ============================================================
// RAPPELS
// ============================================================

function cleRappel(
    tache
) {

    return (
        "sedakor-rappel-" +
        tache.id +
        "-" +
        tache.dateEcheance +
        "-" +
        tache.heureRappel
    );

}


function rappelDejaEnvoye(
    tache
) {

    return (
        localStorage.getItem(
            cleRappel(tache)
        ) ===
        "oui"
    );

}


function enregistrerRappelEnvoye(
    tache
) {

    localStorage.setItem(
        cleRappel(tache),
        "oui"
    );

}


function dateHeureRappel(
    tache
) {

    if (
        !tache.dateEcheance ||
        !tache.heureRappel
    ) {

        return null;

    }

    const date =
        new Date(
            tache.dateEcheance +
            "T" +
            tache.heureRappel +
            ":00"
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return null;

    }

    return date;

}


function rappelEstProche(
    tache
) {

    if (
        tache.terminee
    ) {

        return false;

    }

    const dateRappel =
        dateHeureRappel(tache);

    if (!dateRappel) {

        return false;

    }

    const maintenant =
        new Date();

    const difference =
        dateRappel.getTime() -
        maintenant.getTime();

    return (
        difference >= 0 &&
        difference <=
        60 * 60 * 1000
    );

}


function rappelEstDu(
    tache
) {

    if (
        tache.terminee
    ) {

        return false;

    }

    const dateRappel =
        dateHeureRappel(tache);

    if (!dateRappel) {

        return false;

    }

    const maintenant =
        new Date();

    const difference =
        maintenant.getTime() -
        dateRappel.getTime();

    return (
        difference >= 0 &&
        difference <=
        2 * 60 * 1000
    );

}


function verifierRappels() {

    if (
        !notificationsDisponibles() ||
        Notification.permission !==
        "granted"
    ) {

        return;

    }

    taches.forEach(
        function (tache) {

            if (
                !tache.heureRappel ||
                !tache.dateEcheance ||
                tache.terminee
            ) {

                return;

            }

            if (
                rappelEstDu(tache) &&
                !rappelDejaEnvoye(tache)
            ) {

                new Notification(
                    "🔔 Rappel SEDAKOR",
                    {
                        body:
                            tache.texte +
                            " — rappel prévu à " +
                            tache.heureRappel
                    }
                );

                enregistrerRappelEnvoye(
                    tache
                );

            }

        }
    );

}


function formaterHeure(
    heure
) {

    if (!heure) {

        return "";

    }

    return (
        "🔔 Rappel : " +
        heure
    );

}


// ============================================================
// DATES
// ============================================================

function dateEstEnRetard(
    tache
) {

    if (
        !tache.dateEcheance ||
        tache.terminee
    ) {

        return false;

    }

    const aujourdHui =
        new Date();

    aujourdHui.setHours(
        0,
        0,
        0,
        0
    );

    const dateLimite =
        new Date(
            tache.dateEcheance +
            "T00:00:00"
        );

    return (
        dateLimite <
        aujourdHui
    );

}


function formaterDate(
    date
) {

    if (!date) {

        return "";

    }

    const morceaux =
        date.split("-");

    if (
        morceaux.length !==
        3
    ) {

        return date;

    }

    return (
        morceaux[2] +
        "/" +
        morceaux[1] +
        "/" +
        morceaux[0]
    );

}


// ============================================================
// CATÉGORIES
// ============================================================

function nomCategorie(
    valeur
) {

    if (
        valeur ===
        "travail"
    ) {

        return "💼 Travail";

    }

    if (
        valeur ===
        "etudes"
    ) {

        return "📚 Études";

    }

    if (
        valeur ===
        "personnel"
    ) {

        return "🏠 Personnel";

    }

    if (
        valeur ===
        "projets"
    ) {

        return "🚀 Projets";

    }

    return "📦 Autre";

}


// ============================================================
// SOUS-TÂCHES
// ============================================================

function nombreSousTachesTerminees(
    tache
) {

    return tache.sousTaches.filter(
        function (sousTache) {

            return sousTache.terminee;

        }
    ).length;

}


function pourcentageSousTaches(
    tache
) {

    if (
        tache.sousTaches.length ===
        0
    ) {

        return 0;

    }

    return Math.round(
        (
            nombreSousTachesTerminees(
                tache
            ) /
            tache.sousTaches.length
        ) *
        100
    );

}


// ============================================================
// COMPTEUR
// ============================================================

function mettreAJourCompteur() {

    const total =
        taches.length;

    const terminees =
        taches.filter(
            function (tache) {

                return tache.terminee;

            }
        ).length;

    const enCours =
        total -
        terminees;

    compteurTaches.textContent =
        total +
        (
            total <= 1
                ? " tâche"
                : " tâches"
        ) +
        " • " +
        enCours +
        " en cours • " +
        terminees +
        (
            terminees <= 1
                ? " terminée"
                : " terminées"
        );

}


// ============================================================
// DASHBOARD
// ============================================================

function mettreAJourDashboard() {

    const total =
        taches.length;


    const terminees =
        taches.filter(
            function (tache) {
                return tache.terminee;
            }
        ).length;


    const enCours =
        total -
        terminees;


    const enRetard =
        taches.filter(
            function (tache) {
                return dateEstEnRetard(
                    tache
                );
            }
        ).length;


    const pourcentage =
        total === 0
            ? 0
            : Math.round(
                (
                    terminees /
                    total
                ) *
                100
            );


    /* =========================
       STATISTIQUES PRINCIPALES
    ========================== */

    statTotal.textContent =
        total;

    statEnCours.textContent =
        enCours;

    statTerminees.textContent =
        terminees;

    statEnRetard.textContent =
        enRetard;


    pourcentageProgression.textContent =
        pourcentage +
        "%";

    progression.style.width =
        pourcentage +
        "%";


    /* =========================
       DATE
    ========================== */

    const maintenant =
        new Date();

    const dateFormatee =
        maintenant.toLocaleDateString(
            "fr-FR",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );

    dashboardDate.textContent =
        dateFormatee;


    /* =========================
       MESSAGE
    ========================== */

    if (total === 0) {

        dashboardMessage.textContent =
            "Commencez par ajouter votre première tâche.";

    }
    else if (enRetard > 0) {

        dashboardMessage.textContent =
            "Vous avez " +
            enRetard +
            (
                enRetard > 1
                    ? " tâches"
                    : " tâche"
            ) +
            " en retard à traiter.";

    }
    else if (enCours === 0) {

        dashboardMessage.textContent =
            "Excellent travail, toutes vos tâches sont terminées.";

    }
    else {

        dashboardMessage.textContent =
            "Vous avez " +
            enCours +
            (
                enCours > 1
                    ? " tâches"
                    : " tâche"
            ) +
            " en cours.";

    }


    /* =========================
       AUJOURD'HUI
    ========================== */

    const aujourdHui =
        maintenant
            .toISOString()
            .split("T")[0];


    const tachesAujourdHui =
        taches.filter(
            function (tache) {

                return (
                    tache.dateEcheance ===
                    aujourdHui
                );

            }
        );


    dashboardCompteurAujourdHui.textContent =
        tachesAujourdHui.length;


    dashboardAujourdHui.innerHTML =
        "";


    if (
        tachesAujourdHui.length ===
        0
    ) {

        dashboardAujourdHui.innerHTML =
            '<div class="dashboard-vide">' +
            '🎉 Aucune tâche prévue aujourd’hui.' +
            '</div>';

    }
    else {

        tachesAujourdHui
            .slice(0, 5)
            .forEach(
                function (tache) {

                    const element =
                        document.createElement(
                            "div"
                        );

                    element.classList.add(
                        "dashboard-tache"
                    );


                    if (tache.terminee) {

                        element.classList.add(
                            "dashboard-tache-terminee"
                        );

                    }


                    const statut =
                        document.createElement(
                            "span"
                        );

                    statut.classList.add(
                        "dashboard-tache-statut"
                    );


                    const texte =
                        document.createElement(
                            "span"
                        );

                    texte.classList.add(
                        "dashboard-tache-texte"
                    );

                    texte.textContent =
                        tache.texte;


                    const priorite =
                        document.createElement(
                            "span"
                        );

                    priorite.classList.add(
                        "dashboard-tache-priorite"
                    );


                    if (
                        tache.priorite ===
                        "haute"
                    ) {

                        priorite.textContent =
                            "Haute";

                    }
                    else if (
                        tache.priorite ===
                        "moyenne"
                    ) {

                        priorite.textContent =
                            "Moyenne";

                    }
                    else {

                        priorite.textContent =
                            "Basse";

                    }


                    element.appendChild(
                        statut
                    );

                    element.appendChild(
                        texte
                    );

                    element.appendChild(
                        priorite
                    );


                    dashboardAujourdHui.appendChild(
                        element
                    );

                }
            );

    }


    /* =========================
       PRIORITÉS
    ========================== */

    const prioriteHaute =
        taches.filter(
            function (tache) {

                return (
                    tache.priorite ===
                    "haute"
                );

            }
        ).length;


    const prioriteMoyenne =
        taches.filter(
            function (tache) {

                return (
                    tache.priorite ===
                    "moyenne"
                );

            }
        ).length;


    const prioriteBasse =
        taches.filter(
            function (tache) {

                return (
                    tache.priorite ===
                    "basse"
                );

            }
        ).length;


    dashboardPrioriteHaute.textContent =
        prioriteHaute;

    dashboardPrioriteMoyenne.textContent =
        prioriteMoyenne;

    dashboardPrioriteBasse.textContent =
        prioriteBasse;


    /* =========================
       CATÉGORIES
    ========================== */

    const categories = [
        [
            "💼 Travail",
            "travail"
        ],
        [
            "📚 Études",
            "etudes"
        ],
        [
            "🏠 Personnel",
            "personnel"
        ],
        [
            "🚀 Projets",
            "projets"
        ],
        [
            "📦 Autre",
            "autre"
        ]
    ];


    dashboardCategories.innerHTML =
        "";


    categories.forEach(
        function (categorie) {

            const nom =
                categorie[0];

            const valeur =
                categorie[1];


            const nombre =
                taches.filter(
                    function (tache) {

                        return (
                            tache.categorie ===
                            valeur
                        );

                    }
                ).length;


            const pourcentageCategorie =
                total === 0
                    ? 0
                    : Math.round(
                        (
                            nombre /
                            total
                        ) *
                        100
                    );


            const bloc =
                document.createElement(
                    "div"
                );

            bloc.classList.add(
                "dashboard-categorie"
            );


            const nomElement =
                document.createElement(
                    "span"
                );

            nomElement.classList.add(
                "dashboard-categorie-nom"
            );

            nomElement.textContent =
                nom;


            const valeurElement =
                document.createElement(
                    "strong"
                );

            valeurElement.classList.add(
                "dashboard-categorie-valeur"
            );

            valeurElement.textContent =
                nombre;


            const barre =
                document.createElement(
                    "div"
                );

            barre.classList.add(
                "dashboard-categorie-barre"
            );


            const remplie =
                document.createElement(
                    "div"
                );

            remplie.classList.add(
                "dashboard-categorie-barre-remplie"
            );

            remplie.style.width =
                pourcentageCategorie +
                "%";


            barre.appendChild(
                remplie
            );


            bloc.appendChild(
                nomElement
            );

            bloc.appendChild(
                valeurElement
            );

            bloc.appendChild(
                barre
            );


            dashboardCategories.appendChild(
                bloc
            );

        }
    );

}


// ============================================================
// PRIORITÉ
// ============================================================

function valeurPriorite(
    tache
) {

    if (
        tache.priorite ===
        "haute"
    ) {

        return 3;

    }

    if (
        tache.priorite ===
        "moyenne"
    ) {

        return 2;

    }

    return 1;

}


// ============================================================
// TRI
// ============================================================

function trierTaches(
    liste
) {

    const copie =
        [...liste];

    if (
        triActuel ===
        "recentes"
    ) {

        copie.sort(
            function (a, b) {

                return b.id - a.id;

            }
        );

    }

    if (
        triActuel ===
        "anciennes"
    ) {

        copie.sort(
            function (a, b) {

                return a.id - b.id;

            }
        );

    }

    if (
        triActuel ===
        "priorite-haute"
    ) {

        copie.sort(
            function (a, b) {

                return (
                    valeurPriorite(b) -
                    valeurPriorite(a)
                );

            }
        );

    }

    if (
        triActuel ===
        "priorite-basse"
    ) {

        copie.sort(
            function (a, b) {

                return (
                    valeurPriorite(a) -
                    valeurPriorite(b)
                );

            }
        );

    }

    if (
        triActuel ===
        "echeance"
    ) {

        copie.sort(
            function (a, b) {

                if (
                    !a.dateEcheance &&
                    !b.dateEcheance
                ) {

                    return 0;

                }

                if (
                    !a.dateEcheance
                ) {

                    return 1;

                }

                if (
                    !b.dateEcheance
                ) {

                    return -1;

                }

                return (
                    new Date(
                        a.dateEcheance
                    ) -
                    new Date(
                        b.dateEcheance
                    )
                );

            }
        );

    }

    return copie;

}


// ============================================================
// TERMINER / RÉOUVRIR UNE TÂCHE
// ============================================================

async function terminerTache(
    tache
) {

    const ancienStatut =
        tache.terminee;

    tache.terminee =
        !tache.terminee;

    try {

        await sauvegarderTache(
            tache
        );

        // Création automatique
        // de la prochaine occurrence

        if (
            tache.terminee &&
            tache.recurrence !==
            "aucune" &&
            tache.dateEcheance
        ) {

            const prochaineDate =
                calculerProchaineDate(
                    tache.dateEcheance,
                    tache.recurrence
                );

            const prochaineTache =
                creerTache(
                    tache.texte,
                    tache.priorite,
                    tache.categorie,
                    prochaineDate,
                    tache.recurrence,
                    tache.heureRappel
                );

            await creerTacheAPI(
                prochaineTache
            );

        }

        await chargerTaches();

    } catch (erreur) {

        tache.terminee =
            ancienStatut;

        console.error(
            "Erreur modification statut :",
            erreur
        );

        alert(
            "Impossible de modifier la tâche."
        );

        await chargerTaches();

    }

}


// ============================================================
// AFFICHER UNE SOUS-TÂCHE
// ============================================================

function afficherSousTache(
    tache,
    sousTache,
    conteneur
) {

    const element =
        document.createElement(
            "div"
        );

    element.classList.add(
        "sous-tache"
    );

    const checkbox =
        document.createElement(
            "input"
        );

    checkbox.type =
        "checkbox";

    checkbox.classList.add(
        "sous-tache-checkbox"
    );

    checkbox.checked =
        sousTache.terminee;

    const texte =
        document.createElement(
            "span"
        );

    texte.classList.add(
        "sous-tache-texte"
    );

    texte.textContent =
        sousTache.texte;

    if (
        sousTache.terminee
    ) {

        texte.classList.add(
            "sous-tache-terminee"
        );

    }

    const bouton =
        document.createElement(
            "button"
        );

    bouton.type =
        "button";

    bouton.classList.add(
        "supprimer-sous-tache"
    );

    bouton.textContent =
        "×";


    // Cocher / décocher

    checkbox.addEventListener(
        "change",
        async function () {

            const ancien =
                sousTache.terminee;

            sousTache.terminee =
                checkbox.checked;

            try {

                await sauvegarderTache(
                    tache
                );

                await chargerTaches();

            } catch (erreur) {

                sousTache.terminee =
                    ancien;

                console.error(
                    "Erreur sous-tâche :",
                    erreur
                );

                alert(
                    "Impossible de sauvegarder la sous-tâche."
                );

                await chargerTaches();

            }

        }
    );


    // Supprimer sous-tâche

    bouton.addEventListener(
        "click",
        async function () {

            const anciennesSousTaches =
                [...tache.sousTaches];

            tache.sousTaches =
                tache.sousTaches.filter(
                    function (element) {

                        return (
                            element.id !==
                            sousTache.id
                        );

                    }
                );

            try {

                await sauvegarderTache(
                    tache
                );

                await chargerTaches();

            } catch (erreur) {

                tache.sousTaches =
                    anciennesSousTaches;

                console.error(
                    "Erreur suppression sous-tâche :",
                    erreur
                );

                alert(
                    "Impossible de supprimer la sous-tâche."
                );

                await chargerTaches();

            }

        }
    );


    element.appendChild(
        checkbox
    );

    element.appendChild(
        texte
    );

    element.appendChild(
        bouton
    );

    conteneur.appendChild(
        element
    );

}


// ============================================================
// AFFICHER UNE TÂCHE
// ============================================================

function afficherTache(
    tache
) {

    const element =
        document.createElement(
            "div"
        );

    element.classList.add(
        "tache"
    );

    if (
        rappelEstProche(tache)
    ) {

        element.classList.add(
            "tache-rappel-proche"
        );

    }


    // --------------------------------------------------------
    // ENTÊTE
    // --------------------------------------------------------

    const entete =
        document.createElement(
            "div"
        );

    entete.classList.add(
        "tache-entete"
    );

    const texte =
        document.createElement(
            "span"
        );

    texte.classList.add(
        "tache-texte"
    );

    texte.textContent =
        tache.texte;

    if (
        tache.terminee
    ) {

        texte.classList.add(
            "tache-terminee"
        );

    }


    const actions =
        document.createElement(
            "div"
        );

    actions.classList.add(
        "tache-actions"
    );


    // Bouton modifier

    const modifier =
        document.createElement(
            "button"
        );

    modifier.type =
        "button";

    modifier.textContent =
        "Modifier";

    modifier.classList.add(
        "modifier"
    );


    // Bouton supprimer

    const supprimer =
        document.createElement(
            "button"
        );

    supprimer.type =
        "button";

    supprimer.textContent =
        "Supprimer";

    supprimer.classList.add(
        "supprimer"
    );


    actions.appendChild(
        modifier
    );

    actions.appendChild(
        supprimer
    );

    entete.appendChild(
        texte
    );

    entete.appendChild(
        actions
    );

    element.appendChild(
        entete
    );


    // --------------------------------------------------------
    // INFORMATIONS
    // --------------------------------------------------------

    const informations =
        document.createElement(
            "div"
        );

    informations.classList.add(
        "tache-infos"
    );


    // Priorité

    const badgePriorite =
        document.createElement(
            "span"
        );

    badgePriorite.classList.add(
        "priorite",
        "priorite-" +
        tache.priorite
    );

    badgePriorite.textContent =
        tache.priorite ===
        "haute"
            ? "Haute"
            : tache.priorite ===
              "basse"
                ? "Basse"
                : "Moyenne";

    informations.appendChild(
        badgePriorite
    );


    // Catégorie

    const badgeCategorie =
        document.createElement(
            "span"
        );

    badgeCategorie.classList.add(
        "categorie",
        "categorie-" +
        tache.categorie
    );

    badgeCategorie.textContent =
        nomCategorie(
            tache.categorie
        );

    informations.appendChild(
        badgeCategorie
    );


    // Échéance

    if (
        tache.dateEcheance
    ) {

        const date =
            document.createElement(
                "span"
            );

        date.classList.add(
            "date-echeance"
        );

        date.textContent =
            dateEstEnRetard(tache)
                ? "En retard • " +
                  formaterDate(
                      tache.dateEcheance
                  )
                : "Échéance : " +
                  formaterDate(
                      tache.dateEcheance
                  );

        if (
            dateEstEnRetard(tache)
        ) {

            date.classList.add(
                "date-en-retard"
            );

        }

        informations.appendChild(
            date
        );

    }


    // Récurrence

    if (
        tache.recurrence !==
        "aucune"
    ) {

        const badgeRecurrence =
            document.createElement(
                "span"
            );

        badgeRecurrence.classList.add(
            "recurrence"
        );

        badgeRecurrence.textContent =
            nomRecurrence(
                tache.recurrence
            );

        informations.appendChild(
            badgeRecurrence
        );

    }


    // Rappel

    if (
        tache.heureRappel &&
        tache.dateEcheance
    ) {

        const badgeRappel =
            document.createElement(
                "span"
            );

        badgeRappel.classList.add(
            "rappel"
        );

        badgeRappel.textContent =
            formaterHeure(
                tache.heureRappel
            );

        if (
            rappelEstProche(tache)
        ) {

            badgeRappel.classList.add(
                "rappel-proche"
            );

        }

        if (
            rappelEstDu(tache)
        ) {

            badgeRappel.classList.add(
                "rappel-du-jour"
            );

        }

        informations.appendChild(
            badgeRappel
        );

    }

    element.appendChild(
        informations
    );


    // --------------------------------------------------------
    // SOUS-TÂCHES
    // --------------------------------------------------------

    const blocSousTaches =
        document.createElement(
            "div"
        );

    blocSousTaches.classList.add(
        "sous-taches"
    );


    const enteteSousTaches =
        document.createElement(
            "div"
        );

    enteteSousTaches.classList.add(
        "sous-taches-entete"
    );


    const titreSousTaches =
        document.createElement(
            "span"
        );

    titreSousTaches.classList.add(
        "sous-taches-titre"
    );

    titreSousTaches.textContent =
        "Sous-tâches";


    const compteurSousTaches =
        document.createElement(
            "span"
        );

    compteurSousTaches.classList.add(
        "sous-taches-progressions"
    );

    compteurSousTaches.textContent =
        nombreSousTachesTerminees(
            tache
        ) +
        " / " +
        tache.sousTaches.length;


    enteteSousTaches.appendChild(
        titreSousTaches
    );

    enteteSousTaches.appendChild(
        compteurSousTaches
    );

    blocSousTaches.appendChild(
        enteteSousTaches
    );


    // Barre de progression

    const barre =
        document.createElement(
            "div"
        );

    barre.classList.add(
        "barre-sous-taches"
    );


    const barreRemplie =
        document.createElement(
            "div"
        );

    barreRemplie.classList.add(
        "progression-sous-taches"
    );

    barreRemplie.style.width =
        pourcentageSousTaches(
            tache
        ) +
        "%";


    barre.appendChild(
        barreRemplie
    );

    blocSousTaches.appendChild(
        barre
    );


    // Liste

    const listeSousTaches =
        document.createElement(
            "div"
        );

    tache.sousTaches.forEach(
        function (sousTache) {

            afficherSousTache(
                tache,
                sousTache,
                listeSousTaches
            );

        }
    );

    blocSousTaches.appendChild(
        listeSousTaches
    );


    // --------------------------------------------------------
    // AJOUT SOUS-TÂCHE
    // --------------------------------------------------------

    const ajout =
        document.createElement(
            "div"
        );

    ajout.classList.add(
        "ajout-sous-tache"
    );


    const champ =
        document.createElement(
            "input"
        );

    champ.type =
        "text";

    champ.placeholder =
        "Ajouter une sous-tâche...";

    champ.classList.add(
        "champ-sous-tache"
    );


    const boutonAjout =
        document.createElement(
            "button"
        );

    boutonAjout.type =
        "button";

    boutonAjout.textContent =
        "Ajouter";

    boutonAjout.classList.add(
        "bouton-ajouter-sous-tache"
    );


    async function ajouterSousTache() {

        const valeur =
            champ.value.trim();

        if (!valeur) {

            champ.focus();

            return;

        }

        const ancienneListe =
            [...tache.sousTaches];

        tache.sousTaches.push(
            creerSousTache(
                valeur
            )
        );

        try {

            await sauvegarderTache(
                tache
            );

            await chargerTaches();

        } catch (erreur) {

            tache.sousTaches =
                ancienneListe;

            console.error(
                "Erreur ajout sous-tâche :",
                erreur
            );

            alert(
                "Impossible d'ajouter la sous-tâche."
            );

            await chargerTaches();

        }

    }


    boutonAjout.addEventListener(
        "click",
        ajouterSousTache
    );


    champ.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key ===
                "Enter"
            ) {

                ajouterSousTache();

            }

        }
    );


    ajout.appendChild(
        champ
    );

    ajout.appendChild(
        boutonAjout
    );

    blocSousTaches.appendChild(
        ajout
    );

    element.appendChild(
        blocSousTaches
    );


    // --------------------------------------------------------
    // TERMINER
    // --------------------------------------------------------

    texte.addEventListener(
        "click",
        function () {

            terminerTache(
                tache
            );

        }
    );


    // --------------------------------------------------------
    // SUPPRIMER
    // --------------------------------------------------------

    supprimer.addEventListener(
        "click",
        async function () {

            const confirmer =
                confirm(
                    "Voulez-vous vraiment supprimer cette tâche ?"
                );

            if (!confirmer) {

                return;

            }

            try {

                await supprimerTacheAPI(
                    tache.id
                );

                await chargerTaches();

            } catch (erreur) {

                console.error(
                    "Erreur suppression tâche :",
                    erreur
                );

                alert(
                    "Impossible de supprimer la tâche."
                );

            }

        }
    );


    // --------------------------------------------------------
    // MODIFIER
    // --------------------------------------------------------

    modifier.addEventListener(
        "click",
        function () {

            const ancienTexte =
                tache.texte;

            const anciennePriorite =
                tache.priorite;

            const ancienneCategorie =
                tache.categorie;

            const ancienneDate =
                tache.dateEcheance ||
                "";

            const ancienneRecurrence =
                tache.recurrence ||
                "aucune";

            const ancienneHeureRappel =
                tache.heureRappel ||
                "";


            entete.innerHTML =
                "";


            // Champ texte

            const champModification =
                document.createElement(
                    "input"
                );

            champModification.type =
                "text";

            champModification.value =
                ancienTexte;

            champModification.classList.add(
                "champ-modification"
            );


            // Priorité

            const selectPriorite =
                document.createElement(
                    "select"
                );

            selectPriorite.classList.add(
                "champ-priorite-modification"
            );


            [
                ["basse", "Priorité basse"],
                ["moyenne", "Priorité moyenne"],
                ["haute", "Priorité haute"]
            ].forEach(
                function (option) {

                    const element =
                        document.createElement(
                            "option"
                        );

                    element.value =
                        option[0];

                    element.textContent =
                        option[1];

                    element.selected =
                        option[0] ===
                        anciennePriorite;

                    selectPriorite.appendChild(
                        element
                    );

                }
            );


            // Catégorie

            const selectCategorie =
                document.createElement(
                    "select"
                );

            selectCategorie.classList.add(
                "champ-categorie-modification"
            );


            [
                ["travail", "💼 Travail"],
                ["etudes", "📚 Études"],
                ["personnel", "🏠 Personnel"],
                ["projets", "🚀 Projets"],
                ["autre", "📦 Autre"]
            ].forEach(
                function (option) {

                    const element =
                        document.createElement(
                            "option"
                        );

                    element.value =
                        option[0];

                    element.textContent =
                        option[1];

                    element.selected =
                        option[0] ===
                        ancienneCategorie;

                    selectCategorie.appendChild(
                        element
                    );

                }
            );


            // Date

            const dateModification =
                document.createElement(
                    "input"
                );

            dateModification.type =
                "date";

            dateModification.value =
                ancienneDate;

            dateModification.classList.add(
                "date-modification"
            );


            // Heure rappel

            const heureModification =
                document.createElement(
                    "input"
                );

            heureModification.type =
                "time";

            heureModification.value =
                ancienneHeureRappel;

            heureModification.classList.add(
                "heure-rappel-modification"
            );


            // Récurrence

            const selectRecurrence =
                document.createElement(
                    "select"
                );

            selectRecurrence.classList.add(
                "recurrence-modification"
            );


            [
                ["aucune", "Pas de répétition"],
                ["quotidienne", "🔄 Tous les jours"],
                ["hebdomadaire", "🔄 Chaque semaine"],
                ["mensuelle", "🔄 Chaque mois"]
            ].forEach(
                function (option) {

                    const element =
                        document.createElement(
                            "option"
                        );

                    element.value =
                        option[0];

                    element.textContent =
                        option[1];

                    element.selected =
                        option[0] ===
                        ancienneRecurrence;

                    selectRecurrence.appendChild(
                        element
                    );

                }
            );


            // Actions

            const actionsEdition =
                document.createElement(
                    "div"
                );

            actionsEdition.classList.add(
                "tache-actions"
            );


            const enregistrer =
                document.createElement(
                    "button"
                );

            enregistrer.type =
                "button";

            enregistrer.textContent =
                "Enregistrer";

            enregistrer.classList.add(
                "enregistrer"
            );


            const annuler =
                document.createElement(
                    "button"
                );

            annuler.type =
                "button";

            annuler.textContent =
                "Annuler";

            annuler.classList.add(
                "annuler"
            );


            actionsEdition.appendChild(
                enregistrer
            );

            actionsEdition.appendChild(
                annuler
            );


            entete.appendChild(
                champModification
            );

            entete.appendChild(
                selectPriorite
            );

            entete.appendChild(
                selectCategorie
            );

            entete.appendChild(
                dateModification
            );

            entete.appendChild(
                heureModification
            );

            entete.appendChild(
                selectRecurrence
            );

            entete.appendChild(
                actionsEdition
            );


            // Annuler

            annuler.addEventListener(
                "click",
                function () {

                    afficherTaches();

                }
            );


            // Enregistrer

            enregistrer.addEventListener(
                "click",
                async function () {

                    const nouveauTexte =
                        champModification.value.trim();

                    if (!nouveauTexte) {

                        champModification.focus();

                        return;

                    }


                    const ancienneValeur = {

                        texte:
                            tache.texte,

                        priorite:
                            tache.priorite,

                        categorie:
                            tache.categorie,

                        dateEcheance:
                            tache.dateEcheance,

                        heureRappel:
                            tache.heureRappel,

                        recurrence:
                            tache.recurrence

                    };


                    tache.texte =
                        nouveauTexte;

                    tache.priorite =
                        selectPriorite.value;

                    tache.categorie =
                        selectCategorie.value;

                    tache.dateEcheance =
                        dateModification.value;

                    tache.heureRappel =
                        heureModification.value;

                    tache.recurrence =
                        selectRecurrence.value;


                    try {

                        await sauvegarderTache(
                            tache
                        );

                        await chargerTaches();

                    } catch (erreur) {

                        console.error(
                            "Erreur modification tâche :",
                            erreur
                        );

                        alert(
                            "Impossible d'enregistrer les modifications."
                        );

                        await chargerTaches();

                    }

                }
            );


            champModification.focus();

            champModification.select();

        }
    );


    listeTaches.appendChild(
        element
    );

}


// ============================================================
// AFFICHAGE
// ============================================================

function afficherTaches() {

    mettreAJourCompteur();

    mettreAJourDashboard();


    const rechercheTexte =
        recherche.value
            .toLowerCase()
            .trim();


    let resultat =
        taches.filter(
            function (tache) {

                return tache.texte
                    .toLowerCase()
                    .includes(
                        rechercheTexte
                    );

            }
        );


    if (
        filtreActuel ===
        "en-cours"
    ) {

        resultat =
            resultat.filter(
                function (tache) {

                    return !tache.terminee;

                }
            );

    }


    if (
        filtreActuel ===
        "terminees"
    ) {

        resultat =
            resultat.filter(
                function (tache) {

                    return tache.terminee;

                }
            );

    }


    if (
        filtreCategorieActuel !==
        "toutes"
    ) {

        resultat =
            resultat.filter(
                function (tache) {

                    return (
                        tache.categorie ===
                        filtreCategorieActuel
                    );

                }
            );

    }


    resultat =
        trierTaches(
            resultat
        );


    listeTaches.innerHTML =
        "";


    resultat.forEach(
        function (tache) {

            afficherTache(
                tache
            );

        }
    );

}


// ============================================================
// FORMULAIRE — AJOUT D'UNE TÂCHE
// ============================================================

formulaire.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const texte =
            champTache.value.trim();


        if (!texte) {

            champTache.focus();

            return;

        }


        const nouvelleTache =
            creerTache(
                texte,
                priorite.value,
                categorie.value,
                dateEcheance.value,
                recurrence.value,
                heureRappel.value
            );


        try {

            await creerTacheAPI(
                nouvelleTache
            );

            await chargerTaches();


            champTache.value =
                "";

            priorite.value =
                "moyenne";

            categorie.value =
                "travail";

            dateEcheance.value =
                "";

            recurrence.value =
                "aucune";

            heureRappel.value =
                "";


            champTache.focus();

        } catch (erreur) {

            console.error(
                "Erreur création tâche :",
                erreur
            );

            alert(
                "Impossible d'enregistrer la tâche."
            );

        }

    }
);


// ============================================================
// RECHERCHE
// ============================================================

recherche.addEventListener(
    "input",
    afficherTaches
);


// ============================================================
// FILTRES
// ============================================================

boutonsFiltres.forEach(
    function (bouton) {

        bouton.addEventListener(
            "click",
            function () {

                filtreActuel =
                    bouton.dataset.filtre;


                boutonsFiltres.forEach(
                    function (element) {

                        element.classList.remove(
                            "actif"
                        );

                    }
                );


                bouton.classList.add(
                    "actif"
                );


                afficherTaches();

            }
        );

    }
);


// ============================================================
// FILTRE CATÉGORIE
// ============================================================

filtreCategories.addEventListener(
    "change",
    function () {

        filtreCategorieActuel =
            filtreCategories.value;

        afficherTaches();

    }
);


// ============================================================
// TRI
// ============================================================

triTaches.addEventListener(
    "change",
    function () {

        triActuel =
            triTaches.value;

        afficherTaches();

    }
);


// ============================================================
// INITIALISATION
// ============================================================

mettreAJourStatutNotifications();


boutonNotifications.addEventListener(
    "click",
    demanderAutorisationNotifications
);


chargerTaches();


verifierRappels();


setInterval(
    verifierRappels,
    30 * 1000
);


boutonsFiltres.forEach(
    function (bouton) {

        if (
            bouton.dataset.filtre ===
            "toutes"
        ) {

            bouton.classList.add(
                "actif"
            );

        }

    }
);