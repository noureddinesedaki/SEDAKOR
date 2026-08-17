document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("registerForm");
    const message = document.getElementById("registerMessage");
    const button = document.getElementById("registerButton");

    if (!form || !message || !button) {
        return;
    }

    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        message.textContent = "";
        message.className = "auth-message";

        const nom =
            document.getElementById("nom").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        button.disabled = true;
        button.textContent = "Création du compte...";

        try {

            const response = await fetch(
                "backend/register.php",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        nom: nom,
                        email: email,
                        password: password
                    })
                }
            );

            const data =
                await response.json();

            if (!response.ok) {

                message.textContent =
                    data.erreur ||
                    "Une erreur est survenue.";

                message.classList.add("error");

                return;
            }

            message.textContent =
                data.message ||
                "Compte créé avec succès.";

            message.classList.add("success");

            form.reset();

        }
        catch (error) {

            console.error(
                "Erreur inscription :",
                error
            );

            message.textContent =
                "Impossible de contacter le serveur.";

            message.classList.add("error");

        }
        finally {

            button.disabled = false;
            button.textContent =
                "Créer mon compte";

        }

    });

});