const API_PROJECTS = "backend/projects.php";

const listeProjets =
    document.querySelector("#liste-projets");

const projetsVide =
    document.querySelector("#projets-vide");

const boutonNouveauProjet =
    document.querySelector("#bouton-nouveau-projet");

const modalProjet =
    document.querySelector("#modal-projet");

const fermerModalProjet =
    document.querySelector("#fermer-modal-projet");

const annulerProjet =
    document.querySelector("#annuler-projet");

const formulaireProjet =
    document.querySelector("#formulaire-projet");

const projetNom =
    document.querySelector("#projet-nom");

const projetDescription =
    document.querySelector("#projet-description");

const projetCouleur =
    document.querySelector("#projet-couleur");

const selectProjetTache =
    document.querySelector("#projet-tache");

const sectionProjets =
    document.querySelector("#projets");

const sectionProjetDetail =
    document.querySelector("#projet-detail");

const boutonRetourProjets =
    document.querySelector("#bouton-retour-projets");

const projetDetailNom =
    document.querySelector("#projet-detail-nom");

const projetDetailDescription =
    document.querySelector("#projet-detail-description");

const projetDetailPourcentage =
    document.querySelector("#projet-detail-pourcentage");

const projetDetailBarre =
    document.querySelector("#projet-detail-barre-progression");

const projetDetailCompteur =
    document.querySelector("#projet-detail-compteur");

const projetDetailListeTaches =
    document.querySelector("#projet-detail-liste-taches");


// ============================================================
// OUVRIR / FERMER LE MODAL
// ============================================================

function ouvrirModalProjet() {

    modalProjet.hidden = false;

    projetNom.value = "";
    projetDescription.value = "";
    projetCouleur.value = "#6366f1";

    projetNom.focus();
}


function fermerModalProjetFonction() {

    modalProjet.hidden = true;

}


boutonNouveauProjet.addEventListener(
    "click",
    ouvrirModalProjet
);


fermerModalProjet.addEventListener(
    "click",
    fermerModalProjetFonction
);


annulerProjet.addEventListener(
    "click",
    fermerModalProjetFonction
);


modalProjet.addEventListener(
    "click",
    function (evenement) {

        if (
            evenement.target === modalProjet
        ) {

            fermerModalProjetFonction();

        }

    }
);


// ============================================================
// CHARGER LES PROJETS
// ============================================================

async function chargerProjets() {

    try {

        const reponse =
            await fetch(
                API_PROJECTS
            );


        if (!reponse.ok) {

            throw new Error(
                "Impossible de charger les projets."
            );

        }


        const donnees =
            await reponse.json();


        if (
            !donnees.succes
        ) {

            throw new Error(
                donnees.erreur ||
                "Impossible de charger les projets."
            );

        }


        afficherProjets(
            donnees.projets || []
        );

    }

    catch (erreur) {

        console.error(
            "Erreur chargement projets :",
            erreur
        );

    }

}


// ============================================================
// AFFICHER LES PROJETS
// ============================================================

function afficherProjets(
    projets
) {

    listeProjets.innerHTML = "";

    if (selectProjetTache) {

    selectProjetTache.innerHTML =
        `<option value="">📁 Aucun projet</option>`;

    projets.forEach(
        function (projet) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                projet.id;

            option.textContent =
                "📁 " + projet.nom;

            selectProjetTache.appendChild(
                option
            );

        }
    );

}


    if (
        projets.length === 0
    ) {

        projetsVide.hidden = false;

        return;

    }


    projetsVide.hidden = true;


    projets.forEach(
        function (projet) {

            const carte =
                document.createElement(
                    "article"
                );


            carte.classList.add(
                "projet-carte"
            );

            carte.addEventListener(
                "click",
                function () {

                ouvrirProjet(
                    projet
                );

    }
);


            carte.style.setProperty(
                "--projet-couleur",
                projet.couleur
            );


            const contenu =
                document.createElement(
                    "div"
                );


            contenu.classList.add(
                "projet-carte-contenu"
            );


            const titre =
                document.createElement(
                    "h3"
                );


            titre.textContent =
                projet.nom;


            const description =
                document.createElement(
                    "p"
                );


            description.textContent =
                projet.description ||
                "Aucune description.";


            const statistiques =
                document.createElement(
                    "div"
                );


            statistiques.classList.add(
                "projet-statistiques"
            );


            statistiques.innerHTML =

                `<span>
                    ${projet.nombre_taches} tâche${projet.nombre_taches > 1 ? "s" : ""}
                </span>

                <span>
                    ${projet.progression}% terminé
                </span>`;


            const progression =
                document.createElement(
                    "div"
                );


            progression.classList.add(
                "projet-progression"
            );


            const progressionBarre =
                document.createElement(
                    "div"
                );


            progressionBarre.classList.add(
                "projet-progression-barre"
            );


            progressionBarre.style.width =
                `${projet.progression}%`;


            progression.appendChild(
                progressionBarre
            );


            const actions =
                document.createElement(
                    "div"
                );


            actions.classList.add(
                "projet-actions"
            );


            const supprimer =
                document.createElement(
                    "button"
                );


            supprimer.type =
                "button";

            supprimer.textContent =
                "Supprimer";

            supprimer.classList.add(
                "projet-supprimer"
            );


            supprimer.addEventListener(
                "click",
            function (evenement) {

                evenement.stopPropagation();

                supprimerProjet(
                    projet.id
                );

    }
);


            actions.appendChild(
                supprimer
            );


            contenu.appendChild(
                titre
            );

            contenu.appendChild(
                description
            );

            contenu.appendChild(
                statistiques
            );

            contenu.appendChild(
                progression
            );

            contenu.appendChild(
                actions
            );


            carte.appendChild(
                contenu
            );


            listeProjets.appendChild(
                carte
            );

        }
    );

}

// ============================================================
// OUVRIR UN PROJET
// ============================================================

async function ouvrirProjet(projet) {

    if (!sectionProjets || !sectionProjetDetail) {
        return;
    }

    sectionProjets.hidden = true;
    sectionProjetDetail.hidden = false;

    projetDetailNom.textContent =
        projet.nom;

    projetDetailDescription.textContent =
        projet.description ||
        "Aucune description.";

    projetDetailPourcentage.textContent =
        `${projet.progression || 0}%`;

    projetDetailBarre.style.width =
        `${projet.progression || 0}%`;

    try {

        const reponse =
            await fetch(
                "backend/tasks.php"
            );

        if (!reponse.ok) {
            throw new Error(
                "Impossible de charger les tâches."
            );
        }

        const donnees =
            await reponse.json();

        const taches =
            Array.isArray(donnees)
                ? donnees
                : [];

        const tachesProjet =
            taches.filter(
                function (tache) {

                    return (
                        Number(
                            tache.project_id
                        ) ===
                        Number(
                            projet.id
                        )
                    );

                }
            );

        afficherTachesProjet(
            tachesProjet
        );

    }
    catch (erreur) {

        console.error(
            "Erreur ouverture projet :",
            erreur
        );

        projetDetailListeTaches.innerHTML =
            `
            <p class="projet-detail-erreur">
                Impossible de charger les tâches du projet.
            </p>
            `;

    }

}

// ============================================================
// AFFICHER LES TÂCHES D'UN PROJET
// ============================================================

function afficherTachesProjet(
    taches
) {

    projetDetailListeTaches.innerHTML = "";

    const nombreTaches =
        taches.length;

    projetDetailCompteur.textContent =
        `${nombreTaches} tâche${nombreTaches > 1 ? "s" : ""}`;

    if (nombreTaches === 0) {

        projetDetailListeTaches.innerHTML =
            `
            <div class="projet-detail-vide">

                <div>
                    📁
                </div>

                <h4>
                    Aucune tâche
                </h4>

                <p>
                    Aucune tâche n'est encore associée à ce projet.
                </p>

            </div>
            `;

        return;
    }

    taches.forEach(
        function (tache) {

            const element =
                document.createElement(
                    "div"
                );

            element.classList.add(
                "projet-detail-tache"
            );

            if (tache.terminee) {

                element.classList.add(
                    "terminee"
                );

            }

            const checkbox =
                document.createElement(
                    "input"
                );

            checkbox.type =
                "checkbox";

            checkbox.checked =
                Boolean(
                    tache.terminee
                );

            checkbox.addEventListener(
    "change",
    async function () {

        try {

            const reponse =
                await fetch(
                    "backend/tasks.php",
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type":
                                "application/json"
                        },
                        body:
                            JSON.stringify({
                                id:
                                    tache.id,

                                terminee:
                                    checkbox.checked
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
                    "Impossible de modifier la tâche."
                );

            }

            window.dispatchEvent(
    new CustomEvent(
        "sedakor:tache-modifiee"
    )
);

            await chargerProjets();

            const projetActualise =
                (
                    await (
                        await fetch(
                            API_PROJECTS
                        )
                    ).json()
                ).projets.find(
                    function (projet) {

                        return Number(
                            projet.id
                        ) === Number(
                            tache.project_id
                        );

                    }
                );

            if (projetActualise) {

                await ouvrirProjet(
                    projetActualise
                );

            }

        }
        catch (erreur) {

            console.error(
                "Erreur modification tâche projet :",
                erreur
            );

            checkbox.checked =
                !checkbox.checked;

            alert(
                "Impossible de modifier la tâche."
            );

        }

    }
);


            const informations =
                document.createElement(
                    "div"
                );

            informations.classList.add(
                "projet-detail-tache-informations"
            );


            const titre =
                document.createElement(
                    "strong"
                );

            titre.textContent =
                tache.titre ||
                tache.texte ||
                "Tâche sans titre";


            const meta =
                document.createElement(
                    "span"
                );

            meta.textContent =
                `${tache.priorite || "moyenne"} · ${tache.categorie || "autre"}`;


            informations.appendChild(
                titre
            );

            informations.appendChild(
                meta
            );


            element.appendChild(
                checkbox
            );

            element.appendChild(
                informations
            );


            projetDetailListeTaches.appendChild(
                element
            );

        }
    );

}

// ============================================================
// CRÉER UN PROJET
// ============================================================

formulaireProjet.addEventListener(
    "submit",
    async function (evenement) {

        evenement.preventDefault();


        const nom =
            projetNom.value.trim();

        const description =
            projetDescription.value.trim();

        const couleur =
            projetCouleur.value;


        if (!nom) {

            projetNom.focus();

            return;

        }


        try {

            const reponse =
                await fetch(
                    API_PROJECTS,
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify({

                                nom:
                                    nom,

                                description:
                                    description,

                                couleur:
                                    couleur

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
                    "Impossible de créer le projet."
                );

            }


            fermerModalProjetFonction();

            await chargerProjets();

        }

        catch (erreur) {

            console.error(
                "Erreur création projet :",
                erreur
            );


            alert(
                erreur.message
            );

        }

    }
);


// ============================================================
// SUPPRIMER UN PROJET
// ============================================================

async function supprimerProjet(
    projectId
) {

    if (
        !confirm(
            "Supprimer ce projet ? Les tâches associées seront conservées."
        )
    ) {

        return;

    }


    try {

        const reponse =
            await fetch(
                API_PROJECTS,
                {

                    method: "DELETE",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            id:
                                projectId

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
                "Impossible de supprimer le projet."
            );

        }


        await chargerProjets();


    }

    catch (erreur) {

        console.error(
            "Erreur suppression projet :",
            erreur
        );


        alert(
            erreur.message
        );

    }

}

// ============================================================
// RETOUR AUX PROJETS
// ============================================================

if (boutonRetourProjets) {

    boutonRetourProjets.addEventListener(
        "click",
        function () {

            sectionProjetDetail.hidden =
                true;

            sectionProjets.hidden =
                false;

        }
    );

}

// ============================================================
// SYNCHRONISATION AVEC LES TÂCHES
// ============================================================

window.addEventListener(
    "sedakor:tache-modifiee",
    function () {

        chargerProjets();

    }
);


// ============================================================
// INITIALISATION
// ============================================================

chargerProjets();
