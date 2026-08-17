document.addEventListener("DOMContentLoaded", async () => {

    try {

        const response = await fetch(
            "backend/session.php",
            {
                method: "GET",
                credentials: "same-origin",
                cache: "no-store"
            }
        );

        if (!response.ok) {

            window.location.replace(
                "connexion.html"
            );

            return;
        }

        const data =
            await response.json();

        if (
            !data.connecte ||
            !data.utilisateur ||
            !data.utilisateur.id
        ) {

            window.location.replace(
                "connexion.html"
            );

            return;
        }

        // Session valide :
        // SEDAKOR peut continuer normalement.

    }
    catch (error) {

        console.error(
            "Erreur de vérification de session :",
            error
        );

        window.location.replace(
            "connexion.html"
        );

    }

});