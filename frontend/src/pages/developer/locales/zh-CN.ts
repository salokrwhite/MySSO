const zhCN = {
  menu: {
    dashboard: "首页仪表盘",
    console: "开发者控制台",
    userAccess: "用户分组与访问",
    auditLogs: "审计日志",
    analytics: "用户分析",
    integration: "对接文档",
    docsManual: "开发手册",
    docsExamples: "语言示例",
  },
  appLayout: {
    title: "开发者后台",
    role: "开发者",
    languageModalTitle: "切换开发者后台语言",
    languageModalDesc: "这里只切换开发者后台可用的语言。",
    languages: {
      zhCN: "简体中文",
      enUS: "English",
    },
  },
  pageMeta: {
    dashboard: {
      title: "首页仪表盘",
      description: "查看开发者接入概览、审核进度和最近动态。",
    },
    console: {
      title: "开发者控制台",
      description: "创建和管理 OIDC 应用，维护回调地址、Scope 与密钥。",
    },
    userAccess: {
      title: "用户分组与访问",
      description: "将已授权用户归类到用户组，为应用配置允许访问的用户范围，并按应用执行封禁。",
    },
    auditLogs: {
      title: "审计日志",
      description: "查看当前开发者后台的接入事件、审核动态和操作轨迹。",
    },
    analytics: {
      title: "用户分析",
      description: "以产品化视角预览应用活跃度、授权质量和用户趋势。",
    },
    docsManual: {
      title: "开发手册",
      description:
        "提供可直接联调的完整 OIDC/OAuth2 接入手册，覆盖授权、换 token、userinfo、登出、错误码和上线清单。",
    },
    docsExamples: {
      title: "语言示例",
      description:
        "按语言提供后端对接参考代码目录。当前包含 Go、C#、PHP、Java、Node.js、Python、Ruby、Rust 八套正式示例，覆盖授权地址生成、回调错误处理、换 token、id_token 校验和 token 生命周期操作。",
    },
    docsExamplesGo: {
      title: "语言示例 - Go",
      description: "Go 后端对接示例，包含授权地址生成、回调错误处理、换 token、id_token 校验和 token 生命周期操作。",
    },
    docsExamplesCsharp: {
      title: "语言示例 - C#",
      description:
        "C# / ASP.NET Core 后端对接示例，包含授权地址生成、回调错误处理、换 token、id_token 校验和 token 生命周期操作。",
    },
    docsExamplesPHP: {
      title: "语言示例 - PHP",
      description: "PHP 后端对接示例，包含授权地址生成、回调错误处理、换 token、id_token 校验和 token 生命周期操作。",
    },
    docsExamplesJava: {
      title: "语言示例 - Java",
      description: "Java 后端对接示例，包含授权地址生成、回调错误处理、换 token、id_token 校验和 token 生命周期操作。",
    },
    docsExamplesNodejs: {
      title: "语言示例 - Node.js",
      description: "Node.js 后端对接示例，包含授权地址生成、回调错误处理、换 token、id_token 校验和 token 生命周期操作。",
    },
    docsExamplesPython: {
      title: "语言示例 - Python",
      description: "Python 后端对接示例，包含授权地址生成、回调错误处理、换 token、id_token 校验和 token 生命周期操作。",
    },
    docsExamplesRuby: {
      title: "语言示例 - Ruby",
      description:
        "Ruby / Rails 后端对接示例，包含授权地址生成、回调错误处理、换 token、id_token 校验和 token 生命周期操作。",
    },
    docsExamplesRust: {
      title: "语言示例 - Rust",
      description:
        "Rust 后端对接示例，包含授权地址生成、回调错误处理、换 token、id_token 校验和 token 生命周期操作。",
    },
  },
  common: {
    copy: "复制",
    codeCopied: "代码已复制",
    refresh: "刷新",
    create: "创建",
    save: "保存",
    cancel: "取消",
    confirm: "确认",
    delete: "删除",
    edit: "编辑",
    details: "查看详情",
    loadingFailed: "加载失败",
    createFailed: "创建失败",
    updateFailed: "更新失败",
    deleteFailed: "删除失败",
    resetFailed: "重置失败",
    batchDelete: "批量删除",
    clearIcon: "清除图标",
    noData: "暂无数据",
    unnamedTarget: "未命名对象",
    submitForReview: "提交审核",
    saveAndResubmit: "保存并重新提交审核",
    currentAvailableScopes: "当前可申请 scope：{{scopes}}",
    displayName: "昵称",
  },
  userAccess: {
    groupsTab: "用户组",
    usersTab: "用户",
    appsTab: "应用访问",
    logsTab: "访问日志",
    createGroup: "新建用户组",
    editGroup: "编辑用户组",
    groupName: "组名",
    groupDescription: "说明",
    members: "成员数",
    boundApps: "绑定应用数",
    updateGroups: "更新分组",
    appBindings: "应用允许访问的用户组",
    saveBindings: "保存访问范围",
    noGroupsBound: "未绑定任何用户组时，应用保持默认全放开。",
    banUser: "封禁用户",
    unbanUser: "解除封禁",
    banReason: "封禁原因",
    banExpiresAt: "过期时间（可选）",
    maskedEmail: "邮箱",
    maskedPhone: "脱敏手机号",
    lastAuthorizedAt: "最近授权时间",
    groups: "所属用户组",
    authorizedApps: "已授权应用",
    currentBan: "当前封禁",
    accessLogDelete: "删除选中日志",
    logDeleted: "访问日志已删除",
    authorizedAppsDetailTitle: "{{name}}的已授权应用",
    authorizedAppsCount: "共 {{count}} 个应用",
    authorizedAppsShortCount: "{{count}} 个应用",
    deleteGroupConfirmTitle: "删除用户组 {{name}}？",
    filterAuthorizedApp: "筛选授权应用",
    searchUserByEmail: "通过邮箱搜索用户",
    batchSetGroups: "批量设置用户组",
    selectApp: "选择应用",
    currentAppUsers: "当前应用用户",
    banStatus: "封禁状态",
    normalStatus: "正常",
    bannedStatus: "已封禁",
    logAction: "动作",
    logTarget: "目标",
    logApp: "应用",
    logUser: "用户",
    logTime: "时间",
    banExpiresAtPlaceholder: "2026-04-30T12:00:00Z",
    batchSetGroupsDescription:
      "已选择 {{count}} 个用户，保存后会将这些用户的分组设置为所选内容。",
    selectAtLeastOneGroup: "请至少选择一个用户组",
  },
  status: {
    approved: "已通过",
    rejected: "已驳回",
    pending: "待审核",
  },
  console: {
    title: "我的应用",
    createApp: "创建应用",
    editApp: "编辑应用",
    appName: "应用名称",
    icon: "站点图标",
    uploadIcon: "上传图标",
    iconHint: "将自动居中裁剪为 64x64 并转换为 webp",
    description: "描述",
    redirectUris: "回调地址（每行一个）",
    postLogoutUris: "退出后回跳地址（每行一个）",
    frontchannelLogoutUri: "Front-Channel Logout 地址",
    allowGetSessionLogout: "允许 GET 会话退出",
    allowGetSessionLogoutHint:
      "开启后，已登记的应用可通过 GET /oauth2/logout 发起浏览器会话退出，用于兼容 Cloudreve 等只支持跳转式退出的 OIDC 客户端。",
    scopes: "Scopes",
    selectScopes: "请选择管理员开放的 scope",
    nameRequired: "请输入应用名称",
    redirectRequired: "请至少填写一个回调地址",
    scopesRequired: "请至少选择一个 scope",
    columns: {
      name: "名称",
      clientId: "Client ID",
      status: "状态",
      scopes: "Scopes",
      reviewComment: "审核意见",
      actions: "操作",
    },
    createSecret: "创建密钥",
    resetSecret: "重置密钥",
    iconUploadFailed: "应用图标上传失败",
    appUpdatedResubmitted: "应用已更新并重新提交审核",
    appDeleted: "应用已删除",
    appRefreshed: "应用状态已刷新",
    confirmDeleteTitle: "确认删除应用？",
    confirmDeleteContent: "应用“{{name}}”删除后不可恢复，相关授权数据也会被清理。",
    secretCreatedTitle: "密钥已创建",
    secretUpdatedTitle: "密钥已更新",
    secretNotice:
      "请立即保存新的 Client Secret，关闭弹窗后页面不会再次明文展示。",
    secretSaveTitle: "保存 Client Secret",
    newClientSecret: "新的 Client Secret",
    clientIdLabel: "Client ID",
    downloadSecretCsv: "下载 CSV 文件",
    copyClientSecret: "复制 Client Secret",
    secretAcknowledged: "我已保存好 Client Secret",
    secretFooterHint: "关闭当前窗口后，系统不会再次展示这条明文密钥。",
    noSecretReturned: "未返回新的密钥",
    secretCreated: "应用密钥已创建",
    secretReset: "应用密钥已重置",
  },
  dashboard: {
    appCount: "接入应用数",
    approvedCount: "已审核通过",
    pendingCount: "待审核应用",
    scopeCount: "申请 Scope 数",
    overview: "接入概览",
    progress: "应用审核完成度",
    currentFocus: "当前开发重点",
    currentFocusDesc:
      "优先保证回调地址、Scope 申请和应用描述完整，这会直接影响管理员审核速度和联调稳定性。",
    recentActivity: "最近动态",
    noActivity: "暂无开发动态",
  },
  audit: {
    title: "事件记录",
    hint: "这里只展示开发者可理解的事件摘要，技术字段已做整理和脱敏处理。",
    summaryReview: "审核结果",
    summaryReviewDesc: "包含应用审核通过与驳回结果。",
    summarySecurity: "安全相关",
    summarySecurityDesc: "包含密钥创建、重置和风险告警。",
    summaryIntegration: "接入事件",
    summaryIntegrationDesc: "展示用户授权、换取令牌和退出登录。",
    columns: {
      event: "事件",
      target: "应用 / 对象",
      summary: "说明",
      time: "时间",
      details: "详情",
    },
    detailModalTitle: "{{title}}详情",
    eventLabel: "事件",
    categoryLabel: "分类",
    targetLabel: "对象",
    timeLabel: "时间",
    summaryLabel: "说明",
    rawActionLabel: "原始动作",
    technicalDetails: "技术详情",
    batchDeleted: "审计日志已删除",
    confirmBatchDeleteTitle: "确认删除选中的审计日志？",
    confirmBatchDeleteContent: "已选择 {{count}} 条日志，删除后不可恢复。",
    categories: {
      appManagement: "应用管理",
      securityAction: "安全操作",
      reviewResult: "审核结果",
      integrationEvent: "接入事件",
      securityAlert: "安全告警",
      systemRecord: "系统记录",
    },
    events: {
      createApp: "创建了应用",
      updateApp: "更新了应用配置",
      createSecret: "创建了客户端密钥",
      resetSecret: "重置了客户端密钥",
      deleteApp: "删除了应用",
      approveApp: "应用审核通过",
      rejectApp: "应用审核未通过",
      authorize: "用户完成授权",
      tokenRefresh: "刷新访问令牌",
      tokenExchange: "换取访问令牌",
      logout: "用户退出登录",
      refreshTokenRisk: "检测到令牌复用风险",
      generic: "记录了一条事件",
    },
    eventStatus: {
      pending: "待审核",
      submitted: "已提交",
      done: "已完成",
      deleted: "已删除",
      approved: "已通过",
      rejected: "未通过",
      success: "成功",
      complete: "完成",
      attention: "需关注",
      recorded: "已记录",
    },
    summaries: {
      createApp: "已创建应用“{{target}}”，当前等待平台审核。",
      updateApp: "已更新“{{target}}”配置，并重新提交审核。",
      updateAppWithChanges:
        "已更新“{{target}}”并重新提交审核，主要变更：{{changes}}。",
      createSecret: "已为“{{target}}”创建新的 Client Secret。",
      resetSecret:
        "已重置“{{target}}”的 Client Secret，请确认业务侧已同步更新。",
      deleteApp: "应用“{{target}}”已删除。",
      approveApp: "平台已通过“{{target}}”的审核。",
      approveAppWithComment: "平台已通过“{{target}}”的审核。审核说明：{{comment}}。",
      rejectApp:
        "平台未通过“{{target}}”的审核，请根据要求调整后重新提交。",
      rejectAppWithComment: "平台未通过“{{target}}”的审核。原因：{{comment}}。",
      authorize: "有用户已完成对“{{target}}”的授权。",
      authorizeWithScopes:
        "有用户已完成对“{{target}}”的授权，同意范围：{{scopes}}。",
      tokenRefresh: "“{{target}}”已成功使用刷新令牌续期访问令牌。",
      tokenExchange: "“{{target}}”已成功通过授权码换取访问令牌。",
      logout: "有用户已从“{{target}}”对应的登录会话退出。",
      refreshTokenRisk:
        "“{{target}}”检测到刷新令牌复用风险，系统已执行防护处理。",
      generic: "系统记录了与“{{target}}”相关的事件。",
      noDetails: "暂无补充说明",
      hidden: "[已隐藏]",
      fieldUpdated: "{{field}}改为{{value}}",
      fieldDefault: "字段",
      updatedDefault: "已更新",
    },
  },
  analytics: {
    successRate: "授权成功率",
    activeApps: "活跃接入应用",
    needsAttention: "待优化应用",
    successRateDesc: "授权码签发后成功换取 token 的真实比例",
    activeAppsDesc: "已审核通过应用中，最近有真实授权行为的占比",
    needsAttentionDesc: "未通过审核或授权成功率偏低的应用占比",
    appConversion: "应用转化观察",
    explanation: "分析说明",
    explanation1: "这里展示的是开发者当前名下应用的真实授权数据，不再是本地模拟值。",
    explanation2:
      "成功率按“授权成功换 token 次数 / 授权确认次数”计算，活跃用户按真实发生过授权或换 token 的去重用户数统计。",
    explanation3:
      "待优化应用占比会把未审核通过的应用，以及授权成功率低于 60% 的应用一起纳入统计。",
    columns: {
      app: "应用",
      status: "状态",
      authorizationCount: "授权次数",
      tokenExchangeCount: "换 Token 次数",
      activeUserCount: "活跃用户数",
      successRate: "成功率",
    },
  },
  docsManual: {
    overview: "接入总览",
    overviewDesc:
      "这套文档按“可直接联调”组织。开发者只要按下面的步骤准备应用信息、跳转授权、后端换 token，再读取用户资料，就可以完成对接。",
    copyMarkdown: "复制为 Markdown",
    copyMarkdownSuccess: "开发手册 Markdown 已复制",
    copyMarkdownFailed: "复制开发手册 Markdown 失败",
    browserLogoutEndpoint: "OIDC 浏览器退出",
    apiLogoutEndpoint: "API 会话退出",
    logoutAlertTitle: "退出模型说明",
    logoutAlertDesc:
      "浏览器单点退出请使用 /oauth2/logout；只需要让当前站点的前端会话结束时，可以调用 /api/auth/logout。两者都会使当前会话对应的认证状态失效，但只有 /oauth2/logout 会继续处理 front-channel logout 和退出后跳转。本地业务退出应使用 POST，不要把普通登出做成可被外部链接触发的 GET。",
    shortestSteps: "最短接入步骤",
    logoutModel: "退出模型",
    logoutDesc:
      "MySSO 现在把退出统一成一套服务端失效逻辑，不同入口只区分响应形态和是否继续执行 OIDC 浏览器退出流程。",
    browserLogoutTitle: "OIDC 浏览器退出",
    browserLogoutDesc:
      "适用于浏览器单点退出、需要通知已接入应用执行 front-channel logout，或需要根据 post_logout_redirect_uri 回跳业务站点的场景。入口：/oauth2/logout。普通浏览器会话退出请优先使用 POST；如果使用 OIDC GET logout，应带上标准参数（如 id_token_hint），不要把它当作站内普通登出链接。",
    apiLogoutTitle: "API 会话退出",
    apiLogoutDesc:
      "适用于前端 Ajax / fetch 主动结束当前登录态，只需要拿到 JSON 结果并自行清理本地状态的场景。入口：/api/auth/logout。不处理 front-channel logout，也不负责页面跳转。该接口应通过同站 POST 调用。",
    scopeMechanism: "Scope 机制",
    scopeAlert:
      "开发者不能自由输入 scope，只能从管理员已开放的 scope 列表中选择。",
    scopeDesc:
      "应用创建或编辑时，请确保后台已勾选你准备在授权请求中使用的全部 scope。授权时如果请求值超出应用已配置范围，会返回 invalid_scope 或 scope not allowed。",
    scopeColumns: {
      scope: "Scope",
      displayName: "显示名称",
      description: "说明",
    },
    scopeDefinitions: {
      openid: {
        displayName: "基础登录",
        description: "确认用户身份并建立 OIDC 登录会话。",
      },
      profile: {
        displayName: "公开资料",
        description: "允许读取昵称、头像等公开资料。",
      },
      email: {
        displayName: "邮箱资料",
        description: "允许读取账号邮箱地址。",
      },
      phone: {
        displayName: "手机号资料",
        description: "允许读取账号绑定手机号。",
      },
      role: {
        displayName: "账号角色信息",
        description: "允许读取账号当前角色标识，例如 user、developer、admin。",
      },
      "gateway.read": {
        displayName: "网关受保护资源读取",
        description: "允许访问系统里受 scope 保护的网关或 API 资源。",
      },
    },
    claimContract: "Claims 契约",
    claimAlertTitle: "对接第三方时请优先阅读这一节",
    claimAlertDesc:
      "应用里勾选某个 scope 只表示“允许申请”；只有授权请求里实际带上该 scope，对应字段才会出现在 userinfo 或 id_token 里。",
    userinfoClaimsDesc:
      "userinfo 返回字段如下。sub 始终存在，推荐第三方系统优先把它当作唯一绑定标识。",
    idTokenClaimsDesc:
      "id_token 里也会带回一部分 claims，便于后端在不额外请求 userinfo 的情况下完成基础校验和映射。",
    claimColumns: {
      claim: "Claim",
      scopeRequirement: "Scope 要求",
      description: "说明",
      notes: "注意事项",
    },
    claimSources: {
      always: "始终返回",
    },
    claimDescriptions: {
      sub: "用户唯一且稳定的账号 ID。",
      email: "用户邮箱地址。",
      phone: "用户绑定手机号。",
      name: "用户公开显示名，当前映射到 display_name。",
      role: "账号当前角色，例如 user、developer、admin。",
      idTokenSub: "id_token 主体标识，应与 access_token / userinfo 里的 sub 对齐。",
      nonce: "授权请求里带入的 nonce，会原样回传到 id_token。",
      authTime: "本次认证时间戳。",
      acr: "本次认证上下文级别标识。",
    },
    claimNotes: {
      sub: "适合做第三方系统唯一主键，不建议用 name 代替。",
      email: "必须同时满足：应用已配置 email，且授权请求里实际带上 email。",
      phone: "仅在用户确实绑定手机号时才有值。",
      name: "不是唯一值，而且用户可自行修改；不要拿它做稳定主键。",
      role: "仅在申请了 role scope 时返回。",
      idTokenSub: "建议后端校验 sub、iss、aud、exp、nonce 等标准 claims。",
      nonce: "用于抵御回放攻击，必须由业务侧校验。",
      authTime: "适用于需要感知用户最近认证时间的场景。",
      acr: "当前会保留认证上下文，但第三方不应把它当作唯一权限依据。",
    },
    authRequestExample: "授权请求示例",
    authRequestDesc:
      "下面是推荐的授权地址格式。生产环境请把 state、nonce、PKCE 参数都改成每次请求动态生成的随机值。",
    discovery: {
      title: "Discovery 与能力说明",
      desc:
        "第三方如支持 OpenID Discovery，可直接读取 /.well-known/openid-configuration。下面列出当前最关键的发现项，方便和第三方产品配置页逐项对照；其中 scopes_supported 会随当前已启用的 scopes 动态变化。",
    },
    tokenExchange: "Token 交换",
    tokenExchangeDesc:
      "后端收到 code 后，立即以 x-www-form-urlencoded 方式调用 /oauth2/token。下面示例展示 authorization_code + client_secret + PKCE 的常见组合。",
    tokenBasicDesc:
      "如果第三方 OIDC 客户端默认使用 client_secret_basic，可以按下面的写法把 client_id:client_secret 放进 Authorization 头。",
    clientAuth: {
      title: "客户端认证方式",
      desc:
        "当前平台支持 client_secret_post 和 client_secret_basic。文档示例默认使用 client_secret_post，也就是在表单体里传 client_id / client_secret；如第三方产品偏好 Basic 认证，也可以按 Discovery 声明改用 Authorization 头。请确保这一步只在服务端执行，不要把 client_secret 暴露给浏览器。",
    },
    tokenResponseDesc:
      "当前 token 响应会返回以下字段。你可以根据 access_token 或 id_token 决定是否继续调用 userinfo。",
    refreshToken: {
      title: "Refresh Token 示例",
      desc:
        "需要续期 access_token 时，可继续调用 /oauth2/token，并把 grant_type 改成 refresh_token。若第三方系统不支持 refresh token，也可以只实现授权码模式。",
      notes: {
        "1": "1. 当前实现会在每次刷新后返回新的 refresh_token，业务侧应立即替换本地保存的旧值。",
        "2": "2. 旧 refresh_token 被轮换后不应继续重试使用，否则可能触发服务端的 reuse 风险保护。",
        "3": "3. 一旦检测到 refresh token reuse，当前用户和客户端组合下的续期能力可能会被保护性失效，需要重新发起登录授权。",
        "4": "4. refresh_token 的生命周期、撤销和轮换都属于服务端安全逻辑，前端不应自行缓存到不安全的位置。",
      },
    },
    userinfoExampleTitle: "UserInfo 示例",
    userinfoExampleDesc:
      "使用 access_token 调用 /oauth2/userinfo 后，返回字段取决于授权请求里真正批准的 scopes。",
    curlExamples: {
      title: "curl 调试示例",
      desc:
        "下面几条命令适合联调阶段快速验证接口是否按预期返回。建议始终用服务端环境变量或临时测试值注入 token，不要把正式密钥写进脚本仓库。",
      token: "授权码换 Token",
      refresh: "刷新 Token",
      userinfo: "读取 UserInfo",
      introspection: "检查 Access Token 状态",
      revocation: "撤销 Refresh Token",
    },
    redirectRules: {
      title: "回调地址匹配规则",
      items: {
        "1": "1. redirect_uri 与 post_logout_redirect_uri 都必须预先写入应用配置，并与请求参数精确匹配；协议、域名、端口、路径和尾斜杠都会参与校验。",
        "2": "2. 不建议在生产环境里混用多个近似地址，例如同时存在 /callback 和 /callback/，这类差异会被视为不同地址。",
        "3": "3. 如果第三方产品支持多个回调地址，请把每一个实际会用到的地址都加入应用配置，而不是依赖模糊匹配。",
      },
    },
    logoutExample: {
      title: "浏览器退出示例",
      desc:
        "浏览器单点退出可使用 /oauth2/logout，并带上 id_token_hint 与 post_logout_redirect_uri。只做站内本地退出时，请走你自己的 POST 登出接口或 /api/auth/logout。",
    },
    claimUsage: {
      title: "phone / role 使用建议",
      items: {
        "1": "1. phone 更适合作为展示信息或补充联系资料，不建议把它当作唯一主键，因为用户可能更换手机号。",
        "2": "2. role 更适合作为会话期展示或辅助授权提示；真正的业务鉴权仍建议由第三方自己的权限系统负责，不要只信任前端展示的 role 字段。",
        "3": "3. 如果第三方确实要根据 role 做后端鉴权，请在每次登录或 token 校验时重新读取并校验，而不是把第一次拿到的 role 长期固化。",
        "4": "4. phone、role 都属于可选 claims，只有在对应 scope 被允许且实际请求时才会返回，缺失并不表示接口异常。",
      },
    },
    idTokenChecklist: {
      title: "id_token 校验清单",
      items: {
        "1": "1. 必须先校验签名，再信任 id_token 里的 claims；不要只做 Base64 解码。",
        "2": "2. 校验 iss 是否等于当前平台的 Issuer，避免把其他来源的 token 误当成本系统签发。",
        "3": "3. 校验 aud 是否包含当前 client_id，避免把发给别的客户端的 token 用在你自己的系统里。",
        "4": "4. 校验 exp / iat / nbf 等时间相关 claims，并考虑服务器时钟误差。",
        "5": "5. 如果授权请求里带了 nonce，必须校验 id_token 返回的 nonce 是否一致。",
        "6": "6. 如业务对最近登录时间敏感，可继续校验 auth_time；若使用 profile / email / role 等字段，也应把 claims 与 scopes 一起核对。",
      },
    },
    mapping: {
      title: "第三方字段映射建议",
      items: {
        "1": "1. 唯一用户标识优先使用 sub。它稳定且不可由用户自行修改，适合做 SSO 绑定主键。",
        "2": "2. 如果第三方系统必须使用可读用户名，优先考虑 email；它通常比 name 更稳定。",
        "3": "3. name 对应 display_name，仅适合展示，不适合做唯一标识或长期绑定键。",
      },
    },
    accessControl: {
      title: "用户组与应用访问控制",
      desc: "平台现在支持开发者按自己的业务场景管理已授权用户，并把访问规则作用到具体应用，而不是影响用户的整站登录。",
      items: {
        "1": "1. 用户组是开发者级复用能力。一个用户组可以绑定多个应用，不需要为每个应用单独重复建组。",
        "2": "2. 开发者只能管理“已经授权过自己任一应用”的用户，不能搜索或编辑全站任意账号。",
        "3": "3. 应用默认全放开；一旦某个应用绑定了至少一个用户组，就会进入白名单模式，只有命中任一绑定组的用户可以继续授权该应用。",
        "4": "4. 你可以在“用户分组与访问”页面里维护用户组、批量设置用户所属组，并给应用绑定允许访问的用户组。",
        "5": "5. 应用级封禁是单应用维度的，不会阻止用户登录 MySSO 本身，也不会影响该用户访问其他开发者的应用。",
        "6": "6. 用户中心会保留授权记录，但如果该应用被限制访问或封禁，详情页会展示对应状态、原因和过期时间。",
      },
    },
    accessRestrictions: {
      title: "访问限制生效规则",
      desc: "接入方需要把这些限制当作 OAuth 行为的一部分处理，而不是把它理解成一次性的页面配置。",
      items: {
        "1": "1. 访问规则会影响首次授权、再次授权、prompt=none 静默授权，以及基于已有 consent 的自动放行。",
        "2": "2. 如果用户后来被移出允许组，或者被应用封禁，即使他过去已经授权过该应用，后续也会被拒绝再次进入。",
        "3": "3. 规则变更后，该应用下已有 refresh_token 会被撤销，旧 access_token 也会因为用户-应用维度版本号变化而失效。",
        "4": "4. 接入系统不要假设“授权成功一次后永远可以自动登录”，应正确处理重新授权、重新登录和权限被收回的场景。",
        "5": "5. 如果你的资源服务器完全离线自校验 JWT，而不回到 SSO 校验当前访问状态，那么它看不到最新的应用级封禁和分组变化，这属于架构边界，需要你在系统设计里单独考虑。",
      },
    },
    denialHandling: {
      title: "授权被拒绝后的处理建议",
      desc: "当授权端点返回 access_denied 时，建议第三方系统把它当作“访问策略拒绝”来处理，而不是统一当成密码错误或系统异常。",
      items: {
        "1": "1. 如果当前账号不在允许访问组里，前端提示应更接近“当前账号无权访问该应用”，不要误导成“登录失败”。",
        "2": "2. 如果当前账号被应用封禁，建议提示用户联系该应用管理员，并展示你自己业务侧的申诉或帮助入口。",
        "3": "3. 后端回调处理要区分用户主动取消授权与平台拒绝授权，不要把两者混写成同一种错误日志。",
        "4": "4. 建议保留原始 error、error_description、state 和回调时间，方便后续排查是权限问题、封禁问题还是常规 OAuth 参数错误。",
      },
    },
    accountBinding: {
      title: "账号绑定主键建议",
      desc: "如果第三方需要把 MySSO 账号和本地账号做长期绑定，建议在项目一开始就确定主键字段，避免上线后再迁移绑定关系。",
      columns: {
        field: "字段",
        recommendation: "建议",
        reason: "说明",
      },
      rows: {
        sub: {
          field: "sub",
          recommendation: "强烈推荐",
          reason: "稳定、唯一、不可由用户自行修改，最适合作为 SSO 绑定主键。",
        },
        email: {
          field: "email",
          recommendation: "可读回填字段",
          reason: "适合展示或做辅助匹配，但不建议替代 sub 成为最终唯一绑定键。",
        },
        name: {
          field: "name / display_name",
          recommendation: "仅展示",
          reason: "可能重复，也可能变更，不适合做唯一主键。",
        },
        phone: {
          field: "phone",
          recommendation: "谨慎使用",
          reason: "手机号具有可变性，更适合作为联系方式或补充资料，而不是长期绑定主键。",
        },
      },
    },
    accessBehavior: {
      title: "访问控制开启前后行为对比",
      desc: "下面这张表可以帮助接入方快速理解启用用户组和应用封禁后的真实授权行为。",
      columns: {
        scenario: "场景",
        behavior: "系统行为",
      },
      rows: {
        "1": {
          scenario: "应用未绑定任何用户组",
          behavior: "所有已登录且满足常规 OAuth 条件的用户都可以授权该应用。",
        },
        "2": {
          scenario: "应用绑定了至少一个用户组",
          behavior: "只有属于任一绑定用户组的用户才可继续授权该应用，其余用户会被拒绝。",
        },
        "3": {
          scenario: "用户历史上授权过应用，但后来被移出允许组",
          behavior: "历史 consent 仍保留，但不再触发自动放行；再次进入时会被拒绝。",
        },
        "4": {
          scenario: "用户被该应用封禁",
          behavior: "当前应用授权直接拒绝，同时不影响用户登录 MySSO 或访问其他开发者的应用。",
        },
      },
    },
    tokenInvalidation: {
      title: "访问控制变更后的 Token 行为",
      desc: "如果你在业务系统里缓存了 access_token 或 refresh_token，需要明确知道这些凭证在访问策略变更后可能会立即失效。",
      items: {
        "1": "1. 当用户被移出允许组，或被当前应用封禁时，该应用下已有 refresh_token 会立即失效。",
        "2": "2. 旧 access_token 也会因为用户-应用维度版本号变化而失效，资源端应能正确处理 401 / 重新授权。",
        "3": "3. 解封或重新加入允许组后，不会恢复旧 token，正确做法是重新走授权流程获取新 token。",
        "4": "4. 不要假设 access_token 到 exp 之前一定一直可用；在启用了访问控制后，权限撤回会比自然过期更早发生。",
      },
    },
    accessDeniedCallback: {
      title: "access_denied 回调示例",
      desc: "当平台因为访问控制规则拒绝授权时，第三方回调通常会拿到 OAuth 标准错误，而不是成功的 code。",
      items: {
        "1": "1. 后端回调处理要优先判断是否携带 error 参数；有 error 时不要再继续执行 code 换 token。",
        "2": "2. 建议保留 state 校验逻辑，即使这是失败回调，也应确认请求和原始登录发起方一致。",
        "3": "3. 业务提示上要区分“用户自己取消授权”和“平台因访问策略拒绝授权”，这样用户和运维都更容易理解原因。",
      },
    },
    accessBoundary: {
      title: "访问被拒绝时的 token 与 userinfo 边界",
      desc: "应用访问控制是在授权阶段生效的，所以被拒绝时的结果与普通登录成功后的接口行为不同。",
      items: {
        "1": "1. 当授权请求被拒绝时，通常不会签发新的 authorization code，因此后续也无法正常换取新的 access_token 或 id_token。",
        "2": "2. 因为没有拿到新的 access_token，接入方也不应该再期待拿到新的 userinfo 返回体。",
        "3": "3. 如果你看到了 access_denied，正确处理方式通常是提示、记录并结束当前登录流程，而不是继续重试 userinfo 或 token 接口。",
      },
    },
    resourceServer: {
      title: "资源服务器联动建议",
      desc: "如果你的业务系统有自己的资源服务器或后端 API，访问控制生效后还需要考虑资源端如何感知权限变化。",
      items: {
        "1": "1. 对安全要求较高的业务，建议资源端结合服务端会话、后端状态检查或 introspection，而不是只信任前端是否显示“已登录”。",
        "2": "2. 如果资源端完全离线自校验 JWT，那么它无法立刻知道用户被移出允许组或被应用封禁，除非你额外做状态联查。",
        "3": "3. 一旦资源端收到 401 或检测到 token 已失效，应把用户引导回完整授权流程，而不是无限重试旧 token。",
        "4": "4. 不要把应用访问控制只做成前端路由守卫；真正的资源访问判断仍应放在后端或资源服务器上完成。",
      },
    },
    troubleshooting: {
      title: "审计与排障建议",
      desc: "当开发者反馈“用户明明授权过，但现在进不去”时，可以按下面的顺序排查。",
      items: {
        "1": "1. 先看“用户分组与访问”页面，确认应用是否绑定了用户组，以及该用户当前是否仍属于允许组。",
        "2": "2. 再看该应用下是否存在封禁记录，尤其确认封禁原因、开始时间和过期时间。",
        "3": "3. 如果要追踪是谁修改了组、绑定或封禁，优先查看开发者访问日志；如果涉及更高层审计，再到管理员日志核对。",
        "4": "4. 用户侧问题可再结合用户中心授权详情一起看，因为那里会直接展示“正常 / 已限制访问 / 已封禁”以及原因说明。",
      },
    },
    accountCenterStatus: {
      title: "用户中心展示状态",
      desc: "当用户在自己的用户中心查看某个应用的授权详情时，看到的状态会和访问控制规则联动。",
      columns: {
        status: "状态",
        meaning: "含义",
      },
      rows: {
        normal: {
          status: "正常",
          meaning: "当前授权记录有效，用户也仍然满足应用访问规则。",
        },
        restricted: {
          status: "已限制访问",
          meaning: "授权记录仍保留，但用户当前不再满足应用允许访问的用户组规则。",
        },
        banned: {
          status: "已封禁",
          meaning: "开发者对该用户执行了单应用封禁，详情页会展示原因、时间和过期时间。",
        },
      },
    },
    thirdPartyTemplates: {
      title: "第三方专项接入模板",
      desc:
        "下面这些不是协议硬要求，而是接第三方产品时最常见的字段映射建议，可以直接作为默认配置起点。",
      items: {
        openlist: {
          title: "OpenList",
          body:
            "推荐 scopes 使用 openid email profile；唯一标识优先用 sub，若第三方界面只能填用户名字段，可退而求其次用 email。不要用 name 作为唯一绑定键。",
        },
        grafana: {
          title: "Grafana",
          body:
            "推荐至少申请 openid email profile，并让 Grafana 使用 email 或 sub 做登录映射。若要同步角色，请把 role 当作登录期映射依据，不要替代 Grafana 自身组织/团队权限模型。",
        },
        authentik: {
          title: "Authentik / 通用 OIDC Broker",
          body:
            "推荐直接读取 Discovery 和 JWKS，优先使用 client_secret_basic 或 client_secret_post 的标准配置。claims 映射建议保持 sub 为主键，email/name/phone/role 作为补充属性同步。",
        },
      },
    },
    errors: {
      title: "常见错误与排查",
      columns: {
        code: "错误 / 现象",
        reason: "常见原因",
        action: "排查建议",
      },
      items: {
        "1": {
          code: "invalid_scope / scope not allowed",
          reason: "授权请求里的 scope 没有在应用配置里勾选，或管理员未开放该 scope。",
          action: "先到开发者控制台勾选对应 scope，再确认授权请求里真的带上了这些值。",
        },
        "2": {
          code: "redirect_uri mismatch",
          reason: "授权请求里的 redirect_uri 与应用配置白名单不完全一致。",
          action: "逐字符核对协议、域名、端口、路径、尾部斜杠和大小写。",
        },
        "3": {
          code: "post_logout_redirect_uri mismatch",
          reason: "退出回跳地址不在应用配置的 post logout 白名单中。",
          action: "把业务实际使用的退出回跳地址加入应用配置。",
        },
        "4": {
          code: "cannot get username from OIDC provider",
          reason: "第三方系统取的字段没有出现在 userinfo 中，常见于只配置了 scope 但授权请求未实际带上，或用户资料本身为空。",
          action: "检查应用 scope、实际授权请求 scope，以及 userinfo 返回的 claims。",
        },
        "5": {
          code: "token expired / invalid token",
          reason: "access_token 已过期、被撤销，或用户认证状态已失效。",
          action: "重新发起授权，或使用 refresh_token 刷新后再请求受保护接口。",
        },
        "6": {
          code: "invalid code / authorization code expired or used",
          reason: "授权码无效、已过期，或已经被消费过一次。",
          action: "重新发起完整授权流程，并确保 code 只在服务端交换一次。",
        },
        "7": {
          code: "authorization request mismatch / pkce verification failed",
          reason: "回调时传入的 redirect_uri、client_id、code_verifier 与最初授权请求不一致。",
          action: "核对 redirect_uri、client_id 和 PKCE 参数是否一一对应，尤其确认 code_verifier 没有丢失或被改写。",
        },
        "8": {
          code: "invalid refresh token / refresh token expired / revoked",
          reason: "刷新令牌不存在、已过期、已撤销，或拿错了客户端对应的 refresh token。",
          action: "停止重试旧 refresh token，改为让用户重新登录，或确认当前客户端使用的是最新一次刷新后返回的新 refresh token。",
        },
        "9": {
          code: "refresh token reuse detected",
          reason: "同一个已轮换的 refresh token 被重复使用，触发了服务端的防重放保护。",
          action: "视为会话已不可信，清理本地旧 token，并强制用户重新完成登录授权。",
        },
        "10": {
          code: "openid scope is required / unsupported code_challenge_method",
          reason: "授权请求缺少 openid，或 PKCE 使用了系统不支持的方法。",
          action: "确保 scope 至少包含 openid，并把 code_challenge_method 固定为 S256。",
        },
        "10a": {
          code: "access_denied / 当前账号无权访问该应用",
          reason: "用户没有命中该应用绑定的允许访问用户组，或开发者已经把该用户移出允许组。",
          action: "检查开发者后台“用户分组与访问”页面里该应用绑定的用户组，以及当前用户是否仍属于这些组之一。",
        },
        "10b": {
          code: "access_denied / 当前账号已被该应用封禁",
          reason: "开发者对该用户执行了单应用封禁。该限制只影响当前应用，不影响用户登录平台或访问其他应用。",
          action: "检查该应用下的封禁记录、封禁原因和过期时间；若业务允许，可由开发者解除封禁后再重新发起授权。",
        },
        "11": {
          code: "consent_required / login_required",
          reason: "请求使用了 prompt=none、max_age 等参数，但当前会话或授权状态不满足静默授权条件。",
          action: "改为正常交互式登录授权，或重新让用户显式完成登录和授权。",
        },
        "12": {
          code: "invalid max_age / acr_values_not_satisfied",
          reason: "max_age 参数非法，或请求的认证上下文级别与当前登录态不匹配。",
          action: "检查 max_age 是否为非负整数，并确认业务端请求的 acr_values 是否与平台实际登录能力一致。",
        },
      },
    },
    launchChecklist: {
      title: "上线前检查清单",
      items: {
        "1": "1. 确认生产环境 redirect_uri 与 post_logout_redirect_uri 都已经写入应用配置。",
        "2": "2. 确认授权请求始终携带 state、nonce 和 PKCE，并在后端完成对应校验。",
        "3": "3. 确认第三方系统使用的用户唯一标识字段已定稿，避免上线后再切换绑定主键。",
        "4": "4. 确认应用里已勾选实际会请求的全部 scopes，而不是只勾选 openid。",
        "5": "5. 确认登出链路区分本地会话退出与 OIDC 浏览器单点退出，不要混用裸 GET 登出链接。",
        "6": "6. 确认异常处理已覆盖 token 交换失败、userinfo 缺字段、scope 不足、应用级访问限制、用户封禁和回调地址不匹配等场景。",
      },
    },
    steps: {
      "1": "1. 在开发者控制台创建应用，保存 client_id，并配置准确的回调地址。",
      "2": "2. 在应用里勾选实际需要的 scopes，至少包含 openid。",
      "3":
        "3. 业务前端把浏览器 302 到授权端点，带上 state、nonce 和 PKCE 参数。",
      "4":
        "4. 用户登录并确认授权后，MySSO 会带着 code 回跳到你的 redirect_uri。",
      "5":
        "5. 业务后端收到 code 后，立即调用 /oauth2/token 换取 token。",
      "6":
        "6. 后端校验 state、nonce、id_token 签名和 claims。",
      "7":
        "7. 如需用户资料，再用 access_token 调 /oauth2/userinfo。",
      "8":
        "8. 联调完成后，再区分接入 /oauth2/logout（浏览器单点退出）和 /api/auth/logout（API 会话退出）；站内本地退出请使用 POST，不要用裸 GET logout 链接，并补齐异常处理和正式域名配置。",
    },
  },
  docsExamples: {
    navTitle: "语言示例导航",
    navDesc:
      "当前提供 Go、C#、PHP、Java、Node.js、Python、Ruby、Rust 八套服务端对接示例。每套示例都包含授权地址构造、回调错误处理、code 换 token、id_token 校验、userinfo、refresh token、introspection、revoke 和浏览器单点退出示例。",
    navHint:
      "请从左侧菜单进入对应语言页面，直接复制到你的服务端项目里再替换 client_id、client_secret、redirect_uri 即可联调。",
    authorizeTitle: "生成授权地址",
    callbackErrorTitle: "处理回调错误",
    tokenTitle: "换取 Token",
    verifyIdTokenTitle: "校验 id_token",
    userinfoTitle: "读取 UserInfo",
    refreshTitle: "刷新 Token",
    introspectTitle: "校验 Token 状态",
    revokeTitle: "撤销 Token",
    logoutTitle: "构造浏览器退出地址",
    notesTitle: "接入提醒",
    notes: {
      backendOnly:
        "1. client_secret、code 换 token、refresh token 和 id_token 校验都必须在服务端完成，不要放到浏览器。",
      verifyIdToken:
        "2. 换到 token 后，请用 Discovery/JWKS 校验 id_token 的签名、iss、aud、exp、nonce，再决定是否建立本地会话。",
      useSub:
        "3. 第三方系统如需要稳定唯一主键，请优先使用 sub；email 更适合作为展示或兼容字段，name 不适合作为唯一标识。",
      handleAccessDenied:
        "4. 请把 access_denied 这类回调错误当成正式业务分支处理。它可能表示用户取消授权、当前账号不在应用允许范围内，或已被应用封禁，而不只是普通登录失败。",
      planForRevocation:
        "5. 需要预留访问权限变化后的处理逻辑。开发者调整用户组或封禁用户后，refresh token 可能立即失效，已签发的 access token 也可能无法继续使用。",
    },
    pages: {
      go: {
        title: "Go 对接示例",
        desc: "适用于 Go 后端接 OAuth/OIDC 回调，并在服务端换取 token。",
      },
      csharp: {
        title: "C# 对接示例",
        desc:
          "适用于 ASP.NET Core 或其他 .NET 服务端应用接 OAuth/OIDC 回调，并在服务端维护本地会话。",
      },
      php: {
        title: "PHP 对接示例",
        desc: "适用于 PHP 后端接收授权回调，并在服务端完成 code 换 token。",
      },
      java: {
        title: "Java 对接示例",
        desc: "适用于 Java 后端服务端对接，常见于 Spring Boot 或传统 Servlet 应用。",
      },
      nodejs: {
        title: "Node.js 对接示例",
        desc:
          "适用于 Node.js 服务端接 OAuth 回调，Express、NestJS 或原生运行时都能直接参考。",
      },
      python: {
        title: "Python 对接示例",
        desc: "适用于 Python 服务端接入，Flask、Django、FastAPI 等框架都可以直接套这套流程。",
      },
      ruby: {
        title: "Ruby 对接示例",
        desc:
          "适用于 Ruby 服务端接入，Rails、Sinatra 或其他基于 Rack 的应用都可以按这套流程处理 OAuth/OIDC 回调。",
      },
      rust: {
        title: "Rust 对接示例",
        desc:
          "适用于 Rust 服务端接入，Axum、Actix Web 或其他异步服务都可以按这套流程处理 OAuth/OIDC 回调和 token 校验。",
      },
    },
  },
};

export default zhCN;
