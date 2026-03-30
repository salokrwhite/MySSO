const enUS = {
  menu: {
    dashboard: "Dashboard",
    console: "Developer Console",
    userAccess: "User Access",
    auditLogs: "Audit Logs",
    analytics: "User Analytics",
    integration: "Integration Docs",
    docsManual: "Developer Manual",
    docsExamples: "Language Examples",
  },
  appLayout: {
    title: "Developer Portal",
    role: "Developer",
    languageModalTitle: "Switch Developer Portal Language",
    languageModalDesc: "Only developer portal languages are shown here.",
    languages: {
      zhCN: "Simplified Chinese",
      enUS: "English",
    },
  },
  pageMeta: {
    dashboard: {
      title: "Dashboard",
      description: "View integration overview, review progress, and recent activity.",
    },
    console: {
      title: "Developer Console",
      description:
        "Create and manage OIDC applications, maintain redirect URIs, scopes, and secrets.",
    },
    userAccess: {
      title: "User Access",
      description:
        "Group previously authorized users, configure which groups may access each app, and apply app-specific bans.",
    },
    auditLogs: {
      title: "Audit Logs",
      description:
        "Review integration events, approval updates, and operation traces in the developer portal.",
    },
    analytics: {
      title: "User Analytics",
      description:
        "Preview app activity, authorization quality, and user trends from a product perspective.",
    },
    docsManual: {
      title: "Developer Manual",
      description:
        "A ready-to-integrate OIDC/OAuth2 manual covering authorization, token exchange, userinfo, logout, error codes, and launch checklist.",
    },
    docsExamples: {
      title: "Language Examples",
      description:
        "Backend integration samples by language. Includes Go, C#, PHP, Java, Node.js, Python, Ruby, and Rust examples for authorization, callback error handling, id_token verification, and token lifecycle operations.",
    },
    docsExamplesGo: {
      title: "Language Examples - Go",
      description:
        "Go backend sample including authorization URL generation, callback error handling, token exchange, id_token verification, and token lifecycle operations.",
    },
    docsExamplesCsharp: {
      title: "Language Examples - C#",
      description:
        "C# / ASP.NET Core backend sample including authorization URL generation, callback error handling, token exchange, id_token verification, and token lifecycle operations.",
    },
    docsExamplesPHP: {
      title: "Language Examples - PHP",
      description:
        "PHP backend sample including authorization URL generation, callback error handling, token exchange, id_token verification, and token lifecycle operations.",
    },
    docsExamplesJava: {
      title: "Language Examples - Java",
      description:
        "Java backend sample including authorization URL generation, callback error handling, token exchange, id_token verification, and token lifecycle operations.",
    },
    docsExamplesNodejs: {
      title: "Language Examples - Node.js",
      description:
        "Node.js backend sample including authorization URL generation, callback error handling, token exchange, id_token verification, and token lifecycle operations.",
    },
    docsExamplesPython: {
      title: "Language Examples - Python",
      description:
        "Python backend sample including authorization URL generation, callback error handling, token exchange, id_token verification, and token lifecycle operations.",
    },
    docsExamplesRuby: {
      title: "Language Examples - Ruby",
      description:
        "Ruby / Rails backend sample including authorization URL generation, callback error handling, token exchange, id_token verification, and token lifecycle operations.",
    },
    docsExamplesRust: {
      title: "Language Examples - Rust",
      description:
        "Rust backend sample including authorization URL generation, callback error handling, token exchange, id_token verification, and token lifecycle operations.",
    },
  },
  common: {
    copy: "Copy",
    codeCopied: "Code copied",
    refresh: "Refresh",
    create: "Create",
    save: "Save",
    cancel: "Cancel",
    confirm: "Confirm",
    delete: "Delete",
    edit: "Edit",
    details: "View Details",
    loadingFailed: "Failed to load",
    createFailed: "Create failed",
    updateFailed: "Update failed",
    deleteFailed: "Delete failed",
    resetFailed: "Reset failed",
    batchDelete: "Batch Delete",
    clearIcon: "Clear icon",
    noData: "No data",
    unnamedTarget: "Unnamed object",
    submitForReview: "Submit for Review",
    saveAndResubmit: "Save and Resubmit",
    currentAvailableScopes: "Available scopes: {{scopes}}",
    displayName: "Display Name",
  },
  userAccess: {
    groupsTab: "Groups",
    usersTab: "Users",
    appsTab: "App Access",
    logsTab: "Access Logs",
    createGroup: "Create Group",
    editGroup: "Edit Group",
    groupName: "Group Name",
    groupDescription: "Description",
    members: "Members",
    boundApps: "Bound Apps",
    updateGroups: "Update Groups",
    appBindings: "Allowed groups for this app",
    saveBindings: "Save Access Rules",
    noGroupsBound: "If no groups are bound, the app stays open to all signed-in users by default.",
    banUser: "Ban User",
    unbanUser: "Unban User",
    banReason: "Ban Reason",
    banExpiresAt: "Expires At (optional)",
    maskedEmail: "Email",
    maskedPhone: "Masked Phone",
    lastAuthorizedAt: "Last Authorized At",
    groups: "Groups",
    authorizedApps: "Authorized Apps",
    currentBan: "Current Ban",
    accessLogDelete: "Delete Selected Logs",
    logDeleted: "Access logs deleted",
    authorizedAppsDetailTitle: "{{name}} Authorized Apps",
    authorizedAppsCount: "{{count}} app(s)",
    authorizedAppsShortCount: "{{count}} app(s)",
    deleteGroupConfirmTitle: "Delete group {{name}}?",
    filterAuthorizedApp: "Filter by authorized app",
    searchUserByEmail: "Search users by email",
    batchSetGroups: "Batch Set Groups",
    selectApp: "Select App",
    currentAppUsers: "Current App Users",
    banStatus: "Ban Status",
    normalStatus: "Normal",
    bannedStatus: "Banned",
    logAction: "Action",
    logTarget: "Target",
    logApp: "App",
    logUser: "User",
    logTime: "Time",
    banExpiresAtPlaceholder: "2026-04-30T12:00:00Z",
    batchSetGroupsDescription:
      "{{count}} user(s) selected. Saving will replace their groups with the selected set.",
    selectAtLeastOneGroup: "Please select at least one group",
  },
  status: {
    approved: "Approved",
    rejected: "Rejected",
    pending: "Pending",
  },
  console: {
    title: "My Apps",
    createApp: "Create App",
    editApp: "Edit App",
    appName: "App Name",
    icon: "App Icon",
    uploadIcon: "Upload Icon",
    iconHint: "Automatically center-crops to 64x64 and converts to webp",
    description: "Description",
    redirectUris: "Redirect URIs (one per line)",
    postLogoutUris: "Post Logout Redirect URIs (one per line)",
    frontchannelLogoutUri: "Front-Channel Logout URI",
    scopes: "Scopes",
    selectScopes: "Select scopes enabled by admins",
    nameRequired: "Please enter the app name",
    redirectRequired: "Please provide at least one redirect URI",
    scopesRequired: "Please select at least one scope",
    columns: {
      name: "Name",
      clientId: "Client ID",
      status: "Status",
      scopes: "Scopes",
      reviewComment: "Review Comment",
      actions: "Actions",
    },
    createSecret: "Create Secret",
    resetSecret: "Reset Secret",
    iconUploadFailed: "Failed to upload app icon",
    appUpdatedResubmitted: "App updated and resubmitted for review",
    appDeleted: "App deleted",
    appRefreshed: "App status refreshed",
    confirmDeleteTitle: "Delete this app?",
    confirmDeleteContent:
      'The app "{{name}}" cannot be recovered after deletion, and related authorization data will also be removed.',
    secretCreatedTitle: "Secret Created",
    secretUpdatedTitle: "Secret Updated",
    secretNotice:
      "Please save the new Client Secret immediately. It will not be shown again in plain text after this dialog closes.",
    secretSaveTitle: "Save Client Secret",
    newClientSecret: "New Client Secret",
    clientIdLabel: "Client ID",
    downloadSecretCsv: "Download CSV",
    copyClientSecret: "Copy Client Secret",
    secretAcknowledged: "I have saved the Client Secret",
    secretFooterHint:
      "After this window is closed, the system will not show this plain-text secret again.",
    noSecretReturned: "No new secret returned",
    secretCreated: "App secret created",
    secretReset: "App secret reset",
  },
  dashboard: {
    appCount: "Connected Apps",
    approvedCount: "Approved",
    pendingCount: "Pending Review",
    scopeCount: "Requested Scopes",
    overview: "Overview",
    progress: "Review Progress",
    currentFocus: "Current Focus",
    currentFocusDesc:
      "Keep redirect URIs, scope requests, and app descriptions complete. These directly affect review speed and integration stability.",
    recentActivity: "Recent Activity",
    noActivity: "No recent activity",
  },
  audit: {
    title: "Event Records",
    hint:
      "This page shows developer-friendly event summaries. Technical fields have been normalized and sanitized.",
    summaryReview: "Review Results",
    summaryReviewDesc: "Includes app approvals and rejections.",
    summarySecurity: "Security",
    summarySecurityDesc: "Includes secret creation, reset, and risk alerts.",
    summaryIntegration: "Integration Events",
    summaryIntegrationDesc: "Shows user authorization, token exchange, and logout.",
    columns: {
      event: "Event",
      target: "App / Target",
      summary: "Summary",
      time: "Time",
      details: "Details",
    },
    detailModalTitle: "{{title}} Details",
    eventLabel: "Event",
    categoryLabel: "Category",
    targetLabel: "Target",
    timeLabel: "Time",
    summaryLabel: "Summary",
    rawActionLabel: "Raw Action",
    technicalDetails: "Technical Details",
    batchDeleted: "Audit logs deleted",
    confirmBatchDeleteTitle: "Delete selected audit logs?",
    confirmBatchDeleteContent:
      "{{count}} log(s) selected. This action cannot be undone.",
    categories: {
      appManagement: "App Management",
      securityAction: "Security Action",
      reviewResult: "Review Result",
      integrationEvent: "Integration Event",
      securityAlert: "Security Alert",
      systemRecord: "System Record",
    },
    events: {
      createApp: "Created an app",
      updateApp: "Updated app settings",
      createSecret: "Created client secret",
      resetSecret: "Reset client secret",
      deleteApp: "Deleted an app",
      approveApp: "App approved",
      rejectApp: "App rejected",
      authorize: "User completed authorization",
      tokenRefresh: "Refreshed access token",
      tokenExchange: "Exchanged authorization code",
      logout: "User logged out",
      refreshTokenRisk: "Refresh token reuse detected",
      generic: "Recorded an event",
    },
    eventStatus: {
      pending: "Pending",
      submitted: "Submitted",
      done: "Done",
      deleted: "Deleted",
      approved: "Approved",
      rejected: "Rejected",
      success: "Success",
      complete: "Completed",
      attention: "Attention",
      recorded: "Recorded",
    },
    summaries: {
      createApp: 'Created app "{{target}}" and it is now waiting for review.',
      updateApp: 'Updated "{{target}}" and resubmitted it for review.',
      updateAppWithChanges:
        'Updated "{{target}}" and resubmitted it for review. Main changes: {{changes}}.',
      createSecret: 'Created a new Client Secret for "{{target}}".',
      resetSecret:
        'Reset the Client Secret for "{{target}}". Make sure your service has been updated.',
      deleteApp: 'App "{{target}}" has been deleted.',
      approveApp: 'The platform approved "{{target}}".',
      approveAppWithComment:
        'The platform approved "{{target}}". Review note: {{comment}}.',
      rejectApp:
        'The platform rejected "{{target}}". Please update it and submit again.',
      rejectAppWithComment:
        'The platform rejected "{{target}}". Reason: {{comment}}.',
      authorize: 'A user completed authorization for "{{target}}".',
      authorizeWithScopes:
        'A user completed authorization for "{{target}}". Granted scopes: {{scopes}}.',
      tokenRefresh:
        '"{{target}}" successfully refreshed its access token with a refresh token.',
      tokenExchange:
        '"{{target}}" successfully exchanged an authorization code for an access token.',
      logout: 'A user logged out from a session related to "{{target}}".',
      refreshTokenRisk:
        '"{{target}}" triggered a refresh token reuse risk check and the system already applied protection.',
      generic: 'The system recorded an event related to "{{target}}".',
      noDetails: "No additional details",
      hidden: "[hidden]",
      fieldUpdated: "{{field}} changed to {{value}}",
      fieldDefault: "field",
      updatedDefault: "updated",
    },
  },
  analytics: {
    successRate: "Authorization Success Rate",
    activeApps: "Active Integrated Apps",
    needsAttention: "Apps Needing Attention",
    successRateDesc:
      "The real ratio of authorization codes that were successfully exchanged for tokens.",
    activeAppsDesc:
      "The share of approved apps that have had real authorization activity recently.",
    needsAttentionDesc:
      "The share of apps that were rejected or have low authorization success rates.",
    appConversion: "App Conversion",
    explanation: "Explanation",
    explanation1:
      "This view shows real authorization data for apps under the current developer account, not mock data.",
    explanation2:
      'Success rate is calculated as "successful token exchanges / authorization confirmations", and active users are deduplicated users with real authorization or token activity.',
    explanation3:
      "Apps needing attention include rejected apps and apps with authorization success rates below 60%.",
    columns: {
      app: "App",
      status: "Status",
      authorizationCount: "Authorizations",
      tokenExchangeCount: "Token Exchanges",
      activeUserCount: "Active Users",
      successRate: "Success Rate",
    },
  },
  docsManual: {
    overview: "Integration Overview",
    overviewDesc:
      "This documentation is organized for direct integration. Once developers prepare app settings, redirect users for authorization, exchange tokens on the backend, and fetch user info, integration is complete.",
    copyMarkdown: "Copy as Markdown",
    copyMarkdownSuccess: "Developer manual Markdown copied",
    copyMarkdownFailed: "Failed to copy developer manual Markdown",
    browserLogoutEndpoint: "OIDC Browser Logout",
    apiLogoutEndpoint: "API Session Logout",
    logoutAlertTitle: "Logout Model",
    logoutAlertDesc:
      "Use /oauth2/logout for browser-based single logout. Use /api/auth/logout only when your frontend needs a JSON API to end the current local session. Both invalidate the current session's auth state, but only /oauth2/logout continues with front-channel logout and post-logout redirect handling. Local application logout should use POST, not a plain GET link that can be triggered cross-site.",
    shortestSteps: "Shortest Integration Path",
    logoutModel: "Logout Model",
    logoutDesc:
      "MySSO now uses one shared server-side invalidation flow for logout. The difference between endpoints is only the response shape and whether OIDC browser logout steps continue.",
    browserLogoutTitle: "OIDC Browser Logout",
    browserLogoutDesc:
      "Use this for browser single logout, front-channel logout notifications to connected apps, or post_logout_redirect_uri return flows. Endpoint: /oauth2/logout. For ordinary in-app logout, prefer POST. If you use OIDC GET logout, send standard protocol parameters such as id_token_hint instead of exposing it as a plain site logout link.",
    apiLogoutTitle: "API Session Logout",
    apiLogoutDesc:
      "Use this when your frontend ends the current signed-in session through Ajax or fetch and only needs a JSON result before doing local cleanup. Endpoint: /api/auth/logout. It does not run front-channel logout or browser redirects, and it should be called with a same-site POST request.",
    scopeMechanism: "Scope Mechanism",
    scopeAlert:
      "Developers cannot enter arbitrary scopes. They can only select scopes enabled by admins.",
    scopeDesc:
      "When creating or editing an app, make sure all scopes you plan to request are already selected. If the authorization request contains scopes outside the app configuration, the platform returns invalid_scope or scope not allowed.",
    scopeColumns: {
      scope: "Scope",
      displayName: "Display Name",
      description: "Description",
    },
    scopeDefinitions: {
      openid: {
        displayName: "Base Sign-In",
        description: "Confirms the user's identity and establishes the OIDC login session.",
      },
      profile: {
        displayName: "Public Profile",
        description: "Allows reading public profile fields such as display name and avatar.",
      },
      email: {
        displayName: "Email",
        description: "Allows reading the account email address.",
      },
      phone: {
        displayName: "Phone",
        description: "Allows reading the account's bound phone number.",
      },
      role: {
        displayName: "Account Role",
        description: "Allows reading the account's current role such as user, developer, or admin.",
      },
      "gateway.read": {
        displayName: "Protected Gateway Resource Access",
        description: "Allows access to gateway or API resources protected by this scope.",
      },
    },
    claimContract: "Claims Contract",
    claimAlertTitle: "Read this section before integrating third-party systems",
    claimAlertDesc:
      'Selecting a scope on the app only means "this app may request it". A claim appears in userinfo or id_token only when the authorization request actually includes that scope and the user grants it.',
    userinfoClaimsDesc:
      "userinfo currently returns the following claims. sub is always present and should be treated as the preferred stable binding key.",
    idTokenClaimsDesc:
      "id_token also carries a subset of claims so your backend can validate and map users without always making an extra userinfo call.",
    claimColumns: {
      claim: "Claim",
      scopeRequirement: "Scope Requirement",
      description: "Description",
      notes: "Notes",
    },
    claimSources: {
      always: "Always present",
    },
    claimDescriptions: {
      sub: "The stable and unique user identifier.",
      email: "The user's email address.",
      phone: "The user's bound phone number.",
      name: "The public display name, currently mapped from display_name.",
      role: "The current account role, such as user, developer, or admin.",
      idTokenSub:
        "The id_token subject identifier. It should match the sub in access_token / userinfo.",
      nonce: "The nonce from the authorization request, echoed back in id_token.",
      authTime: "The authentication timestamp for the current sign-in.",
      acr: "The authentication context class reference for the current login.",
    },
    claimNotes: {
      sub: "Best choice for a stable third-party binding key. Do not replace it with name.",
      email:
        "Returned only when the app allows email and the authorization request actually includes email.",
      phone: "Returned only when the user has a bound phone number.",
      name: "Not unique and can be changed by the user. Do not use it as a long-term stable key.",
      role: "Returned only when the role scope is granted.",
      idTokenSub:
        "Your backend should verify sub, iss, aud, exp, nonce, and other required OIDC claims.",
      nonce: "Must be checked by the relying party to mitigate replay attacks.",
      authTime: "Useful when your app needs to know how recently the user authenticated.",
      acr: "Represents authentication context, but should not be treated as the only permission signal.",
    },
    authRequestExample: "Authorization Request Example",
    authRequestDesc:
      "The example below shows the recommended authorization URL shape. In production, state, nonce, and PKCE values must be generated per request.",
    discovery: {
      title: "Discovery and Capabilities",
      desc:
        "If your third-party product supports OpenID Discovery, read /.well-known/openid-configuration directly. The key discovery fields below are listed here so you can match them against product settings one by one. scopes_supported follows the scopes currently enabled on the platform.",
    },
    tokenExchange: "Token Exchange",
    tokenExchangeDesc:
      "After your backend receives the code, immediately call /oauth2/token using application/x-www-form-urlencoded. The sample below shows the common authorization_code + client_secret + PKCE flow.",
    tokenBasicDesc:
      "If your OIDC client defaults to client_secret_basic, use the following pattern and place client_id:client_secret in the Authorization header.",
    clientAuth: {
      title: "Client Authentication Method",
      desc:
        "The platform currently supports both client_secret_post and client_secret_basic. The samples use client_secret_post by default, meaning client_id and client_secret are sent in the form body. If your product prefers Basic auth, follow the Discovery metadata and move credentials into the Authorization header. Run this step only on the backend and never expose client_secret to the browser.",
    },
    tokenResponseDesc:
      "The current token response includes the following fields. Use access_token or id_token depending on whether you still need to call userinfo.",
    refreshToken: {
      title: "Refresh Token Example",
      desc:
        "When you need a new access_token, call /oauth2/token again with grant_type=refresh_token. If the third-party product does not support refresh tokens, the authorization code flow alone is still valid.",
      notes: {
        "1": "1. The current implementation returns a new refresh_token on every refresh. Replace the previously stored one immediately.",
        "2": "2. Once a refresh_token has been rotated out, do not keep retrying it. Reusing an old token may trigger the server-side reuse protection.",
        "3": "3. If refresh token reuse is detected, the session for the user/client pair may be protectively invalidated and the user will need to sign in again.",
        "4": "4. Lifetime, revocation, and rotation of refresh_token are backend security concerns. Do not persist them in unsafe client-side storage.",
      },
    },
    userinfoExampleTitle: "UserInfo Example",
    userinfoExampleDesc:
      "When you call /oauth2/userinfo with the access_token, returned claims depend on the scopes that were actually requested and approved.",
    curlExamples: {
      title: "curl Debug Examples",
      desc:
        "These commands are useful during integration testing when you want to verify endpoint behavior quickly. Prefer injecting tokens through backend environment variables or temporary test values instead of committing real secrets into scripts.",
      token: "Exchange Authorization Code",
      refresh: "Refresh Token",
      userinfo: "Fetch UserInfo",
      introspection: "Check Access Token State",
      revocation: "Revoke Refresh Token",
    },
    redirectRules: {
      title: "Redirect Matching Rules",
      items: {
        "1": "1. Both redirect_uri and post_logout_redirect_uri must be preconfigured on the app and must match request parameters exactly. Scheme, host, port, path, and trailing slash all matter.",
        "2": "2. Avoid mixing similar production URLs such as /callback and /callback/. They are treated as different addresses.",
        "3": "3. If the third-party product supports multiple callback URLs, register every real callback URL in the app configuration instead of relying on fuzzy matching.",
      },
    },
    logoutExample: {
      title: "Browser Logout Example",
      desc:
        "For browser single logout, use /oauth2/logout with id_token_hint and post_logout_redirect_uri. For local in-app sign-out only, call your own POST logout flow or /api/auth/logout.",
    },
    claimUsage: {
      title: "Guidance for phone / role",
      items: {
        "1": "1. phone is better used as a display or contact attribute, not as a unique binding key, because users may change phone numbers.",
        "2": "2. role is better treated as a session-time display or auxiliary authorization hint. Your real business authorization model should still live in the third-party system.",
        "3": "3. If your backend truly needs role-based decisions, re-evaluate role during login or token validation instead of persisting the first received value forever.",
        "4": "4. Both phone and role are optional claims. They appear only when the matching scope is allowed and actually requested, so absence does not automatically mean an integration failure.",
      },
    },
    idTokenChecklist: {
      title: "id_token Validation Checklist",
      items: {
        "1": "1. Always verify the signature before trusting any claim in id_token. Do not rely on Base64 decoding alone.",
        "2": "2. Verify iss against the platform Issuer so you do not accidentally trust a token minted by another system.",
        "3": "3. Verify aud contains your current client_id so you do not accept a token issued for another client.",
        "4": "4. Validate time-based claims such as exp, iat, and nbf, and account for reasonable server clock skew.",
        "5": "5. If the authorization request included nonce, verify the returned nonce value exactly.",
        "6": "6. If your business logic depends on recent sign-in, also verify auth_time. When using profile, email, or role claims, cross-check them against the granted scopes as well.",
      },
    },
    mapping: {
      title: "Third-Party Mapping Guidance",
      items: {
        "1": "1. Use sub as the primary unique user identifier whenever possible. It is stable and not user-editable.",
        "2": "2. If a third-party system requires a readable username, prefer email over name because it is usually more stable.",
        "3": "3. name maps to display_name and is suitable for display only, not for a durable unique binding key.",
      },
    },
    accessControl: {
      title: "User Groups and App Access Control",
      desc: "The platform now lets developers manage previously authorized users for their own business scenarios and apply those rules to specific apps without affecting global platform sign-in.",
      items: {
        "1": "1. User groups are reusable at the developer level. One group can be bound to multiple apps, so you do not need to rebuild the same audience per app.",
        "2": "2. Developers may only manage users who have already authorized at least one of their apps. They cannot search or edit arbitrary platform accounts.",
        "3": "3. Apps are open by default. Once at least one group is bound to an app, that app enters allowlist mode and only users matching any bound group may authorize it.",
        "4": "4. Use the User Access page to manage groups, batch-update user memberships, and bind allowed groups to each app.",
        "5": "5. App-level bans are scoped to a single app. They do not prevent the user from signing in to MySSO itself or from using apps owned by other developers.",
        "6": "6. The account center keeps historical authorization records, but if access becomes restricted or banned, the authorization detail page will display the current status, reason, and expiry time.",
      },
    },
    accessRestrictions: {
      title: "How Restrictions Take Effect",
      desc: "Treat these rules as part of the OAuth behavior itself, not as one-time UI configuration.",
      items: {
        "1": "1. Access rules affect first-time authorization, repeated authorization, prompt=none silent authorization, and consent-based auto-approval.",
        "2": "2. If a user is later removed from an allowed group or banned from the app, future authorization will be denied even if the user had already approved the app in the past.",
        "3": "3. After a rule change, existing refresh tokens for that app are revoked and prior access tokens also stop working because the per-user per-app access version changes.",
        "4": "4. Your integration must not assume that a previously successful authorization guarantees permanent automatic sign-in. Handle re-authorization, re-login, and withdrawn access explicitly.",
        "5": "5. If your resource server validates JWTs fully offline and never checks current state with the SSO platform, it cannot see the latest app-level bans or group changes. That is an architectural boundary you should plan for separately.",
      },
    },
    denialHandling: {
      title: "How to Handle Authorization Denials",
      desc: "When the authorization endpoint returns access_denied, treat it as an access policy rejection rather than a generic login failure whenever possible.",
      items: {
        "1": "1. If the current account is not in an allowed group, your UI should say something closer to “this account cannot access the app” instead of “login failed”.",
        "2": "2. If the current account is banned from the app, guide the user to contact that app's administrator or your own support flow.",
        "3": "3. In the callback handler, distinguish user-cancelled consent from platform-denied authorization so your logs and alerts stay meaningful.",
        "4": "4. Preserve the original error, error_description, state, and callback timestamp so you can later tell access policy issues from bans or normal OAuth parameter problems.",
      },
    },
    accountBinding: {
      title: "Account Binding Key Guidance",
      desc: "If your system needs a durable binding between MySSO accounts and local accounts, decide the key early and keep it stable.",
      columns: {
        field: "Field",
        recommendation: "Recommendation",
        reason: "Notes",
      },
      rows: {
        sub: {
          field: "sub",
          recommendation: "Strongly recommended",
          reason: "Stable, unique, and not user-editable. This is the best long-term SSO binding key.",
        },
        email: {
          field: "email",
          recommendation: "Readable secondary field",
          reason: "Good for display or fallback matching, but it should not replace sub as the canonical binding key.",
        },
        name: {
          field: "name / display_name",
          recommendation: "Display only",
          reason: "It may change and may not be unique, so it is not suitable as a durable primary key.",
        },
        phone: {
          field: "phone",
          recommendation: "Use carefully",
          reason: "Phone numbers can change and are better treated as contact data than as a long-term account binding key.",
        },
      },
    },
    accessBehavior: {
      title: "Behavior Before and After Access Control",
      desc: "This table gives integrators a quick mental model of how authorization behavior changes once user groups or app bans are enabled.",
      columns: {
        scenario: "Scenario",
        behavior: "Platform Behavior",
      },
      rows: {
        "1": {
          scenario: "The app has no bound user groups",
          behavior: "Any signed-in user who satisfies normal OAuth requirements may authorize the app.",
        },
        "2": {
          scenario: "The app has one or more bound user groups",
          behavior: "Only users belonging to any bound group may authorize the app. Others are denied.",
        },
        "3": {
          scenario: "The user had authorized the app before but was later removed from allowed groups",
          behavior: "Historical consent remains as a record, but it no longer auto-approves access. Future entry is denied.",
        },
        "4": {
          scenario: "The user is banned from the app",
          behavior: "Authorization for the current app is denied immediately, without affecting platform sign-in or other developers' apps.",
        },
      },
    },
    tokenInvalidation: {
      title: "Token Behavior After Access Changes",
      desc: "If your system caches access_token or refresh_token values, you should expect them to stop working immediately after some access control changes.",
      items: {
        "1": "1. When a user is removed from an allowed group or banned from the app, existing refresh tokens for that app stop working immediately.",
        "2": "2. Older access tokens also stop working because the per-user per-app access version changes, so your resource side must handle 401 and re-authorization cleanly.",
        "3": "3. If the user is later unbanned or added back to an allowed group, old tokens are not restored. A fresh authorization flow is required.",
        "4": "4. Do not assume an access token will remain usable until exp if app-level access control is enabled. Access withdrawal may happen earlier than natural expiration.",
      },
    },
    accessDeniedCallback: {
      title: "access_denied Callback Example",
      desc: "When the platform rejects authorization because of app access control, the callback usually carries a standard OAuth error instead of a successful code.",
      items: {
        "1": "1. In your backend callback handler, check for the error parameter first. If it exists, do not continue into the code exchange path.",
        "2": "2. Keep state validation even on failure callbacks so you can still confirm the response belongs to the original login initiation.",
        "3": "3. In user-facing messaging, distinguish user-cancelled authorization from platform-denied authorization so both users and operators can understand the cause quickly.",
      },
    },
    accessBoundary: {
      title: "Token and UserInfo Boundaries on Denial",
      desc: "App access control takes effect during the authorization stage, so denial behavior is different from a successful sign-in flow.",
      items: {
        "1": "1. When the authorization request is denied, the platform normally does not issue a new authorization code, so no new access_token or id_token can be exchanged.",
        "2": "2. Without a new access_token, your integration should not expect a fresh userinfo response either.",
        "3": "3. If you receive access_denied, the correct action is usually to show the user a clear message, log the event, and stop the current login flow instead of retrying token or userinfo endpoints.",
      },
    },
    resourceServer: {
      title: "Resource Server Guidance",
      desc: "If your system has its own resource server or backend APIs, you also need a plan for how those services react after app access control changes.",
      items: {
        "1": "1. For higher-security scenarios, let your resource side combine backend session checks, current-state lookups, or introspection instead of trusting only the frontend's signed-in state.",
        "2": "2. If your resource server validates JWTs fully offline, it cannot immediately learn that a user was removed from an allowed group or banned from the app unless you add an online state check.",
        "3": "3. When the resource side receives 401 or detects token invalidation, redirect users into a fresh authorization flow instead of endlessly retrying old tokens.",
        "4": "4. Do not implement app access control as a frontend-only route guard. Final access decisions still belong on the backend or resource server.",
      },
    },
    troubleshooting: {
      title: "Audit and Troubleshooting Guidance",
      desc: "When a developer says “the user had authorized before, but now cannot enter”, this is a practical troubleshooting order.",
      items: {
        "1": "1. Start with the User Access page and confirm whether the app is bound to groups and whether the user still belongs to any allowed group.",
        "2": "2. Then check whether the user has an active ban record for that app, including the reason, effective time, and expiry time.",
        "3": "3. If you need to know who changed groups, app bindings, or bans, look at the developer access logs first and then cross-check admin logs when deeper audit tracing is required.",
        "4": "4. For user-side visibility, also inspect the account center authorization detail because it directly shows Normal, Restricted, or Banned together with the reason.",
      },
    },
    accountCenterStatus: {
      title: "What Users See in the Account Center",
      desc: "When users open authorization details for an app in their account center, the visible status now reflects app-level access control.",
      columns: {
        status: "Status",
        meaning: "Meaning",
      },
      rows: {
        normal: {
          status: "Normal",
          meaning: "The authorization record is active and the user still satisfies the app's current access rules.",
        },
        restricted: {
          status: "Restricted",
          meaning: "The historical authorization remains visible, but the user no longer satisfies the app's allowed-group rules.",
        },
        banned: {
          status: "Banned",
          meaning: "The developer applied an app-specific ban. The detail page shows the reason, effective time, and expiry time when available.",
        },
      },
    },
    thirdPartyTemplates: {
      title: "Third-Party Integration Templates",
      desc:
        "These are not protocol requirements. They are practical default mappings for common third-party products and can be used as starting templates.",
      items: {
        openlist: {
          title: "OpenList",
          body:
            "Recommended scopes are openid email profile. Prefer sub as the unique identifier. If the product UI only accepts a username field, email is the next-best fallback. Do not use name as the long-term binding key.",
        },
        grafana: {
          title: "Grafana",
          body:
            "Request at least openid email profile and let Grafana map login identity from email or sub. If you sync role, treat it as a login-time mapping hint rather than a replacement for Grafana's own org/team permission model.",
        },
        authentik: {
          title: "Authentik / Generic OIDC Broker",
          body:
            "Read Discovery and JWKS directly and keep the configuration standards-based. sub should remain the primary key, while email, name, phone, and role should be synchronized only as additional profile attributes.",
        },
      },
    },
    errors: {
      title: "Common Errors and Troubleshooting",
      columns: {
        code: "Error / Symptom",
        reason: "Common Cause",
        action: "Recommended Action",
      },
      items: {
        "1": {
          code: "invalid_scope / scope not allowed",
          reason:
            "The authorization request includes scopes that are not selected on the app or not enabled by admins.",
          action:
            "Select the required scopes in the developer console and verify that the authorization request really includes them.",
        },
        "2": {
          code: "redirect_uri mismatch",
          reason:
            "The redirect_uri in the authorization request does not exactly match the app allowlist.",
          action:
            "Compare protocol, host, port, path, trailing slash, and case sensitivity character by character.",
        },
        "3": {
          code: "post_logout_redirect_uri mismatch",
          reason:
            "The logout redirect is not in the configured post-logout allowlist.",
          action:
            "Add the exact post-logout redirect URI used by your application to the app configuration.",
        },
        "4": {
          code: "cannot get username from OIDC provider",
          reason:
            "The third-party system expects a claim that is missing from userinfo. Common causes are missing requested scopes or empty source profile fields.",
          action:
            "Check the app scopes, the actual requested scopes, and the final userinfo payload returned by the provider.",
        },
        "5": {
          code: "token expired / invalid token",
          reason:
            "The access token expired, was revoked, or the underlying authentication state is no longer valid.",
          action:
            "Start a new authorization flow or refresh the token before calling protected endpoints again.",
        },
        "6": {
          code: "invalid code / authorization code expired or used",
          reason:
            "The authorization code is invalid, expired, or has already been consumed once.",
          action:
            "Restart the full authorization flow and make sure the code is exchanged only once on the backend.",
        },
        "7": {
          code: "authorization request mismatch / pkce verification failed",
          reason:
            "The redirect_uri, client_id, or code_verifier used during token exchange does not match the original authorization request.",
          action:
            "Compare redirect_uri, client_id, and PKCE values end to end, especially that the original code_verifier is preserved correctly.",
        },
        "8": {
          code: "invalid refresh token / refresh token expired / revoked",
          reason:
            "The refresh token does not exist, has expired, was revoked, or belongs to a different client.",
          action:
            "Stop retrying the old token, ask the user to sign in again if needed, and confirm that your client stores the newest refresh token returned after each refresh.",
        },
        "9": {
          code: "refresh token reuse detected",
          reason:
            "An already rotated refresh token was used again and triggered the server-side replay protection.",
          action:
            "Treat the session as untrusted, clear local tokens, and require the user to complete a fresh sign-in flow.",
        },
        "10": {
          code: "openid scope is required / unsupported code_challenge_method",
          reason:
            "The authorization request omitted openid, or PKCE uses a method not supported by the platform.",
          action:
            "Ensure the requested scopes include openid and keep code_challenge_method fixed to S256.",
        },
        "10a": {
          code: "access_denied / current account cannot access this app",
          reason:
            "The user no longer matches the groups bound to the app, or the developer removed the user from the allowed audience.",
          action:
            "Review the app bindings in the User Access page and confirm that the user still belongs to at least one bound group.",
        },
        "10b": {
          code: "access_denied / current account is banned from this app",
          reason:
            "The developer applied an app-specific ban to this user. This only affects the current app, not platform sign-in or other developers' apps.",
          action:
            "Check the app's ban records, reason, and expiry time. If allowed by your process, lift the ban and start a fresh authorization flow.",
        },
        "11": {
          code: "consent_required / login_required",
          reason:
            "The request used prompt=none, max_age, or similar parameters, but the current session or consent state does not allow silent authorization.",
          action:
            "Fall back to an interactive sign-in and consent flow so the user can complete the required step explicitly.",
        },
        "12": {
          code: "invalid max_age / acr_values_not_satisfied",
          reason:
            "The max_age parameter is invalid, or the requested authentication context does not match the current session.",
          action:
            "Make sure max_age is a non-negative integer and that requested acr_values align with the platform's actual authentication context.",
        },
      },
    },
    launchChecklist: {
      title: "Launch Checklist",
      items: {
        "1": "1. Confirm that production redirect_uri and post_logout_redirect_uri values are fully configured on the app.",
        "2": "2. Confirm that every authorization request carries state, nonce, and PKCE, and that your backend verifies them.",
        "3": "3. Confirm the unique user identifier used by the third-party system before launch to avoid rebinding problems later.",
        "4": "4. Confirm that the app has every scope it will actually request, not just openid.",
        "5": "5. Confirm that local logout and OIDC browser logout are handled separately and that you do not expose plain GET logout links.",
        "6": "6. Confirm that failure handling covers token exchange errors, missing userinfo claims, insufficient scopes, app-level access restrictions, app bans, and callback mismatch scenarios.",
      },
    },
    steps: {
      "1": "1. Create an app in the developer console, save the client_id, and configure accurate redirect URIs.",
      "2": "2. Select the scopes your app really needs. openid is required at minimum.",
      "3":
        "3. Redirect the browser to the authorization endpoint with state, nonce, and PKCE parameters.",
      "4":
        "4. After the user signs in and approves access, MySSO redirects back to your redirect_uri with a code.",
      "5":
        "5. Your backend receives the code and immediately calls /oauth2/token to exchange it for tokens.",
      "6":
        "6. Verify state, nonce, and the id_token signature and claims on the backend.",
      "7":
        "7. If you need user profile data, call /oauth2/userinfo with the access_token.",
      "8":
        "8. After integration works, wire /oauth2/logout for browser single logout and /api/auth/logout for API session logout; use POST for local sign-out, avoid plain GET logout links, then finish error handling and production domain setup.",
    },
  },
  docsExamples: {
    navTitle: "Language Example Navigation",
    navDesc:
      "Go, C#, PHP, Java, Node.js, Python, Ruby, and Rust backend integration samples are currently provided. Each sample includes authorization URL generation, callback error handling, code exchange, id_token verification, userinfo, refresh token, introspection, revocation, and browser logout examples.",
    navHint:
      "Open the target language page from the left menu, copy the sample into your backend project, and replace client_id, client_secret, and redirect_uri to start testing.",
    authorizeTitle: "Build Authorization URL",
    callbackErrorTitle: "Handle Callback Errors",
    tokenTitle: "Exchange Token",
    verifyIdTokenTitle: "Verify id_token",
    userinfoTitle: "Fetch UserInfo",
    refreshTitle: "Refresh Token",
    introspectTitle: "Introspect Token",
    revokeTitle: "Revoke Token",
    logoutTitle: "Build Browser Logout URL",
    notesTitle: "Integration Notes",
    notes: {
      backendOnly:
        "1. Keep client_secret, code exchange, refresh token handling, and id_token verification on the backend. Do not move them into the browser.",
      verifyIdToken:
        "2. After receiving tokens, validate the id_token signature, iss, aud, exp, and nonce against Discovery/JWKS before creating a local session.",
      useSub:
        "3. If the third-party system needs a stable unique key, prefer sub. email is a better display or compatibility field, and name should not be used as the unique identifier.",
      handleAccessDenied:
        "4. Treat callback errors such as access_denied as first-class outcomes. They may indicate user cancellation, app audience mismatch, or an app-specific ban rather than a generic login failure.",
      planForRevocation:
        "5. Be prepared for app-level access changes. Refresh tokens can be revoked and previously issued access tokens may become unusable after the developer changes groups or bans a user.",
    },
    pages: {
      go: {
        title: "Go Integration Example",
        desc:
          "Suitable for Go backends handling OAuth/OIDC callbacks and exchanging tokens server-side.",
      },
      csharp: {
        title: "C# Integration Example",
        desc:
          "Suitable for ASP.NET Core or other .NET backends handling OAuth/OIDC callbacks and maintaining local sessions server-side.",
      },
      php: {
        title: "PHP Integration Example",
        desc:
          "Suitable for PHP backends receiving authorization callbacks and exchanging codes for tokens.",
      },
      java: {
        title: "Java Integration Example",
        desc:
          "Suitable for Java backends, including Spring Boot and traditional Servlet applications.",
      },
      nodejs: {
        title: "Node.js Integration Example",
        desc:
          "Suitable for Node.js backends handling OAuth callbacks in Express, NestJS, or plain runtimes.",
      },
      python: {
        title: "Python Integration Example",
        desc:
          "Suitable for Python backends such as Flask, Django, or FastAPI.",
      },
      ruby: {
        title: "Ruby Integration Example",
        desc:
          "Suitable for Ruby backends such as Rails, Sinatra, or other Rack-based applications handling OAuth/OIDC callbacks server-side.",
      },
      rust: {
        title: "Rust Integration Example",
        desc:
          "Suitable for Rust backends such as Axum, Actix Web, or other async services handling OAuth/OIDC callbacks and token validation server-side.",
      },
    },
  },
};

export default enUS;
