document.addEventListener("DOMContentLoaded", async () => {

    // ============================================================
    // ÉLÉMENTS — MENU UTILISATEUR
    // ============================================================

    const userMenuButton =
        document.getElementById("userMenuButton");

    const userMenuDropdown =
        document.getElementById("userMenuDropdown");

    const userMenuNom =
        document.getElementById("userMenuNom");


    // ============================================================
    // ÉLÉMENTS — COMPTE
    // ============================================================

    const compteNom =
        document.getElementById("compte-nom");

    const compteEmail =
        document.getElementById("compte-email");

    const compteMessage =
        document.getElementById("compte-message");


    // ============================================================
    // ÉLÉMENTS — PROFIL
    // ============================================================

    const modifierProfilButton =
        document.getElementById(
            "modifierProfilButton"
        );

    const formulaireProfil =
        document.getElementById(
            "formulaire-profil"
        );

    const profilNom =
        document.getElementById(
            "profil-nom"
        );

    const profilEmail =
        document.getElementById(
            "profil-email"
        );

    const enregistrerProfilButton =
        document.getElementById(
            "enregistrerProfilButton"
        );

    const annulerProfilButton =
        document.getElementById(
            "annulerProfilButton"
        );


    // ============================================================
    // ÉLÉMENTS — MOT DE PASSE
    // ============================================================

    const modifierMotDePasseButton =
        document.getElementById(
            "modifierMotDePasseButton"
        );

    const formulaireMotDePasse =
        document.getElementById(
            "formulaire-mot-de-passe"
        );

    const ancienMotDePasse =
        document.getElementById(
            "ancien-mot-de-passe"
        );

    const nouveauMotDePasse =
        document.getElementById(
            "nouveau-mot-de-passe"
        );

    const confirmationMotDePasse =
        document.getElementById(
            "confirmation-mot-de-passe"
        );

    const enregistrerMotDePasseButton =
        document.getElementById(
            "enregistrerMotDePasseButton"
        );

    const annulerMotDePasseButton =
        document.getElementById(
            "annulerMotDePasseButton"
        );


    // ============================================================
    // UTILISATEUR ACTUEL
    // ============================================================

    let utilisateurActuel = null;


    // ============================================================
    // MESSAGE
    // ============================================================

    function afficherMessage(
        message,
        succes = true
    ) {

        if (!compteMessage) {
            return;
        }


        compteMessage.textContent =
            message;


        compteMessage.style.display =
            "block";


        compteMessage.style.backgroundColor =
            succes
                ? "#dcfce7"
                : "#fee2e2";


        compteMessage.style.color =
            succes
                ? "#166534"
                : "#991b1b";

    }


    function cacherMessage() {

        if (!compteMessage) {
            return;
        }


        compteMessage.textContent = "";

        compteMessage.style.display =
            "none";

    }


    // ============================================================
    // AFFICHER L'UTILISATEUR
    // ============================================================

    function afficherUtilisateur(
        utilisateur
    ) {

        utilisateurActuel =
            utilisateur;


        if (userMenuNom) {

            userMenuNom.textContent =
                utilisateur.nom;

        }


        if (compteNom) {

            compteNom.textContent =
                utilisateur.nom;

        }


        if (compteEmail) {

            compteEmail.textContent =
                utilisateur.email;

        }

    }


    // ============================================================
    // MENU UTILISATEUR
    // ============================================================

    if (
        userMenuButton &&
        userMenuDropdown
    ) {

        userMenuButton.addEventListener(
            "click",
            () => {

                const ouvert =
                    userMenuButton.getAttribute(
                        "aria-expanded"
                    ) === "true";


                userMenuButton.setAttribute(
                    "aria-expanded",
                    String(!ouvert)
                );


                userMenuDropdown.hidden =
                    ouvert;

            }
        );


        document.addEventListener(
            "click",
            (event) => {

                if (
                    !event.target.closest(
                        ".utilisateur-menu"
                    )
                ) {

                    userMenuButton.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                    userMenuDropdown.hidden =
                        true;

                }

            }
        );

    }


    // ============================================================
    // RÉCUPÉRER LA SESSION
    // ============================================================

    try {

        const response =
            await fetch(
                "/TaskFlow/backend/session.php",
                {
                    method: "GET",
                    credentials: "same-origin",
                    cache: "no-store"
                }
            );


        console.log(
            "Session HTTP :",
            response.status
        );


        const data =
            await response.json();


        console.log(
            "Données session :",
            data
        );


        if (
            !response.ok ||
            !data.connecte ||
            !data.utilisateur
        ) {

            return;

        }


        afficherUtilisateur(
            data.utilisateur
        );


        // ========================================================
        // REMPLIR LE FORMULAIRE PROFIL
        // ========================================================

        if (profilNom) {

            profilNom.value =
                data.utilisateur.nom;

        }


        if (profilEmail) {

            profilEmail.value =
                data.utilisateur.email;

        }

    }
    catch (error) {

        console.error(
            "Erreur chargement du compte :",
            error
        );


        afficherMessage(
            "Impossible de charger votre compte.",
            false
        );

    }


    // ============================================================
    // V9.6 — OUVRIR MODIFICATION PROFIL
    // ============================================================

    if (
        modifierProfilButton &&
        formulaireProfil
    ) {

        modifierProfilButton.addEventListener(
            "click",
            () => {

                cacherMessage();

                formulaireProfil.hidden =
                    false;

                modifierProfilButton.hidden =
                    true;


                // On masque l'autre formulaire
                if (formulaireMotDePasse) {

                    formulaireMotDePasse.hidden =
                        true;

                }

                if (modifierMotDePasseButton) {

                    modifierMotDePasseButton.hidden =
                        false;

                }


                if (profilNom) {

                    profilNom.focus();

                }

            }
        );

    }


    // ============================================================
    // V9.6 — ANNULER MODIFICATION PROFIL
    // ============================================================

    if (
        annulerProfilButton &&
        formulaireProfil
    ) {

        annulerProfilButton.addEventListener(
            "click",
            () => {

                if (utilisateurActuel) {

                    profilNom.value =
                        utilisateurActuel.nom;

                    profilEmail.value =
                        utilisateurActuel.email;

                }


                formulaireProfil.hidden =
                    true;

                modifierProfilButton.hidden =
                    false;

                cacherMessage();

            }
        );

    }


    // ============================================================
    // V9.6 — ENREGISTRER MODIFICATION PROFIL
    // ============================================================

    if (formulaireProfil) {

        formulaireProfil.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();

                cacherMessage();


                const nom =
                    profilNom.value.trim();

                const email =
                    profilEmail.value.trim();


                if (!nom || !email) {

                    afficherMessage(
                        "Le nom et l'email sont obligatoires.",
                        false
                    );

                    return;

                }


                enregistrerProfilButton.disabled =
                    true;

                enregistrerProfilButton.textContent =
                    "Enregistrement...";


                try {

                    const response =
                        await fetch(
                            "/TaskFlow/backend/account.php",
                            {
                                method: "PUT",

                                credentials:
                                    "same-origin",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify({
                                        nom: nom,
                                        email: email
                                    })
                            }
                        );


                    const data =
                        await response.json();


                    if (!response.ok) {

                        throw new Error(
                            data.erreur ||
                            "Impossible de modifier le profil."
                        );

                    }


                    afficherUtilisateur(
                        data.utilisateur
                    );


                    formulaireProfil.hidden =
                        true;

                    modifierProfilButton.hidden =
                        false;


                    afficherMessage(
                        data.message ||
                        "Profil modifié avec succès.",
                        true
                    );

                }
                catch (error) {

                    console.error(
                        "Erreur modification profil :",
                        error
                    );


                    afficherMessage(
                        error.message ||
                        "Impossible de modifier le profil.",
                        false
                    );

                }
                finally {

                    enregistrerProfilButton.disabled =
                        false;

                    enregistrerProfilButton.textContent =
                        "Enregistrer les modifications";

                }

            }
        );

    }


    // ============================================================
    // V9.7 — OUVRIR MOT DE PASSE
    // ============================================================

    if (
        modifierMotDePasseButton &&
        formulaireMotDePasse
    ) {

        modifierMotDePasseButton.addEventListener(
            "click",
            () => {

                cacherMessage();

                formulaireMotDePasse.hidden =
                    false;

                modifierMotDePasseButton.hidden =
                    true;


                // On masque l'autre formulaire
                if (formulaireProfil) {

                    formulaireProfil.hidden =
                        true;

                }

                if (modifierProfilButton) {

                    modifierProfilButton.hidden =
                        false;

                }


                if (ancienMotDePasse) {

                    ancienMotDePasse.focus();

                }

            }
        );

    }


    // ============================================================
    // V9.7 — ANNULER MOT DE PASSE
    // ============================================================

    if (
        annulerMotDePasseButton &&
        formulaireMotDePasse
    ) {

        annulerMotDePasseButton.addEventListener(
            "click",
            () => {

                formulaireMotDePasse.reset();

                formulaireMotDePasse.hidden =
                    true;

                modifierMotDePasseButton.hidden =
                    false;

                cacherMessage();

            }
        );

    }


    // ============================================================
    // V9.7 — ENREGISTRER MOT DE PASSE
    // ============================================================

    if (formulaireMotDePasse) {

        formulaireMotDePasse.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();

                cacherMessage();


                const ancien =
                    ancienMotDePasse.value;

                const nouveau =
                    nouveauMotDePasse.value;

                const confirmation =
                    confirmationMotDePasse.value;


                // ------------------------------------------------
                // VALIDATION
                // ------------------------------------------------

                if (
                    !ancien ||
                    !nouveau ||
                    !confirmation
                ) {

                    afficherMessage(
                        "Tous les champs sont obligatoires.",
                        false
                    );

                    return;

                }


                if (
                    nouveau.length < 8
                ) {

                    afficherMessage(
                        "Le nouveau mot de passe doit contenir au moins 8 caractères.",
                        false
                    );

                    return;

                }


                if (
                    nouveau !== confirmation
                ) {

                    afficherMessage(
                        "Les nouveaux mots de passe ne correspondent pas.",
                        false
                    );

                    return;

                }


                // ------------------------------------------------
                // BOUTON
                // ------------------------------------------------

                enregistrerMotDePasseButton.disabled =
                    true;

                enregistrerMotDePasseButton.textContent =
                    "Modification...";


                try {

                    const response =
                        await fetch(
                            "/TaskFlow/backend/password.php",
                            {
                                method: "PUT",

                                credentials:
                                    "same-origin",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify({

                                        ancien_mot_de_passe:
                                            ancien,

                                        nouveau_mot_de_passe:
                                            nouveau,

                                        confirmation:
                                            confirmation

                                    })
                            }
                        );


                    const data =
                        await response.json();


                    if (!response.ok) {

                        throw new Error(
                            data.erreur ||
                            "Impossible de modifier le mot de passe."
                        );

                    }


                    // ------------------------------------------------
                    // SUCCÈS
                    // ------------------------------------------------

                    formulaireMotDePasse.reset();

                    formulaireMotDePasse.hidden =
                        true;

                    modifierMotDePasseButton.hidden =
                        false;


                    afficherMessage(
                        data.message ||
                        "Mot de passe modifié avec succès.",
                        true
                    );

                }
                catch (error) {

                    console.error(
                        "Erreur changement mot de passe :",
                        error
                    );


                    afficherMessage(
                        error.message ||
                        "Impossible de modifier le mot de passe.",
                        false
                    );

                }
                finally {

                    enregistrerMotDePasseButton.disabled =
                        false;

                    enregistrerMotDePasseButton.textContent =
                        "Modifier le mot de passe";

                }

            }
        );

    }

});