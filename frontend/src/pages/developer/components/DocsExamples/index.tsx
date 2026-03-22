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
  tokenCode,
  userInfoCode,
  refreshCode,
  logoutCode,
  notes,
  language,
}: {
  title: string;
  description: string;
  authorizeCode: string;
  tokenCode: string;
  userInfoCode: string;
  refreshCode: string;
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
            title={t("docsExamples.tokenTitle")}
            language={language}
            code={tokenCode}
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
  const tokenCode = `package main

import (
  "bytes"
  "encoding/json"
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

  body, err := io.ReadAll(resp.Body)
  if err != nil {
    return nil, err
  }

  var token map[string]any
  err = json.Unmarshal(body, &token)
  return token, err
}`;
  const userInfoCode = `package main

import (
  "encoding/json"
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

  var profile map[string]any
  err = json.NewDecoder(resp.Body).Decode(&profile)
  return profile, err
}`;
  const refreshCode = `package main

import (
  "bytes"
  "encoding/json"
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

  var token map[string]any
  err = json.NewDecoder(resp.Body).Decode(&token)
  return token, err
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
  const notes = (["backendOnly", "verifyIdToken", "useSub"] as const).map((item) =>
    t(`docsExamples.notes.${item}`),
  );

  return (
    <ExamplePage
      title={t("docsExamples.pages.go.title")}
      description={t("docsExamples.pages.go.desc")}
      authorizeCode={authorizeCode}
      tokenCode={tokenCode}
      userInfoCode={userInfoCode}
      refreshCode={refreshCode}
      logoutCode={logoutCode}
      notes={notes}
      language="go"
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
        ],
    ]));

    return json_decode($response, true);
}`;
  const userInfoCode = `<?php
function fetchUserInfo(string $accessToken): array {
    $response = file_get_contents('${issuer}/oauth2/userinfo', false, stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => "Authorization: Bearer {$accessToken}\\r\\n",
        ],
    ]));

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
        ],
    ]));

    return json_decode($response, true);
}`;
  const logoutCode = `<?php
$logoutUrl = '${issuer}/oauth2/logout?' . http_build_query([
    'id_token_hint' => $idToken,
    'post_logout_redirect_uri' => 'https://client.example.com/logout/callback',
]);`;
  const notes = (["backendOnly", "verifyIdToken", "useSub"] as const).map((item) =>
    t(`docsExamples.notes.${item}`),
  );

  return (
    <ExamplePage
      title={t("docsExamples.pages.php.title")}
      description={t("docsExamples.pages.php.desc")}
      authorizeCode={authorizeCode}
      tokenCode={tokenCode}
      userInfoCode={userInfoCode}
      refreshCode={refreshCode}
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
        System.out.println(response.body());
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
        System.out.println(response.body());
    }
}`;
  const logoutCode = `String logoutUrl = "${issuer}/oauth2/logout"
    + "?id_token_hint=" + URLEncoder.encode(idToken, StandardCharsets.UTF_8)
    + "&post_logout_redirect_uri="
    + URLEncoder.encode("https://client.example.com/logout/callback", StandardCharsets.UTF_8);`;
  const notes = (["backendOnly", "verifyIdToken", "useSub"] as const).map((item) =>
    t(`docsExamples.notes.${item}`),
  );

  return (
    <ExamplePage
      title={t("docsExamples.pages.java.title")}
      description={t("docsExamples.pages.java.desc")}
      authorizeCode={authorizeCode}
      tokenCode={tokenCode}
      userInfoCode={userInfoCode}
      refreshCode={refreshCode}
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

  return response.json();
}`;
  const userInfoCode = `async function fetchUserInfo(accessToken) {
  const response = await fetch("${issuer}/oauth2/userinfo", {
    headers: { Authorization: "Bearer " + accessToken },
  });

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

  return response.json();
}`;
  const logoutCode = `const logoutUrl =
  "${issuer}/oauth2/logout?" +
  new URLSearchParams({
    id_token_hint: idToken,
    post_logout_redirect_uri: "https://client.example.com/logout/callback",
  }).toString();`;
  const notes = (["backendOnly", "verifyIdToken", "useSub"] as const).map((item) =>
    t(`docsExamples.notes.${item}`),
  );

  return (
    <ExamplePage
      title={t("docsExamples.pages.nodejs.title")}
      description={t("docsExamples.pages.nodejs.desc")}
      authorizeCode={authorizeCode}
      tokenCode={tokenCode}
      userInfoCode={userInfoCode}
      refreshCode={refreshCode}
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
  const logoutCode = `from urllib.parse import urlencode

logout_url = "${issuer}/oauth2/logout?" + urlencode({
    "id_token_hint": id_token,
    "post_logout_redirect_uri": "https://client.example.com/logout/callback",
})`;
  const notes = (["backendOnly", "verifyIdToken", "useSub"] as const).map((item) =>
    t(`docsExamples.notes.${item}`),
  );

  return (
    <ExamplePage
      title={t("docsExamples.pages.python.title")}
      description={t("docsExamples.pages.python.desc")}
      authorizeCode={authorizeCode}
      tokenCode={tokenCode}
      userInfoCode={userInfoCode}
      refreshCode={refreshCode}
      logoutCode={logoutCode}
      notes={notes}
      language="python"
    />
  );
}
