import { Alert, Card, Descriptions, Space, Table, Typography } from "antd";
import { API_BASE } from "../../../../api/client";
import { useDeveloperTranslation } from "../../i18n";
import type { ScopeDefinition } from "../../types";
import { CodePanel } from "../common/CodePanel";

function getAvailableScopes(scopes: ScopeDefinition[]) {
  return scopes.length > 0
    ? scopes
    : [
        {
          key: "openid",
          display_name: "OpenID",
          description: "OIDC base scope used to identify the user.",
          enabled: true,
          developer_selectable: true,
        },
        {
          key: "profile",
          display_name: "Profile",
          description: "Allows reading basic public profile fields.",
          enabled: true,
          developer_selectable: true,
        },
        {
          key: "email",
          display_name: "Email",
          description: "Allows reading the user's email address.",
          enabled: true,
          developer_selectable: true,
        },
        {
          key: "phone",
          display_name: "Phone",
          description: "Allows reading the user's phone number.",
          enabled: true,
          developer_selectable: true,
        },
        {
          key: "role",
          display_name: "Role",
          description: "Allows reading user roles.",
          enabled: true,
          developer_selectable: true,
        },
        {
          key: "gateway.read",
          display_name: "Protected API Access",
          description: "Allows access to platform APIs protected by this scope.",
          enabled: true,
          developer_selectable: true,
        },
      ];
}

type ManualTranslator = (key: string) => string;

function getScopeDisplayMeta(
  scope: Pick<ScopeDefinition, "key" | "display_name" | "description">,
  t: ManualTranslator,
) {
  const knownKeys = new Set([
    "openid",
    "profile",
    "email",
    "phone",
    "role",
    "gateway.read",
  ]);
  if (!knownKeys.has(scope.key)) {
    return {
      displayName: scope.display_name,
      description: scope.description,
    };
  }
  return {
    displayName: t(`docsManual.scopeDefinitions.${scope.key}.displayName`),
    description: t(`docsManual.scopeDefinitions.${scope.key}.description`),
  };
}

export function buildDeveloperManualMarkdown(scopes: ScopeDefinition[], t: ManualTranslator) {
  const availableScopes = getAvailableScopes(scopes);
  const supportedScopeKeys = availableScopes
    .filter((item) => item.enabled !== false)
    .map((item) => item.key)
    .join(" ");
  const issuer = API_BASE.replace(/\/api$/, "");
  const discoveryURL = `${issuer}/.well-known/openid-configuration`;
  const jwksURL = `${issuer}/.well-known/jwks.json`;
  const tokenURL = `${issuer}/oauth2/token`;
  const userInfoURL = `${issuer}/oauth2/userinfo`;
  const browserLogoutURL = `${issuer}/oauth2/logout`;
  const apiLogoutURL = `${issuer}/api/auth/logout`;
  const authorizeURL = `${issuer}/oauth2/authorize`;
  const introspectionURL = `${issuer}/oauth2/introspect`;
  const revocationURL = `${issuer}/oauth2/revoke`;
  const refreshExample = `POST ${tokenURL}
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token&
client_id=your-client-id&
client_secret=your-client-secret&
refresh_token=refresh-token-from-previous-response`;
  const tokenBasicExample = `POST ${tokenURL}
Authorization: Basic base64(client_id:client_secret)
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&
code=authorization-code-from-callback&
redirect_uri=${encodeURIComponent(
    "https://client.example.com/callback",
  )}&
code_verifier=your-code-verifier`;
  const logoutExample = `GET ${browserLogoutURL}?id_token_hint=id-token&post_logout_redirect_uri=${encodeURIComponent(
    "https://client.example.com/logout/callback",
  )}`;
  const authorizeExample = `${authorizeURL}?client_id=your-client-id&redirect_uri=${encodeURIComponent(
    "https://client.example.com/callback",
  )}&response_type=code&scope=${encodeURIComponent(
    "openid email profile",
  )}&state=your-random-state&nonce=your-random-nonce&code_challenge=your-code-challenge&code_challenge_method=S256`;
  const tokenExample = `POST ${tokenURL}
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&
client_id=your-client-id&
client_secret=your-client-secret&
code=authorization-code-from-callback&
redirect_uri=${encodeURIComponent(
    "https://client.example.com/callback",
  )}&
code_verifier=your-code-verifier`;
  const tokenResponseExample = `{
  "token_type": "Bearer",
  "expires_in": 3600,
  "access_token": "access-token",
  "id_token": "id-token",
  "refresh_token": "refresh-token",
  "scope": "openid email profile"
}`;
  const userInfoExample = `GET ${userInfoURL}
Authorization: Bearer access-token

{
  "sub": "user-unique-id",
  "email": "user@example.com",
  "name": "Display Name"
}`;
  const userInfoCurlExample = `curl -X GET "${userInfoURL}" \\
  -H "Authorization: Bearer access-token"`;
  const tokenCurlExample = `curl -X POST "${tokenURL}" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "grant_type=authorization_code" \\
  -d "client_id=your-client-id" \\
  -d "client_secret=your-client-secret" \\
  -d "code=authorization-code-from-callback" \\
  -d "redirect_uri=https%3A%2F%2Fclient.example.com%2Fcallback" \\
  -d "code_verifier=your-code-verifier"`;
  const refreshCurlExample = `curl -X POST "${tokenURL}" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "grant_type=refresh_token" \\
  -d "client_id=your-client-id" \\
  -d "client_secret=your-client-secret" \\
  -d "refresh_token=refresh-token-from-previous-response"`;
  const introspectionCurlExample = `curl -X POST "${introspectionURL}" \\
  -u "your-client-id:your-client-secret" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "token=access-token"`;
  const revocationCurlExample = `curl -X POST "${revocationURL}" \\
  -u "your-client-id:your-client-secret" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "token=refresh-token"`;
  const accessDeniedCallbackExample = `GET https://client.example.com/callback?error=access_denied&error_description=${encodeURIComponent(
    "current account cannot access this app",
  )}&state=your-random-state`;
  const userInfoClaims = [
    {
      key: "sub",
      source: t("docsManual.claimSources.always"),
      description: t("docsManual.claimDescriptions.sub"),
      notes: t("docsManual.claimNotes.sub"),
    },
    {
      key: "email",
      source: "email",
      description: t("docsManual.claimDescriptions.email"),
      notes: t("docsManual.claimNotes.email"),
    },
    {
      key: "phone",
      source: "phone",
      description: t("docsManual.claimDescriptions.phone"),
      notes: t("docsManual.claimNotes.phone"),
    },
    {
      key: "name",
      source: "profile",
      description: t("docsManual.claimDescriptions.name"),
      notes: t("docsManual.claimNotes.name"),
    },
    {
      key: "role",
      source: "role",
      description: t("docsManual.claimDescriptions.role"),
      notes: t("docsManual.claimNotes.role"),
    },
  ];
  const idTokenClaims = [
    {
      key: "sub",
      source: t("docsManual.claimSources.always"),
      description: t("docsManual.claimDescriptions.idTokenSub"),
      notes: t("docsManual.claimNotes.idTokenSub"),
    },
    {
      key: "nonce",
      source: t("docsManual.claimSources.always"),
      description: t("docsManual.claimDescriptions.nonce"),
      notes: t("docsManual.claimNotes.nonce"),
    },
    {
      key: "auth_time",
      source: t("docsManual.claimSources.always"),
      description: t("docsManual.claimDescriptions.authTime"),
      notes: t("docsManual.claimNotes.authTime"),
    },
    {
      key: "acr",
      source: t("docsManual.claimSources.always"),
      description: t("docsManual.claimDescriptions.acr"),
      notes: t("docsManual.claimNotes.acr"),
    },
    {
      key: "email",
      source: "email",
      description: t("docsManual.claimDescriptions.email"),
      notes: t("docsManual.claimNotes.email"),
    },
    {
      key: "phone",
      source: "phone",
      description: t("docsManual.claimDescriptions.phone"),
      notes: t("docsManual.claimNotes.phone"),
    },
    {
      key: "name",
      source: "profile",
      description: t("docsManual.claimDescriptions.name"),
      notes: t("docsManual.claimNotes.name"),
    },
    {
      key: "role",
      source: "role",
      description: t("docsManual.claimDescriptions.role"),
      notes: t("docsManual.claimNotes.role"),
    },
  ];
  const launchChecklist = (["1", "2", "3", "4", "5", "6"] as const).map(
    (item) => t(`docsManual.launchChecklist.items.${item}`),
  );
  const accessControlBasics = (["1", "2", "3", "4", "5", "6"] as const).map((item) =>
    t(`docsManual.accessControl.items.${item}`),
  );
  const accessRestrictionBehavior = (["1", "2", "3", "4", "5"] as const).map((item) =>
    t(`docsManual.accessRestrictions.items.${item}`),
  );
  const denialHandling = (["1", "2", "3", "4"] as const).map((item) =>
    t(`docsManual.denialHandling.items.${item}`),
  );
  const tokenInvalidation = (["1", "2", "3", "4"] as const).map((item) =>
    t(`docsManual.tokenInvalidation.items.${item}`),
  );
  const accessDeniedCallbackNotes = (["1", "2", "3"] as const).map((item) =>
    t(`docsManual.accessDeniedCallback.items.${item}`),
  );
  const accessBoundaryNotes = (["1", "2", "3"] as const).map((item) =>
    t(`docsManual.accessBoundary.items.${item}`),
  );
  const resourceServerNotes = (["1", "2", "3", "4"] as const).map((item) =>
    t(`docsManual.resourceServer.items.${item}`),
  );
  const troubleshootingNotes = (["1", "2", "3", "4"] as const).map((item) =>
    t(`docsManual.troubleshooting.items.${item}`),
  );
  const mappingGuidance = (["1", "2", "3"] as const).map((item) =>
    t(`docsManual.mapping.items.${item}`),
  );
  const claimUsageGuidance = (["1", "2", "3", "4"] as const).map((item) =>
    t(`docsManual.claimUsage.items.${item}`),
  );
  const commonErrors = (
    [
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "10a",
      "10b",
      "11",
      "12",
    ] as const
  ).map((item) => ({
    code: t(`docsManual.errors.items.${item}.code`),
    reason: t(`docsManual.errors.items.${item}.reason`),
    action: t(`docsManual.errors.items.${item}.action`),
  }));
  const redirectRules = (["1", "2", "3"] as const).map((item) =>
    t(`docsManual.redirectRules.items.${item}`),
  );
  const idTokenChecklist = (["1", "2", "3", "4", "5", "6"] as const).map((item) =>
    t(`docsManual.idTokenChecklist.items.${item}`),
  );
  const refreshTokenNotes = (["1", "2", "3", "4"] as const).map((item) =>
    t(`docsManual.refreshToken.notes.${item}`),
  );
  const thirdPartyTemplates = (["openlist", "grafana", "authentik"] as const).map(
    (item) => ({
      title: t(`docsManual.thirdPartyTemplates.items.${item}.title`),
      body: t(`docsManual.thirdPartyTemplates.items.${item}.body`),
    }),
  );
  const steps = (["1", "2", "3", "4", "5", "6", "7", "8"] as const).map((step) =>
    t(`docsManual.steps.${step}`),
  );
  const endpointRows = [
    ["Issuer", issuer],
    ["Discovery", discoveryURL],
    ["JWKS", jwksURL],
    ["Authorize", authorizeURL],
    ["Token", tokenURL],
    ["UserInfo", userInfoURL],
    ["Introspection", introspectionURL],
    ["Revocation", revocationURL],
    [t("docsManual.browserLogoutEndpoint"), browserLogoutURL],
    [t("docsManual.apiLogoutEndpoint"), apiLogoutURL],
  ] as const;
  const scopeRows = availableScopes.map((item) => {
    const meta = getScopeDisplayMeta(item, t);
    return [item.key, meta.displayName, meta.description];
  });
  const discoveryRows = [
    ["authorization_endpoint", authorizeURL],
    ["token_endpoint", tokenURL],
    ["userinfo_endpoint", userInfoURL],
    ["jwks_uri", jwksURL],
    ["scopes_supported", supportedScopeKeys],
    ["response_types_supported", "code"],
    ["grant_types_supported", "authorization_code refresh_token"],
    ["subject_types_supported", "public"],
    ["token_endpoint_auth_methods_supported", "client_secret_basic client_secret_post"],
    ["id_token_signing_alg_values_supported", "RS256"],
    ["code_challenge_methods_supported", "S256"],
    ["frontchannel_logout_supported", "true"],
    ["frontchannel_logout_session_supported", "false"],
  ] as const;
  const accountBindingRows = (["sub", "email", "name", "phone"] as const).map((item) => [
    t(`docsManual.accountBinding.rows.${item}.field`),
    t(`docsManual.accountBinding.rows.${item}.recommendation`),
    t(`docsManual.accountBinding.rows.${item}.reason`),
  ]);
  const accessBehaviorRows = (["1", "2", "3", "4"] as const).map((item) => [
    t(`docsManual.accessBehavior.rows.${item}.scenario`),
    t(`docsManual.accessBehavior.rows.${item}.behavior`),
  ]);
  const accountCenterStatusRows = (["normal", "restricted", "banned"] as const).map(
    (item) => [
      t(`docsManual.accountCenterStatus.rows.${item}.status`),
      t(`docsManual.accountCenterStatus.rows.${item}.meaning`),
    ],
  );
  const toMarkdownTable = (headers: string[], rows: ReadonlyArray<ReadonlyArray<string>>) =>
    [
      `| ${headers.join(" | ")} |`,
      `| ${headers.map(() => "---").join(" | ")} |`,
      ...rows.map((row) => `| ${row.join(" | ")} |`),
    ].join("\n");
  const toNumberedMarkdownList = (items: string[]) =>
    items.map((item, index) => `${index + 1}. ${item.replace(/^\d+\.\s*/, "")}`).join("\n");
  const toCodeBlock = (language: string, code: string) => `\`\`\`${language}\n${code}\n\`\`\``;
  return [
    `# ${t("docsManual.overview")}`,
    "",
    t("docsManual.overviewDesc"),
    "",
    toMarkdownTable(["Endpoint", "Value"], endpointRows),
    "",
    `> ${t("docsManual.logoutAlertTitle")}: ${t("docsManual.logoutAlertDesc")}`,
    "",
    `## ${t("docsManual.shortestSteps")}`,
    "",
    toNumberedMarkdownList(steps),
    "",
    `## ${t("docsManual.logoutModel")}`,
    "",
    t("docsManual.logoutDesc"),
    "",
    toMarkdownTable(
      [t("docsManual.logoutModel"), t("docsManual.scopeColumns.description")],
      [
        [t("docsManual.browserLogoutTitle"), t("docsManual.browserLogoutDesc")],
        [t("docsManual.apiLogoutTitle"), t("docsManual.apiLogoutDesc")],
      ],
    ),
    "",
    `## ${t("docsManual.scopeMechanism")}`,
    "",
    `> ${t("docsManual.scopeAlert")}`,
    "",
    t("docsManual.scopeDesc"),
    "",
    toMarkdownTable(
      [
        t("docsManual.scopeColumns.scope"),
        t("docsManual.scopeColumns.displayName"),
        t("docsManual.scopeColumns.description"),
      ],
      scopeRows,
    ),
    "",
    `## ${t("docsManual.discovery.title")}`,
    "",
    t("docsManual.discovery.desc"),
    "",
    toMarkdownTable(["Field", "Value"], discoveryRows),
    "",
    `## ${t("docsManual.claimContract")}`,
    "",
    `> ${t("docsManual.claimAlertTitle")}: ${t("docsManual.claimAlertDesc")}`,
    "",
    `### userinfo`,
    "",
    t("docsManual.userinfoClaimsDesc"),
    "",
    toMarkdownTable(
      [
        t("docsManual.claimColumns.claim"),
        t("docsManual.claimColumns.scopeRequirement"),
        t("docsManual.claimColumns.description"),
        t("docsManual.claimColumns.notes"),
      ],
      userInfoClaims.map((item) => [item.key, item.source, item.description, item.notes]),
    ),
    "",
    `### id_token`,
    "",
    t("docsManual.idTokenClaimsDesc"),
    "",
    toMarkdownTable(
      [
        t("docsManual.claimColumns.claim"),
        t("docsManual.claimColumns.scopeRequirement"),
        t("docsManual.claimColumns.description"),
        t("docsManual.claimColumns.notes"),
      ],
      idTokenClaims.map((item) => [item.key, item.source, item.description, item.notes]),
    ),
    "",
    `## ${t("docsManual.authRequestExample")}`,
    "",
    t("docsManual.authRequestDesc"),
    "",
    toCodeBlock("http", authorizeExample),
    "",
    `## ${t("docsManual.tokenExchange")}`,
    "",
    t("docsManual.tokenExchangeDesc"),
    "",
    `### ${t("docsManual.clientAuth.title")}`,
    "",
    t("docsManual.clientAuth.desc"),
    "",
    toCodeBlock("http", tokenExample),
    "",
    t("docsManual.tokenBasicDesc"),
    "",
    toCodeBlock("http", tokenBasicExample),
    "",
    t("docsManual.tokenResponseDesc"),
    "",
    toCodeBlock("json", tokenResponseExample),
    "",
    `## ${t("docsManual.refreshToken.title")}`,
    "",
    t("docsManual.refreshToken.desc"),
    "",
    toCodeBlock("http", refreshExample),
    "",
    toNumberedMarkdownList(refreshTokenNotes),
    "",
    `## ${t("docsManual.userinfoExampleTitle")}`,
    "",
    t("docsManual.userinfoExampleDesc"),
    "",
    toCodeBlock("http", userInfoExample),
    "",
    `## ${t("docsManual.curlExamples.title")}`,
    "",
    t("docsManual.curlExamples.desc"),
    "",
    `### ${t("docsManual.curlExamples.token")}`,
    "",
    toCodeBlock("bash", tokenCurlExample),
    "",
    `### ${t("docsManual.curlExamples.refresh")}`,
    "",
    toCodeBlock("bash", refreshCurlExample),
    "",
    `### ${t("docsManual.curlExamples.userinfo")}`,
    "",
    toCodeBlock("bash", userInfoCurlExample),
    "",
    `### ${t("docsManual.curlExamples.introspection")}`,
    "",
    toCodeBlock("bash", introspectionCurlExample),
    "",
    `### ${t("docsManual.curlExamples.revocation")}`,
    "",
    toCodeBlock("bash", revocationCurlExample),
    "",
    `## ${t("docsManual.redirectRules.title")}`,
    "",
    toNumberedMarkdownList(redirectRules),
    "",
    `## ${t("docsManual.logoutExample.title")}`,
    "",
    t("docsManual.logoutExample.desc"),
    "",
    toCodeBlock("http", logoutExample),
    "",
    `## ${t("docsManual.claimUsage.title")}`,
    "",
    toNumberedMarkdownList(claimUsageGuidance),
    "",
    `## ${t("docsManual.idTokenChecklist.title")}`,
    "",
    toNumberedMarkdownList(idTokenChecklist),
    "",
    `## ${t("docsManual.mapping.title")}`,
    "",
    toNumberedMarkdownList(mappingGuidance),
    "",
    `## ${t("docsManual.accessControl.title")}`,
    "",
    t("docsManual.accessControl.desc"),
    "",
    toNumberedMarkdownList(accessControlBasics),
    "",
    `## ${t("docsManual.accessRestrictions.title")}`,
    "",
    t("docsManual.accessRestrictions.desc"),
    "",
    toNumberedMarkdownList(accessRestrictionBehavior),
    "",
    `## ${t("docsManual.denialHandling.title")}`,
    "",
    t("docsManual.denialHandling.desc"),
    "",
    toNumberedMarkdownList(denialHandling),
    "",
    `## ${t("docsManual.accountBinding.title")}`,
    "",
    t("docsManual.accountBinding.desc"),
    "",
    toMarkdownTable(
      [
        t("docsManual.accountBinding.columns.field"),
        t("docsManual.accountBinding.columns.recommendation"),
        t("docsManual.accountBinding.columns.reason"),
      ],
      accountBindingRows,
    ),
    "",
    `## ${t("docsManual.accessBehavior.title")}`,
    "",
    t("docsManual.accessBehavior.desc"),
    "",
    toMarkdownTable(
      [
        t("docsManual.accessBehavior.columns.scenario"),
        t("docsManual.accessBehavior.columns.behavior"),
      ],
      accessBehaviorRows,
    ),
    "",
    `## ${t("docsManual.tokenInvalidation.title")}`,
    "",
    t("docsManual.tokenInvalidation.desc"),
    "",
    toNumberedMarkdownList(tokenInvalidation),
    "",
    `## ${t("docsManual.accessDeniedCallback.title")}`,
    "",
    t("docsManual.accessDeniedCallback.desc"),
    "",
    toCodeBlock("http", accessDeniedCallbackExample),
    "",
    toNumberedMarkdownList(accessDeniedCallbackNotes),
    "",
    `## ${t("docsManual.accessBoundary.title")}`,
    "",
    t("docsManual.accessBoundary.desc"),
    "",
    toNumberedMarkdownList(accessBoundaryNotes),
    "",
    `## ${t("docsManual.resourceServer.title")}`,
    "",
    t("docsManual.resourceServer.desc"),
    "",
    toNumberedMarkdownList(resourceServerNotes),
    "",
    `## ${t("docsManual.troubleshooting.title")}`,
    "",
    t("docsManual.troubleshooting.desc"),
    "",
    toNumberedMarkdownList(troubleshootingNotes),
    "",
    `## ${t("docsManual.accountCenterStatus.title")}`,
    "",
    t("docsManual.accountCenterStatus.desc"),
    "",
    toMarkdownTable(
      [
        t("docsManual.accountCenterStatus.columns.status"),
        t("docsManual.accountCenterStatus.columns.meaning"),
      ],
      accountCenterStatusRows,
    ),
    "",
    `## ${t("docsManual.thirdPartyTemplates.title")}`,
    "",
    t("docsManual.thirdPartyTemplates.desc"),
    "",
    ...thirdPartyTemplates.flatMap((item) => [`### ${item.title}`, "", item.body, ""]),
    `## ${t("docsManual.errors.title")}`,
    "",
    toMarkdownTable(
      [
        t("docsManual.errors.columns.code"),
        t("docsManual.errors.columns.reason"),
        t("docsManual.errors.columns.action"),
      ],
      commonErrors.map((item) => [item.code, item.reason, item.action]),
    ),
    "",
    `## ${t("docsManual.launchChecklist.title")}`,
    "",
    toNumberedMarkdownList(launchChecklist),
  ].join("\n");
}

export function DeveloperDocsManual({ scopes }: { scopes: ScopeDefinition[] }) {
  const { t } = useDeveloperTranslation();
  const availableScopes = getAvailableScopes(scopes);
  const supportedScopeKeys = availableScopes
    .filter((item) => item.enabled !== false)
    .map((item) => item.key)
    .join(" ");
  const issuer = API_BASE.replace(/\/api$/, "");
  const discoveryURL = `${issuer}/.well-known/openid-configuration`;
  const jwksURL = `${issuer}/.well-known/jwks.json`;
  const tokenURL = `${issuer}/oauth2/token`;
  const userInfoURL = `${issuer}/oauth2/userinfo`;
  const browserLogoutURL = `${issuer}/oauth2/logout`;
  const apiLogoutURL = `${issuer}/api/auth/logout`;
  const authorizeURL = `${issuer}/oauth2/authorize`;
  const introspectionURL = `${issuer}/oauth2/introspect`;
  const revocationURL = `${issuer}/oauth2/revoke`;
  const refreshExample = `POST ${tokenURL}
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token&
client_id=your-client-id&
client_secret=your-client-secret&
refresh_token=refresh-token-from-previous-response`;
  const tokenBasicExample = `POST ${tokenURL}
Authorization: Basic base64(client_id:client_secret)
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&
code=authorization-code-from-callback&
redirect_uri=${encodeURIComponent(
    "https://client.example.com/callback",
  )}&
code_verifier=your-code-verifier`;
  const logoutExample = `GET ${browserLogoutURL}?id_token_hint=id-token&post_logout_redirect_uri=${encodeURIComponent(
    "https://client.example.com/logout/callback",
  )}`;
  const authorizeExample = `${authorizeURL}?client_id=your-client-id&redirect_uri=${encodeURIComponent(
    "https://client.example.com/callback",
  )}&response_type=code&scope=${encodeURIComponent(
    "openid email profile",
  )}&state=your-random-state&nonce=your-random-nonce&code_challenge=your-code-challenge&code_challenge_method=S256`;
  const tokenExample = `POST ${tokenURL}
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&
client_id=your-client-id&
client_secret=your-client-secret&
code=authorization-code-from-callback&
redirect_uri=${encodeURIComponent(
    "https://client.example.com/callback",
  )}&
code_verifier=your-code-verifier`;
  const tokenResponseExample = `{
  "token_type": "Bearer",
  "expires_in": 3600,
  "access_token": "access-token",
  "id_token": "id-token",
  "refresh_token": "refresh-token",
  "scope": "openid email profile"
}`;
  const userInfoExample = `GET ${userInfoURL}
Authorization: Bearer access-token

{
  "sub": "user-unique-id",
  "email": "user@example.com",
  "name": "Display Name"
}`;
  const userInfoCurlExample = `curl -X GET "${userInfoURL}" \\
  -H "Authorization: Bearer access-token"`;
  const tokenCurlExample = `curl -X POST "${tokenURL}" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "grant_type=authorization_code" \\
  -d "client_id=your-client-id" \\
  -d "client_secret=your-client-secret" \\
  -d "code=authorization-code-from-callback" \\
  -d "redirect_uri=https%3A%2F%2Fclient.example.com%2Fcallback" \\
  -d "code_verifier=your-code-verifier"`;
  const refreshCurlExample = `curl -X POST "${tokenURL}" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "grant_type=refresh_token" \\
  -d "client_id=your-client-id" \\
  -d "client_secret=your-client-secret" \\
  -d "refresh_token=refresh-token-from-previous-response"`;
  const introspectionCurlExample = `curl -X POST "${issuer}/oauth2/introspect" \\
  -u "your-client-id:your-client-secret" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "token=access-token"`;
  const revocationCurlExample = `curl -X POST "${issuer}/oauth2/revoke" \\
  -u "your-client-id:your-client-secret" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "token=refresh-token"`;
  const accessDeniedCallbackExample = `GET https://client.example.com/callback?error=access_denied&error_description=${encodeURIComponent(
    "current account cannot access this app",
  )}&state=your-random-state`;
  const userInfoClaims = [
    {
      key: "sub",
      source: t("docsManual.claimSources.always"),
      description: t("docsManual.claimDescriptions.sub"),
      notes: t("docsManual.claimNotes.sub"),
    },
    {
      key: "email",
      source: "email",
      description: t("docsManual.claimDescriptions.email"),
      notes: t("docsManual.claimNotes.email"),
    },
    {
      key: "phone",
      source: "phone",
      description: t("docsManual.claimDescriptions.phone"),
      notes: t("docsManual.claimNotes.phone"),
    },
    {
      key: "name",
      source: "profile",
      description: t("docsManual.claimDescriptions.name"),
      notes: t("docsManual.claimNotes.name"),
    },
    {
      key: "role",
      source: "role",
      description: t("docsManual.claimDescriptions.role"),
      notes: t("docsManual.claimNotes.role"),
    },
  ];
  const idTokenClaims = [
    {
      key: "sub",
      source: t("docsManual.claimSources.always"),
      description: t("docsManual.claimDescriptions.idTokenSub"),
      notes: t("docsManual.claimNotes.idTokenSub"),
    },
    {
      key: "nonce",
      source: t("docsManual.claimSources.always"),
      description: t("docsManual.claimDescriptions.nonce"),
      notes: t("docsManual.claimNotes.nonce"),
    },
    {
      key: "auth_time",
      source: t("docsManual.claimSources.always"),
      description: t("docsManual.claimDescriptions.authTime"),
      notes: t("docsManual.claimNotes.authTime"),
    },
    {
      key: "acr",
      source: t("docsManual.claimSources.always"),
      description: t("docsManual.claimDescriptions.acr"),
      notes: t("docsManual.claimNotes.acr"),
    },
    {
      key: "email",
      source: "email",
      description: t("docsManual.claimDescriptions.email"),
      notes: t("docsManual.claimNotes.email"),
    },
    {
      key: "phone",
      source: "phone",
      description: t("docsManual.claimDescriptions.phone"),
      notes: t("docsManual.claimNotes.phone"),
    },
    {
      key: "name",
      source: "profile",
      description: t("docsManual.claimDescriptions.name"),
      notes: t("docsManual.claimNotes.name"),
    },
    {
      key: "role",
      source: "role",
      description: t("docsManual.claimDescriptions.role"),
      notes: t("docsManual.claimNotes.role"),
    },
  ];
  const launchChecklist = (["1", "2", "3", "4", "5", "6"] as const).map((item) =>
    t(`docsManual.launchChecklist.items.${item}`),
  );
  const accessControlBasics = (["1", "2", "3", "4", "5", "6"] as const).map((item) =>
    t(`docsManual.accessControl.items.${item}`),
  );
  const accessRestrictionBehavior = (["1", "2", "3", "4", "5"] as const).map((item) =>
    t(`docsManual.accessRestrictions.items.${item}`),
  );
  const denialHandling = (["1", "2", "3", "4"] as const).map((item) =>
    t(`docsManual.denialHandling.items.${item}`),
  );
  const tokenInvalidation = (["1", "2", "3", "4"] as const).map((item) =>
    t(`docsManual.tokenInvalidation.items.${item}`),
  );
  const accessDeniedCallbackNotes = (["1", "2", "3"] as const).map((item) =>
    t(`docsManual.accessDeniedCallback.items.${item}`),
  );
  const accessBoundaryNotes = (["1", "2", "3"] as const).map((item) =>
    t(`docsManual.accessBoundary.items.${item}`),
  );
  const resourceServerNotes = (["1", "2", "3", "4"] as const).map((item) =>
    t(`docsManual.resourceServer.items.${item}`),
  );
  const troubleshootingNotes = (["1", "2", "3", "4"] as const).map((item) =>
    t(`docsManual.troubleshooting.items.${item}`),
  );
  const mappingGuidance = (["1", "2", "3"] as const).map((item) =>
    t(`docsManual.mapping.items.${item}`),
  );
  const claimUsageGuidance = (["1", "2", "3", "4"] as const).map((item) =>
    t(`docsManual.claimUsage.items.${item}`),
  );
  const commonErrors = (
    [
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "10a",
      "10b",
      "11",
      "12",
    ] as const
  ).map((item) => ({
    code: t(`docsManual.errors.items.${item}.code`),
    reason: t(`docsManual.errors.items.${item}.reason`),
    action: t(`docsManual.errors.items.${item}.action`),
  }));
  const redirectRules = (["1", "2", "3"] as const).map((item) =>
    t(`docsManual.redirectRules.items.${item}`),
  );
  const idTokenChecklist = (["1", "2", "3", "4", "5", "6"] as const).map((item) =>
    t(`docsManual.idTokenChecklist.items.${item}`),
  );
  const refreshTokenNotes = (["1", "2", "3", "4"] as const).map((item) =>
    t(`docsManual.refreshToken.notes.${item}`),
  );
  const thirdPartyTemplates = (["openlist", "grafana", "authentik"] as const).map(
    (item) => ({
      title: t(`docsManual.thirdPartyTemplates.items.${item}.title`),
      body: t(`docsManual.thirdPartyTemplates.items.${item}.body`),
    }),
  );

  return (
    <Space direction="vertical" size={20} style={{ width: "100%" }}>
      <Card title={t("docsManual.overview")}>
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            {t("docsManual.overviewDesc")}
          </Typography.Paragraph>
          <div className="developer-docs-scroll">
            <Descriptions
              column={1}
              bordered
              size="small"
              className="developer-docs-descriptions"
            >
              <Descriptions.Item label="Issuer">{issuer}</Descriptions.Item>
              <Descriptions.Item label="Discovery">{discoveryURL}</Descriptions.Item>
              <Descriptions.Item label="JWKS">{jwksURL}</Descriptions.Item>
              <Descriptions.Item label="Authorize">{`${issuer}/oauth2/authorize`}</Descriptions.Item>
              <Descriptions.Item label="Token">{tokenURL}</Descriptions.Item>
              <Descriptions.Item label="UserInfo">{userInfoURL}</Descriptions.Item>
              <Descriptions.Item label="Introspection">
                {introspectionURL}
              </Descriptions.Item>
              <Descriptions.Item label="Revocation">{revocationURL}</Descriptions.Item>
              <Descriptions.Item label={t("docsManual.browserLogoutEndpoint")}>
                {browserLogoutURL}
              </Descriptions.Item>
              <Descriptions.Item label={t("docsManual.apiLogoutEndpoint")}>
                {apiLogoutURL}
              </Descriptions.Item>
            </Descriptions>
          </div>
          <Alert
            type="warning"
            showIcon
            message={t("docsManual.logoutAlertTitle")}
            description={t("docsManual.logoutAlertDesc")}
          />
        </Space>
      </Card>

      <Card title={t("docsManual.shortestSteps")}>
        <Space direction="vertical" size={10} style={{ width: "100%" }}>
          {(["1", "2", "3", "4", "5", "6", "7", "8"] as const).map((step) => (
            <Typography.Paragraph key={step} style={{ marginBottom: 0 }}>
              {t(`docsManual.steps.${step}`)}
            </Typography.Paragraph>
          ))}
        </Space>
      </Card>

      <Card title={t("docsManual.logoutModel")}>
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            {t("docsManual.logoutDesc")}
          </Typography.Paragraph>
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label={t("docsManual.browserLogoutTitle")}>
              {t("docsManual.browserLogoutDesc")}
            </Descriptions.Item>
            <Descriptions.Item label={t("docsManual.apiLogoutTitle")}>
              {t("docsManual.apiLogoutDesc")}
            </Descriptions.Item>
          </Descriptions>
        </Space>
      </Card>

      <Card title={t("docsManual.scopeMechanism")}>
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Alert type="info" showIcon message={t("docsManual.scopeAlert")} />
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            {t("docsManual.scopeDesc")}
          </Typography.Paragraph>
          <Table
            rowKey="key"
            pagination={false}
            scroll={{ x: 760 }}
            columns={[
              {
                title: t("docsManual.scopeColumns.scope"),
                dataIndex: "key",
                width: 180,
                render: (value: string) => <Typography.Text code>{value}</Typography.Text>,
              },
              {
                title: t("docsManual.scopeColumns.displayName"),
                dataIndex: "display_name",
                width: 180,
                render: (_value: string, record: ScopeDefinition) =>
                  getScopeDisplayMeta(record, t).displayName,
              },
              {
                title: t("docsManual.scopeColumns.description"),
                dataIndex: "description",
                render: (_value: string, record: ScopeDefinition) =>
                  getScopeDisplayMeta(record, t).description,
              },
            ]}
            dataSource={availableScopes}
          />
        </Space>
      </Card>

      <Card title={t("docsManual.discovery.title")}>
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            {t("docsManual.discovery.desc")}
          </Typography.Paragraph>
          <div className="developer-docs-scroll">
            <Descriptions
              column={1}
              bordered
              size="small"
              className="developer-docs-descriptions"
            >
              <Descriptions.Item label="authorization_endpoint">
                {authorizeURL}
              </Descriptions.Item>
              <Descriptions.Item label="token_endpoint">{tokenURL}</Descriptions.Item>
              <Descriptions.Item label="userinfo_endpoint">{userInfoURL}</Descriptions.Item>
              <Descriptions.Item label="jwks_uri">{jwksURL}</Descriptions.Item>
              <Descriptions.Item label="scopes_supported">
                {supportedScopeKeys}
              </Descriptions.Item>
              <Descriptions.Item label="response_types_supported">code</Descriptions.Item>
              <Descriptions.Item label="grant_types_supported">
                authorization_code refresh_token
              </Descriptions.Item>
              <Descriptions.Item label="subject_types_supported">public</Descriptions.Item>
              <Descriptions.Item label="token_endpoint_auth_methods_supported">
                client_secret_basic client_secret_post
              </Descriptions.Item>
              <Descriptions.Item label="id_token_signing_alg_values_supported">
                RS256
              </Descriptions.Item>
              <Descriptions.Item label="code_challenge_methods_supported">
                S256
              </Descriptions.Item>
              <Descriptions.Item label="frontchannel_logout_supported">true</Descriptions.Item>
              <Descriptions.Item label="frontchannel_logout_session_supported">
                false
              </Descriptions.Item>
            </Descriptions>
          </div>
        </Space>
      </Card>

      <Card title={t("docsManual.claimContract")}>
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Alert
            type="warning"
            showIcon
            message={t("docsManual.claimAlertTitle")}
            description={t("docsManual.claimAlertDesc")}
          />
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            {t("docsManual.userinfoClaimsDesc")}
          </Typography.Paragraph>
          <Table
            rowKey="key"
            pagination={false}
            scroll={{ x: 960 }}
            columns={[
              {
                title: t("docsManual.claimColumns.claim"),
                dataIndex: "key",
                width: 140,
                render: (value: string) => <Typography.Text code>{value}</Typography.Text>,
              },
              {
                title: t("docsManual.claimColumns.scopeRequirement"),
                dataIndex: "source",
                width: 180,
              },
              {
                title: t("docsManual.claimColumns.description"),
                dataIndex: "description",
              },
              {
                title: t("docsManual.claimColumns.notes"),
                dataIndex: "notes",
              },
            ]}
            dataSource={userInfoClaims}
          />
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            {t("docsManual.idTokenClaimsDesc")}
          </Typography.Paragraph>
          <Table
            rowKey="key"
            pagination={false}
            scroll={{ x: 960 }}
            columns={[
              {
                title: t("docsManual.claimColumns.claim"),
                dataIndex: "key",
                width: 140,
                render: (value: string) => <Typography.Text code>{value}</Typography.Text>,
              },
              {
                title: t("docsManual.claimColumns.scopeRequirement"),
                dataIndex: "source",
                width: 180,
              },
              {
                title: t("docsManual.claimColumns.description"),
                dataIndex: "description",
              },
              {
                title: t("docsManual.claimColumns.notes"),
                dataIndex: "notes",
              },
            ]}
            dataSource={idTokenClaims}
          />
        </Space>
      </Card>

      <Card title={t("docsManual.authRequestExample")}>
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            {t("docsManual.authRequestDesc")}
          </Typography.Paragraph>
          <CodePanel language="http" code={authorizeExample} />
        </Space>
      </Card>

      <Card title={t("docsManual.tokenExchange")}>
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            {t("docsManual.tokenExchangeDesc")}
          </Typography.Paragraph>
          <Alert
            type="info"
            showIcon
            message={t("docsManual.clientAuth.title")}
            description={t("docsManual.clientAuth.desc")}
          />
          <CodePanel language="http" code={tokenExample} />
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            {t("docsManual.tokenBasicDesc")}
          </Typography.Paragraph>
          <CodePanel language="http" code={tokenBasicExample} />
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            {t("docsManual.tokenResponseDesc")}
          </Typography.Paragraph>
          <CodePanel language="json" code={tokenResponseExample} />
        </Space>
      </Card>

      <Card title={t("docsManual.refreshToken.title")}>
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            {t("docsManual.refreshToken.desc")}
          </Typography.Paragraph>
          <CodePanel language="http" code={refreshExample} />
          {refreshTokenNotes.map((item) => (
            <Typography.Paragraph key={item} style={{ marginBottom: 0 }}>
              {item}
            </Typography.Paragraph>
          ))}
        </Space>
      </Card>

      <Card title={t("docsManual.userinfoExampleTitle")}>
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            {t("docsManual.userinfoExampleDesc")}
          </Typography.Paragraph>
          <CodePanel language="http" code={userInfoExample} />
        </Space>
      </Card>

      <Card title={t("docsManual.curlExamples.title")}>
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            {t("docsManual.curlExamples.desc")}
          </Typography.Paragraph>
          <Typography.Text strong>{t("docsManual.curlExamples.token")}</Typography.Text>
          <CodePanel language="bash" code={tokenCurlExample} />
          <Typography.Text strong>{t("docsManual.curlExamples.refresh")}</Typography.Text>
          <CodePanel language="bash" code={refreshCurlExample} />
          <Typography.Text strong>{t("docsManual.curlExamples.userinfo")}</Typography.Text>
          <CodePanel language="bash" code={userInfoCurlExample} />
          <Typography.Text strong>
            {t("docsManual.curlExamples.introspection")}
          </Typography.Text>
          <CodePanel language="bash" code={introspectionCurlExample} />
          <Typography.Text strong>{t("docsManual.curlExamples.revocation")}</Typography.Text>
          <CodePanel language="bash" code={revocationCurlExample} />
        </Space>
      </Card>

      <Card title={t("docsManual.redirectRules.title")}>
        <Space direction="vertical" size={10} style={{ width: "100%" }}>
          {redirectRules.map((item) => (
            <Typography.Paragraph key={item} style={{ marginBottom: 0 }}>
              {item}
            </Typography.Paragraph>
          ))}
        </Space>
      </Card>

      <Card title={t("docsManual.logoutExample.title")}>
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            {t("docsManual.logoutExample.desc")}
          </Typography.Paragraph>
          <CodePanel language="http" code={logoutExample} />
        </Space>
      </Card>

      <Card title={t("docsManual.claimUsage.title")}>
        <Space direction="vertical" size={10} style={{ width: "100%" }}>
          {claimUsageGuidance.map((item) => (
            <Typography.Paragraph key={item} style={{ marginBottom: 0 }}>
              {item}
            </Typography.Paragraph>
          ))}
        </Space>
      </Card>

      <Card title={t("docsManual.idTokenChecklist.title")}>
        <Space direction="vertical" size={10} style={{ width: "100%" }}>
          {idTokenChecklist.map((item) => (
            <Typography.Paragraph key={item} style={{ marginBottom: 0 }}>
              {item}
            </Typography.Paragraph>
          ))}
        </Space>
      </Card>

      <Card title={t("docsManual.mapping.title")}>
        <Space direction="vertical" size={10} style={{ width: "100%" }}>
          {mappingGuidance.map((item) => (
            <Typography.Paragraph key={item} style={{ marginBottom: 0 }}>
              {item}
            </Typography.Paragraph>
          ))}
        </Space>
      </Card>

      <Card title={t("docsManual.accessControl.title")}>
        <Space direction="vertical" size={10} style={{ width: "100%" }}>
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            {t("docsManual.accessControl.desc")}
          </Typography.Paragraph>
          {accessControlBasics.map((item) => (
            <Typography.Paragraph key={item} style={{ marginBottom: 0 }}>
              {item}
            </Typography.Paragraph>
          ))}
        </Space>
      </Card>

      <Card title={t("docsManual.accessRestrictions.title")}>
        <Space direction="vertical" size={10} style={{ width: "100%" }}>
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            {t("docsManual.accessRestrictions.desc")}
          </Typography.Paragraph>
          {accessRestrictionBehavior.map((item) => (
            <Typography.Paragraph key={item} style={{ marginBottom: 0 }}>
              {item}
            </Typography.Paragraph>
          ))}
        </Space>
      </Card>

      <Card title={t("docsManual.denialHandling.title")}>
        <Space direction="vertical" size={10} style={{ width: "100%" }}>
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            {t("docsManual.denialHandling.desc")}
          </Typography.Paragraph>
          {denialHandling.map((item) => (
            <Typography.Paragraph key={item} style={{ marginBottom: 0 }}>
              {item}
            </Typography.Paragraph>
          ))}
        </Space>
      </Card>

      <Card title={t("docsManual.accountBinding.title")}>
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            {t("docsManual.accountBinding.desc")}
          </Typography.Paragraph>
          <Table
            pagination={false}
            scroll={{ x: 900 }}
            columns={[
              {
                title: t("docsManual.accountBinding.columns.field"),
                dataIndex: "field",
                width: 180,
                render: (value: string) => <Typography.Text code>{value}</Typography.Text>,
              },
              {
                title: t("docsManual.accountBinding.columns.recommendation"),
                dataIndex: "recommendation",
                width: 200,
              },
              {
                title: t("docsManual.accountBinding.columns.reason"),
                dataIndex: "reason",
              },
            ]}
            dataSource={(["sub", "email", "name", "phone"] as const).map((item) => ({
              key: item,
              field: t(`docsManual.accountBinding.rows.${item}.field`),
              recommendation: t(`docsManual.accountBinding.rows.${item}.recommendation`),
              reason: t(`docsManual.accountBinding.rows.${item}.reason`),
            }))}
          />
        </Space>
      </Card>

      <Card title={t("docsManual.accessBehavior.title")}>
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            {t("docsManual.accessBehavior.desc")}
          </Typography.Paragraph>
          <Table
            pagination={false}
            scroll={{ x: 900 }}
            columns={[
              {
                title: t("docsManual.accessBehavior.columns.scenario"),
                dataIndex: "scenario",
                width: 280,
              },
              {
                title: t("docsManual.accessBehavior.columns.behavior"),
                dataIndex: "behavior",
              },
            ]}
            dataSource={(["1", "2", "3", "4"] as const).map((item) => ({
              key: item,
              scenario: t(`docsManual.accessBehavior.rows.${item}.scenario`),
              behavior: t(`docsManual.accessBehavior.rows.${item}.behavior`),
            }))}
          />
        </Space>
      </Card>

      <Card title={t("docsManual.tokenInvalidation.title")}>
        <Space direction="vertical" size={10} style={{ width: "100%" }}>
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            {t("docsManual.tokenInvalidation.desc")}
          </Typography.Paragraph>
          {tokenInvalidation.map((item) => (
            <Typography.Paragraph key={item} style={{ marginBottom: 0 }}>
              {item}
            </Typography.Paragraph>
          ))}
        </Space>
      </Card>

      <Card title={t("docsManual.accessDeniedCallback.title")}>
        <Space direction="vertical" size={10} style={{ width: "100%" }}>
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            {t("docsManual.accessDeniedCallback.desc")}
          </Typography.Paragraph>
          <CodePanel language="http" code={accessDeniedCallbackExample} />
          {accessDeniedCallbackNotes.map((item) => (
            <Typography.Paragraph key={item} style={{ marginBottom: 0 }}>
              {item}
            </Typography.Paragraph>
          ))}
        </Space>
      </Card>

      <Card title={t("docsManual.accessBoundary.title")}>
        <Space direction="vertical" size={10} style={{ width: "100%" }}>
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            {t("docsManual.accessBoundary.desc")}
          </Typography.Paragraph>
          {accessBoundaryNotes.map((item) => (
            <Typography.Paragraph key={item} style={{ marginBottom: 0 }}>
              {item}
            </Typography.Paragraph>
          ))}
        </Space>
      </Card>

      <Card title={t("docsManual.resourceServer.title")}>
        <Space direction="vertical" size={10} style={{ width: "100%" }}>
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            {t("docsManual.resourceServer.desc")}
          </Typography.Paragraph>
          {resourceServerNotes.map((item) => (
            <Typography.Paragraph key={item} style={{ marginBottom: 0 }}>
              {item}
            </Typography.Paragraph>
          ))}
        </Space>
      </Card>

      <Card title={t("docsManual.troubleshooting.title")}>
        <Space direction="vertical" size={10} style={{ width: "100%" }}>
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            {t("docsManual.troubleshooting.desc")}
          </Typography.Paragraph>
          {troubleshootingNotes.map((item) => (
            <Typography.Paragraph key={item} style={{ marginBottom: 0 }}>
              {item}
            </Typography.Paragraph>
          ))}
        </Space>
      </Card>

      <Card title={t("docsManual.accountCenterStatus.title")}>
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            {t("docsManual.accountCenterStatus.desc")}
          </Typography.Paragraph>
          <Table
            pagination={false}
            scroll={{ x: 760 }}
            columns={[
              {
                title: t("docsManual.accountCenterStatus.columns.status"),
                dataIndex: "status",
                width: 180,
              },
              {
                title: t("docsManual.accountCenterStatus.columns.meaning"),
                dataIndex: "meaning",
              },
            ]}
            dataSource={(["normal", "restricted", "banned"] as const).map((item) => ({
              key: item,
              status: t(`docsManual.accountCenterStatus.rows.${item}.status`),
              meaning: t(`docsManual.accountCenterStatus.rows.${item}.meaning`),
            }))}
          />
        </Space>
      </Card>

      <Card title={t("docsManual.thirdPartyTemplates.title")}>
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            {t("docsManual.thirdPartyTemplates.desc")}
          </Typography.Paragraph>
          <div className="developer-docs-scroll">
            <Descriptions
              column={1}
              bordered
              size="small"
              className="developer-docs-descriptions"
            >
              {thirdPartyTemplates.map((item) => (
                <Descriptions.Item key={item.title} label={item.title}>
                  {item.body}
                </Descriptions.Item>
              ))}
            </Descriptions>
          </div>
        </Space>
      </Card>

      <Card title={t("docsManual.errors.title")}>
        <Table
          rowKey="code"
          pagination={false}
          scroll={{ x: 960 }}
          columns={[
            {
              title: t("docsManual.errors.columns.code"),
              dataIndex: "code",
              width: 220,
            },
            {
              title: t("docsManual.errors.columns.reason"),
              dataIndex: "reason",
            },
            {
              title: t("docsManual.errors.columns.action"),
              dataIndex: "action",
            },
          ]}
          dataSource={commonErrors}
        />
      </Card>

      <Card title={t("docsManual.launchChecklist.title")}>
        <Space direction="vertical" size={10} style={{ width: "100%" }}>
          {launchChecklist.map((item) => (
            <Typography.Paragraph key={item} style={{ marginBottom: 0 }}>
              {item}
            </Typography.Paragraph>
          ))}
        </Space>
      </Card>
    </Space>
  );
}
