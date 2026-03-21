const enUS = {
  menu: {
    dashboard: "Dashboard",
    console: "Developer Console",
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
        "Backend integration samples by language. Includes Go, PHP, Java, Node.js, and Python examples for authorization, token exchange, and userinfo.",
    },
    docsExamplesGo: {
      title: "Language Examples - Go",
      description:
        "Go backend sample including authorization URL generation, code exchange, and userinfo request.",
    },
    docsExamplesPHP: {
      title: "Language Examples - PHP",
      description:
        "PHP backend sample including authorization URL generation, code exchange, and userinfo request.",
    },
    docsExamplesJava: {
      title: "Language Examples - Java",
      description:
        "Java backend sample including authorization URL generation, code exchange, and userinfo request.",
    },
    docsExamplesNodejs: {
      title: "Language Examples - Node.js",
      description:
        "Node.js backend sample including authorization URL generation, code exchange, and userinfo request.",
    },
    docsExamplesPython: {
      title: "Language Examples - Python",
      description:
        "Python backend sample including authorization URL generation, code exchange, and userinfo request.",
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
      "Go, PHP, Java, Node.js, and Python backend integration samples are currently provided. Each sample includes authorization URL generation and code-to-token / userinfo calls.",
    navHint:
      "Open the target language page from the left menu, copy the sample into your backend project, and replace client_id, client_secret, and redirect_uri to start testing.",
    authorizeTitle: "Build Authorization URL",
    tokenTitle: "Exchange Token",
    pages: {
      go: {
        title: "Go Integration Example",
        desc:
          "Suitable for Go backends handling OAuth/OIDC callbacks and exchanging tokens server-side.",
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
    },
  },
};

export default enUS;
