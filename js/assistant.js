// ============================================================
// SEDAKOR — V22.2
// CONTEXTE ASSISTANT IA
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

let contexteSedakor =
    null;


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

        message.innerHTML =
            `
            <div class="assistant-message-contenu">
                <p>${texte}</p>
            </div>
            `;

    }
    else {

        message.classList.add(
            "assistant-message-ia"
        );

        message.innerHTML =
            `
            <div class="assistant-avatar">
                🤖
            </div>

            <div class="assistant-message-contenu">

                <strong>
                    Assistant SEDAKOR
                </strong>

                <p>
                    ${texte}
                </p>

            </div>
            `;

    }


    assistantConversation.appendChild(
        message
    );


    assistantConversation.scrollTop =
        assistantConversation.scrollHeight;

}


// ============================================================
// RÉSUMÉ
// ============================================================

function afficherResumeAssistant() {

    if (
        !contexteSedakor
    ) {

        return;

    }


    const statistiques =
        contexteSedakor.statistiques;


    afficherMessageAssistant(

        `J'ai accès à vos données SEDAKOR. 
        Vous avez actuellement 
        <strong>${statistiques.total}</strong> tâches,
        dont <strong>${statistiques.enCours}</strong> en cours
        et <strong>${statistiques.terminees}</strong> terminées.
        ${
            statistiques.enRetard > 0
                ? `Vous avez également <strong>${statistiques.enRetard}</strong> tâche(s) en retard.`
                : "Aucune tâche en retard."
        }`

    );

}


// ============================================================
// ENVOYER UN MESSAGE
// ============================================================

assistantFormulaire.addEventListener(
    "submit",
    function (evenement) {

        evenement.preventDefault();


        const texte =
            assistantMessage.value.trim();


        if (!texte) {

            return;

        }


        afficherMessageAssistant(
            texte,
            "utilisateur"
        );


        assistantMessage.value =
            "";


        // ----------------------------------------------------
        // V22.2
        // L'IA réelle arrive en V22.3.
        // ----------------------------------------------------

        afficherMessageAssistant(

            "Je comprends votre demande. Mon accès aux données SEDAKOR est maintenant opérationnel. 🤖"

        );

    }
);


// ============================================================
// INITIALISATION
// ============================================================

chargerContexteAssistant();