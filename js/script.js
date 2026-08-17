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
    document.querySelector(
        "#pourcentage-progression"
    );

const progression =
    document.querySelector(
        "#progression"
    );


let taches = [];

let filtreActuel = "toutes";

let filtreCategorieActuel = "toutes";

let triActuel = "recentes";


// =========================
// CHARGEMENT
// =========================

const tachesSauvegardees =
    localStorage.getItem("taches");


if (tachesSauvegardees) {

    try {

        taches =
            JSON.parse(
                tachesSauvegardees
            );

    } catch (erreur) {

        taches = [];

    }

}


// =========================
// NORMALISATION
// =========================

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


        if (
            !Array.isArray(
                tache.sousTaches
            )
        ) {

            tache.sousTaches = [];

        }


        if (!tache.recurrence) {

            tache.recurrence =
                "aucune";

        }


        if (
            typeof tache.recurrence !==
            "string"
        ) {

            tache.recurrence =
                "aucune";

        }


        tache.sousTaches.forEach(
            function (sousTache) {

                if (
                    typeof sousTache.terminee !==
                    "boolean"
                ) {

                    sousTache.terminee =
                        false;

                }

            }
        );

    }
);


localStorage.setItem(
    "taches",
    JSON.stringify(taches)
);


// =========================
// SAUVEGARDE
// =========================

function sauvegarderTaches() {

    localStorage.setItem(
        "taches",
        JSON.stringify(taches)
    );

}


// =========================
// CRÉATION
// =========================

function creerTache(
    texte,
    niveauPriorite,
    niveauCategorie,
    date,
    niveauRecurrence
) {

    return {

        id: Date.now(),

        texte: texte,

        terminee: false,

        priorite: niveauPriorite,

        categorie: niveauCategorie,

        dateEcheance: date,

        recurrence: niveauRecurrence,

        sousTaches: []

    };

}


function creerSousTache(
    texte
) {

    return {

        id:
            Date.now() +
            Math.random(),

        texte: texte,

        terminee: false

    };

}


// =========================
// RÉCURRENCE
// =========================

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
            prochaineDate.getDate() + 1
        );

    }


    if (
        typeRecurrence ===
        "hebdomadaire"
    ) {

        prochaineDate.setDate(
            prochaineDate.getDate() + 7
        );

    }


    if (
        typeRecurrence ===
        "mensuelle"
    ) {

        const jour =
            prochaineDate.getDate();

        prochaineDate.setMonth(
            prochaineDate.getMonth() + 1
        );


        // Évite les débordements
        // de dates comme 31 → mois suivant

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
        ).padStart(2, "0");

    const jour =
        String(
            prochaineDate.getDate()
        ).padStart(2, "0");


    return (
        annee +
        "-" +
        mois +
        "-" +
        jour
    );

}


// =========================
// NOM RÉCURRENCE
// =========================

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


// =========================
// DATE
// =========================

function dateEstEnRetard(tache) {

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


function formaterDate(date) {

    if (!date) {

        return "";

    }


    const morceaux =
        date.split("-");


    if (
        morceaux.length !== 3
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


// =========================
// CATÉGORIE
// =========================

function nomCategorie(
    categorie
) {

    if (
        categorie === "travail"
    ) {

        return "💼 Travail";

    }


    if (
        categorie === "etudes"
    ) {

        return "📚 Études";

    }


    if (
        categorie === "personnel"
    ) {

        return "🏠 Personnel";

    }


    if (
        categorie === "projets"
    ) {

        return "🚀 Projets";

    }


    return "📦 Autre";

}


// =========================
// SOUS-TÂCHES
// =========================

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
        tache.sousTaches.length === 0
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


// =========================
// COMPTEUR
// =========================

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


// =========================
// DASHBOARD
// =========================

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

}


// =========================
// PRIORITÉ
// =========================

function valeurPriorite(
    tache
) {

    if (
        tache.priorite === "haute"
    ) {

        return 3;

    }


    if (
        tache.priorite === "moyenne"
    ) {

        return 2;

    }


    return 1;

}


// =========================
// TRI
// =========================

function trierTaches(
    tachesATrier
) {

    const copie =
        [...tachesATrier];


    if (
        triActuel === "recentes"
    ) {

        copie.sort(
            function (a, b) {

                return b.id - a.id;

            }
        );

    }


    if (
        triActuel === "anciennes"
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


// =========================
// TERMINER UNE TÂCHE
// =========================

function terminerTache(
    tache
) {

    tache.terminee =
        !tache.terminee;


    /*
     * V6 :
     * lorsqu'une tâche récurrente
     * est terminée, on crée
     * automatiquement la prochaine.
     */

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
                tache.recurrence
            );


        /*
         * Les sous-tâches ne sont pas
         * copiées : chaque nouvelle
         * occurrence recommence proprement.
         */

        taches.push(
            prochaineTache
        );

    }


    sauvegarderTaches();

    afficherTaches();

}


// =========================
// AFFICHER SOUS-TÂCHE
// =========================

function afficherSousTache(
    tache,
    sousTache,
    conteneur
) {

    const element =
        document.createElement("div");


    element.classList.add(
        "sous-tache"
    );


    const checkbox =
        document.createElement("input");


    checkbox.type =
        "checkbox";


    checkbox.classList.add(
        "sous-tache-checkbox"
    );


    checkbox.checked =
        sousTache.terminee;


    const texte =
        document.createElement("span");


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
        document.createElement("button");


    bouton.type =
        "button";


    bouton.classList.add(
        "supprimer-sous-tache"
    );


    bouton.textContent =
        "×";


    checkbox.addEventListener(
        "change",
        function () {

            sousTache.terminee =
                checkbox.checked;


            sauvegarderTaches();

            afficherTaches();

        }
    );


    bouton.addEventListener(
        "click",
        function () {

            tache.sousTaches =
                tache.sousTaches.filter(
                    function (element) {

                        return (
                            element.id !==
                            sousTache.id
                        );

                    }
                );


            sauvegarderTaches();

            afficherTaches();

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


// =========================
// AFFICHER UNE TÂCHE
// =========================

function afficherTache(
    tache
) {

    const element =
        document.createElement("div");


    element.classList.add(
        "tache"
    );


    // Entête

    const entete =
        document.createElement("div");


    entete.classList.add(
        "tache-entete"
    );


    const texte =
        document.createElement("span");


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
        document.createElement("div");


    actions.classList.add(
        "tache-actions"
    );


    const modifier =
        document.createElement("button");


    modifier.type =
        "button";


    modifier.textContent =
        "Modifier";


    modifier.classList.add(
        "modifier"
    );


    const supprimer =
        document.createElement("button");


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


    // Informations

    const informations =
        document.createElement("div");


    informations.classList.add(
        "tache-infos"
    );


    const badgePriorite =
        document.createElement("span");


    badgePriorite.classList.add(
        "priorite",
        "priorite-" +
        tache.priorite
    );


    badgePriorite.textContent =
        tache.priorite === "haute"
            ? "Haute"
            : tache.priorite === "basse"
                ? "Basse"
                : "Moyenne";


    informations.appendChild(
        badgePriorite
    );


    const badgeCategorie =
        document.createElement("span");


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


    if (
        tache.dateEcheance
    ) {

        const date =
            document.createElement("span");


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


    // Badge récurrence

    if (
        tache.recurrence !==
        "aucune"
    ) {

        const badgeRecurrence =
            document.createElement("span");


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


    element.appendChild(
        informations
    );


    // =========================
    // SOUS-TÂCHES
    // =========================

    const blocSousTaches =
        document.createElement("div");


    blocSousTaches.classList.add(
        "sous-taches"
    );


    const enteteSousTaches =
        document.createElement("div");


    enteteSousTaches.classList.add(
        "sous-taches-entete"
    );


    const titre =
        document.createElement("span");


    titre.classList.add(
        "sous-taches-titre"
    );


    titre.textContent =
        "Sous-tâches";


    const compteur =
        document.createElement("span");


    compteur.classList.add(
        "sous-taches-progressions"
    );


    compteur.textContent =
        nombreSousTachesTerminees(
            tache
        ) +
        " / " +
        tache.sousTaches.length;


    enteteSousTaches.appendChild(
        titre
    );

    enteteSousTaches.appendChild(
        compteur
    );


    blocSousTaches.appendChild(
        enteteSousTaches
    );


    const barre =
        document.createElement("div");


    barre.classList.add(
        "barre-sous-taches"
    );


    const barreRemplie =
        document.createElement("div");


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


    const listeSousTaches =
        document.createElement("div");


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


    const ajout =
        document.createElement("div");


    ajout.classList.add(
        "ajout-sous-tache"
    );


    const champ =
        document.createElement("input");


    champ.type =
        "text";


    champ.placeholder =
        "Ajouter une sous-tâche...";


    champ.classList.add(
        "champ-sous-tache"
    );


    const boutonAjout =
        document.createElement("button");


    boutonAjout.type =
        "button";


    boutonAjout.textContent =
        "Ajouter";


    boutonAjout.classList.add(
        "bouton-ajouter-sous-tache"
    );


    function ajouterSousTache() {

        const valeur =
            champ.value.trim();


        if (!valeur) {

            champ.focus();

            return;

        }


        tache.sousTaches.push(
            creerSousTache(
                valeur
            )
        );


        sauvegarderTaches();

        afficherTaches();

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


    // =========================
    // TERMINER
    // =========================

    texte.addEventListener(
        "click",
        function () {

            terminerTache(
                tache
            );

        }
    );


    // =========================
    // SUPPRIMER
    // =========================

    supprimer.addEventListener(
        "click",
        function () {

            taches =
                taches.filter(
                    function (element) {

                        return (
                            element.id !==
                            tache.id
                        );

                    }
                );


            sauvegarderTaches();

            afficherTaches();

        }
    );


    // =========================
    // MODIFIER
    // =========================

    modifier.addEventListener(
        "click",
        function () {

            const ancienTexte =
                tache.texte;


            const ancienPriorite =
                tache.priorite;


            const ancienneCategorie =
                tache.categorie;


            const ancienneDate =
                tache.dateEcheance ||
                "";


            const ancienneRecurrence =
                tache.recurrence ||
                "aucune";


            entete.innerHTML =
                "";


            const champModification =
                document.createElement("input");


            champModification.type =
                "text";


            champModification.value =
                ancienTexte;


            champModification.classList.add(
                "champ-modification"
            );


            const actionsEdition =
                document.createElement("div");


            actionsEdition.classList.add(
                "tache-actions"
            );


            const selectPriorite =
                document.createElement("select");


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


                    if (
                        option[0] ===
                        ancienPriorite
                    ) {

                        element.selected =
                            true;

                    }


                    selectPriorite.appendChild(
                        element
                    );

                }
            );


            const selectCategorie =
                document.createElement("select");


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


                    if (
                        option[0] ===
                        ancienneCategorie
                    ) {

                        element.selected =
                            true;

                    }


                    selectCategorie.appendChild(
                        element
                    );

                }
            );


            const dateModification =
                document.createElement("input");


            dateModification.type =
                "date";


            dateModification.value =
                ancienneDate;


            dateModification.classList.add(
                "date-modification"
            );


            const selectRecurrence =
                document.createElement("select");


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


                    if (
                        option[0] ===
                        ancienneRecurrence
                    ) {

                        element.selected =
                            true;

                    }


                    selectRecurrence.appendChild(
                        element
                    );

                }
            );


            const enregistrer =
                document.createElement("button");


            enregistrer.type =
                "button";


            enregistrer.textContent =
                "Enregistrer";


            enregistrer.classList.add(
                "enregistrer"
            );


            const annuler =
                document.createElement("button");


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
                selectRecurrence
            );

            entete.appendChild(
                actionsEdition
            );


            annuler.addEventListener(
                "click",
                function () {

                    afficherTaches();

                }
            );


            enregistrer.addEventListener(
                "click",
                function () {

                    const nouveauTexte =
                        champModification
                            .value
                            .trim();


                    if (!nouveauTexte) {

                        champModification.focus();

                        return;

                    }


                    tache.texte =
                        nouveauTexte;


                    tache.priorite =
                        selectPriorite.value;


                    tache.categorie =
                        selectCategorie.value;


                    tache.dateEcheance =
                        dateModification.value;


                    tache.recurrence =
                        selectRecurrence.value;


                    sauvegarderTaches();

                    afficherTaches();

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


// =========================
// AFFICHAGE
// =========================

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


// =========================
// FORMULAIRE
// =========================

formulaire.addEventListener(
    "submit",
    function (event) {

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
                recurrence.value
            );


        taches.push(
            nouvelleTache
        );


        sauvegarderTaches();


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


        afficherTaches();

        champTache.focus();

    }
);


// =========================
// RECHERCHE
// =========================

recherche.addEventListener(
    "input",
    afficherTaches
);


// =========================
// FILTRES
// =========================

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


// =========================
// CATÉGORIE
// =========================

filtreCategories.addEventListener(
    "change",
    function () {

        filtreCategorieActuel =
            filtreCategories.value;


        afficherTaches();

    }
);


// =========================
// TRI
// =========================

triTaches.addEventListener(
    "change",
    function () {

        triActuel =
            triTaches.value;


        afficherTaches();

    }
);


// =========================
// INITIALISATION
// =========================

afficherTaches();


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