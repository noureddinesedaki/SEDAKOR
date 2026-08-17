const formulaire = document.querySelector("#formulaire-tache");
const champTache = document.querySelector("#tache");
const listeTaches = document.querySelector("#taches");
const recherche = document.querySelector("#recherche");
const boutonsFiltres = document.querySelectorAll("#filtres button");
const compteurTaches = document.querySelector("#compteur-taches");

let taches = [];
let filtreActuel = "toutes";

const tachesSauvegardees = localStorage.getItem("taches");

if (tachesSauvegardees) {
    taches = JSON.parse(tachesSauvegardees);
}


// Créer une nouvelle tâche
function creerTache(texte) {
    return {
        id: Date.now(),
        texte: texte,
        terminee: false
    };
}


// Mettre à jour le compteur
function mettreAJourCompteur() {

    const nombreTotal = taches.length;

    const nombreTerminees = taches.filter(function (tache) {
        return tache.terminee;
    }).length;

    const nombreEnCours = nombreTotal - nombreTerminees;

    const texteTaches = nombreTotal <= 1 ? "tâche" : "tâches";
    const texteTerminees = nombreTerminees <= 1 ? "terminée" : "terminées";

    compteurTaches.textContent =
        nombreTotal + " " + texteTaches +
        " • " + nombreEnCours + " en cours" +
        " • " + nombreTerminees + " " + texteTerminees;
}


// Mettre à jour le bouton de filtre actif
function mettreAJourFiltres() {

    boutonsFiltres.forEach(function (bouton) {

        bouton.classList.remove("actif");

        if (bouton.dataset.filtre === filtreActuel) {
            bouton.classList.add("actif");
        }

    });
}


// Afficher une tâche
function afficherTache(tache) {

    const nouvelleTache = document.createElement("div");
    nouvelleTache.classList.add("tache");


    // Texte de la tâche
    const texteElement = document.createElement("span");
    texteElement.textContent = tache.texte;

    nouvelleTache.appendChild(texteElement);


    // Marquer la tâche comme terminée
    nouvelleTache.addEventListener("click", function () {

        tache.terminee = !tache.terminee;

        localStorage.setItem(
            "taches",
            JSON.stringify(taches)
        );

        afficherTaches();
    });


    // Bouton Modifier
    const boutonModifier = document.createElement("button");

    boutonModifier.textContent = "Modifier";
    boutonModifier.classList.add("modifier");


    boutonModifier.addEventListener("click", function (event) {

        event.stopPropagation();

        // Créer le champ de modification
        const champModification = document.createElement("input");

        champModification.type = "text";
        champModification.value = tache.texte;
        champModification.classList.add("champ-modification");

        // Remplacer le texte par le champ
        nouvelleTache.replaceChild(
            champModification,
            texteElement
        );

        champModification.focus();


        // Créer le bouton Enregistrer
        const boutonEnregistrer = document.createElement("button");

        boutonEnregistrer.textContent = "Enregistrer";
        boutonEnregistrer.classList.add("enregistrer");


        // Créer le bouton Annuler
        const boutonAnnuler = document.createElement("button");

        boutonAnnuler.textContent = "Annuler";
        boutonAnnuler.classList.add("annuler");


        // Annuler la modification
        boutonAnnuler.addEventListener("click", function (event) {

            event.stopPropagation();

            nouvelleTache.replaceChild(
                texteElement,
                champModification
            );

            boutonEnregistrer.remove();
            boutonAnnuler.remove();
        });


        // Enregistrer la modification
        boutonEnregistrer.addEventListener("click", function (event) {

            event.stopPropagation();

            const nouveauTexte = champModification.value.trim();

            // Empêcher un texte vide
            if (nouveauTexte === "") {
                return;
            }

            // Modifier la tâche
            tache.texte = nouveauTexte;

            // Sauvegarder
            localStorage.setItem(
                "taches",
                JSON.stringify(taches)
            );

            // Mettre à jour le texte affiché
            texteElement.textContent = nouveauTexte;

            // Remplacer le champ par le texte
            nouvelleTache.replaceChild(
                texteElement,
                champModification
            );

            // Supprimer les boutons d'édition
            boutonEnregistrer.remove();
            boutonAnnuler.remove();
        });


        // Ajouter les boutons d'édition
        nouvelleTache.appendChild(boutonEnregistrer);
        nouvelleTache.appendChild(boutonAnnuler);

    });


    // Bouton Supprimer
    const boutonSupprimer = document.createElement("button");

    boutonSupprimer.textContent = "Supprimer";
    boutonSupprimer.classList.add("supprimer");


    boutonSupprimer.addEventListener("click", function (event) {

        event.stopPropagation();

        taches = taches.filter(function (tacheActuelle) {

            return tacheActuelle.id !== tache.id;

        });

        localStorage.setItem(
            "taches",
            JSON.stringify(taches)
        );

        afficherTaches();
    });


    // Ajouter les boutons à la tâche
    nouvelleTache.appendChild(boutonModifier);
    nouvelleTache.appendChild(boutonSupprimer);

    listeTaches.appendChild(nouvelleTache);


    // Si la tâche était déjà terminée
    if (tache.terminee) {
        texteElement.classList.add("tache-terminee");
    }
}


// Afficher les tâches selon la recherche et le filtre
function afficherTaches() {

    mettreAJourCompteur();

    const valeurRecherche = recherche.value.toLowerCase();


    // Recherche
    let tachesFiltrees = taches.filter(function (tache) {

        return tache.texte
            .toLowerCase()
            .includes(valeurRecherche);

    });


    // Filtre "En cours"
    if (filtreActuel === "en-cours") {

        tachesFiltrees = tachesFiltrees.filter(function (tache) {

            return !tache.terminee;

        });
    }


    // Filtre "Terminées"
    if (filtreActuel === "terminees") {

        tachesFiltrees = tachesFiltrees.filter(function (tache) {

            return tache.terminee;

        });
    }


    // Effacer l'affichage actuel
    listeTaches.innerHTML = "";


    // Afficher les tâches filtrées
    tachesFiltrees.forEach(function (tache) {

        afficherTache(tache);

    });
}


// Afficher les tâches sauvegardées au chargement
afficherTaches();
mettreAJourFiltres();


// Ajouter une nouvelle tâche
formulaire.addEventListener("submit", function (event) {

    event.preventDefault();

    const texteTache = champTache.value.trim();


    // Empêcher une tâche vide
    if (texteTache === "") {
        return;
    }


    // Créer la tâche
    const nouvelleTache = creerTache(texteTache);


    // Ajouter la tâche au tableau
    taches.push(nouvelleTache);


    // Sauvegarder
    localStorage.setItem(
        "taches",
        JSON.stringify(taches)
    );


    // Vider le champ
    champTache.value = "";


    // Actualiser l'affichage
    afficherTaches();
});


// Rechercher une tâche
recherche.addEventListener("input", function () {

    afficherTaches();

});


// Gérer les boutons de filtre
boutonsFiltres.forEach(function (bouton) {

    bouton.addEventListener("click", function () {

        filtreActuel = bouton.dataset.filtre;

        mettreAJourFiltres();

        afficherTaches();

    });

});