<?php

session_start();

header("Content-Type: application/json; charset=UTF-8");


// ============================================================
// VÉRIFIER LA SESSION UTILISATEUR
// ============================================================

if (
    !isset($_SESSION["user_id"]) ||
    !is_numeric($_SESSION["user_id"]) ||
    (int)$_SESSION["user_id"] <= 0
) {

    http_response_code(401);

    echo json_encode([
        "connecte" => false
    ], JSON_UNESCAPED_UNICODE);

    exit;
}


// ============================================================
// UTILISATEUR CONNECTÉ
// ============================================================

echo json_encode([

    "connecte" => true,

    "utilisateur" => [

        "id" =>
            (int)
            $_SESSION["user_id"],

        "nom" =>
            $_SESSION["user_nom"] ?? "",

        "email" =>
            $_SESSION["user_email"] ?? ""

    ]

], JSON_UNESCAPED_UNICODE);

exit;