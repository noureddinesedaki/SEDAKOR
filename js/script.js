const formulaire = document.querySelector("#formulaire-tache");
const champTache = document.querySelector("#tache");
const priorite = document.querySelector("#priorite");
const dateEcheance = document.querySelector("#date-echeance");
const listeTaches = document.querySelector("#taches");
const recherche = document.querySelector("#recherche");
const boutonsFiltres = document.querySelectorAll("#filtres button");
const compteurTaches = document.querySelector("#compteur-taches");


let taches = [];
let filtreActuel = "toutes";


// =========================
// CHARGER LES TÂCHES
// =========================

const tachesSauvegardees =
    localStorage.getItem("taches");

if (tachesSauvegardees) {
    try {
        taches = JSON.parse(tachesSauvegardees);
    } catch (erreur) {
        taches = [];
    }
}


// =========================
// CRÉER UNE TÂCHE
// =========================

function creerTache(texte, niveauPriorite, date) {

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
// COMPTEUR
// =========================

function mettreAJourCompteur() {

    const nombreTotal = taches.length;

    const nombreTerminees =
        taches.filter(function (tache) {
            return tache.terminee;
        }).length;

    const nombreEnCours =
        nombreTotal - nombreTerminees;

    const texteTaches =
        nombreTotal <= 1
            ? "tâche"
            : "tâches";

    const texteTerminees =
        nombreTerminees <= 1
            ? "terminée"
            : "terminées";

    compteurTaches.textContent =
        nombreTotal + " " +
        texteTaches +
        " • " +
        nombreEnCours +
        " en cours" +
        " • " +
        nombreTerminees +
        " " +
        texteTerminees;
}


// =========================
// FILTRE ACTIF
// =========================

function mettreAJourFiltres() {

    boutonsFiltres.forEach(function (bouton) {

        bouton.classList.remove("actif");

        if (
            bouton.dataset.filtre ===
            filtreActuel
        ) {
            bouton.classList.add("actif");
        }

    });
}


// =========================
// FORMATER UNE DATE
// =========================

function formaterDate(date) {

    if (!date) {
        return "";
    }

    const morceaux = date.split("-");

    if (morceaux.length !== 3) {
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
// DATE EN RETARD
// =========================

function dateEstEnRetard(tache) {

    if (
        !tache.dateEcheance ||
        tache.terminee
    ) {
        return false;
    }

    const aujourdHui = new Date();

    aujourdHui.setHours(
        0,
        0,
        0,
        0
    );

    const dateLimite = new Date(
        tache.dateEcheance +
        "T00:00:00"
    );

    return dateLimite < aujourdHui;
}


// =========================
// AFFICHER UNE TÂCHE
// =========================

function afficherTache(tache) {

    const nouvelleTache =
        document.createElement("div");

    nouvelleTache.classList.add("tache");


    // =========================
    // TEXTE
    // =========================

    const texteElement =
        document.createElement("span");

    texteElement.textContent =
        tache.texte;

    if (tache.terminee) {

        texteElement.classList.add(
            "tache-terminee"
        );
    }

    nouvelleTache.appendChild(
        texteElement
    );


    // =========================
    // INFORMATIONS
    // =========================

    const informations =
        document.createElement("div");

    informations.classList.add(
        "tache-infos"
    );


    // =========================
    // PRIORITÉ
    // =========================

    if (tache.priorite) {

        const badgePriorite =
            document.createElement("span");

        badgePriorite.classList.add(
            "priorite"
        );

        badgePriorite.classList.add(
            "priorite-" +
            tache.priorite
        );


        if (
            tache.priorite === "basse"
        ) {

            badgePriorite.textContent =
                "Basse";

        } else if (
            tache.priorite === "moyenne"
        ) {

            badgePriorite.textContent =
                "Moyenne";

        } else if (
            tache.priorite === "haute"
        ) {

            badgePriorite.textContent =
                "Haute";

        }

        informations.appendChild(
            badgePriorite
        );
    }


    // =========================
    // DATE D'ÉCHÉANCE
    // =========================

    if (tache.dateEcheance) {

        const dateElement =
            document.createElement("span");

        dateElement.classList.add(
            "date-echeance"
        );


        if (dateEstEnRetard(tache)) {

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
        informations.children.length > 0
    ) {

        nouvelleTache.appendChild(
            informations
        );
    }


    // =========================
    // ACTIONS
    // =========================

    const actions =
        document.createElement("div");

    actions.classList.add(
        "tache-actions"
    );


    // Modifier

    const boutonModifier =
        document.createElement("button");

    boutonModifier.textContent =
        "Modifier";

    boutonModifier.classList.add(
        "modifier"
    );


    // Supprimer

    const boutonSupprimer =
        document.createElement("button");

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
    // TERMINER LA TÂCHE
    // =========================

    nouvelleTache.addEventListener(
        "click",
        function (event) {

            if (
                event.target.tagName === "BUTTON" ||
                event.target.tagName === "INPUT" ||
                event.target.tagName === "SELECT"
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


            // Empêcher plusieurs éditions

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
                document.createElement("input");

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


            // =========================
            // SELECT PRIORITÉ
            // =========================

            const selectModification =
                document.createElement("select");

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


            // =========================
            // DATE MODIFICATION
            // =========================

            const dateModification =
                document.createElement("input");

            dateModification.type =
                "date";

            dateModification.value =
                tache.dateEcheance || "";

            dateModification.classList.add(
                "date-modification"
            );


            // =========================
            // INFORMATIONS
            // =========================

            informations.innerHTML = "";

            informations.appendChild(
                selectModification
            );

            informations.appendChild(
                dateModification
            );


            // =========================
            // BOUTON ENREGISTRER
            // =========================

            const boutonEnregistrer =
                document.createElement("button");

            boutonEnregistrer.textContent =
                "Enregistrer";

            boutonEnregistrer.classList.add(
                "enregistrer"
            );


            // =========================
            // BOUTON ANNULER
            // =========================

            const boutonAnnuler =
                document.createElement("button");

            boutonAnnuler.textContent =
                "Annuler";

            boutonAnnuler.classList.add(
                "annuler"
            );


            actions.innerHTML = "";

            actions.appendChild(
                boutonEnregistrer
            );

            actions.appendChild(
                boutonAnnuler
            );


            // Focus

            champModification.focus();

            champModification.select();


            // =========================
            // ANNULER
            // =========================

            boutonAnnuler.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();

                    afficherTaches();
                }
            );


            // =========================
            // ENREGISTRER
            // =========================

            boutonEnregistrer.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();


                    const nouveauTexte =
                        champModification.value.trim();


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


            // =========================
            // CLAVIER
            // =========================

            champModification.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key === "Enter"
                    ) {

                        boutonEnregistrer.click();
                    }


                    if (
                        event.key === "Escape"
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
        filtreActuel === "en-cours"
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
        filtreActuel === "terminees"
    ) {

        tachesFiltrees =
            tachesFiltrees.filter(
                function (tache) {

                    return tache.terminee;
                }
            );
    }


    listeTaches.innerHTML = "";


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


        // Récupérer les valeurs

        const niveauPriorite =
            priorite.value;

        const date =
            dateEcheance.value;


        // Créer la tâche

        const nouvelleTache =
            creerTache(
                texteTache,
                niveauPriorite,
                date
            );


        // Ajouter au tableau

        taches.push(
            nouvelleTache
        );


        // Sauvegarder

        sauvegarderTaches();


        // Réinitialiser le formulaire

        champTache.value = "";

        priorite.value =
            "moyenne";

        dateEcheance.value = "";


        // Actualiser

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