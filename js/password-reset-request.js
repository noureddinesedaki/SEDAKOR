document.addEventListener(
    "DOMContentLoaded",
    () => {

        const form =
            document.getElementById(
                "resetRequestForm"
            );

        const message =
            document.getElementById(
                "resetRequestMessage"
            );

        const button =
            document.getElementById(
                "resetRequestButton"
            );

        if (
            !form ||
            !message ||
            !button
        ) {
            return;
        }

        form.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();

                message.textContent = "";
                message.className =
                    "auth-message";

                const email =
                    document
                        .getElementById("email")
                        .value
                        .trim();

                button.disabled = true;

                button.textContent =
                    "Traitement...";

                try {

                    const response =
                        await fetch(
                            "backend/password-reset-request.php",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify({
                                        email: email
                                    })
                            }
                        );

                    const data =
                        await response.json();

                    if (!response.ok) {

                        message.textContent =
                            data.erreur ||
                            "Une erreur est survenue.";

                        message.classList.add(
                            "error"
                        );

                        return;
                    }

                    message.textContent =
                        data.message ||
                        "Demande enregistrée.";

                    message.classList.add(
                        "success"
                    );

                    /*
                     * MODE TEST LOCAL
                     *
                     * Le backend fournit temporairement
                     * le lien dans lien_test.
                     */

                    if (data.lien_test) {

                        const lien =
                            document.createElement(
                                "a"
                            );

                        lien.href =
                            data.lien_test;

                        lien.textContent =
                            " Ouvrir le lien de réinitialisation";

                        lien.style.display =
                            "block";

                        lien.style.marginTop =
                            "12px";

                        message.appendChild(
                            lien
                        );
                    }

                }
                catch (error) {

                    console.error(
                        "Erreur réinitialisation :",
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
                        "Réinitialiser mon mot de passe";
                }

            }
        );

    }
);
