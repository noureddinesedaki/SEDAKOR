document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("loginForm");
    const message = document.getElementById("loginMessage");
    const button = document.getElementById("loginButton");

    if (!form || !message || !button) {
        return;
    }

    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        message.textContent = "";
        message.className = "auth-message";

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        button.disabled = true;
        button.textContent = "Connexion...";

        try {

            const response = await fetch(
                "backend/login.php",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    credentials: "same-origin",

                    body: JSON.stringify({
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
    "Connexion réussie.";

message.classList.add("success");

setTimeout(() => {

    window.location.href = "index.html";

}, 500);

        }
        catch (error) {

            console.error(
                "Erreur connexion :",
                error
            );

            message.textContent =
                "Impossible de contacter le serveur.";

            message.classList.add("error");

        }
        finally {

            button.disabled = false;
            button.textContent =
                "Se connecter";

        }

    });

});