<?php

require_once __DIR__ . "/session-config.php";

header("Content-Type: application/json; charset=UTF-8");


// ============================================================
// AUTORISER UNIQUEMENT POST
// ============================================================

if (
    $_SERVER["REQUEST_METHOD"] !== "POST"
) {

    http_response_code(405);

    echo json_encode([
        "erreur" =>
            "Méthode HTTP non autorisée."
    ], JSON_UNESCAPED_UNICODE);

    exit;

}


// ============================================================
// DÉTRUIRE LA SESSION
// ============================================================

$_SESSION = [];


// Supprimer le cookie de session
if (
    ini_get("session.use_cookies")
) {

    $parametres =
        session_get_cookie_params();

    setcookie(
        session_name(),
        "",
        time() - 42000,
        $parametres["path"],
        $parametres["domain"],
        $parametres["secure"],
        $parametres["httponly"]
    );

}


// Détruire définitivement la session
session_destroy();


// ============================================================
// RÉPONSE
// ============================================================

http_response_code(200);

echo json_encode([

    "succes" =>
        true,

    "message" =>
        "Déconnexion réussie."

], JSON_UNESCAPED_UNICODE);

exit;