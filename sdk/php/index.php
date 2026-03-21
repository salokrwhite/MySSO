<?php
session_start();

$myssoBase = getenv('MYSSO_BASE') ?: 'http://localhost:8080';
$clientId = getenv('MYSSO_CLIENT_ID') ?: 'replace-with-client-id';
$clientSecret = getenv('MYSSO_CLIENT_SECRET') ?: 'replace-with-client-secret';
$redirectUri = getenv('MYSSO_REDIRECT_URI') ?: 'http://localhost:8088/callback.php';
$scope = getenv('MYSSO_SCOPE') ?: 'openid profile email';
$prompt = trim((string) (getenv('MYSSO_PROMPT') ?: ''));
$maxAge = trim((string) (getenv('MYSSO_MAX_AGE') ?: ''));

function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function random_string($length = 32) {
    return base64url_encode(random_bytes($length));
}

$state = random_string(18);
$nonce = random_string(18);
$verifier = random_string(48);
$challenge = base64url_encode(hash('sha256', $verifier, true));

$_SESSION['oidc_state'] = $state;
$_SESSION['oidc_nonce'] = $nonce;
$_SESSION['oidc_verifier'] = $verifier;

$query = [
    'client_id' => $clientId,
    'redirect_uri' => $redirectUri,
    'response_type' => 'code',
    'scope' => $scope,
    'state' => $state,
    'nonce' => $nonce,
    'code_challenge' => $challenge,
    'code_challenge_method' => 'S256',
];
if ($prompt !== '') {
    $query['prompt'] = $prompt;
}
if ($maxAge !== '') {
    $query['max_age'] = $maxAge;
}

header("Location: {$myssoBase}/oauth2/authorize?" . http_build_query($query));
exit;
