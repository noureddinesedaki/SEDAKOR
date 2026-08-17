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


// Dashboard

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
// NORMALISER LES ANCIENNES TÂCHES
// =========================

taches.forEach(
    function (tache) {

        if (
            !tache.priorite
        ) {

            tache.priorite =
                "moyenne";

        }


        if (
            !tache.categorie
        ) {

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
// CRÉER UNE TÂCHE
// =========================

function creerTache(
    texte,
    niveauPriorite,
    niveauCategorie,
    date
) {

    return {

        id: Date.now(),

        texte: texte,

        terminee: false,

        priorite: niveauPriorite,

        categorie: niveauCategorie,

        dateEcheance: date,

        sousTaches: []

    };

}


// =========================
// CRÉER UNE SOUS-TÂCHE
// =========================

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
// SAUVEGARDER
// =========================

function sauvegarderTaches() {

    localStorage.setItem(
        "taches",
        JSON.stringify(taches)
    );

}


// =========================
// DATE EN RETARD
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


// =========================
// FORMATER UNE DATE
// =========================

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
// NOM CATÉGORIE
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
// COMPTER SOUS-TÂCHES
// =========================

function nombreSousTachesTerminees(
    tache
) {

    if (
        !Array.isArray(
            tache.sousTaches
        )
    ) {

        return 0;

    }


    return tache.sousTaches.filter(
        function (sousTache) {

            return sousTache.terminee;

        }
    ).length;

}


// =========================
// POURCENTAGE SOUS-TÂCHES
// =========================

function pourcentageSousTaches(
    tache
) {

    if (
        !Array.isArray(
            tache.sousTaches
        ) ||
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


    const texteTotal =
        total <= 1
            ? "tâche"
            : "tâches";


    const texteTerminees =
        terminees <= 1
            ? "terminée"
            : "terminées";


    compteurTaches.textContent =
        total +
        " " +
        texteTotal +
        " • " +
        enCours +
        " en cours" +
        " • " +
        terminees +
        " " +
        texteTerminees;

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


    let pourcentage = 0;


    if (
        total > 0
    ) {

        pourcentage =
            Math.round(
                (
                    terminees /
                    total
                ) *
                100
            );

    }


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
// FILTRES
// =========================

function mettreAJourFiltres() {

    boutonsFiltres.forEach(
        function (bouton) {

            bouton.classList.remove(
                "actif"
            );


            if (
                bouton.dataset.filtre ===
                filtreActuel
            ) {

                bouton.classList.add(
                    "actif"
                );

            }

        }
    );

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


    if (
        tache.priorite === "basse"
    ) {

        return 1;

    }


    return 0;

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


// =========================
// AFFICHER UNE SOUS-TÂCHE
// =========================

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


    // Checkbox

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


    // Texte

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


    // Supprimer

    const boutonSupprimer =
        document.createElement(
            "button"
        );


    boutonSupprimer.type =
        "button";


    boutonSupprimer.classList.add(
        "supprimer-sous-tache"
    );


    boutonSupprimer.textContent =
        "×";


    // Cocher

    checkbox.addEventListener(
        "change",
        function () {

            sousTache.terminee =
                checkbox.checked;


            sauvegarderTaches();


            afficherTaches();

        }
    );


    // Supprimer

    boutonSupprimer.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();


            tache.sousTaches =
                tache.sousTaches.filter(
                    function (
                        sousTacheActuelle
                    ) {

                        return (
                            sousTacheActuelle.id !==
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
        boutonSupprimer
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

    if (
        !Array.isArray(
            tache.sousTaches
        )
    ) {

        tache.sousTaches = [];

    }


    const nouvelleTache =
        document.createElement(
            "div"
        );


    nouvelleTache.classList.add(
        "tache"
    );


    // =========================
    // ENTÊTE
    // =========================

    const entete =
        document.createElement(
            "div"
        );


    entete.classList.add(
        "tache-entete"
    );


    // Texte

    const texteElement =
        document.createElement(
            "span"
        );


    texteElement.classList.add(
        "tache-texte"
    );


    texteElement.textContent =
        tache.texte;


    if (
        tache.terminee
    ) {

        texteElement.classList.add(
            "tache-terminee"
        );

    }


    entete.appendChild(
        texteElement
    );


    // Actions

    const actions =
        document.createElement(
            "div"
        );


    actions.classList.add(
        "tache-actions"
    );


    const boutonModifier =
        document.createElement(
            "button"
        );


    boutonModifier.type =
        "button";


    boutonModifier.textContent =
        "Modifier";


    boutonModifier.classList.add(
        "modifier"
    );


    const boutonSupprimer =
        document.createElement(
            "button"
        );


    boutonSupprimer.type =
        "button";


    boutonSupprimer.textContent =
        "Supprimer";


    boutonSupprimer.classList.add(
        "supprimer"
    );


    actions.appendChild(
        boutonModifier
    );


    actions.appendChild(
        boutonSupprimer
    );


    entete.appendChild(
        actions
    );


    nouvelleTache.appendChild(
        entete
    );


    // =========================
    // INFORMATIONS
    // =========================

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
        "priorite"
    );


    const prioriteActuelle =
        tache.priorite ||
        "moyenne";


    badgePriorite.classList.add(
        "priorite-" +
        prioriteActuelle
    );


    if (
        prioriteActuelle ===
        "haute"
    ) {

        badgePriorite.textContent =
            "Haute";

    } else if (
        prioriteActuelle ===
        "basse"
    ) {

        badgePriorite.textContent =
            "Basse";

    } else {

        badgePriorite.textContent =
            "Moyenne";

    }


    informations.appendChild(
        badgePriorite
    );


    // Catégorie

    const badgeCategorie =
        document.createElement(
            "span"
        );


    const categorieActuelle =
        tache.categorie ||
        "autre";


    badgeCategorie.classList.add(
        "categorie"
    );


    badgeCategorie.classList.add(
        "categorie-" +
        categorieActuelle
    );


    badgeCategorie.textContent =
        nomCategorie(
            categorieActuelle
        );


    informations.appendChild(
        badgeCategorie
    );


    // Date

    if (
        tache.dateEcheance
    ) {

        const dateElement =
            document.createElement(
                "span"
            );


        dateElement.classList.add(
            "date-echeance"
        );


        if (
            dateEstEnRetard(
                tache
            )
        ) {

            dateElement.classList.add(
                "date-en-retard"
            );


            dateElement.textContent =
                "En retard • " +
                formaterDate(
                    tache.dateEcheance
                );

        } else {

            dateElement.textContent =
                "Échéance : " +
                formaterDate(
                    tache.dateEcheance
                );

        }


        informations.appendChild(
            dateElement
        );

    }


    nouvelleTache.appendChild(
        informations
    );


    // =========================
    // SOUS-TÂCHES
    // =========================

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


    const progressionTexte =
        document.createElement(
            "span"
        );


    progressionTexte.classList.add(
        "sous-taches-progressions"
    );


    const totalSousTaches =
        tache.sousTaches.length;


    const sousTachesTerminees =
        nombreSousTachesTerminees(
            tache
        );


    progressionTexte.textContent =
        sousTachesTerminees +
        " / " +
        totalSousTaches;


    enteteSousTaches.appendChild(
        titreSousTaches
    );


    enteteSousTaches.appendChild(
        progressionTexte
    );


    blocSousTaches.appendChild(
        enteteSousTaches
    );


    // Barre de progression

    const barreSousTaches =
        document.createElement(
            "div"
        );


    barreSousTaches.classList.add(
        "barre-sous-taches"
    );


    const progressionSousTaches =
        document.createElement(
            "div"
        );


    progressionSousTaches.classList.add(
        "progression-sous-taches"
    );


    progressionSousTaches.style.width =
        pourcentageSousTaches(
            tache
        ) +
        "%";


    barreSousTaches.appendChild(
        progressionSousTaches
    );


    blocSousTaches.appendChild(
        barreSousTaches
    );


    // Liste des sous-tâches

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


    // Ajouter une sous-tâche

    const ajoutSousTache =
        document.createElement(
            "div"
        );


    ajoutSousTache.classList.add(
        "ajout-sous-tache"
    );


    const champSousTache =
        document.createElement(
            "input"
        );


    champSousTache.type =
        "text";


    champSousTache.placeholder =
        "Ajouter une sous-tâche...";


    champSousTache.classList.add(
        "champ-sous-tache"
    );


    const boutonAjouterSousTache =
        document.createElement(
            "button"
        );


    boutonAjouterSousTache.type =
        "button";


    boutonAjouterSousTache.textContent =
        "Ajouter";


    boutonAjouterSousTache.classList.add(
        "bouton-ajouter-sous-tache"
    );


    function ajouterSousTache() {

        const texteSousTache =
            champSousTache.value.trim();


        if (
            texteSousTache === ""
        ) {

            champSousTache.focus();

            return;

        }


        const nouvelleSousTache =
            creerSousTache(
                texteSousTache
            );


        tache.sousTaches.push(
            nouvelleSousTache
        );


        sauvegarderTaches();


        afficherTaches();

    }


    boutonAjouterSousTache.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            ajouterSousTache();

        }
    );


    champSousTache.addEventListener(
        "keydown",
        function (event) {

            event.stopPropagation();


            if (
                event.key ===
                "Enter"
            ) {

                ajouterSousTache();

            }

        }
    );


    ajoutSousTache.appendChild(
        champSousTache
    );


    ajoutSousTache.appendChild(
        boutonAjouterSousTache
    );


    blocSousTaches.appendChild(
        ajoutSousTache
    );


    nouvelleTache.appendChild(
        blocSousTaches
    );


    // =========================
    // TERMINER LA TÂCHE
    // =========================

    texteElement.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();


            tache.terminee =
                !tache.terminee;


            sauvegarderTaches();


            afficherTaches();

        }
    );


    // =========================
    // MODIFIER
    // =========================

    boutonModifier.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();


            if (
                nouvelleTache.classList.contains(
                    "edition"
                )
            ) {

                return;

            }


            nouvelleTache.classList.add(
                "edition"
            );


            // Champ texte

            const champModification =
                document.createElement(
                    "input"
                );


            champModification.type =
                "text";


            champModification.value =
                tache.texte;


            champModification.classList.add(
                "champ-modification"
            );


            entete.replaceChild(
                champModification,
                texteElement
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
                {
                    valeur: "basse",
                    texte: "Priorité basse"
                },
                {
                    valeur: "moyenne",
                    texte: "Priorité moyenne"
                },
                {
                    valeur: "haute",
                    texte: "Priorité haute"
                }
            ].forEach(
                function (option) {

                    const element =
                        document.createElement(
                            "option"
                        );


                    element.value =
                        option.valeur;


                    element.textContent =
                        option.texte;


                    if (
                        option.valeur ===
                        prioriteActuelle
                    ) {

                        element.selected =
                            true;

                    }


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
                {
                    valeur: "travail",
                    texte: "💼 Travail"
                },
                {
                    valeur: "etudes",
                    texte: "📚 Études"
                },
                {
                    valeur: "personnel",
                    texte: "🏠 Personnel"
                },
                {
                    valeur: "projets",
                    texte: "🚀 Projets"
                },
                {
                    valeur: "autre",
                    texte: "📦 Autre"
                }
            ].forEach(
                function (option) {

                    const element =
                        document.createElement(
                            "option"
                        );


                    element.value =
                        option.valeur;


                    element.textContent =
                        option.texte;


                    if (
                        option.valeur ===
                        categorieActuelle
                    ) {

                        element.selected =
                            true;

                    }


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
                tache.dateEcheance ||
                "";


            dateModification.classList.add(
                "date-modification"
            );


            // Remplacer les infos

            informations.innerHTML =
                "";


            informations.appendChild(
                selectPriorite
            );


            informations.appendChild(
                selectCategorie
            );


            informations.appendChild(
                dateModification
            );


            // Boutons

            actions.innerHTML =
                "";


            const boutonEnregistrer =
                document.createElement(
                    "button"
                );


            boutonEnregistrer.type =
                "button";


            boutonEnregistrer.textContent =
                "Enregistrer";


            boutonEnregistrer.classList.add(
                "enregistrer"
            );


            const boutonAnnuler =
                document.createElement(
                    "button"
                );


            boutonAnnuler.type =
                "button";


            boutonAnnuler.textContent =
                "Annuler";


            boutonAnnuler.classList.add(
                "annuler"
            );


            actions.appendChild(
                boutonEnregistrer
            );


            actions.appendChild(
                boutonAnnuler
            );


            champModification.focus();


            champModification.select();


            // Annuler

            boutonAnnuler.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();

                    afficherTaches();

                }
            );


            // Enregistrer

            boutonEnregistrer.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();


                    const nouveauTexte =
                        champModification
                            .value
                            .trim();


                    if (
                        nouveauTexte === ""
                    ) {

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


                    sauvegarderTaches();


                    afficherTaches();

                }
            );


            // Entrée / Échap

            champModification.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key ===
                        "Enter"
                    ) {

                        boutonEnregistrer.click();

                    }


                    if (
                        event.key ===
                        "Escape"
                    ) {

                        boutonAnnuler.click();

                    }

                }
            );

        }
    );


    // =========================
    // SUPPRIMER
    // =========================

    boutonSupprimer.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();


            taches =
                taches.filter(
                    function (tacheActuelle) {

                        return (
                            tacheActuelle.id !==
                            tache.id
                        );

                    }
                );


            sauvegarderTaches();


            afficherTaches();

        }
    );


    listeTaches.appendChild(
        nouvelleTache
    );

}


// =========================
// AFFICHER LES TÂCHES
// =========================

function afficherTaches() {

    mettreAJourCompteur();

    mettreAJourDashboard();


    const valeurRecherche =
        recherche.value.toLowerCase();


    let tachesFiltrees =
        taches.filter(
            function (tache) {

                return tache.texte
                    .toLowerCase()
                    .includes(
                        valeurRecherche
                    );

            }
        );


    // Filtre état

    if (
        filtreActuel ===
        "en-cours"
    ) {

        tachesFiltrees =
            tachesFiltrees.filter(
                function (tache) {

                    return !tache.terminee;

                }
            );

    }


    if (
        filtreActuel ===
        "terminees"
    ) {

        tachesFiltrees =
            tachesFiltrees.filter(
                function (tache) {

                    return tache.terminee;

                }
            );

    }


    // Filtre catégorie

    if (
        filtreCategorieActuel !==
        "toutes"
    ) {

        tachesFiltrees =
            tachesFiltrees.filter(
                function (tache) {

                    return (
                        (
                            tache.categorie ||
                            "autre"
                        ) ===
                        filtreCategorieActuel
                    );

                }
            );

    }


    // Tri

    tachesFiltrees =
        trierTaches(
            tachesFiltrees
        );


    listeTaches.innerHTML =
        "";


    tachesFiltrees.forEach(
        function (tache) {

            afficherTache(
                tache
            );

        }
    );

}


// =========================
// CHARGEMENT INITIAL
// =========================

afficherTaches();

mettreAJourFiltres();


// =========================
// AJOUTER UNE TÂCHE
// =========================

formulaire.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const texteTache =
            champTache.value.trim();


        if (
            texteTache === ""
        ) {

            champTache.focus();

            return;

        }


        const nouvelleTache =
            creerTache(
                texteTache,
                priorite.value,
                categorie.value,
                dateEcheance.value
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


        afficherTaches();


        champTache.focus();

    }
);


// =========================
// RECHERCHE
// =========================

recherche.addEventListener(
    "input",
    function () {

        afficherTaches();

    }
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


                mettreAJourFiltres();


                afficherTaches();

            }
        );

    }
);


// =========================
// FILTRE CATÉGORIE
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