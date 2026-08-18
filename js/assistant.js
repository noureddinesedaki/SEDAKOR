// ============================================================
// SEDAKOR — V22.3
// ASSISTANT IA — GEMINI
// ============================================================

const API_ASSISTANT =
    "backend/assistant.php";


// ============================================================
// ÉLÉMENTS
// ============================================================

const assistantConversation =
    document.querySelector(
        "#assistant-conversation"
    );

const assistantFormulaire =
    document.querySelector(
        "#assistant-formulaire"
    );

const assistantMessage =
    document.querySelector(
        "#assistant-message"
    );


// ============================================================
// CONTEXTE SEDAKOR
// ============================================================

let contexteSedakor = null;


// ============================================================
// CHARGER LE CONTEXTE
// ============================================================

async function chargerContexteAssistant() {

    try {

        const reponse =
            await fetch(
                API_ASSISTANT
            );


        const donnees =
            await reponse.json();


        if (
            !reponse.ok ||
            !donnees.succes
        ) {

            throw new Error(
                donnees.erreur ||
                "Impossible de récupérer le contexte SEDAKOR."
            );

        }


        contexteSedakor =
            donnees.contexte;


        console.log(
            "🤖 Contexte SEDAKOR chargé :",
            contexteSedakor
        );


        afficherResumeAssistant();

    }

    catch (erreur) {

        console.error(
            "Erreur contexte assistant :",
            erreur
        );

    }

}


// ============================================================
// CONVERTIR LE MARKDOWN GEMINI EN HTML SÉCURISÉ
// ============================================================

function markdownVersHtml(texte) {

    function echapperHtml(valeur) {

        return valeur
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    let lignes =
        texte
            .replace(/\r\n/g, "\n")
            .split("\n");


    let html = "";

    let dansListePuces = false;
    let dansListeNumerotee = false;


    function fermerListes() {

        if (dansListePuces) {

            html += "</ul>";

            dansListePuces = false;

        }


        if (dansListeNumerotee) {

            html += "</ol>";

            dansListeNumerotee = false;

        }

    }


    for (
        let i = 0;
        i < lignes.length;
        i++
    ) {

        let ligne =
            lignes[i].trim();


        // Ligne vide
        if (!ligne) {

            fermerListes();

            continue;

        }


        // Ligne horizontale
        if (
            /^---+$/.test(ligne) ||
            /^\*\*\*+$/.test(ligne)
        ) {

            fermerListes();

            html +=
                "<hr>";

            continue;

        }


        // Titre ###
        if (
            ligne.startsWith("### ")
        ) {

            fermerListes();

            const titre =
                echapperHtml(
                    ligne.substring(4)
                );

            html +=
                `<h4>${titre}</h4>`;

            continue;

        }


        // Titre ##
        if (
            ligne.startsWith("## ")
        ) {

            fermerListes();

            const titre =
                echapperHtml(
                    ligne.substring(3)
                );

            html +=
                `<h3>${titre}</h3>`;

            continue;

        }


        // Titre #
        if (
            ligne.startsWith("# ")
        ) {

            fermerListes();

            const titre =
                echapperHtml(
                    ligne.substring(2)
                );

            html +=
                `<h3>${titre}</h3>`;

            continue;

        }


        // Liste numérotée
        const listeNumerotee =
            ligne.match(
                /^(\d+)\.\s+(.*)$/
            );


        if (listeNumerotee) {

            if (!dansListeNumerotee) {

                if (dansListePuces) {

                    html += "</ul>";

                    dansListePuces =
                        false;

                }

                html += "<ol>";

                dansListeNumerotee =
                    true;

            }


            let contenu =
                echapperHtml(
                    listeNumerotee[2]
                );


            contenu =
                contenu.replace(
                    /\*\*(.*?)\*\*/g,
                    "<strong>$1</strong>"
                );


            html +=
                `<li>${contenu}</li>`;

            continue;

        }


        // Liste à puces
        const listePuce =
            ligne.match(
                /^[-*]\s+(.*)$/
            );


        if (listePuce) {

            if (!dansListePuces) {

                if (dansListeNumerotee) {

                    html += "</ol>";

                    dansListeNumerotee =
                        false;

                }

                html += "<ul>";

                dansListePuces =
                    true;

            }


            let contenu =
                echapperHtml(
                    listePuce[1]
                );


            contenu =
                contenu.replace(
                    /\*\*(.*?)\*\*/g,
                    "<strong>$1</strong>"
                );


            html +=
                `<li>${contenu}</li>`;

            continue;

        }


        // Paragraphe normal
        fermerListes();


        let contenu =
            echapperHtml(
                ligne
            );


        // Gras
        contenu =
            contenu.replace(
                /\*\*(.*?)\*\*/g,
                "<strong>$1</strong>"
            );


        // Italique simple
        contenu =
            contenu.replace(
                /(?<!\*)\*([^*]+)\*(?!\*)/g,
                "<em>$1</em>"
            );


        html +=
            `<p>${contenu}</p>`;

    }


    fermerListes();


    return html;

}


// ============================================================
// AFFICHER UN MESSAGE
// ============================================================

function afficherMessageAssistant(
    texte,
    type = "ia"
) {

    const message =
        document.createElement(
            "div"
        );


    message.classList.add(
        "assistant-message"
    );


    if (
        type === "utilisateur"
    ) {

        message.classList.add(
            "assistant-message-utilisateur"
        );


        const contenu =
            document.createElement(
                "div"
            );


        contenu.classList.add(
            "assistant-message-contenu"
        );


        const paragraphe =
            document.createElement(
                "p"
            );


        paragraphe.textContent =
            texte;


        contenu.appendChild(
            paragraphe
        );


        message.appendChild(
            contenu
        );

    }

    else {

        message.classList.add(
            "assistant-message-ia"
        );


        const avatar =
            document.createElement(
                "div"
            );


        avatar.classList.add(
            "assistant-avatar"
        );


        avatar.textContent =
            "🤖";


        const contenu =
            document.createElement(
                "div"
            );


        contenu.classList.add(
            "assistant-message-contenu"
        );


        const titre =
            document.createElement(
                "strong"
            );


        titre.textContent =
            "Assistant SEDAKOR";


        const corps =
            document.createElement(
                "div"
            );


        corps.classList.add(
            "assistant-message-texte"
        );


        corps.innerHTML =
            markdownVersHtml(
                texte
            );


        contenu.appendChild(
            titre
        );


        contenu.appendChild(
            corps
        );


        message.appendChild(
            avatar
        );


        message.appendChild(
            contenu
        );

    }


    assistantConversation.appendChild(
        message
    );


    assistantConversation.scrollTop =
        assistantConversation.scrollHeight;

}


// ============================================================
// RÉSUMÉ INITIAL
// ============================================================

function afficherResumeAssistant() {

    if (
        !contexteSedakor
    ) {

        return;

    }


    const statistiques =
        contexteSedakor.statistiques;


    let message =
        "J'ai accès à vos données SEDAKOR. " +
        "Vous avez actuellement " +
        statistiques.total +
        " tâches, dont " +
        statistiques.enCours +
        " en cours et " +
        statistiques.terminees +
        " terminées.";


    if (
        statistiques.enRetard > 0
    ) {

        message +=
            " Vous avez également " +
            statistiques.enRetard +
            " tâche(s) en retard.";

    }

    else {

        message +=
            " Aucune tâche en retard.";

    }


    afficherMessageAssistant(
        message
    );

}


// ============================================================
// AFFICHER L'INDICATEUR DE CHARGEMENT
// ============================================================

function afficherChargementAssistant() {

    const message =
        document.createElement(
            "div"
        );


    message.classList.add(
        "assistant-message",
        "assistant-message-ia",
        "assistant-message-chargement"
    );


    const avatar =
        document.createElement(
            "div"
        );


    avatar.classList.add(
        "assistant-avatar"
    );


    avatar.textContent =
        "🤖";


    const contenu =
        document.createElement(
            "div"
        );


    contenu.classList.add(
        "assistant-message-contenu"
    );


    const titre =
        document.createElement(
            "strong"
        );


    titre.textContent =
        "Assistant SEDAKOR";


    const paragraphe =
        document.createElement(
            "p"
        );


    paragraphe.textContent =
        "Réflexion en cours…";


    contenu.appendChild(
        titre
    );

    contenu.appendChild(
        paragraphe
    );


    message.appendChild(
        avatar
    );

    message.appendChild(
        contenu
    );


    assistantConversation.appendChild(
        message
    );


    assistantConversation.scrollTop =
        assistantConversation.scrollHeight;


    return message;

}


// ============================================================
// ENVOYER UN MESSAGE À GEMINI
// ============================================================

assistantFormulaire.addEventListener(
    "submit",
    async function (evenement) {

        evenement.preventDefault();


        const texte =
            assistantMessage.value.trim();


        if (
            !texte
        ) {

            return;

        }


        // ----------------------------------------------------
        // AFFICHER LE MESSAGE UTILISATEUR
        // ----------------------------------------------------

        afficherMessageAssistant(
            texte,
            "utilisateur"
        );


        assistantMessage.value =
            "";


        assistantMessage.disabled =
            true;


        const bouton =
            assistantFormulaire.querySelector(
                "button[type='submit']"
            );


        if (
            bouton
        ) {

            bouton.disabled =
                true;

        }


        // ----------------------------------------------------
        // CHARGEMENT
        // ----------------------------------------------------

        const chargement =
            afficherChargementAssistant();


        try {

            // ------------------------------------------------
            // APPEL DU BACKEND
            // ------------------------------------------------

            const reponse =
                await fetch(
                    API_ASSISTANT,
                    {
                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                message:
                                    texte
                            })
                    }
                );


            const donnees =
                await reponse.json();


            // ------------------------------------------------
            // SUPPRIMER LE CHARGEMENT
            // ------------------------------------------------

            if (
                chargement &&
                chargement.parentNode
            ) {

                chargement.parentNode.removeChild(
                    chargement
                );

            }


            // ------------------------------------------------
            // ERREUR
            // ------------------------------------------------

            if (
                !reponse.ok ||
                !donnees.succes
            ) {

                throw new Error(
                    donnees.erreur ||
                    "Impossible d'obtenir une réponse de l'assistant."
                );

            }


            // ------------------------------------------------
            // AFFICHER LA RÉPONSE GEMINI
            // ------------------------------------------------

            afficherMessageAssistant(
                donnees.reponse ||
                "Je n'ai pas reçu de réponse."
            );

        }

        catch (erreur) {

            console.error(
                "Erreur Assistant SEDAKOR :",
                erreur
            );


            if (
                chargement &&
                chargement.parentNode
            ) {

                chargement.parentNode.removeChild(
                    chargement
                );

            }


            afficherMessageAssistant(
                "Désolé, je n'ai pas pu traiter votre demande. " +
                erreur.message
            );

        }

        finally {

            assistantMessage.disabled =
                false;


            if (
                bouton
            ) {

                bouton.disabled =
                    false;

            }


            assistantMessage.focus();

        }

    }
);


// ============================================================
// INITIALISATION
// ============================================================

chargerContexteAssistant();