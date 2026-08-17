const formulaire = document.querySelector("#formulaire-tache");
const champTache = document.querySelector("#tache");
const listeTaches = document.querySelector("#taches");
const recherche = document.querySelector("#recherche");
const boutonsFiltres = document.querySelectorAll("#filtres button");
const compteurTaches = document.querySelector("#compteur-taches");

let taches = [];
let filtreActuel = "toutes";


// =========================
// CHARGER LES TÂCHES
// =========================

const tachesSauvegardees = localStorage.getItem("taches");

if (tachesSauvegardees) {
    taches = JSON.parse(tachesSauvegardees);
}


// =========================
// CRÉER UNE TÂCHE
// =========================

function creerTache(texte) {

    return {
        id: Date.now(),
        texte: texte,
        terminee: false
    };

}


// =========================
// COMPTEUR
// =========================

function mettreAJourCompteur() {

    const nombreTotal = taches.length;

    const nombreTerminees = taches.filter(function (tache) {
        return tache.terminee;
    }).length;

    const nombreEnCours = nombreTotal - nombreTerminees;

    const texteTaches =
        nombreTotal <= 1 ? "tâche" : "tâches";

    const texteTerminees =
        nombreTerminees <= 1 ? "terminée" : "terminées";


    compteurTaches.textContent =
        nombreTotal + " " + texteTaches +
        " • " + nombreEnCours + " en cours" +
        " • " + nombreTerminees + " " + texteTerminees;

}


// =========================
// FILTRE ACTIF
// =========================

function mettreAJourFiltres() {

    boutonsFiltres.forEach(function (bouton) {

        bouton.classList.remove("actif");

        if (bouton.dataset.filtre === filtreActuel) {

            bouton.classList.add("actif");

        }

    });

}


// =========================
// AFFICHER UNE TÂCHE
// =========================

function afficherTache(tache) {

    const nouvelleTache = document.createElement("div");

    nouvelleTache.classList.add("tache");


    // =========================
    // TEXTE
    // =========================

    const texteElement = document.createElement("span");

    texteElement.textContent = tache.texte;

    nouvelleTache.appendChild(texteElement);


    // Si la tâche est terminée

    if (tache.terminee) {

        texteElement.classList.add("tache-terminee");

    }


    // =========================
    // CONTENEUR DES BOUTONS
    // =========================

    const actions = document.createElement("div");

    actions.classList.add("tache-actions");


    // =========================
    // BOUTON MODIFIER
    // =========================

    const boutonModifier = document.createElement("button");

    boutonModifier.textContent = "Modifier";

    boutonModifier.classList.add("modifier");


    // =========================
    // BOUTON SUPPRIMER
    // =========================

    const boutonSupprimer = document.createElement("button");

    boutonSupprimer.textContent = "Supprimer";

    boutonSupprimer.classList.add("supprimer");


    // Ajouter les boutons

    actions.appendChild(boutonModifier);
    actions.appendChild(boutonSupprimer);

    nouvelleTache.appendChild(actions);


    // =========================
    // TERMINER / RÉACTIVER
    // =========================

    nouvelleTache.addEventListener("click", function (event) {

        // Ne pas déclencher si on clique sur un bouton ou un input

        if (
            event.target.tagName === "BUTTON" ||
            event.target.tagName === "INPUT"
        ) {
            return;
        }


        tache.terminee = !tache.terminee;


        localStorage.setItem(
            "taches",
            JSON.stringify(taches)
        );


        afficherTaches();

    });


    // =========================
    // MODIFIER
    // =========================

    boutonModifier.addEventListener("click", function (event) {

        event.stopPropagation();


        // Éviter de lancer plusieurs éditions

        if (nouvelleTache.classList.contains("edition")) {
            return;
        }


        nouvelleTache.classList.add("edition");


        // Champ de modification

        const champModification =
            document.createElement("input");

        champModification.type = "text";

        champModification.value = tache.texte;

        champModification.classList.add(
            "champ-modification"
        );


        // Remplacer le texte par le champ

        nouvelleTache.replaceChild(
            champModification,
            texteElement
        );


        // Bouton Enregistrer

        const boutonEnregistrer =
            document.createElement("button");

        boutonEnregistrer.textContent =
            "Enregistrer";

        boutonEnregistrer.classList.add(
            "enregistrer"
        );


        // Bouton Annuler

        const boutonAnnuler =
            document.createElement("button");

        boutonAnnuler.textContent =
            "Annuler";

        boutonAnnuler.classList.add(
            "annuler"
        );


        // Vider les boutons actuels

        actions.innerHTML = "";


        // Ajouter les nouveaux boutons

        actions.appendChild(boutonEnregistrer);
        actions.appendChild(boutonAnnuler);


        // Focus automatique

        champModification.focus();


        // Sélectionner le texte

        champModification.select();


        // =========================
        // ANNULER
        // =========================

        boutonAnnuler.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();


                nouvelleTache.replaceChild(
                    texteElement,
                    champModification
                );


                actions.innerHTML = "";

                actions.appendChild(boutonModifier);
                actions.appendChild(boutonSupprimer);


                nouvelleTache.classList.remove(
                    "edition"
                );

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


                // Empêcher une tâche vide

                if (nouveauTexte === "") {

                    champModification.focus();

                    return;

                }


                // Modifier la tâche

                tache.texte = nouveauTexte;


                // Sauvegarder

                localStorage.setItem(
                    "taches",
                    JSON.stringify(taches)
                );


                // Actualiser l'affichage

                afficherTaches();

            }
        );


        // =========================
        // ENTRÉE CLAVIER
        // =========================

        champModification.addEventListener(
            "keydown",
            function (event) {

                // Entrée = enregistrer

                if (event.key === "Enter") {

                    boutonEnregistrer.click();

                }


                // Échap = annuler

                if (event.key === "Escape") {

                    boutonAnnuler.click();

                }

            }
        );

    });


    // =========================
    // SUPPRIMER
    // =========================

    boutonSupprimer.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();


            taches = taches.filter(
                function (tacheActuelle) {

                    return (
                        tacheActuelle.id !== tache.id
                    );

                }
            );


            localStorage.setItem(
                "taches",
                JSON.stringify(taches)
            );


            afficherTaches();

        }
    );


    // Ajouter la tâche à la liste

    listeTaches.appendChild(nouvelleTache);

}


// =========================
// AFFICHER LES TÂCHES
// =========================

function afficherTaches() {

    mettreAJourCompteur();


    const valeurRecherche =
        recherche.value.toLowerCase();


    // =========================
    // RECHERCHE
    // =========================

    let tachesFiltrees =
        taches.filter(function (tache) {

            return tache.texte
                .toLowerCase()
                .includes(valeurRecherche);

        });


    // =========================
    // FILTRE EN COURS
    // =========================

    if (filtreActuel === "en-cours") {

        tachesFiltrees =
            tachesFiltrees.filter(
                function (tache) {

                    return !tache.terminee;

                }
            );

    }


    // =========================
    // FILTRE TERMINÉES
    // =========================

    if (filtreActuel === "terminees") {

        tachesFiltrees =
            tachesFiltrees.filter(
                function (tache) {

                    return tache.terminee;

                }
            );

    }


    // =========================
    // EFFACER LA LISTE
    // =========================

    listeTaches.innerHTML = "";


    // =========================
    // AFFICHER LES TÂCHES
    // =========================

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


        // Empêcher une tâche vide

        if (texteTache === "") {

            champTache.focus();

            return;

        }


        // Créer la tâche

        const nouvelleTache =
            creerTache(texteTache);


        // Ajouter au tableau

        taches.push(nouvelleTache);


        // Sauvegarder

        localStorage.setItem(
            "taches",
            JSON.stringify(taches)
        );


        // Vider le champ

        champTache.value = "";


        // Revenir automatiquement en haut de la liste

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