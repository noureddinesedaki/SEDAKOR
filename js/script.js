const formulaire =
    document.querySelector("#formulaire-tache");

const champTache =
    document.querySelector("#tache");

const priorite =
    document.querySelector("#priorite");

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

let triActuel = "recentes";


// =========================
// CHARGER LES TÂCHES
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
// CRÉER UNE TÂCHE
// =========================

function creerTache(
    texte,
    niveauPriorite,
    date
) {

    return {

        id: Date.now(),

        texte: texte,

        terminee: false,

        priorite: niveauPriorite,

        dateEcheance: date

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
// METTRE À JOUR LE COMPTEUR
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
        total - terminees;


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
// METTRE À JOUR LE DASHBOARD
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
        total - terminees;


    const enRetard =
        taches.filter(
            function (tache) {

                return dateEstEnRetard(
                    tache
                );

            }
        ).length;


    let pourcentage = 0;


    if (total > 0) {

        pourcentage =
            Math.round(
                (terminees / total) *
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
        pourcentage + "%";


    progression.style.width =
        pourcentage + "%";

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

function valeurPriorite(tache) {

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
// AFFICHER UNE TÂCHE
// =========================

function afficherTache(tache) {

    const nouvelleTache =
        document.createElement(
            "div"
        );


    nouvelleTache.classList.add(
        "tache"
    );


    // Texte

    const texteElement =
        document.createElement(
            "span"
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


    nouvelleTache.appendChild(
        texteElement
    );


    // Informations

    const informations =
        document.createElement(
            "div"
        );


    informations.classList.add(
        "tache-infos"
    );


    // Priorité

    if (
        tache.priorite
    ) {

        const badgePriorite =
            document.createElement(
                "span"
            );


        badgePriorite.classList.add(
            "priorite"
        );


        badgePriorite.classList.add(
            "priorite-" +
            tache.priorite
        );


        if (
            tache.priorite ===
            "basse"
        ) {

            badgePriorite.textContent =
                "Basse";

        }


        if (
            tache.priorite ===
            "moyenne"
        ) {

            badgePriorite.textContent =
                "Moyenne";

        }


        if (
            tache.priorite ===
            "haute"
        ) {

            badgePriorite.textContent =
                "Haute";

        }


        informations.appendChild(
            badgePriorite
        );

    }


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
            dateEstEnRetard(tache)
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


    if (
        informations.children.length >
        0
    ) {

        nouvelleTache.appendChild(
            informations
        );

    }


    // Actions

    const actions =
        document.createElement(
            "div"
        );


    actions.classList.add(
        "tache-actions"
    );


    // Modifier

    const boutonModifier =
        document.createElement(
            "button"
        );


    boutonModifier.textContent =
        "Modifier";


    boutonModifier.classList.add(
        "modifier"
    );


    // Supprimer

    const boutonSupprimer =
        document.createElement(
            "button"
        );


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


    nouvelleTache.appendChild(
        actions
    );


    // =========================
    // TERMINER
    // =========================

    nouvelleTache.addEventListener(
        "click",
        function (event) {

            if (
                event.target.tagName ===
                "BUTTON" ||
                event.target.tagName ===
                "INPUT" ||
                event.target.tagName ===
                "SELECT"
            ) {

                return;

            }


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


            // Texte

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


            nouvelleTache.replaceChild(
                champModification,
                texteElement
            );


            // Priorité

            const selectModification =
                document.createElement(
                    "select"
                );


            selectModification.classList.add(
                "champ-priorite-modification"
            );


            const optionsPriorite = [

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

            ];


            optionsPriorite.forEach(
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
                        (
                            tache.priorite ||
                            "moyenne"
                        )
                    ) {

                        element.selected =
                            true;

                    }


                    selectModification.appendChild(
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


            informations.innerHTML =
                "";


            informations.appendChild(
                selectModification
            );


            informations.appendChild(
                dateModification
            );


            // Boutons

            const boutonEnregistrer =
                document.createElement(
                    "button"
                );


            boutonEnregistrer.textContent =
                "Enregistrer";


            boutonEnregistrer.classList.add(
                "enregistrer"
            );


            const boutonAnnuler =
                document.createElement(
                    "button"
                );


            boutonAnnuler.textContent =
                "Annuler";


            boutonAnnuler.classList.add(
                "annuler"
            );


            actions.innerHTML =
                "";


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
                        selectModification.value;


                    tache.dateEcheance =
                        dateModification.value;


                    sauvegarderTaches();


                    afficherTaches();

                }
            );


            // Clavier

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


    // En cours

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


    // Terminées

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


    // Tri

    tachesFiltrees =
        trierTaches(
            tachesFiltrees
        );


    // Effacer

    listeTaches.innerHTML =
        "";


    // Afficher

    tachesFiltrees.forEach(
        function (tache) {

            afficherTache(tache);

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