document.addEventListener("DOMContentLoaded", () => {

    const logoutButton =
        document.getElementById("logoutButton");

    if (!logoutButton) {
        return;
    }

    logoutButton.addEventListener("click", async () => {

        const confirmation =
            confirm("Voulez-vous vraiment vous déconnecter ?");

        if (!confirmation) {
            return;
        }

        logoutButton.disabled = true;
        logoutButton.textContent = "Déconnexion...";

        try {

            const response =
                await fetch(
                    "backend/logout.php",
                    {
                        method: "POST",
                        credentials: "same-origin"
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    data.erreur ||
                    "La déconnexion a échoué."
                );

            }

            window.location.href =
                "connexion.html";

        }
        catch (error) {

            console.error(
                "Erreur déconnexion :",
                error
            );

            alert(
                error.message ||
                "Impossible de vous déconnecter."
            );

            logoutButton.disabled = false;
            logoutButton.textContent =
                "Déconnexion";

        }

    });

});