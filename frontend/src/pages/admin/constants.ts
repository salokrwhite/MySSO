import type { AdminPageMeta, SettingsTab, SettingsTabKey, SystemSettings } from "./types";

export const defaultSettings: SystemSettings = {
  allow_user_registration: true,
  enable_phone_verification: true,
  site_name: "MySSO",
  site_name_en: "MySSO",
  site_browser_title: "",
  site_browser_title_en: "",
  site_logo_data_url: "",
  site_footer_text: "",
  site_icp_record_number: "",
  site_public_security_record_number: "",
  home_page_announcement_enabled: false,
  home_page_announcement_content: "",
  user_center_announcement_enabled: false,
  user_center_announcement_content: "",
  developer_announcement_enabled: false,
  developer_announcement_content: "",
  public_base_url: "",
  frontend_base_url: "",
  oidc_first_party_client_id: "",
  oidc_first_party_client_secret: "",
  oidc_first_party_client_secret_configured: false,
  oidc_first_party_scope: "",
  oidc_auto_approve_client_ids: "",
  oidc_auto_approve_redirect_hosts: "",
  smtp_host: "",
  smtp_port: "587",
  smtp_username: "",
  smtp_password: "",
  smtp_password_configured: false,
  smtp_from: "",
  smtp_force_ssl: false,
  smtp_verification_code_ttl_minutes: 10,
  smtp_verification_code_cooldown_seconds: 60,
  login_code_subject_template: "MySSO 登录验证码",
  login_code_body_template:
    "你好，\n\n你的登录验证码是 {{code}} ，{{minutes}} 分钟内有效。\n\n邮箱：{{email}}\n\n如果这不是你的操作，请忽略此邮件。",
  login_code_subject_template_en: "MySSO Login Verification Code",
  login_code_body_template_en:
    "Hello,\n\nYour login verification code is {{code}}. It is valid for {{minutes}} minutes.\n\nEmail: {{email}}\n\nIf this was not you, please ignore this email.",
  register_code_subject_template: "MySSO 注册验证码",
  register_code_body_template:
    "你好，\n\n你的注册验证码是 {{code}} ，{{minutes}} 分钟内有效。\n\n邮箱：{{email}}\n国家：{{country}}\n\n如果这不是你的操作，请忽略此邮件。",
  register_code_subject_template_en: "MySSO Registration Verification Code",
  register_code_body_template_en:
    "Hello,\n\nYour registration verification code is {{code}}. It is valid for {{minutes}} minutes.\n\nEmail: {{email}}\nCountry/Region: {{country}}\n\nIf this was not you, please ignore this email.",
  reset_password_code_subject_template: "MySSO 找回密码验证码",
  reset_password_code_body_template:
    "你好，\n\n你正在通过邮箱验证码重置 MySSO 账号密码，验证码是 {{code}} ，{{minutes}} 分钟内有效。\n\n邮箱：{{email}}\n\n如果这不是你的操作，请忽略此邮件。",
  reset_password_code_subject_template_en: "MySSO Password Reset Verification Code",
  reset_password_code_body_template_en:
    "Hello,\n\nYou are resetting the password for your MySSO account by email verification code. Your code is {{code}} and it is valid for {{minutes}} minutes.\n\nEmail: {{email}}\n\nIf this was not you, please ignore this email.",
  delete_account_code_subject_template: "MySSO 账号注销验证码",
  delete_account_code_body_template:
    "你好，\n\n你正在申请注销 MySSO 账号，验证码是 {{code}} ，{{minutes}} 分钟内有效。\n\n账号邮箱：{{email}}\n\n如果这不是你的操作，请立即检查账号安全。",
  delete_account_code_subject_template_en: "MySSO Account Deletion Verification Code",
  delete_account_code_body_template_en:
    "Hello,\n\nYou are requesting deletion of your MySSO account. Your verification code is {{code}} and it is valid for {{minutes}} minutes.\n\nAccount email: {{email}}\n\nIf this was not you, please review your account security immediately.",
  change_email_code_subject_template: "MySSO 邮箱变更验证码",
  change_email_code_body_template:
    "你好，\n\n你正在修改 MySSO 账号绑定邮箱，验证码是 {{code}} ，{{minutes}} 分钟内有效。\n\n新邮箱：{{email}}\n\n如果这不是你的操作，请忽略此邮件。",
  change_email_code_subject_template_en: "MySSO Email Change Verification Code",
  change_email_code_body_template_en:
    "Hello,\n\nYou are changing the email address bound to your MySSO account. Your verification code is {{code}} and it is valid for {{minutes}} minutes.\n\nNew email: {{email}}\n\nIf this was not you, please ignore this email.",
  sms_provider: "disabled",
  sms_template_provider: "disabled",
  sms_api_base: "http://api.smsbao.com/",
  sms_username: "",
  sms_password: "",
  sms_password_configured: false,
  sms_signature: "",
  sms_login_template: "【{{signature}}】你的登录验证码是 {{code}}，{{minutes}} 分钟内有效。",
  sms_register_template: "【{{signature}}】你的验证码是 {{code}}，{{minutes}} 分钟内有效。",
  sms_reset_password_template: "【{{signature}}】你正在重置密码，验证码是 {{code}}，{{minutes}} 分钟内有效。",
  sms_bind_phone_template: "【{{signature}}】你正在绑定手机号，验证码是 {{code}}，{{minutes}} 分钟内有效。",
  sms_delete_account_template: "【{{signature}}】你正在申请注销账号，验证码是 {{code}}，{{minutes}} 分钟内有效。",
  aliyun_sms_access_key_id: "",
  aliyun_sms_access_key_secret: "",
  aliyun_sms_access_key_secret_configured: false,
  aliyun_sms_endpoint: "dypnsapi.aliyuncs.com",
  aliyun_sms_region_id: "cn-hangzhou",
  aliyun_sms_sign_name: "",
  aliyun_sms_login_template_code: "",
  aliyun_sms_register_template_code: "",
  aliyun_sms_reset_template_code: "",
  aliyun_sms_bind_phone_template_code: "",
  aliyun_sms_delete_template_code: "",
  risk_control_enabled: false,
  risk_immediate_bind_probability: 50,
  risk_delayed_bind_probability: 50,
  risk_delayed_bind_login_count: 3,
  developer_managed_users_search_window_seconds: 10,
  developer_managed_users_search_limit: 5
};

export function getSettingsTabs(t: (key: string) => string): SettingsTab[] {
  return [
    { key: "site", label: t("站点信息") },
    { key: "session", label: t("用户会话") },
    { key: "verification", label: t("验证码") },
    { key: "intl", label: t("国际化支持") },
    { key: "sms", label: t("发信配置") },
    { key: "media", label: t("公告配置") },
    { key: "addons", label: t("风控管理") },
    { key: "rateLimit", label: t("限流管理") },
    { key: "email", label: t("邮件") },
    { key: "scope", label: t("Scope 设置") }
  ];
}

export function getSettingsTabMeta(t: (key: string) => string): Record<SettingsTabKey, AdminPageMeta> {
  return {
    site: { title: t("站点信息"), description: t("预留站点名称、域名和品牌信息配置。") },
    session: { title: t("用户会话"), description: t("预留登录会话、超时和单点登录策略配置。") },
    verification: { title: t("验证码"), description: t("管理验证码有效期和发送冷却时间。") },
    intl: { title: t("国际化支持"), description: t("配置邮箱验证码中英文模板，并按国家/地区自动选择发送语言。") },
    sms: { title: t("发信配置"), description: t("管理短信发信接口与模板配置，并预留阿里云等扩展能力。") },
    media: { title: t("公告配置"), description: t("分别配置用户中心和开发者后台的顶部公告，互不影响，可独立开启和编辑。") },
    addons: { title: t("风控管理"), description: t("管理中国大陆注册用户的手机号绑定风控策略与触发概率。") },
    rateLimit: { title: t("限流管理"), description: t("限制开发者后台高成本查询接口的短时间重复调用。") },
    email: { title: t("邮件"), description: t("管理 SMTP 连接、发件人和测试邮件。") },
    scope: { title: t("Scope 设置"), description: t("集中管理系统可用 scope、是否启用，以及开发者是否可在创建应用时直接申请。") }
  };
}

export function getAdminPageMeta(t: (key: string) => string) {
  return {
    dashboard: {
      title: t("首页仪表盘"),
      description: t("集中查看平台运行概览、关键审计和策略配置。")
    },
    users: {
      title: t("用户管理"),
      description: t("查看账号状态、角色和 MFA 开启情况，并执行冻结或解冻。")
    },
    apps: {
      title: t("应用管理"),
      description: t("集中处理应用审核，跟踪接入状态和审核意见。")
    },
    emailSendLogs: {
      title: t("邮件发信记录"),
      description: t("查看邮件发送时间、发信内容、目标邮箱和对应用户账号。")
    },
    phoneSendLogs: {
      title: t("手机号发信记录"),
      description: t("查看短信发送时间、发信内容、目标手机号和对应用户账号。")
    },
    auditLogs: {
      title: t("审计日志"),
      description: t("查看平台关键操作记录，支持勾选并批量删除历史审计日志。")
    },
    developerAccessLogs: {
      title: t("开发者访问日志"),
      description: t("查看开发者侧用户组、访问限制和封禁操作记录，支持管理员硬删除。")
    },
    riskLogs: {
      title: t("Passkey 数据"),
      description: ""
    },
    settings: {
      title: t("参数设置"),
      description: t("使用顶部同级标签管理不同系统子页面，邮件与验证码配置已可直接生效。")
    }
  } satisfies Record<"dashboard" | "users" | "apps" | "emailSendLogs" | "phoneSendLogs" | "auditLogs" | "developerAccessLogs" | "riskLogs" | "settings", AdminPageMeta>;
}
