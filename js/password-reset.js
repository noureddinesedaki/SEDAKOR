document.addEventListener(
    "DOMContentLoaded",
    () => {

        const form =
            document.getElementById(
                "resetPasswordForm"
            );

        const message =
            document.getElementById(
                "resetPasswordMessage"
            );

        const button =
            document.getElementById(
                "resetPasswordButton"
            );

        if (
            !form ||
            !message ||
            !button
        ) {
            return;
        }

        const params =
            new URLSearchParams(
                window.location.search
            );

        const token =
            params.get("token");

        if (!token) {

            message.textContent =
                "Lien de réinitialisation invalide.";

            message.classList.add(
                "error"
            );

            button.disabled = true;

            return;
        }

        form.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();

                message.textContent = "";
                message.className =
                    "auth-message";

                const password =
                    document
                        .getElementById("password")
                        .value;

                const confirmation =
                    document
                        .getElementById("confirmation")
                        .value;

                if (password.length < 8) {

                    message.textContent =
                        "Le mot de passe doit contenir au moins 8 caractères.";

                    message.classList.add(
                        "error"
                    );

                    return;
                }

                if (
                    password !==
                    confirmation
                ) {

                    message.textContent =
                        "Les mots de passe ne correspondent pas.";

                    message.classList.add(
                        "error"
                    );

                    return;
                }

                button.disabled = true;

                button.textContent =
                    "Enregistrement...";

                try {

                    const response =
                        await fetch(
                            "backend/password-reset.php",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify({
                                        token:
                                            token,

                                        nouveau_mot_de_passe:
                                            password,

                                        confirmation:
                                            confirmation
                                    })
                            }
                        );

                    const data =
                        await response.json();

                    if (!response.ok) {

                        message.textContent =
                            data.erreur ||
                            "Impossible de réinitialiser le mot de passe.";

                        message.classList.add(
                            "error"
                        );

                        return;
                    }

                    message.textContent =
                        data.message ||
                        "Mot de passe réinitialisé.";

                    message.classList.add(
                        "success"
                    );

                    form.reset();

                    setTimeout(
                        () => {
                            window.location.href =
                                "connexion.html";
                        },
                        1500
                    );

                }
                catch (error) {

                    console.error(
                        "Erreur réinitialisation mot de passe :",
                        error
                    );

                    message.textContent =
                        "Impossible de contacter le serveur.";

                    message.classList.add(
                        "error"
                    );

                }
                finally {

                    button.disabled = false;

                    button.textContent =
                        "Enregistrer le nouveau mot de passe";
                }

            }
        );

    }
);
