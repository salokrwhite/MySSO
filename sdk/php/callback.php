<?php
session_start();

$myssoBase = getenv('MYSSO_BASE') ?: 'http://localhost:8080';
$clientId = getenv('MYSSO_CLIENT_ID') ?: 'replace-with-client-id';
$clientSecret = getenv('MYSSO_CLIENT_SECRET') ?: 'replace-with-client-secret';
$redirectUri = getenv('MYSSO_REDIRECT_URI') ?: 'http://localhost:8088/callback.php';

if (!empty($_GET['error'])) {
    header('Content-Type: application/json');
    echo json_encode([
        'error' => $_GET['error'],
        'error_description' => $_GET['error_description'] ?? '',
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

$code = $_GET['code'] ?? '';
$state = $_GET['state'] ?? '';
if ($code === '' || $state === '' || $state !== ($_SESSION['oidc_state'] ?? '')) {
    http_response_code(400);
    echo 'invalid authorization response';
    exit;
}

$tokenBody = http_build_query([
    'grant_type' => 'authorization_code',
    'client_id' => $clientId,
    'client_secret' => $clientSecret,
    'code' => $code,
    'redirect_uri' => $redirectUri,
    'code_verifier' => $_SESSION['oidc_verifier'] ?? '',
]);

$tokenContext = stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/x-www-form-urlencoded\r\n",
        'content' => $tokenBody,
        'timeout' => 5,
    ]
]);

$tokenResponse = file_get_contents("{$myssoBase}/oauth2/token", false, $tokenContext);
$tokenPayload = json_decode($tokenResponse ?: '{}', true);

$userinfoContext = stream_context_create([
    'http' => [
        'method' => 'GET',
        'header' => "Authorization: Bearer " . ($tokenPayload['access_token'] ?? '') . "\r\n",
        'timeout' => 5,
    ]
]);

$userinfoResponse = file_get_contents("{$myssoBase}/oauth2/userinfo", false, $userinfoContext);
$userinfoPayload = json_decode($userinfoResponse ?: '{}', true);

header('Content-Type: application/json');
echo json_encode([
    'token' => $tokenPayload,
    'userinfo' => $userinfoPayload,
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
