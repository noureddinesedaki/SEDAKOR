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

const filtrePriorite =
    document.getElementById("filtre-priorite");

const filtreEcheance =
    document.getElementById("filtre-echeance");

const boutonReinitialiserFiltres =
    document.getElementById("reinitialiser-filtres");

let filtrePrioriteActuel = "toutes";
let filtreEcheanceActuel = "toutes";

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
// V12 — UTILISATEUR CONNECTÉ
// ============================================================

let utilisateurConnecteId = null;

// ============================================================
// V11 — CALENDRIER
// ============================================================

const calendrierMois =
    document.querySelector(
        "#calendrier-mois"
    );

const calendrierGrille =
    document.querySelector(
        "#calendrier-grille"
    );

const calendrierPrecedent =
    document.querySelector(
        "#calendrier-mois-precedent"
    );

const calendrierSuivant =
    document.querySelector(
        "#calendrier-mois-suivant"
    );

const calendrierAujourdHui =
    document.querySelector(
        "#calendrier-aujourd-hui"
    );


let dateCalendrier =
    new Date();


function formaterDateCalendrier(
    date
) {

    const annee =
        date.getFullYear();

    const mois =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const jour =
        String(
            date.getDate()
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


function afficherCalendrier() {

    if (
        !calendrierGrille ||
        !calendrierMois
    ) {

        return;

    }

    const annee =
        dateCalendrier.getFullYear();

    const mois =
        dateCalendrier.getMonth();


    const premierJour =
        new Date(
            annee,
            mois,
            1
        );


    const dernierJour =
        new Date(
            annee,
            mois + 1,
            0
        );


    /*
     * En JavaScript :
     * dimanche = 0
     * lundi = 1
     *
     * On transforme pour commencer
     * la semaine par lundi.
     */

    let premierJourSemaine =
        premierJour.getDay();

    if (
        premierJourSemaine === 0
    ) {

        premierJourSemaine =
            7;

    }


    calendrierMois.textContent =
        dateCalendrier.toLocaleDateString(
            "fr-FR",
            {
                month: "long",
                year: "numeric"
            }
        );


    calendrierGrille.innerHTML =
        "";


    /*
     * Jours de la semaine
     */

    const joursSemaine = [
        "Lun",
        "Mar",
        "Mer",
        "Jeu",
        "Ven",
        "Sam",
        "Dim"
    ];


    joursSemaine.forEach(
        function (jour) {

            const cellule =
                document.createElement(
                    "div"
                );

            cellule.classList.add(
                "calendrier-jour-semaine"
            );

            cellule.textContent =
                jour;

            calendrierGrille.appendChild(
                cellule
            );

        }
    );


    /*
     * Cases vides avant le premier jour
     */

    for (
        let i = 1;
        i < premierJourSemaine;
        i++
    ) {

        const cellule =
            document.createElement(
                "div"
            );

        cellule.classList.add(
            "calendrier-case",
            "calendrier-case-vide"
        );

        calendrierGrille.appendChild(
            cellule
        );

    }


    /*
     * Jours du mois
     */

    for (
        let jour = 1;
        jour <= dernierJour.getDate();
        jour++
    ) {

        const cellule =
            document.createElement(
                "div"
            );

        cellule.classList.add(
            "calendrier-case"
        );


        const dateJour =
            new Date(
                annee,
                mois,
                jour
            );


        const dateTexte =
            formaterDateCalendrier(
                dateJour
            );


        /*
         * Numéro du jour
         */

        const numero =
            document.createElement(
                "div"
            );

        numero.classList.add(
            "calendrier-numero"
        );

        numero.textContent =
            jour;


        /*
         * Aujourd'hui
         */

        const aujourdHui =
            new Date();

        if (
            formaterDateCalendrier(
                aujourdHui
            ) === dateTexte
        ) {

            cellule.classList.add(
                "calendrier-aujourd-hui"
            );

        }


        cellule.appendChild(
            numero
        );


        /*
         * Tâches du jour
         */

        const tachesDuJour =
            taches.filter(
                function (tache) {

                    return (
                        tache.dateEcheance ===
                        dateTexte
                    );

                }
            );


        tachesDuJour.forEach(
            function (tache) {

                const tacheElement =
                    document.createElement(
                        "div"
                    );

                tacheElement.classList.add(
                    "calendrier-tache"
                );


                if (
                    tache.terminee
                ) {

                    tacheElement.classList.add(
                        "calendrier-tache-terminee"
                    );

                }


                /*
                 * Priorité
                 */

                tacheElement.classList.add(
                    "calendrier-priorite-" +
                    tache.priorite
                );


                tacheElement.textContent =
                    tache.texte;


                tacheElement.title =
                    tache.texte;


                /*
                 * Clic sur une tâche :
                 * on revient à la liste
                 */

                tacheElement.addEventListener(
                    "click",
                    function () {

                        const elementTache =
                            document.querySelector(
                                ".tache"
                            );

                        if (
                            elementTache
                        ) {

                            elementTache.scrollIntoView({
                                behavior:
                                    "smooth",
                                block:
                                    "center"
                            });

                        }

                    }
                );


                cellule.appendChild(
                    tacheElement
                );

            }
        );


        calendrierGrille.appendChild(
            cellule
        );

    }

}


// ============================================================
// NAVIGATION CALENDRIER
// ============================================================

if (
    calendrierPrecedent
) {

    calendrierPrecedent.addEventListener(
        "click",
        function () {

            dateCalendrier.setMonth(
                dateCalendrier.getMonth() - 1
            );

            afficherCalendrier();

        }
    );

}


if (
    calendrierSuivant
) {

    calendrierSuivant.addEventListener(
        "click",
        function () {

            dateCalendrier.setMonth(
                dateCalendrier.getMonth() + 1
            );

            afficherCalendrier();

        }
    );

}


if (
    calendrierAujourdHui
) {

    calendrierAujourdHui.addEventListener(
        "click",
        function () {

            dateCalendrier =
                new Date();

            afficherCalendrier();

        }
    );

}

// ============================================================
// V12 — CHARGER L'UTILISATEUR CONNECTÉ
// ============================================================

async function chargerUtilisateurConnecte() {

    try {

        const reponse =
            await fetch(
                "/TaskFlow/backend/session.php"
            );

        if (
            !reponse.ok
        ) {

            throw new Error(
                "Impossible de récupérer la session."
            );

        }

        const donnees =
            await reponse.json();

        if (
            !donnees.connecte ||
            !donnees.utilisateur
        ) {

            utilisateurConnecteId =
                null;

            return;

        }

        utilisateurConnecteId =
            Number(
                donnees.utilisateur.id
            );

    } catch (erreur) {

        console.error(
            "Erreur récupération utilisateur connecté :",
            erreur
        );

        utilisateurConnecteId =
            null;

    }

}

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

        await chargerUtilisateurConnecte();

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

        afficherCalendrier();

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
// V16 — NOTIFICATIONS SEDAKOR
// ============================================================

const notificationsCompteur =
    document.querySelector(
        "#notifications-compteur"
    );

const listeNotifications =
    document.querySelector(
        "#liste-notifications"
    );

const boutonToutesLues =
    document.querySelector(
        "#bouton-toutes-lues"
    );

const API_TASK_COMMENTS =
    "backend/task-comments.php";

const API_NOTIFICATIONS =
    "/TaskFlow/backend/notifications.php";

// ============================================================
// ICÔNE SELON LE TYPE
// ============================================================

function iconeNotification(type) {

    if (type === "tache_partagee") {
        return "👥";
    }

    if (type === "commentaire") {
        return "💬";
    }

    if (type === "rappel") {
        return "⏰";
    }

    if (type === "echeance") {
        return "⚠️";
    }

    return "🔔";
}


// ============================================================
// FORMATER LA DATE
// ============================================================

function formaterDateNotification(dateTexte) {

    if (!dateTexte) {
        return "";
    }

    const date =
        new Date(
            dateTexte.replace(" ", "T")
        );

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleString(
        "fr-FR",
        {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


// ============================================================
// CHARGER LES NOTIFICATIONS
// ============================================================

async function chargerNotifications() {

    try {

        const reponse =
            await fetch(
                API_NOTIFICATIONS
            );

        if (!reponse.ok) {
            throw new Error(
                "Erreur HTTP : " +
                reponse.status
            );
        }

        const donnees =
            await reponse.json();

        if (!donnees.succes) {
            throw new Error(
                donnees.erreur ||
                "Erreur notifications."
            );
        }

        afficherNotifications(
            donnees.notifications || [],
            donnees.non_lues || 0
        );

    } catch (erreur) {

        console.error(
            "Erreur chargement notifications :",
            erreur
        );

    }
}


// ============================================================
// AFFICHER LES NOTIFICATIONS
// ============================================================

function afficherNotifications(
    notifications,
    nonLues
) {

    if (!listeNotifications) {
        return;
    }

    listeNotifications.innerHTML = "";

    if (notificationsCompteur) {

        notificationsCompteur.textContent =
            nonLues;

        notificationsCompteur.hidden =
            nonLues === 0;
    }

    if (boutonToutesLues) {

        boutonToutesLues.hidden =
            nonLues === 0;
    }


    if (notifications.length === 0) {

        const vide =
            document.createElement(
                "p"
            );

        vide.classList.add(
            "notifications-vide"
        );

        vide.textContent =
            "Aucune nouvelle notification.";

        listeNotifications.appendChild(
            vide
        );

        return;
    }


    notifications
        .slice(0, 20)
        .forEach(
            function (notification) {

                const element =
                    document.createElement(
                        "div"
                    );

                element.classList.add(
                    "notification-element"
                );

                if (!notification.lue) {

                    element.classList.add(
                        "notification-non-lue"
                    );

                }


                const icone =
                    document.createElement(
                        "span"
                    );

                icone.classList.add(
                    "notification-icone"
                );

                icone.textContent =
                    iconeNotification(
                        notification.type
                    );


                const contenu =
                    document.createElement(
                        "div"
                    );

                contenu.classList.add(
                    "notification-contenu"
                );


                const message =
                    document.createElement(
                        "p"
                    );

                message.classList.add(
                    "notification-message"
                );

                message.textContent =
                    notification.message;


                const date =
                    document.createElement(
                        "div"
                    );

                date.classList.add(
                    "notification-date"
                );

                date.textContent =
                    formaterDateNotification(
                        notification.created_at
                    );


                contenu.appendChild(
                    message
                );

                contenu.appendChild(
                    date
                );


                const supprimer =
                    document.createElement(
                        "button"
                    );

                supprimer.type =
                    "button";

                supprimer.classList.add(
                    "notification-supprimer"
                );

                supprimer.textContent =
                    "×";

                supprimer.title =
                    "Supprimer";


                supprimer.addEventListener(
                    "click",
                    async function (evenement) {

                        evenement.stopPropagation();

                        await supprimerNotification(
                            notification.id
                        );

                    }
                );


                element.appendChild(
                    icone
                );

                element.appendChild(
                    contenu
                );

                element.appendChild(
                    supprimer
                );


                element.addEventListener(
                    "click",
                    async function () {

                        if (
                            !notification.lue
                        ) {

                            await marquerNotificationLue(
                                notification.id
                            );

                        }

                    }
                );


                listeNotifications.appendChild(
                    element
                );

            }
        );
}


// ============================================================
// MARQUER UNE NOTIFICATION COMME LUE
// ============================================================

async function marquerNotificationLue(
    notificationId
) {

    try {

        const reponse =
            await fetch(
                API_NOTIFICATIONS,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            notification_id:
                                notificationId
                        })
                }
            );

        if (!reponse.ok) {
            throw new Error(
                "Impossible de modifier la notification."
            );
        }

        await chargerNotifications();

    } catch (erreur) {

        console.error(
            "Erreur notification :",
            erreur
        );

    }
}


// ============================================================
// TOUT MARQUER COMME LU
// ============================================================

async function marquerToutesNotificationsLues() {

    try {

        const reponse =
            await fetch(
                API_NOTIFICATIONS,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            toutes: true
                        })
                }
            );

        if (!reponse.ok) {
            throw new Error(
                "Impossible de modifier les notifications."
            );
        }

        await chargerNotifications();

    } catch (erreur) {

        console.error(
            "Erreur notifications :",
            erreur
        );

    }
}


if (boutonToutesLues) {

    boutonToutesLues.addEventListener(
        "click",
        marquerToutesNotificationsLues
    );

}


// ============================================================
// SUPPRIMER UNE NOTIFICATION
// ============================================================

async function supprimerNotification(
    notificationId
) {

    try {

        const reponse =
            await fetch(
                API_NOTIFICATIONS,
                {
                    method: "DELETE",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            notification_id:
                                notificationId
                        })
                }
            );

        if (!reponse.ok) {
            throw new Error(
                "Impossible de supprimer la notification."
            );
        }

        await chargerNotifications();

    } catch (erreur) {

        console.error(
            "Erreur suppression notification :",
            erreur
        );

    }
}


// ============================================================
// INITIALISATION
// ============================================================

chargerNotifications();


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

    const heure =
    tache.heureRappel.length === 5
        ? tache.heureRappel + ":00"
        : tache.heureRappel;

const date =
    new Date(
        tache.dateEcheance +
        "T" +
        heure
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


// ============================================================
// V16 — VÉRIFIER LES RAPPELS
// ============================================================

async function verifierRappels() {

    taches.forEach(
        async function (tache) {

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

                // ------------------------------------------------
                // V16 — NOTIFICATION PERSISTANTE
                // ------------------------------------------------

                try {

                    const reponse =
                        await fetch(
                            API_NOTIFICATIONS,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify({
                                        task_id:
                                            tache.id,

                                        type:
                                            "rappel",

                                        message:
                                            "Rappel : " +
                                            tache.texte +
                                            " — prévu à " +
                                            tache.heureRappel
                                    })
                            }
                        );

                    if (!reponse.ok) {

                        throw new Error(
                            "Erreur HTTP : " +
                            reponse.status
                        );
                    }


                    // --------------------------------------------
                    // NOTIFICATION NAVIGATEUR
                    // --------------------------------------------

                    if (
                        notificationsDisponibles() &&
                        Notification.permission ===
                            "granted"
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

                    }


                    // --------------------------------------------
                    // EMPÊCHER LES DOUBLONS
                    // --------------------------------------------

                    enregistrerRappelEnvoye(
                        tache
                    );


                    // --------------------------------------------
                    // ACTUALISER LE COMPTEUR
                    // --------------------------------------------

                    await chargerNotifications();

                } catch (erreur) {

                    console.error(
                        "Erreur création notification rappel :",
                        erreur
                    );

                }
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

// ============================================================
// V12 — FENÊTRE DE PARTAGE
// ============================================================

async function ouvrirFenetrePartage(
    tache
) {

    // --------------------------------------------------------
    // FENÊTRE
    // --------------------------------------------------------

    const overlay =
        document.createElement(
            "div"
        );

    overlay.classList.add(
        "partage-overlay"
    );


    const fenetre =
        document.createElement(
            "div"
        );

    fenetre.classList.add(
        "partage-fenetre"
    );


    // --------------------------------------------------------
    // EN-TÊTE
    // --------------------------------------------------------

    const entete =
        document.createElement(
            "div"
        );

    entete.classList.add(
        "partage-entete"
    );


    const titre =
        document.createElement(
            "h2"
        );

    titre.textContent =
        "Partager la tâche";


    const fermer =
        document.createElement(
            "button"
        );

    fermer.type =
        "button";

    fermer.classList.add(
        "partage-fermer"
    );

    fermer.textContent =
        "×";


    fermer.addEventListener(
        "click",
        function () {

            overlay.remove();

        }
    );


    entete.appendChild(
        titre
    );

    entete.appendChild(
        fermer
    );


    // --------------------------------------------------------
    // TÂCHE
    // --------------------------------------------------------

    const nomTache =
        document.createElement(
            "p"
        );

    nomTache.classList.add(
        "partage-tache"
    );

    nomTache.textContent =
        tache.texte;


    // --------------------------------------------------------
    // RECHERCHE
    // --------------------------------------------------------

    const rechercheUtilisateur =
        document.createElement(
            "input"
        );

    rechercheUtilisateur.type =
        "text";

    rechercheUtilisateur.placeholder =
        "Rechercher un nom ou un email...";

    rechercheUtilisateur.autocomplete =
        "off";

    rechercheUtilisateur.classList.add(
        "partage-recherche"
    );


    const resultats =
        document.createElement(
            "div"
        );

    resultats.classList.add(
        "partage-resultats"
    );


    // --------------------------------------------------------
    // MEMBRES
    // --------------------------------------------------------

    const titreMembres =
        document.createElement(
            "h3"
        );

    titreMembres.textContent =
        "Collaborateurs";


    const membres =
        document.createElement(
            "div"
        );

    membres.classList.add(
        "partage-membres"
    );


    // --------------------------------------------------------
    // CHARGER LES MEMBRES
    // --------------------------------------------------------

    async function chargerMembres() {

        membres.innerHTML =
            "<p>Chargement...</p>";


        try {

            const reponse =
                await fetch(
                    "/TaskFlow/backend/task-members.php?task_id=" +
                    encodeURIComponent(
                        tache.id
                    )
                );


            const donnees =
                await reponse.json();


            if (
                !reponse.ok
            ) {

                throw new Error(
                    donnees.erreur ||
                    "Impossible de charger les membres."
                );

            }


            membres.innerHTML =
                "";


            if (
                !donnees.membres ||
                donnees.membres.length === 0
            ) {

                const vide =
                    document.createElement(
                        "p"
                    );

                vide.textContent =
                    "Aucun collaborateur.";

                membres.appendChild(
                    vide
                );

                return;

            }


            donnees.membres.forEach(
                function (membre) {

                    const ligne =
                        document.createElement(
                            "div"
                        );

                    ligne.classList.add(
                        "partage-membre"
                    );


                    const informations =
                        document.createElement(
                            "div"
                        );

                    informations.classList.add(
                        "partage-membre-informations"
                    );


                    const nom =
                        document.createElement(
                            "strong"
                        );

                    nom.textContent =
                        membre.nom;


                    const email =
                        document.createElement(
                            "small"
                        );

                    email.textContent =
                        membre.email;


                    informations.appendChild(
                        nom
                    );

                    informations.appendChild(
                        email
                    );


                    const retirer =
                        document.createElement(
                            "button"
                        );

                    retirer.type =
                        "button";

                    retirer.textContent =
                        "Retirer";

                    retirer.classList.add(
                        "partage-retirer"
                    );


                    retirer.addEventListener(
                        "click",
                        async function () {

                            const confirmer =
                                confirm(
                                    "Retirer " +
                                    membre.nom +
                                    " de cette tâche ?"
                                );


                            if (
                                !confirmer
                            ) {

                                return;

                            }


                            try {

                                const reponse =
                                    await fetch(
                                        "/TaskFlow/backend/task-members.php",
                                        {
                                            method:
                                                "DELETE",

                                            headers: {
                                                "Content-Type":
                                                    "application/json"
                                            },

                                            body:
                                                JSON.stringify(
                                                    {
                                                        task_id:
                                                            tache.id,

                                                        user_id:
                                                            membre.user_id
                                                    }
                                                )
                                        }
                                    );


                                const donnees =
                                    await reponse.json();


                                if (
                                    !reponse.ok
                                ) {

                                    throw new Error(
                                        donnees.erreur ||
                                        "Impossible de retirer le collaborateur."
                                    );

                                }


                                await chargerMembres();

                            }
                            catch (
                                erreur
                            ) {

                                console.error(
                                    "Erreur retrait collaborateur :",
                                    erreur
                                );


                                alert(
                                    erreur.message
                                );

                            }

                        }
                    );


                    ligne.appendChild(
                        informations
                    );

                    ligne.appendChild(
                        retirer
                    );


                    membres.appendChild(
                        ligne
                    );

                }
            );

        }
        catch (
            erreur
        ) {

            console.error(
                "Erreur chargement collaborateurs :",
                erreur
            );


            membres.innerHTML =
                "";


            const erreurElement =
                document.createElement(
                    "p"
                );

            erreurElement.textContent =
                erreur.message;


            membres.appendChild(
                erreurElement
            );

        }

    }


    // --------------------------------------------------------
    // RECHERCHER DES UTILISATEURS
    // --------------------------------------------------------

    let temporisationRecherche =
        null;


    async function rechercherUtilisateurs() {

        const valeur =
            rechercheUtilisateur.value.trim();


        resultats.innerHTML =
            "";


        if (
            valeur.length < 2
        ) {

            return;

        }


        const chargement =
            document.createElement(
                "p"
            );

        chargement.textContent =
            "Recherche...";


        resultats.appendChild(
            chargement
        );


        try {

            const reponse =
                await fetch(
                    "/TaskFlow/backend/users.php?recherche=" +
                    encodeURIComponent(
                        valeur
                    )
                );


            const donnees =
                await reponse.json();


            if (
                !reponse.ok
            ) {

                throw new Error(
                    donnees.erreur ||
                    "Impossible d'effectuer la recherche."
                );

            }


            resultats.innerHTML =
                "";


            if (
                !donnees.utilisateurs ||
                donnees.utilisateurs.length === 0
            ) {

                const vide =
                    document.createElement(
                        "p"
                    );

                vide.textContent =
                    "Aucun utilisateur trouvé.";

                resultats.appendChild(
                    vide
                );

                return;

            }


            donnees.utilisateurs.forEach(
                function (utilisateur) {

                    const ligne =
                        document.createElement(
                            "div"
                        );

                    ligne.classList.add(
                        "partage-resultat"
                    );


                    const informations =
                        document.createElement(
                            "div"
                        );


                    const nom =
                        document.createElement(
                            "strong"
                        );

                    nom.textContent =
                        utilisateur.nom;


                    const email =
                        document.createElement(
                            "small"
                        );

                    email.textContent =
                        utilisateur.email;


                    informations.appendChild(
                        nom
                    );

                    informations.appendChild(
                        email
                    );


                    const ajouter =
                        document.createElement(
                            "button"
                        );

                    ajouter.type =
                        "button";

                    ajouter.textContent =
                        "Ajouter";

                    ajouter.classList.add(
                        "partage-ajouter"
                    );


                    ajouter.addEventListener(
                        "click",
                        async function () {

                            ajouter.disabled =
                                true;

                            ajouter.textContent =
                                "Ajout...";


                            try {

                                const reponse =
                                    await fetch(
                                        "/TaskFlow/backend/task-members.php",
                                        {
                                            method:
                                                "POST",

                                            headers: {
                                                "Content-Type":
                                                    "application/json"
                                            },

                                            body:
                                                JSON.stringify(
                                                    {
                                                        task_id:
                                                            tache.id,

                                                        user_id:
                                                            utilisateur.id
                                                    }
                                                )
                                        }
                                    );


                                const donnees =
                                    await reponse.json();


                                if (
                                    !reponse.ok
                                ) {

                                    throw new Error(
                                        donnees.erreur ||
                                        "Impossible d'ajouter le collaborateur."
                                    );

                                }


                                ajouter.textContent =
                                    "Ajouté";


                                await chargerMembres();

                            }
                            catch (
                                erreur
                            ) {

                                console.error(
                                    "Erreur ajout collaborateur :",
                                    erreur
                                );


                                alert(
                                    erreur.message
                                );


                                ajouter.disabled =
                                    false;

                                ajouter.textContent =
                                    "Ajouter";

                            }

                        }
                    );


                    ligne.appendChild(
                        informations
                    );

                    ligne.appendChild(
                        ajouter
                    );


                    resultats.appendChild(
                        ligne
                    );

                }
            );

        }
        catch (
            erreur
        ) {

            console.error(
                "Erreur recherche utilisateurs :",
                erreur
            );


            resultats.innerHTML =
                "";


            const erreurElement =
                document.createElement(
                    "p"
                );

            erreurElement.textContent =
                erreur.message;


            resultats.appendChild(
                erreurElement
            );

        }

    }


    rechercheUtilisateur.addEventListener(
        "input",
        function () {

            clearTimeout(
                temporisationRecherche
            );


            temporisationRecherche =
                setTimeout(
                    rechercherUtilisateurs,
                    300
                );

        }
    );


    // --------------------------------------------------------
    // CONSTRUCTION
    // --------------------------------------------------------

    fenetre.appendChild(
        entete
    );

    fenetre.appendChild(
        nomTache
    );

    fenetre.appendChild(
        rechercheUtilisateur
    );

    fenetre.appendChild(
        resultats
    );

    fenetre.appendChild(
        titreMembres
    );

    fenetre.appendChild(
        membres
    );


    overlay.appendChild(
        fenetre
    );


    // Fermer en cliquant
    // hors de la fenêtre

    overlay.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                overlay
            ) {

                overlay.remove();

            }

        }
    );


    document.body.appendChild(
        overlay
    );


    await chargerMembres();

    rechercheUtilisateur.focus();

}

// ============================================================
// V14 — COMMENTAIRES
// ============================================================

async function chargerCommentaires(
    taskId
) {

    const reponse =
        await fetch(
            API_TASK_COMMENTS +
            "?task_id=" +
            encodeURIComponent(taskId)
        );

    const donnees =
        await reponse.json();

    if (
        !reponse.ok ||
        !donnees.succes
    ) {

        throw new Error(
            donnees.erreur ||
            "Impossible de charger les commentaires."
        );

    }

    return donnees.commentaires || [];
}


async function ajouterCommentaire(
    taskId,
    contenu
) {

    const reponse =
        await fetch(
            API_TASK_COMMENTS,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({
                        task_id:
                            taskId,

                        contenu:
                            contenu
                    })
            }
        );

    const donnees =
        await reponse.json();

    if (
        !reponse.ok ||
        !donnees.succes
    ) {

        throw new Error(
            donnees.erreur ||
            "Impossible d'ajouter le commentaire."
        );

    }

    return donnees.commentaire;
}


async function supprimerCommentaire(
    commentId
) {

    const reponse =
        await fetch(
            API_TASK_COMMENTS,
            {
                method: "DELETE",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({
                        comment_id:
                            commentId
                    })
            }
        );

    const donnees =
        await reponse.json();

    if (
        !reponse.ok ||
        !donnees.succes
    ) {

        throw new Error(
            donnees.erreur ||
            "Impossible de supprimer le commentaire."
        );

    }

    return donnees;
}

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

        // --------------------------------------------------------
    // PARTAGER — V12
    // --------------------------------------------------------

    if (
        Number(tache.user_id) ===
        Number(utilisateurConnecteId)
    ) {

        const partager =
            document.createElement(
                "button"
            );

        partager.type =
            "button";

        partager.textContent =
            "Partager";

        partager.classList.add(
            "partager"
        );

        partager.addEventListener(
            "click",
            function () {

                ouvrirFenetrePartage(
                    tache
                );

            }
        );

        actions.appendChild(
            partager
        );

    }


    // --------------------------------------------------------
    // MODIFIER

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
// V14 — COMMENTAIRES
// --------------------------------------------------------

const blocCommentaires =
    document.createElement(
        "div"
    );

blocCommentaires.classList.add(
    "commentaires"
);


const enteteCommentaires =
    document.createElement(
        "div"
    );

enteteCommentaires.classList.add(
    "commentaires-entete"
);


const titreCommentaires =
    document.createElement(
        "span"
    );

titreCommentaires.classList.add(
    "commentaires-titre"
);

titreCommentaires.textContent =
    "💬 Commentaires";


const listeCommentaires =
    document.createElement(
        "div"
    );

listeCommentaires.classList.add(
    "liste-commentaires"
);


const formulaireCommentaire =
    document.createElement(
        "div"
    );

formulaireCommentaire.classList.add(
    "formulaire-commentaire"
);


const champCommentaire =
    document.createElement(
        "textarea"
    );

champCommentaire.placeholder =
    "Écrire un commentaire...";

champCommentaire.maxLength =
    5000;

champCommentaire.classList.add(
    "champ-commentaire"
);


const boutonCommentaire =
    document.createElement(
        "button"
    );

boutonCommentaire.type =
    "button";

boutonCommentaire.textContent =
    "Envoyer";

boutonCommentaire.classList.add(
    "bouton-commentaire"
);


enteteCommentaires.appendChild(
    titreCommentaires
);

blocCommentaires.appendChild(
    enteteCommentaires
);

blocCommentaires.appendChild(
    listeCommentaires
);


formulaireCommentaire.appendChild(
    champCommentaire
);

formulaireCommentaire.appendChild(
    boutonCommentaire
);

blocCommentaires.appendChild(
    formulaireCommentaire
);


async function afficherCommentaires() {

    listeCommentaires.innerHTML =
        "";

    try {

        const commentaires =
            await chargerCommentaires(
                tache.id
            );

        if (
            commentaires.length === 0
        ) {

            const vide =
                document.createElement(
                    "p"
                );

            vide.classList.add(
                "commentaires-vide"
            );

            vide.textContent =
                "Aucun commentaire.";

            listeCommentaires.appendChild(
                vide
            );

            return;
        }


        commentaires.forEach(
            function (commentaire) {

                const elementCommentaire =
                    document.createElement(
                        "div"
                    );

                elementCommentaire.classList.add(
                    "commentaire"
                );


                const contenu =
                    document.createElement(
                        "div"
                    );

                contenu.classList.add(
                    "commentaire-contenu"
                );

                contenu.textContent =
                    commentaire.contenu;


                const informations =
                    document.createElement(
                        "div"
                    );

                informations.classList.add(
                    "commentaire-informations"
                );

                informations.textContent =
                    (
                        commentaire.nom ||
                        commentaire.email ||
                        "Utilisateur"
                    ) +
                    " • " +
                    commentaire.created_at;


                elementCommentaire.appendChild(
                    contenu
                );

                elementCommentaire.appendChild(
                    informations
                );


                if (
                    Number(
                        commentaire.user_id
                    ) ===
                    Number(
                        utilisateurConnecteId
                    )
                ) {

                    const boutonSupprimer =
                        document.createElement(
                            "button"
                        );

                    boutonSupprimer.type =
                        "button";

                    boutonSupprimer.textContent =
                        "Supprimer";

                    boutonSupprimer.classList.add(
                        "bouton-supprimer-commentaire"
                    );


                    boutonSupprimer.addEventListener(
                        "click",
                        async function () {

                            try {

                                await supprimerCommentaire(
                                    commentaire.id
                                );

                                await afficherCommentaires();

                            } catch (erreur) {

                                console.error(
                                    "Erreur suppression commentaire :",
                                    erreur
                                );

                                alert(
                                    "Impossible de supprimer le commentaire."
                                );

                            }

                        }
                    );


                    elementCommentaire.appendChild(
                        boutonSupprimer
                    );

                }


                listeCommentaires.appendChild(
                    elementCommentaire
                );

            }
        );

    } catch (erreur) {

        console.error(
            "Erreur chargement commentaires :",
            erreur
        );

        const erreurElement =
            document.createElement(
                "p"
            );

        erreurElement.classList.add(
            "commentaires-erreur"
        );

        erreurElement.textContent =
            "Impossible de charger les commentaires.";

        listeCommentaires.appendChild(
            erreurElement
        );

    }

}


boutonCommentaire.addEventListener(
    "click",
    async function () {

        const contenu =
            champCommentaire.value.trim();

        if (!contenu) {

            champCommentaire.focus();

            return;
        }


        boutonCommentaire.disabled =
            true;

        try {

            await ajouterCommentaire(
                tache.id,
                contenu
            );

            champCommentaire.value =
                "";

            await afficherCommentaires();

        } catch (erreur) {

            console.error(
                "Erreur ajout commentaire :",
                erreur
            );

            alert(
                erreur.message ||
                "Impossible d'ajouter le commentaire."
            );

        } finally {

            boutonCommentaire.disabled =
                false;

        }

    }
);


champCommentaire.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            boutonCommentaire.click();

        }

    }
);


element.appendChild(
    blocCommentaires
);

afficherCommentaires();

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

    // FILTRE PRIORITÉ

if (
    filtrePrioriteActuel !==
    "toutes"
) {

    resultat =
        resultat.filter(
            function (tache) {

                return (
                    tache.priorite ===
                    filtrePrioriteActuel
                );

            }
        );

}


// FILTRE ÉCHÉANCE

if (
    filtreEcheanceActuel !==
    "toutes"
) {

    const aujourdHui =
        new Date();

    aujourdHui.setHours(
        0,
        0,
        0,
        0
    );

    resultat =
        resultat.filter(
            function (tache) {

                if (
                    filtreEcheanceActuel ===
                    "sans-echeance"
                ) {

                    return !tache.dateEcheance;

                }

                if (
                    !tache.dateEcheance
                ) {

                    return false;

                }

                const dateEcheance =
                    new Date(
                        tache.dateEcheance +
                        "T00:00:00"
                    );

                if (
                    filtreEcheanceActuel ===
                    "aujourd-hui"
                ) {

                    return (
                        dateEcheance.getTime() ===
                        aujourdHui.getTime()
                    );

                }

                if (
                    filtreEcheanceActuel ===
                    "semaine"
                ) {

                    const finSemaine =
                        new Date(
                            aujourdHui
                        );

                    finSemaine.setDate(
                        finSemaine.getDate() + 7
                    );

                    return (
                        dateEcheance >=
                        aujourdHui &&
                        dateEcheance <=
                        finSemaine
                    );

                }

                return true;

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
// FILTRE PRIORITÉ
// ============================================================

filtrePriorite.addEventListener(
    "change",
    function () {

        filtrePrioriteActuel =
            filtrePriorite.value;

        afficherTaches();

    }
);


// ============================================================
// FILTRE ÉCHÉANCE
// ============================================================

filtreEcheance.addEventListener(
    "change",
    function () {

        filtreEcheanceActuel =
            filtreEcheance.value;

        afficherTaches();

    }
);


// ============================================================
// RÉINITIALISER LES FILTRES
// ============================================================

boutonReinitialiserFiltres.addEventListener(
    "click",
    function () {

        recherche.value =
            "";

        filtreActuel =
            "toutes";

        filtreCategorieActuel =
            "toutes";

        filtrePrioriteActuel =
            "toutes";

        filtreEcheanceActuel =
            "toutes";

        filtreCategories.value =
            "toutes";

        filtrePriorite.value =
            "toutes";

        filtreEcheance.value =
            "toutes";

        boutonsFiltres.forEach(
            function (bouton) {

                bouton.classList.remove(
                    "actif"
                );

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

// ============================================================
// SIDEBAR — OUVRIR / FERMER
// ============================================================

const sedakorMenuButton =
    document.querySelector(
        "#sedakor-menu-button"
    );

const sedakorApp =
    document.querySelector(
        ".sedakor-app"
    );


if (
    sedakorMenuButton &&
    sedakorApp
) {

    sedakorMenuButton.addEventListener(
        "click",
        function () {

            sedakorApp.classList.toggle(
                "sidebar-masquee"
            );

        }
    );

}

// ============================================================
// SIDEBAR — ÉTAT INITIAL RESPONSIVE
// ============================================================

// ============================================================
// SIDEBAR — ÉTAT RESPONSIVE
// ============================================================

let largeurPrecedente =
    window.innerWidth;


function ajusterSidebarResponsive() {

    if (!sedakorApp) {
        return;
    }

    const largeurActuelle =
        window.innerWidth;


    /*
     * Si on vient de passer d'un grand écran
     * vers un écran moyen ou mobile,
     * on ferme automatiquement la sidebar.
     */

    if (
        largeurPrecedente > 1100 &&
        largeurActuelle <= 1100
    ) {

        sedakorApp.classList.add(
            "sidebar-masquee"
        );

    }


    /*
     * Si on revient sur un grand écran,
     * on réouvre automatiquement la sidebar.
     */

    if (
        largeurPrecedente <= 1100 &&
        largeurActuelle > 1100
    ) {

        sedakorApp.classList.remove(
            "sidebar-masquee"
        );

    }


    largeurPrecedente =
        largeurActuelle;

}

// ============================================================
// SIDEBAR — FERMETURE EN CLIQUANT EN DEHORS
// ============================================================

document.addEventListener(
    "click",
    function (event) {

        if (!sedakorApp) {
            return;
        }

        // Uniquement sur écran réduit
        if (window.innerWidth > 1100) {
            return;
        }

        // Sidebar déjà fermée
        if (
            sedakorApp.classList.contains(
                "sidebar-masquee"
            )
        ) {
            return;
        }

        const sidebar =
            document.querySelector(
                ".sedakor-sidebar"
            );

        const boutonMenu =
            document.querySelector(
                "#sedakor-menu-button"
            );

        // Clic dans la sidebar → on ne ferme pas
        if (
            sidebar &&
            sidebar.contains(event.target)
        ) {
            return;
        }

        // Clic sur le bouton menu → le bouton
        // gère lui-même l'ouverture/fermeture
        if (
            boutonMenu &&
            boutonMenu.contains(event.target)
        ) {
            return;
        }

        // Clic ailleurs → fermeture
        sedakorApp.classList.add(
            "sidebar-masquee"
        );

    }
);

ajusterSidebarResponsive();


window.addEventListener(
    "resize",
    ajusterSidebarResponsive
);


ajusterSidebarResponsive();


window.addEventListener(
    "resize",
    ajusterSidebarResponsive
);