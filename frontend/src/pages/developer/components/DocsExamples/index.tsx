import { Card, Space, Typography } from "antd";
import { API_BASE } from "../../../../api/client";
import { useDeveloperTranslation } from "../../i18n";
import { CodePanel } from "../common/CodePanel";

export function DeveloperDocsExamples() {
  const { t } = useDeveloperTranslation();

  return (
    <Space direction="vertical" size={20} style={{ width: "100%" }}>
      <Card title={t("docsExamples.navTitle")}>
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            {t("docsExamples.navDesc")}
          </Typography.Paragraph>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            {t("docsExamples.navHint")}
          </Typography.Paragraph>
        </Space>
      </Card>
    </Space>
  );
}

function ExamplePage({
  title,
  description,
  authorizeCode,
  callbackErrorCode,
  tokenCode,
  verifyIdTokenCode,
  userInfoCode,
  refreshCode,
  introspectCode,
  revokeCode,
  logoutCode,
  notes,
  language,
}: {
  title: string;
  description: string;
  authorizeCode: string;
  callbackErrorCode: string;
  tokenCode: string;
  verifyIdTokenCode: string;
  userInfoCode: string;
  refreshCode: string;
  introspectCode: string;
  revokeCode: string;
  logoutCode: string;
  notes: string[];
  language: string;
}) {
  const { t } = useDeveloperTranslation();

  return (
    <Space direction="vertical" size={20} style={{ width: "100%" }}>
      <Card title={title}>
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            {description}
          </Typography.Paragraph>
          <CodePanel
            title={t("docsExamples.authorizeTitle")}
            language={language}
            code={authorizeCode}
          />
          <CodePanel
            title={t("docsExamples.callbackErrorTitle")}
            language={language}
            code={callbackErrorCode}
          />
          <CodePanel
            title={t("docsExamples.tokenTitle")}
            language={language}
            code={tokenCode}
          />
          <CodePanel
            title={t("docsExamples.verifyIdTokenTitle")}
            language={language}
            code={verifyIdTokenCode}
          />
          <CodePanel
            title={t("docsExamples.userinfoTitle")}
            language={language}
            code={userInfoCode}
          />
          <CodePanel
            title={t("docsExamples.refreshTitle")}
            language={language}
            code={refreshCode}
          />
          <CodePanel
            title={t("docsExamples.introspectTitle")}
            language={language}
            code={introspectCode}
          />
          <CodePanel
            title={t("docsExamples.revokeTitle")}
            language={language}
            code={revokeCode}
          />
          <CodePanel
            title={t("docsExamples.logoutTitle")}
            language={language}
            code={logoutCode}
          />
          <Card size="small" title={t("docsExamples.notesTitle")}>
            <Space direction="vertical" size={8} style={{ width: "100%" }}>
              {notes.map((item) => (
                <Typography.Paragraph key={item} style={{ marginBottom: 0 }}>
                  {item}
                </Typography.Paragraph>
              ))}
            </Space>
          </Card>
        </Space>
      </Card>
    </Space>
  );
}

export function DeveloperDocsExamplesGo() {
  const { t } = useDeveloperTranslation();
  const issuer = API_BASE.replace(/\/api$/, "");
  const authorizeCode = `package main

import (
  "fmt"
  "net/url"
)

func main() {
  params := url.Values{}
  params.Set("client_id", "your-client-id")
  params.Set("redirect_uri", "https://client.example.com/callback")
  params.Set("response_type", "code")
  params.Set("scope", "openid profile email")
  params.Set("state", "your-random-state")
  params.Set("nonce", "your-random-nonce")
  params.Set("code_challenge", "your-code-challenge")
  params.Set("code_challenge_method", "S256")

  fmt.Println("${issuer}/oauth2/authorize?" + params.Encode())
}`;
  const callbackErrorCode = `package main

import (
  "fmt"
  "net/http"
)

func handleCallback(w http.ResponseWriter, r *http.Request) {
  if errCode := r.URL.Query().Get("error"); errCode != "" {
    errDesc := r.URL.Query().Get("error_description")
    state := r.URL.Query().Get("state")
    fmt.Printf("oidc callback rejected: error=%s description=%s state=%s\\n", errCode, errDesc, state)

    // access_denied may mean the user canceled consent, lost group access,
    // or is banned from the current app.
    http.Error(w, "current account cannot complete authorization", http.StatusForbidden)
    return
  }

  code := r.URL.Query().Get("code")
  _ = code
}`;
  const tokenCode = `package main

import (
  "bytes"
  "encoding/json"
  "fmt"
  "io"
  "net/http"
  "net/url"
)

func exchangeCode(code string, verifier string) (map[string]any, error) {
  form := url.Values{}
  form.Set("grant_type", "authorization_code")
  form.Set("client_id", "your-client-id")
  form.Set("client_secret", "your-client-secret")
  form.Set("code", code)
  form.Set("redirect_uri", "https://client.example.com/callback")
  form.Set("code_verifier", verifier)

  resp, err := http.Post("${issuer}/oauth2/token", "application/x-www-form-urlencoded", bytes.NewBufferString(form.Encode()))
  if err != nil {
    return nil, err
  }
  defer resp.Body.Close()

  if resp.StatusCode != http.StatusOK {
    body, _ := io.ReadAll(resp.Body)
    return nil, fmt.Errorf("token exchange failed: status=%d body=%s", resp.StatusCode, string(body))
  }

  body, err := io.ReadAll(resp.Body)
  if err != nil {
    return nil, err
  }

  var token map[string]any
  err = json.Unmarshal(body, &token)
  return token, err
}`;
  const verifyIdTokenCode = `package main

import (
  "context"
  "fmt"
  "github.com/coreos/go-oidc/v3/oidc"
)

func verifyIDToken(ctx context.Context, rawIDToken string, clientID string, expectedNonce string) error {
  provider, err := oidc.NewProvider(ctx, "${issuer}")
  if err != nil {
    return err
  }

  verifier := provider.Verifier(&oidc.Config{ClientID: clientID})
  token, err := verifier.Verify(ctx, rawIDToken)
  if err != nil {
    return err
  }

  var claims struct {
    Nonce string \`json:"nonce"\`
    Sub   string \`json:"sub"\`
  }
  if err := token.Claims(&claims); err != nil {
    return err
  }
  if claims.Nonce != expectedNonce {
    return fmt.Errorf("nonce mismatch")
  }

  fmt.Println("stable user id:", claims.Sub)
  return nil
}`;
  const userInfoCode = `package main

import (
  "encoding/json"
  "fmt"
  "net/http"
)

func fetchUserInfo(accessToken string) (map[string]any, error) {
  req, err := http.NewRequest(http.MethodGet, "${issuer}/oauth2/userinfo", nil)
  if err != nil {
    return nil, err
  }
  req.Header.Set("Authorization", "Bearer "+accessToken)

  resp, err := http.DefaultClient.Do(req)
  if err != nil {
    return nil, err
  }
  defer resp.Body.Close()

  if resp.StatusCode != http.StatusOK {
    return nil, fmt.Errorf("userinfo request failed: status=%d", resp.StatusCode)
  }

  var profile map[string]any
  err = json.NewDecoder(resp.Body).Decode(&profile)
  return profile, err
}`;
  const refreshCode = `package main

import (
  "bytes"
  "encoding/json"
  "fmt"
  "net/http"
  "net/url"
)

func refreshToken(refreshToken string) (map[string]any, error) {
  form := url.Values{}
  form.Set("grant_type", "refresh_token")
  form.Set("client_id", "your-client-id")
  form.Set("client_secret", "your-client-secret")
  form.Set("refresh_token", refreshToken)

  resp, err := http.Post("${issuer}/oauth2/token", "application/x-www-form-urlencoded", bytes.NewBufferString(form.Encode()))
  if err != nil {
    return nil, err
  }
  defer resp.Body.Close()

  if resp.StatusCode != http.StatusOK {
    return nil, fmt.Errorf("refresh failed: status=%d", resp.StatusCode)
  }

  var token map[string]any
  err = json.NewDecoder(resp.Body).Decode(&token)
  return token, err
}`;
  const introspectCode = `package main

import (
  "bytes"
  "encoding/json"
  "fmt"
  "net/http"
  "net/url"
)

func introspectToken(accessToken string) (map[string]any, error) {
  form := url.Values{}
  form.Set("token", accessToken)

  req, err := http.NewRequest(http.MethodPost, "${issuer}/oauth2/introspect", bytes.NewBufferString(form.Encode()))
  if err != nil {
    return nil, err
  }
  req.SetBasicAuth("your-client-id", "your-client-secret")
  req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

  resp, err := http.DefaultClient.Do(req)
  if err != nil {
    return nil, err
  }
  defer resp.Body.Close()

  if resp.StatusCode != http.StatusOK {
    return nil, fmt.Errorf("introspection failed: status=%d", resp.StatusCode)
  }

  var result map[string]any
  err = json.NewDecoder(resp.Body).Decode(&result)
  return result, err
}`;
  const revokeCode = `package main

import (
  "bytes"
  "fmt"
  "net/http"
  "net/url"
)

func revokeToken(token string) error {
  form := url.Values{}
  form.Set("token", token)

  req, err := http.NewRequest(http.MethodPost, "${issuer}/oauth2/revoke", bytes.NewBufferString(form.Encode()))
  if err != nil {
    return err
  }
  req.SetBasicAuth("your-client-id", "your-client-secret")
  req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

  resp, err := http.DefaultClient.Do(req)
  if err != nil {
    return err
  }
  defer resp.Body.Close()

  if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusNoContent {
    return fmt.Errorf("revoke failed: status=%d", resp.StatusCode)
  }

  return nil
}`;
  const logoutCode = `package main

import (
  "fmt"
  "net/url"
)

func browserLogout(idTokenHint string) string {
  return fmt.Sprintf(
    "${issuer}/oauth2/logout?id_token_hint=%s&post_logout_redirect_uri=%s",
    url.QueryEscape(idTokenHint),
    url.QueryEscape("https://client.example.com/logout/callback"),
  )
}`;
  const notes = (
    ["backendOnly", "verifyIdToken", "useSub", "handleAccessDenied", "planForRevocation"] as const
  ).map((item) =>
    t(`docsExamples.notes.${item}`),
  );

  return (
    <ExamplePage
      title={t("docsExamples.pages.go.title")}
      description={t("docsExamples.pages.go.desc")}
      authorizeCode={authorizeCode}
      callbackErrorCode={callbackErrorCode}
      tokenCode={tokenCode}
      verifyIdTokenCode={verifyIdTokenCode}
      userInfoCode={userInfoCode}
      refreshCode={refreshCode}
      introspectCode={introspectCode}
      revokeCode={revokeCode}
      logoutCode={logoutCode}
      notes={notes}
      language="go"
    />
  );
}

export function DeveloperDocsExamplesCsharp() {
  const { t } = useDeveloperTranslation();
  const issuer = API_BASE.replace(/\/api$/, "");
  const authorizeCode = `using Microsoft.AspNetCore.WebUtilities;
using System.Collections.Generic;

var query = new Dictionary<string, string?>
{
    ["client_id"] = "your-client-id",
    ["redirect_uri"] = "https://client.example.com/callback",
    ["response_type"] = "code",
    ["scope"] = "openid profile email",
    ["state"] = "your-random-state",
    ["nonce"] = "your-random-nonce",
    ["code_challenge"] = "your-code-challenge",
    ["code_challenge_method"] = "S256",
};

var authorizeUrl = QueryHelpers.AddQueryString("${issuer}/oauth2/authorize", query);
Console.WriteLine(authorizeUrl);`;
  const callbackErrorCode = `app.MapGet("/callback", (HttpRequest request) =>
{
    var error = request.Query["error"].ToString();
    if (!string.IsNullOrWhiteSpace(error))
    {
        var description = request.Query["error_description"].ToString();
        var state = request.Query["state"].ToString();

        Console.WriteLine($"oidc callback rejected: error={error}, description={description}, state={state}");
        return Results.Problem(
            title: "Authorization rejected",
            detail: "The current account cannot complete authorization for this app.",
            statusCode: StatusCodes.Status403Forbidden
        );
    }

    var code = request.Query["code"].ToString();
    return Results.Ok(new { code });
});`;
  const tokenCode = `using System.Net.Http.Headers;

static async Task<string> ExchangeCodeAsync(string code, string codeVerifier)
{
    using var http = new HttpClient();
    using var form = new FormUrlEncodedContent(new Dictionary<string, string>
    {
        ["grant_type"] = "authorization_code",
        ["client_id"] = "your-client-id",
        ["client_secret"] = "your-client-secret",
        ["code"] = code,
        ["redirect_uri"] = "https://client.example.com/callback",
        ["code_verifier"] = codeVerifier,
    });

    using var response = await http.PostAsync("${issuer}/oauth2/token", form);
    response.EnsureSuccessStatusCode();
    return await response.Content.ReadAsStringAsync();
}`;
  const verifyIdTokenCode = `using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;

static async Task<string> VerifyIdTokenAsync(string rawIdToken, string expectedNonce)
{
    var configManager = new ConfigurationManager<OpenIdConnectConfiguration>(
        "${issuer}/.well-known/openid-configuration",
        new OpenIdConnectConfigurationRetriever());
    var config = await configManager.GetConfigurationAsync(CancellationToken.None);

    var handler = new JwtSecurityTokenHandler();
    var validation = new TokenValidationParameters
    {
        ValidIssuer = "${issuer}",
        ValidAudience = "your-client-id",
        IssuerSigningKeys = config.SigningKeys,
        ValidateIssuerSigningKey = true,
        ValidateLifetime = true,
    };

    var principal = handler.ValidateToken(rawIdToken, validation, out _);
    var nonce = principal.FindFirst("nonce")?.Value;
    if (nonce != expectedNonce)
    {
        throw new SecurityTokenValidationException("nonce mismatch");
    }

    return principal.FindFirst("sub")?.Value ?? throw new SecurityTokenValidationException("missing sub");
}`;
  const userInfoCode = `using System.Net.Http.Headers;

static async Task<string> FetchUserInfoAsync(string accessToken)
{
    using var http = new HttpClient();
    http.DefaultRequestHeaders.Authorization =
        new AuthenticationHeaderValue("Bearer", accessToken);

    using var response = await http.GetAsync("${issuer}/oauth2/userinfo");
    response.EnsureSuccessStatusCode();
    return await response.Content.ReadAsStringAsync();
}`;
  const refreshCode = `static async Task<string> RefreshTokenAsync(string refreshToken)
{
    using var http = new HttpClient();
    using var form = new FormUrlEncodedContent(new Dictionary<string, string>
    {
        ["grant_type"] = "refresh_token",
        ["client_id"] = "your-client-id",
        ["client_secret"] = "your-client-secret",
        ["refresh_token"] = refreshToken,
    });

    using var response = await http.PostAsync("${issuer}/oauth2/token", form);
    response.EnsureSuccessStatusCode();
    return await response.Content.ReadAsStringAsync();
}`;
  const introspectCode = `using System.Net.Http.Headers;
using System.Text;

static async Task<string> IntrospectTokenAsync(string accessToken)
{
    using var http = new HttpClient();
    var basic = Convert.ToBase64String(Encoding.UTF8.GetBytes("your-client-id:your-client-secret"));
    http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", basic);

    using var form = new FormUrlEncodedContent(new Dictionary<string, string>
    {
        ["token"] = accessToken,
    });

    using var response = await http.PostAsync("${issuer}/oauth2/introspect", form);
    response.EnsureSuccessStatusCode();
    return await response.Content.ReadAsStringAsync();
}`;
  const revokeCode = `using System.Net.Http.Headers;
using System.Text;

static async Task RevokeTokenAsync(string token)
{
    using var http = new HttpClient();
    var basic = Convert.ToBase64String(Encoding.UTF8.GetBytes("your-client-id:your-client-secret"));
    http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", basic);

    using var form = new FormUrlEncodedContent(new Dictionary<string, string>
    {
        ["token"] = token,
    });

    using var response = await http.PostAsync("${issuer}/oauth2/revoke", form);
    response.EnsureSuccessStatusCode();
}`;
  const logoutCode = `using Microsoft.AspNetCore.WebUtilities;
using System.Collections.Generic;

var logoutUrl = QueryHelpers.AddQueryString("${issuer}/oauth2/logout", new Dictionary<string, string?>
{
    ["id_token_hint"] = idToken,
    ["post_logout_redirect_uri"] = "https://client.example.com/logout/callback",
});`;
  const notes = (
    ["backendOnly", "verifyIdToken", "useSub", "handleAccessDenied", "planForRevocation"] as const
  ).map((item) => t(`docsExamples.notes.${item}`));

  return (
    <ExamplePage
      title={t("docsExamples.pages.csharp.title")}
      description={t("docsExamples.pages.csharp.desc")}
      authorizeCode={authorizeCode}
      callbackErrorCode={callbackErrorCode}
      tokenCode={tokenCode}
      verifyIdTokenCode={verifyIdTokenCode}
      userInfoCode={userInfoCode}
      refreshCode={refreshCode}
      introspectCode={introspectCode}
      revokeCode={revokeCode}
      logoutCode={logoutCode}
      notes={notes}
      language="csharp"
    />
  );
}

export function DeveloperDocsExamplesPHP() {
  const { t } = useDeveloperTranslation();
  const issuer = API_BASE.replace(/\/api$/, "");
  const authorizeCode = `<?php
$params = http_build_query([
    'client_id' => 'your-client-id',
    'redirect_uri' => 'https://client.example.com/callback',
    'response_type' => 'code',
    'scope' => 'openid profile email',
    'state' => 'your-random-state',
    'nonce' => 'your-random-nonce',
    'code_challenge' => 'your-code-challenge',
    'code_challenge_method' => 'S256',
]);

echo '${issuer}/oauth2/authorize?' . $params;`;
  const callbackErrorCode = `<?php
function handleCallback(): void {
    if (isset($_GET['error'])) {
        $error = $_GET['error'];
        $description = $_GET['error_description'] ?? '';
        $state = $_GET['state'] ?? '';

        error_log("oidc callback rejected: {$error} {$description} state={$state}");
        http_response_code(403);
        exit('current account cannot complete authorization');
    }

    $code = $_GET['code'] ?? '';
    // Continue with code exchange...
}`;
  const tokenCode = `<?php
function exchangeCode(string $code, string $codeVerifier): array {
    $postFields = http_build_query([
        'grant_type' => 'authorization_code',
        'client_id' => 'your-client-id',
        'client_secret' => 'your-client-secret',
        'code' => $code,
        'redirect_uri' => 'https://client.example.com/callback',
        'code_verifier' => $codeVerifier,
    ]);

    $response = file_get_contents('${issuer}/oauth2/token', false, stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/x-www-form-urlencoded\\r\\n",
            'content' => $postFields,
            'ignore_errors' => true,
        ],
    ]));
    $statusLine = $http_response_header[0] ?? '';
    if ($response === false || !str_contains($statusLine, ' 200 ')) {
        throw new RuntimeException('token exchange failed: ' . $statusLine);
    }

    return json_decode($response, true);
}`;
  const verifyIdTokenCode = `<?php
use Firebase\\JWT\\JWK;
use Firebase\\JWT\\JWT;

function verifyIdToken(string $idToken, string $expectedNonce): array {
    $jwks = json_decode(file_get_contents('${issuer}/.well-known/jwks.json'), true, 512, JSON_THROW_ON_ERROR);
    $decoded = (array) JWT::decode($idToken, JWK::parseKeySet($jwks));

    if (($decoded['iss'] ?? '') !== '${issuer}') {
        throw new RuntimeException('invalid issuer');
    }
    if (($decoded['aud'] ?? '') !== 'your-client-id') {
        throw new RuntimeException('invalid audience');
    }
    if (($decoded['nonce'] ?? '') !== $expectedNonce) {
        throw new RuntimeException('invalid nonce');
    }

    return $decoded; // use $decoded['sub'] as the stable local binding key
}`;
  const userInfoCode = `<?php
function fetchUserInfo(string $accessToken): array {
    $response = file_get_contents('${issuer}/oauth2/userinfo', false, stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => "Authorization: Bearer {$accessToken}\\r\\n",
            'ignore_errors' => true,
        ],
    ]));
    $statusLine = $http_response_header[0] ?? '';
    if ($response === false || !str_contains($statusLine, ' 200 ')) {
        throw new RuntimeException('userinfo request failed: ' . $statusLine);
    }

    return json_decode($response, true);
}`;
  const refreshCode = `<?php
function refreshToken(string $refreshToken): array {
    $postFields = http_build_query([
        'grant_type' => 'refresh_token',
        'client_id' => 'your-client-id',
        'client_secret' => 'your-client-secret',
        'refresh_token' => $refreshToken,
    ]);

    $response = file_get_contents('${issuer}/oauth2/token', false, stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/x-www-form-urlencoded\\r\\n",
            'content' => $postFields,
            'ignore_errors' => true,
        ],
    ]));
    $statusLine = $http_response_header[0] ?? '';
    if ($response === false || !str_contains($statusLine, ' 200 ')) {
        throw new RuntimeException('refresh failed: ' . $statusLine);
    }

    return json_decode($response, true);
}`;
  const introspectCode = `<?php
function introspectToken(string $accessToken): array {
    $response = file_get_contents('${issuer}/oauth2/introspect', false, stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' =>
                "Authorization: Basic " . base64_encode('your-client-id:your-client-secret') . "\\r\\n" .
                "Content-Type: application/x-www-form-urlencoded\\r\\n",
            'content' => http_build_query(['token' => $accessToken]),
            'ignore_errors' => true,
        ],
    ]));
    $statusLine = $http_response_header[0] ?? '';
    if ($response === false || !str_contains($statusLine, ' 200 ')) {
        throw new RuntimeException('introspection failed: ' . $statusLine);
    }

    return json_decode($response, true);
}`;
  const revokeCode = `<?php
function revokeToken(string $token): void {
    $response = file_get_contents('${issuer}/oauth2/revoke', false, stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' =>
                "Authorization: Basic " . base64_encode('your-client-id:your-client-secret') . "\\r\\n" .
                "Content-Type: application/x-www-form-urlencoded\\r\\n",
            'content' => http_build_query(['token' => $token]),
            'ignore_errors' => true,
        ],
    ]));
    $statusLine = $http_response_header[0] ?? '';
    if ($response === false || !str_contains($statusLine, ' 200 ') && !str_contains($statusLine, ' 204 ')) {
        throw new RuntimeException('revoke failed: ' . $statusLine);
    }
}`;
  const logoutCode = `<?php
$logoutUrl = '${issuer}/oauth2/logout?' . http_build_query([
    'id_token_hint' => $idToken,
    'post_logout_redirect_uri' => 'https://client.example.com/logout/callback',
]);`;
  const notes = (
    ["backendOnly", "verifyIdToken", "useSub", "handleAccessDenied", "planForRevocation"] as const
  ).map((item) =>
    t(`docsExamples.notes.${item}`),
  );

  return (
    <ExamplePage
      title={t("docsExamples.pages.php.title")}
      description={t("docsExamples.pages.php.desc")}
      authorizeCode={authorizeCode}
      callbackErrorCode={callbackErrorCode}
      tokenCode={tokenCode}
      verifyIdTokenCode={verifyIdTokenCode}
      userInfoCode={userInfoCode}
      refreshCode={refreshCode}
      introspectCode={introspectCode}
      revokeCode={revokeCode}
      logoutCode={logoutCode}
      notes={notes}
      language="php"
    />
  );
}

export function DeveloperDocsExamplesJava() {
  const { t } = useDeveloperTranslation();
  const issuer = API_BASE.replace(/\/api$/, "");
  const authorizeCode = `import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

public class OIDCLoginExample {
    public static void main(String[] args) {
        String url = "${issuer}/oauth2/authorize"
            + "?client_id=" + URLEncoder.encode("your-client-id", StandardCharsets.UTF_8)
            + "&redirect_uri=" + URLEncoder.encode("https://client.example.com/callback", StandardCharsets.UTF_8)
            + "&response_type=code"
            + "&scope=" + URLEncoder.encode("openid profile email", StandardCharsets.UTF_8)
            + "&state=" + URLEncoder.encode("your-random-state", StandardCharsets.UTF_8)
            + "&nonce=" + URLEncoder.encode("your-random-nonce", StandardCharsets.UTF_8)
            + "&code_challenge=" + URLEncoder.encode("your-code-challenge", StandardCharsets.UTF_8)
            + "&code_challenge_method=S256";
        System.out.println(url);
    }
}`;
  const callbackErrorCode = `import java.util.Map;

public class OIDCCallbackErrorExample {
    public void handleCallback(Map<String, String> query) {
        if (query.containsKey("error")) {
            String error = query.get("error");
            String description = query.getOrDefault("error_description", "");
            String state = query.getOrDefault("state", "");

            System.out.printf("oidc callback rejected: error=%s description=%s state=%s%n", error, description, state);
            throw new RuntimeException("current account cannot complete authorization");
        }
    }
}`;
  const tokenCode = `import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class OIDCExchangeExample {
    public static void main(String[] args) throws Exception {
        String form = "grant_type=authorization_code"
            + "&client_id=your-client-id"
            + "&client_secret=your-client-secret"
            + "&code=authorization-code"
            + "&redirect_uri=https%3A%2F%2Fclient.example.com%2Fcallback"
            + "&code_verifier=your-code-verifier";

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("${issuer}/oauth2/token"))
            .header("Content-Type", "application/x-www-form-urlencoded")
            .POST(HttpRequest.BodyPublishers.ofString(form))
            .build();

        HttpResponse<String> response = HttpClient.newHttpClient()
            .send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            throw new RuntimeException("token exchange failed: " + response.statusCode() + " " + response.body());
        }
        System.out.println(response.body());
    }
}`;
  const verifyIdTokenCode = `import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.jwk.source.RemoteJWKSet;
import com.nimbusds.jose.proc.JWSAlgorithmFamilyJWSKeySelector;
import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jwt.proc.BadJWTException;
import com.nimbusds.jwt.proc.ConfigurableJWTProcessor;
import com.nimbusds.jwt.proc.DefaultJWTProcessor;

import java.net.URL;

public class OIDCVerifyIdTokenExample {
    public void verify(String rawIdToken, String expectedNonce) throws Exception {
        ConfigurableJWTProcessor<SecurityContext> processor = new DefaultJWTProcessor<>();
        processor.setJWSKeySelector(new JWSAlgorithmFamilyJWSKeySelector<>(
            JWSAlgorithm.Family.RSA,
            new RemoteJWKSet<>(new URL("${issuer}/.well-known/jwks.json"))
        ));
        processor.setJWTClaimsSetVerifier((claims, context) -> {
            if (!"${issuer}".equals(claims.getIssuer())) {
                throw new BadJWTException("invalid issuer");
            }
            if (claims.getAudience() == null || !claims.getAudience().contains("your-client-id")) {
                throw new BadJWTException("invalid audience");
            }
        });

        var claims = processor.process(rawIdToken, null);
        String nonce = (String) claims.getClaim("nonce");
        String sub = claims.getSubject();

        if (!expectedNonce.equals(nonce)) {
            throw new RuntimeException("nonce mismatch");
        }

        System.out.println("stable user id: " + sub);
    }
}`;
  const userInfoCode = `import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class OIDCUserInfoExample {
    public static void main(String[] args) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("${issuer}/oauth2/userinfo"))
            .header("Authorization", "Bearer " + accessToken)
            .GET()
            .build();

        HttpResponse<String> response = HttpClient.newHttpClient()
            .send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            throw new RuntimeException("userinfo request failed: " + response.statusCode() + " " + response.body());
        }
        System.out.println(response.body());
    }
}`;
  const refreshCode = `import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class OIDCRefreshExample {
    public static void main(String[] args) throws Exception {
        String form = "grant_type=refresh_token"
            + "&client_id=your-client-id"
            + "&client_secret=your-client-secret"
            + "&refresh_token=your-refresh-token";

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("${issuer}/oauth2/token"))
            .header("Content-Type", "application/x-www-form-urlencoded")
            .POST(HttpRequest.BodyPublishers.ofString(form))
            .build();

        HttpResponse<String> response = HttpClient.newHttpClient()
            .send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            throw new RuntimeException("refresh failed: " + response.statusCode() + " " + response.body());
        }
        System.out.println(response.body());
    }
}`;
  const introspectCode = `import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Base64;

public class OIDCIntrospectionExample {
    public static void main(String[] args) throws Exception {
        String basic = Base64.getEncoder().encodeToString("your-client-id:your-client-secret".getBytes());
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("${issuer}/oauth2/introspect"))
            .header("Authorization", "Basic " + basic)
            .header("Content-Type", "application/x-www-form-urlencoded")
            .POST(HttpRequest.BodyPublishers.ofString("token=access-token"))
            .build();

        HttpResponse<String> response = HttpClient.newHttpClient()
            .send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            throw new RuntimeException("introspection failed: " + response.statusCode() + " " + response.body());
        }
        System.out.println(response.body());
    }
}`;
  const revokeCode = `import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Base64;

public class OIDCRevokeExample {
    public static void main(String[] args) throws Exception {
        String basic = Base64.getEncoder().encodeToString("your-client-id:your-client-secret".getBytes());
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("${issuer}/oauth2/revoke"))
            .header("Authorization", "Basic " + basic)
            .header("Content-Type", "application/x-www-form-urlencoded")
            .POST(HttpRequest.BodyPublishers.ofString("token=refresh-token"))
            .build();

        HttpResponse<Void> response = HttpClient.newHttpClient()
            .send(request, HttpResponse.BodyHandlers.discarding());
        if (response.statusCode() != 200 && response.statusCode() != 204) {
            throw new RuntimeException("revoke failed: " + response.statusCode());
        }
    }
}`;
  const logoutCode = `String logoutUrl = "${issuer}/oauth2/logout"
    + "?id_token_hint=" + URLEncoder.encode(idToken, StandardCharsets.UTF_8)
    + "&post_logout_redirect_uri="
    + URLEncoder.encode("https://client.example.com/logout/callback", StandardCharsets.UTF_8);`;
  const notes = (
    ["backendOnly", "verifyIdToken", "useSub", "handleAccessDenied", "planForRevocation"] as const
  ).map((item) =>
    t(`docsExamples.notes.${item}`),
  );

  return (
    <ExamplePage
      title={t("docsExamples.pages.java.title")}
      description={t("docsExamples.pages.java.desc")}
      authorizeCode={authorizeCode}
      callbackErrorCode={callbackErrorCode}
      tokenCode={tokenCode}
      verifyIdTokenCode={verifyIdTokenCode}
      userInfoCode={userInfoCode}
      refreshCode={refreshCode}
      introspectCode={introspectCode}
      revokeCode={revokeCode}
      logoutCode={logoutCode}
      notes={notes}
      language="java"
    />
  );
}

export function DeveloperDocsExamplesNodejs() {
  const { t } = useDeveloperTranslation();
  const issuer = API_BASE.replace(/\/api$/, "");
  const authorizeCode = `const params = new URLSearchParams({
  client_id: "your-client-id",
  redirect_uri: "https://client.example.com/callback",
  response_type: "code",
  scope: "openid profile email",
  state: "your-random-state",
  nonce: "your-random-nonce",
  code_challenge: "your-code-challenge",
  code_challenge_method: "S256",
});

console.log("${issuer}/oauth2/authorize?" + params.toString());`;
  const callbackErrorCode = `function handleCallback(requestUrl) {
  const url = new URL(requestUrl);
  const error = url.searchParams.get("error");
  if (error) {
    const description = url.searchParams.get("error_description") || "";
    const state = url.searchParams.get("state") || "";

    console.error("oidc callback rejected", { error, description, state });
    throw new Error("current account cannot complete authorization");
  }

  return url.searchParams.get("code");
}`;
  const tokenCode = `async function exchangeCode(code, verifier) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: "your-client-id",
    client_secret: "your-client-secret",
    code,
    redirect_uri: "https://client.example.com/callback",
    code_verifier: verifier,
  });

  const response = await fetch("${issuer}/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    throw new Error("token exchange failed: " + response.status);
  }

  return response.json();
}`;
  const verifyIdTokenCode = `import * as jose from "jose";

async function verifyIdToken(idToken, expectedNonce) {
  const JWKS = jose.createRemoteJWKSet(new URL("${issuer}/.well-known/jwks.json"));
  const { payload } = await jose.jwtVerify(idToken, JWKS, {
    issuer: "${issuer}",
    audience: "your-client-id",
  });

  if (payload.nonce !== expectedNonce) {
    throw new Error("nonce mismatch");
  }

  return payload.sub;
}`;
  const userInfoCode = `async function fetchUserInfo(accessToken) {
  const response = await fetch("${issuer}/oauth2/userinfo", {
    headers: { Authorization: "Bearer " + accessToken },
  });

  if (!response.ok) {
    throw new Error("userinfo request failed: " + response.status);
  }

  return response.json();
}`;
  const refreshCode = `async function refreshToken(refreshToken) {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: "your-client-id",
    client_secret: "your-client-secret",
    refresh_token: refreshToken,
  });

  const response = await fetch("${issuer}/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    throw new Error("refresh failed: " + response.status);
  }

  return response.json();
}`;
  const introspectCode = `async function introspectToken(accessToken) {
  const body = new URLSearchParams({ token: accessToken });
  const basic = Buffer.from("your-client-id:your-client-secret").toString("base64");

  const response = await fetch("${issuer}/oauth2/introspect", {
    method: "POST",
    headers: {
      Authorization: "Basic " + basic,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    throw new Error("introspection failed: " + response.status);
  }

  return response.json();
}`;
  const revokeCode = `async function revokeToken(token) {
  const body = new URLSearchParams({ token });
  const basic = Buffer.from("your-client-id:your-client-secret").toString("base64");

  const response = await fetch("${issuer}/oauth2/revoke", {
    method: "POST",
    headers: {
      Authorization: "Basic " + basic,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    throw new Error("revoke failed: " + response.status);
  }
}`;
  const logoutCode = `const logoutUrl =
  "${issuer}/oauth2/logout?" +
  new URLSearchParams({
    id_token_hint: idToken,
    post_logout_redirect_uri: "https://client.example.com/logout/callback",
  }).toString();`;
  const notes = (
    ["backendOnly", "verifyIdToken", "useSub", "handleAccessDenied", "planForRevocation"] as const
  ).map((item) =>
    t(`docsExamples.notes.${item}`),
  );

  return (
    <ExamplePage
      title={t("docsExamples.pages.nodejs.title")}
      description={t("docsExamples.pages.nodejs.desc")}
      authorizeCode={authorizeCode}
      callbackErrorCode={callbackErrorCode}
      tokenCode={tokenCode}
      verifyIdTokenCode={verifyIdTokenCode}
      userInfoCode={userInfoCode}
      refreshCode={refreshCode}
      introspectCode={introspectCode}
      revokeCode={revokeCode}
      logoutCode={logoutCode}
      notes={notes}
      language="javascript"
    />
  );
}

export function DeveloperDocsExamplesPython() {
  const { t } = useDeveloperTranslation();
  const issuer = API_BASE.replace(/\/api$/, "");
  const authorizeCode = `from urllib.parse import urlencode

params = urlencode({
    "client_id": "your-client-id",
    "redirect_uri": "https://client.example.com/callback",
    "response_type": "code",
    "scope": "openid profile email",
    "state": "your-random-state",
    "nonce": "your-random-nonce",
    "code_challenge": "your-code-challenge",
    "code_challenge_method": "S256",
})

print("${issuer}/oauth2/authorize?" + params)`;
  const callbackErrorCode = `from urllib.parse import urlparse, parse_qs

def handle_callback(callback_url: str) -> str | None:
    params = parse_qs(urlparse(callback_url).query)
    error = params.get("error", [None])[0]
    if error:
        description = params.get("error_description", [""])[0]
        state = params.get("state", [""])[0]
        raise RuntimeError(
            f"oidc callback rejected: error={error} description={description} state={state}"
        )

    return params.get("code", [None])[0]`;
  const tokenCode = `import requests

def exchange_code(code: str, code_verifier: str) -> dict:
    response = requests.post(
        "${issuer}/oauth2/token",
        data={
            "grant_type": "authorization_code",
            "client_id": "your-client-id",
            "client_secret": "your-client-secret",
            "code": code,
            "redirect_uri": "https://client.example.com/callback",
            "code_verifier": code_verifier,
        },
        timeout=10,
    )
    response.raise_for_status()
    return response.json()`;
  const verifyIdTokenCode = `import jwt
from jwt import PyJWKClient

def verify_id_token(id_token: str, expected_nonce: str) -> str:
    jwk_client = PyJWKClient("${issuer}/.well-known/jwks.json")
    signing_key = jwk_client.get_signing_key_from_jwt(id_token)
    claims = jwt.decode(
        id_token,
        signing_key.key,
        algorithms=["RS256"],
        audience="your-client-id",
        issuer="${issuer}",
    )
    if claims.get("nonce") != expected_nonce:
        raise ValueError("nonce mismatch")
    return claims["sub"]`;
  const userInfoCode = `import requests

def fetch_userinfo(access_token: str) -> dict:
    response = requests.get(
        "${issuer}/oauth2/userinfo",
        headers={"Authorization": f"Bearer {access_token}"},
        timeout=10,
    )
    response.raise_for_status()
    return response.json()`;
  const refreshCode = `import requests

def refresh_token(refresh_token: str) -> dict:
    response = requests.post(
        "${issuer}/oauth2/token",
        data={
            "grant_type": "refresh_token",
            "client_id": "your-client-id",
            "client_secret": "your-client-secret",
            "refresh_token": refresh_token,
        },
        timeout=10,
    )
    response.raise_for_status()
    return response.json()`;
  const introspectCode = `import requests

def introspect_token(access_token: str) -> dict:
    response = requests.post(
        "${issuer}/oauth2/introspect",
        auth=("your-client-id", "your-client-secret"),
        data={"token": access_token},
        timeout=10,
    )
    response.raise_for_status()
    return response.json()`;
  const revokeCode = `import requests

def revoke_token(token: str) -> None:
    response = requests.post(
        "${issuer}/oauth2/revoke",
        auth=("your-client-id", "your-client-secret"),
        data={"token": token},
        timeout=10,
    )
    response.raise_for_status()`;
  const logoutCode = `from urllib.parse import urlencode

logout_url = "${issuer}/oauth2/logout?" + urlencode({
    "id_token_hint": id_token,
    "post_logout_redirect_uri": "https://client.example.com/logout/callback",
})`;
  const notes = (
    ["backendOnly", "verifyIdToken", "useSub", "handleAccessDenied", "planForRevocation"] as const
  ).map((item) =>
    t(`docsExamples.notes.${item}`),
  );

  return (
    <ExamplePage
      title={t("docsExamples.pages.python.title")}
      description={t("docsExamples.pages.python.desc")}
      authorizeCode={authorizeCode}
      callbackErrorCode={callbackErrorCode}
      tokenCode={tokenCode}
      verifyIdTokenCode={verifyIdTokenCode}
      userInfoCode={userInfoCode}
      refreshCode={refreshCode}
      introspectCode={introspectCode}
      revokeCode={revokeCode}
      logoutCode={logoutCode}
      notes={notes}
      language="python"
    />
  );
}

export function DeveloperDocsExamplesRuby() {
  const { t } = useDeveloperTranslation();
  const issuer = API_BASE.replace(/\/api$/, "");
  const authorizeCode = `require "uri"

params = URI.encode_www_form(
  client_id: "your-client-id",
  redirect_uri: "https://client.example.com/callback",
  response_type: "code",
  scope: "openid profile email",
  state: "your-random-state",
  nonce: "your-random-nonce",
  code_challenge: "your-code-challenge",
  code_challenge_method: "S256"
)

puts "${issuer}/oauth2/authorize?#{params}"`;
  const callbackErrorCode = `require "rack/utils"

def handle_callback(query_string)
  params = Rack::Utils.parse_query(query_string)
  if params["error"] && !params["error"].empty?
    error = params["error"]
    description = params["error_description"].to_s
    state = params["state"].to_s

    warn "oidc callback rejected: error=#{error} description=#{description} state=#{state}"
    raise "current account cannot complete authorization"
  end

  params["code"]
end`;
  const tokenCode = `require "faraday"
require "json"

def exchange_code(code, code_verifier)
  response = Faraday.post("${issuer}/oauth2/token") do |req|
    req.headers["Content-Type"] = "application/x-www-form-urlencoded"
    req.body = URI.encode_www_form(
      grant_type: "authorization_code",
      client_id: "your-client-id",
      client_secret: "your-client-secret",
      code: code,
      redirect_uri: "https://client.example.com/callback",
      code_verifier: code_verifier
    )
  end

  raise "token exchange failed: #{response.status}" unless response.success?
  JSON.parse(response.body)
end`;
  const verifyIdTokenCode = `require "jwt"
require "json"
require "net/http"

def verify_id_token(id_token, expected_nonce)
  jwks = JSON.parse(Net::HTTP.get(URI("${issuer}/.well-known/jwks.json")), symbolize_names: true)
  payload, = JWT.decode(
    id_token,
    nil,
    true,
    algorithms: ["RS256"],
    iss: "${issuer}",
    verify_iss: true,
    aud: "your-client-id",
    verify_aud: true,
    jwks: jwks
  )

  raise "invalid issuer" unless payload["iss"] == "${issuer}"
  raise "invalid audience" unless payload["aud"] == "your-client-id"
  raise "nonce mismatch" unless payload["nonce"] == expected_nonce

  payload["sub"]
end`;
  const userInfoCode = `require "faraday"
require "json"

def fetch_userinfo(access_token)
  response = Faraday.get("${issuer}/oauth2/userinfo") do |req|
    req.headers["Authorization"] = "Bearer #{access_token}"
  end

  raise "userinfo failed: #{response.status}" unless response.success?
  JSON.parse(response.body)
end`;
  const refreshCode = `require "faraday"
require "json"

def refresh_token(refresh_token)
  response = Faraday.post("${issuer}/oauth2/token") do |req|
    req.headers["Content-Type"] = "application/x-www-form-urlencoded"
    req.body = URI.encode_www_form(
      grant_type: "refresh_token",
      client_id: "your-client-id",
      client_secret: "your-client-secret",
      refresh_token: refresh_token
    )
  end

  raise "refresh failed: #{response.status}" unless response.success?
  JSON.parse(response.body)
end`;
  const introspectCode = `require "faraday"
require "json"
require "base64"

def introspect_token(access_token)
  basic = Base64.strict_encode64("your-client-id:your-client-secret")
  response = Faraday.post("${issuer}/oauth2/introspect") do |req|
    req.headers["Authorization"] = "Basic #{basic}"
    req.headers["Content-Type"] = "application/x-www-form-urlencoded"
    req.body = URI.encode_www_form(token: access_token)
  end

  raise "introspection failed: #{response.status}" unless response.success?
  JSON.parse(response.body)
end`;
  const revokeCode = `require "faraday"
require "base64"

def revoke_token(token)
  basic = Base64.strict_encode64("your-client-id:your-client-secret")
  response = Faraday.post("${issuer}/oauth2/revoke") do |req|
    req.headers["Authorization"] = "Basic #{basic}"
    req.headers["Content-Type"] = "application/x-www-form-urlencoded"
    req.body = URI.encode_www_form(token: token)
  end

  raise "revoke failed: #{response.status}" unless response.success?
end`;
  const logoutCode = `require "uri"

logout_url = "${issuer}/oauth2/logout?" + URI.encode_www_form(
  id_token_hint: id_token,
  post_logout_redirect_uri: "https://client.example.com/logout/callback"
)`;
  const notes = (
    ["backendOnly", "verifyIdToken", "useSub", "handleAccessDenied", "planForRevocation"] as const
  ).map((item) => t(`docsExamples.notes.${item}`));

  return (
    <ExamplePage
      title={t("docsExamples.pages.ruby.title")}
      description={t("docsExamples.pages.ruby.desc")}
      authorizeCode={authorizeCode}
      callbackErrorCode={callbackErrorCode}
      tokenCode={tokenCode}
      verifyIdTokenCode={verifyIdTokenCode}
      userInfoCode={userInfoCode}
      refreshCode={refreshCode}
      introspectCode={introspectCode}
      revokeCode={revokeCode}
      logoutCode={logoutCode}
      notes={notes}
      language="ruby"
    />
  );
}

export function DeveloperDocsExamplesRust() {
  const { t } = useDeveloperTranslation();
  const issuer = API_BASE.replace(/\/api$/, "");
  const authorizeCode = `use url::Url;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut url = Url::parse("${issuer}/oauth2/authorize")?;
    url.query_pairs_mut()
        .append_pair("client_id", "your-client-id")
        .append_pair("redirect_uri", "https://client.example.com/callback")
        .append_pair("response_type", "code")
        .append_pair("scope", "openid profile email")
        .append_pair("state", "your-random-state")
        .append_pair("nonce", "your-random-nonce")
        .append_pair("code_challenge", "your-code-challenge")
        .append_pair("code_challenge_method", "S256");

    println!("{}", url);
    Ok(())
}`;
  const callbackErrorCode = `use url::Url;

fn handle_callback(callback_url: &str) -> Result<String, String> {
    let url = Url::parse(callback_url).map_err(|err| err.to_string())?;
    let params: std::collections::HashMap<_, _> = url.query_pairs().into_owned().collect();

    if let Some(error) = params.get("error") {
        let description = params.get("error_description").cloned().unwrap_or_default();
        let state = params.get("state").cloned().unwrap_or_default();
        return Err(format!(
            "oidc callback rejected: error={}, description={}, state={}",
            error, description, state
        ));
    }

    params
        .get("code")
        .cloned()
        .ok_or_else(|| "missing code".to_string())
}`;
  const tokenCode = `use reqwest::Client;
use serde_json::Value;

async fn exchange_code(code: &str, code_verifier: &str) -> Result<Value, reqwest::Error> {
    let client = Client::new();
    let response = client
        .post("${issuer}/oauth2/token")
        .form(&[
            ("grant_type", "authorization_code"),
            ("client_id", "your-client-id"),
            ("client_secret", "your-client-secret"),
            ("code", code),
            ("redirect_uri", "https://client.example.com/callback"),
            ("code_verifier", code_verifier),
        ])
        .send()
        .await?
        .error_for_status()?;

    response.json().await
}`;
  const verifyIdTokenCode = `use jsonwebtoken::{decode, decode_header, Algorithm, DecodingKey, Validation};
use reqwest::Client;
use serde::Deserialize;

#[derive(Debug, Deserialize)]
struct IdTokenClaims {
    iss: String,
    aud: String,
    nonce: String,
    sub: String,
    exp: usize,
}

#[derive(Debug, Deserialize)]
struct JwkSetResponse {
    keys: Vec<JwkKey>,
}

#[derive(Debug, Deserialize)]
struct JwkKey {
    kid: Option<String>,
    n: String,
    e: String,
}

async fn verify_id_token(raw_id_token: &str, expected_nonce: &str) -> Result<String, Box<dyn std::error::Error>> {
    let header = decode_header(raw_id_token)?;
    let kid = header.kid.ok_or("missing kid")?;
    let jwks: JwkSetResponse = Client::new()
        .get("${issuer}/.well-known/jwks.json")
        .send()
        .await?
        .error_for_status()?
        .json()
        .await?;

    let key = jwks
        .keys
        .iter()
        .find(|item| item.kid.as_deref() == Some(kid.as_str()))
        .ok_or("missing jwk")?;

    let decoding_key = DecodingKey::from_rsa_components(
        &key.n,
        &key.e,
    )?;

    let mut validation = Validation::new(Algorithm::RS256);
    validation.set_issuer(&["${issuer}"]);
    validation.set_audience(&["your-client-id"]);

    let token = decode::<IdTokenClaims>(raw_id_token, &decoding_key, &validation)?;
    if token.claims.nonce != expected_nonce {
        return Err("nonce mismatch".into());
    }

    Ok(token.claims.sub)
}`;
  const userInfoCode = `use reqwest::Client;
use serde_json::Value;

async fn fetch_userinfo(access_token: &str) -> Result<Value, reqwest::Error> {
    let client = Client::new();
    let response = client
        .get("${issuer}/oauth2/userinfo")
        .bearer_auth(access_token)
        .send()
        .await?
        .error_for_status()?;

    response.json().await
}`;
  const refreshCode = `use reqwest::Client;
use serde_json::Value;

async fn refresh_token(refresh_token: &str) -> Result<Value, reqwest::Error> {
    let client = Client::new();
    let response = client
        .post("${issuer}/oauth2/token")
        .form(&[
            ("grant_type", "refresh_token"),
            ("client_id", "your-client-id"),
            ("client_secret", "your-client-secret"),
            ("refresh_token", refresh_token),
        ])
        .send()
        .await?
        .error_for_status()?;

    response.json().await
}`;
  const introspectCode = `use reqwest::Client;
use serde_json::Value;

async fn introspect_token(access_token: &str) -> Result<Value, reqwest::Error> {
    let client = Client::new();
    let response = client
        .post("${issuer}/oauth2/introspect")
        .basic_auth("your-client-id", Some("your-client-secret"))
        .form(&[("token", access_token)])
        .send()
        .await?
        .error_for_status()?;

    response.json().await
}`;
  const revokeCode = `use reqwest::Client;

async fn revoke_token(token: &str) -> Result<(), reqwest::Error> {
    let client = Client::new();
    client
        .post("${issuer}/oauth2/revoke")
        .basic_auth("your-client-id", Some("your-client-secret"))
        .form(&[("token", token)])
        .send()
        .await?
        .error_for_status()?;

    Ok(())
}`;
  const logoutCode = `use url::Url;

fn build_logout_url(id_token: &str) -> Result<String, url::ParseError> {
    let mut url = Url::parse("${issuer}/oauth2/logout")?;
    url.query_pairs_mut()
        .append_pair("id_token_hint", id_token)
        .append_pair("post_logout_redirect_uri", "https://client.example.com/logout/callback");
    Ok(url.to_string())
}`;
  const notes = (
    ["backendOnly", "verifyIdToken", "useSub", "handleAccessDenied", "planForRevocation"] as const
  ).map((item) => t(`docsExamples.notes.${item}`));

  return (
    <ExamplePage
      title={t("docsExamples.pages.rust.title")}
      description={t("docsExamples.pages.rust.desc")}
      authorizeCode={authorizeCode}
      callbackErrorCode={callbackErrorCode}
      tokenCode={tokenCode}
      verifyIdTokenCode={verifyIdTokenCode}
      userInfoCode={userInfoCode}
      refreshCode={refreshCode}
      introspectCode={introspectCode}
      revokeCode={revokeCode}
      logoutCode={logoutCode}
      notes={notes}
      language="rust"
    />
  );
}
