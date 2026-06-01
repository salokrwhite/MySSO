CREATE TABLE `audit_logs` (
  `id` varchar(64) NOT NULL,
  `actor_id` varchar(64) NOT NULL,
  `actor_role` varchar(32) NOT NULL,
  `action` varchar(128) NOT NULL,
  `target_id` varchar(64) NOT NULL,
  `detail_json` json DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_audit_logs_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `authorization_codes` (
  `code` varchar(128) NOT NULL,
  `user_id` varchar(64) NOT NULL,
  `client_id` varchar(128) NOT NULL,
  `redirect_uri` varchar(512) NOT NULL,
  `scopes` text NOT NULL,
  `code_challenge` varchar(255) DEFAULT '',
  `code_challenge_method` varchar(32) DEFAULT '',
  `nonce` varchar(255) DEFAULT '',
  `state` varchar(255) DEFAULT '',
  `auth_time` datetime DEFAULT NULL,
  `acr` varchar(255) NOT NULL DEFAULT '',
  `expires_at` datetime NOT NULL,
  `used` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`code`),
  KEY `idx_authorization_codes_cleanup` (`expires_at`,`used`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `client_apps` (
  `id` varchar(64) NOT NULL,
  `owner_user_id` varchar(64) NOT NULL,
  `name` varchar(255) NOT NULL,
  `icon_url` varchar(255) NOT NULL DEFAULT '',
  `client_id` varchar(128) NOT NULL,
  `client_secret` varchar(255) NOT NULL,
  `description` text,
  `frontchannel_logout_uri` varchar(255) NOT NULL DEFAULT '',
  `allow_get_session_logout` tinyint(1) NOT NULL DEFAULT '0',
  `status` varchar(32) NOT NULL,
  `review_comment` varchar(255) DEFAULT '',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `client_id` (`client_id`),
  KEY `idx_client_apps_owner_user_id` (`owner_user_id`),
  KEY `idx_client_apps_status` (`status`),
  KEY `idx_client_apps_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `client_redirect_uris` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `app_id` varchar(64) NOT NULL,
  `uri_type` varchar(32) NOT NULL DEFAULT 'login',
  `uri` varchar(512) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_app_redirect_uri` (`app_id`,`uri_type`,`uri`),
  KEY `idx_client_redirect_uris_app_type` (`app_id`,`uri_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `client_scopes` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `app_id` varchar(64) NOT NULL,
  `scope` varchar(128) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_app_scope` (`app_id`,`scope`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `consents` (
  `id` varchar(64) NOT NULL,
  `user_id` varchar(64) NOT NULL,
  `client_id` varchar(128) NOT NULL,
  `scopes` text NOT NULL,
  `created_at` datetime NOT NULL,
  `revoked_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_consents_user_revoked_created_at` (`user_id`,`revoked_at`,`created_at`),
  KEY `idx_consents_client_id` (`client_id`),
  KEY `idx_consents_revoked_at` (`revoked_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `auth_challenges` (
  `token` varchar(64) NOT NULL,
  `challenge_type` varchar(64) NOT NULL,
  `user_id` varchar(64) NOT NULL DEFAULT '',
  `channel` varchar(32) NOT NULL DEFAULT '',
  `target` varchar(255) NOT NULL DEFAULT '',
  `acr` varchar(255) NOT NULL DEFAULT '',
  `payload_json` json DEFAULT NULL,
  `expires_at` datetime NOT NULL,
  `consumed_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`token`),
  KEY `idx_auth_challenges_type_expires` (`challenge_type`,`expires_at`),
  KEY `idx_auth_challenges_type_user` (`challenge_type`,`user_id`),
  KEY `idx_auth_challenges_user_id` (`user_id`),
  KEY `idx_auth_challenges_type_created` (`challenge_type`,`created_at`),
  KEY `idx_auth_challenges_consumed_at` (`consumed_at`),
  KEY `idx_auth_challenges_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `developer_groups` (
  `id` varchar(64) NOT NULL,
  `owner_user_id` varchar(64) NOT NULL,
  `name` varchar(128) NOT NULL,
  `description` varchar(500) NOT NULL DEFAULT '',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_developer_group_owner_name` (`owner_user_id`,`name`),
  KEY `idx_developer_groups_owner_user_id` (`owner_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `developer_group_members` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `group_id` varchar(64) NOT NULL,
  `user_id` varchar(64) NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_developer_group_member` (`group_id`,`user_id`),
  KEY `idx_developer_group_members_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `app_group_bindings` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `app_id` varchar(64) NOT NULL,
  `group_id` varchar(64) NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_app_group_binding` (`app_id`,`group_id`),
  KEY `idx_app_group_bindings_group_id` (`group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `app_user_access_states` (
  `app_id` varchar(64) NOT NULL,
  `user_id` varchar(64) NOT NULL,
  `access_version` int(11) NOT NULL DEFAULT '1',
  `ban_id` varchar(64) NOT NULL DEFAULT '',
  `ban_reason` varchar(500) NOT NULL DEFAULT '',
  `ban_expires_at` datetime DEFAULT NULL,
  `ban_created_at` datetime DEFAULT NULL,
  `ban_updated_at` datetime DEFAULT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`app_id`,`user_id`),
  KEY `idx_app_user_access_states_user_id` (`user_id`),
  KEY `idx_app_user_access_states_app_ban_updated_at` (`app_id`,`ban_updated_at`),
  KEY `idx_app_user_access_states_ban_expires_at` (`ban_expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `developer_access_logs` (
  `id` varchar(64) NOT NULL,
  `owner_user_id` varchar(64) NOT NULL,
  `actor_id` varchar(64) NOT NULL,
  `action` varchar(128) NOT NULL,
  `target_type` varchar(64) NOT NULL DEFAULT '',
  `target_id` varchar(64) NOT NULL DEFAULT '',
  `app_id` varchar(64) NOT NULL DEFAULT '',
  `user_id` varchar(64) NOT NULL DEFAULT '',
  `group_id` varchar(64) NOT NULL DEFAULT '',
  `detail_json` json DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_developer_access_logs_owner_created_at` (`owner_user_id`,`created_at`),
  KEY `idx_developer_access_logs_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `send_logs` (
  `id` varchar(64) NOT NULL,
  `channel` varchar(32) NOT NULL,
  `target` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `account_email` varchar(255) NOT NULL DEFAULT '',
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_send_logs_channel_created_at` (`channel`,`created_at`),
  KEY `idx_send_logs_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `verification_codes` (
  `id` varchar(64) NOT NULL,
  `channel` varchar(32) NOT NULL,
  `target` varchar(255) NOT NULL,
  `country` varchar(64) NOT NULL DEFAULT '',
  `purpose` varchar(32) NOT NULL,
  `code` varchar(16) NOT NULL,
  `expires_at` datetime NOT NULL,
  `consumed` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_verification_lookup` (`channel`,`target`,`purpose`,`code`,`consumed`,`expires_at`),
  KEY `idx_verification_latest` (`channel`,`target`,`purpose`,`created_at`),
  KEY `idx_verification_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `gateway_policies` (
  `id` varchar(64) NOT NULL,
  `name` varchar(255) NOT NULL,
  `path` varchar(255) NOT NULL,
  `method` varchar(16) NOT NULL,
  `scopes` text NOT NULL,
  `claims` text NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT '1',
  `description` text,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `passkey_usage_logs` (
  `id` varchar(64) NOT NULL,
  `user_id` varchar(64) NOT NULL,
  `passkey_id` varchar(64) NOT NULL,
  `credential_id` varchar(512) NOT NULL,
  `event_type` varchar(32) NOT NULL,
  `source_ip` varchar(64) NOT NULL DEFAULT '',
  `user_agent` text NOT NULL,
  `result` varchar(32) NOT NULL,
  `failure_reason` varchar(255) NOT NULL DEFAULT '',
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_passkey_usage_logs_user_id` (`user_id`),
  KEY `idx_passkey_usage_logs_passkey_id` (`passkey_id`),
  KEY `idx_passkey_usage_logs_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `passkeys` (
  `id` varchar(64) NOT NULL,
  `user_id` varchar(64) NOT NULL,
  `name` varchar(255) NOT NULL,
  `credential_id` varchar(512) NOT NULL,
  `credential_json` json NOT NULL,
  `sign_count` int(10) unsigned NOT NULL DEFAULT '0',
  `aaguid` varchar(64) NOT NULL DEFAULT '',
  `transports_json` json DEFAULT NULL,
  `last_used_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_passkeys_credential_id` (`credential_id`),
  KEY `idx_passkeys_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `refresh_tokens` (
  `token` varchar(255) NOT NULL,
  `user_id` varchar(64) NOT NULL,
  `client_id` varchar(128) NOT NULL,
  `scopes` text NOT NULL,
  `rotated_from_token` varchar(255) NOT NULL DEFAULT '',
  `replaced_by_token` varchar(255) NOT NULL DEFAULT '',
  `created_at` datetime DEFAULT NULL,
  `expires_at` datetime NOT NULL,
  `revoked` tinyint(1) NOT NULL DEFAULT '0',
  `revoked_at` datetime DEFAULT NULL,
  PRIMARY KEY (`token`),
  KEY `idx_refresh_tokens_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `scope_definitions` (
  `scope_key` varchar(128) NOT NULL,
  `display_name` varchar(128) NOT NULL,
  `description` text NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT '1',
  `developer_selectable` tinyint(1) NOT NULL DEFAULT '1',
  `is_system` tinyint(1) NOT NULL DEFAULT '0',
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`scope_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `sessions` (
  `token` varchar(255) NOT NULL,
  `user_id` varchar(64) NOT NULL,
  `role` varchar(32) NOT NULL,
  `authenticated_at` datetime DEFAULT NULL,
  `acr` varchar(255) NOT NULL DEFAULT '',
  `expires_at` datetime NOT NULL,
  PRIMARY KEY (`token`),
  KEY `idx_sessions_user_id` (`user_id`),
  KEY `idx_sessions_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `system_settings` (
  `setting_key` varchar(191) NOT NULL,
  `setting_value` text NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `user_operation_logs` (
  `id` varchar(64) NOT NULL,
  `user_id` varchar(64) NOT NULL,
  `action` varchar(128) NOT NULL,
  `target_id` varchar(64) NOT NULL DEFAULT '',
  `detail_json` json DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user_operation_logs_user_created_at` (`user_id`,`created_at`),
  KEY `idx_user_operation_logs_action` (`action`),
  KEY `idx_user_operation_logs_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `user_security_policies` (
  `user_id` varchar(64) NOT NULL,
  `force_phone_binding_next_login` tinyint(1) NOT NULL DEFAULT '0',
  `force_mfa_enrollment_next_login` tinyint(1) NOT NULL DEFAULT '0',
  `login_step_up_mode` varchar(32) NOT NULL DEFAULT 'none',
  `phone_binding_risk_mode` varchar(32) NOT NULL DEFAULT '',
  `phone_binding_risk_required` tinyint(1) NOT NULL DEFAULT '0',
  `phone_binding_risk_login_count` int(11) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`user_id`),
  KEY `idx_user_security_policies_updated_at` (`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `users` (
  `id` varchar(64) NOT NULL,
  `country` varchar(64) NOT NULL DEFAULT '',
  `gender` varchar(16) NOT NULL DEFAULT '',
  `preferred_locale` varchar(16) NOT NULL DEFAULT '',
  `email` varchar(255) NOT NULL,
  `phone` varchar(32) DEFAULT '',
  `display_name` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` varchar(32) NOT NULL,
  `status` varchar(32) NOT NULL,
  `freeze_reason` varchar(500) NOT NULL DEFAULT '',
  `mfa_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `mfa_method` varchar(32) NOT NULL DEFAULT '',
  `mfa_secret` varchar(255) DEFAULT '',
  `auth_version` int(11) NOT NULL DEFAULT '1',
  `last_login_at` datetime DEFAULT NULL,
  `last_device_ip` varchar(64) DEFAULT '',
  `deletion_requested_at` datetime DEFAULT NULL,
  `deletion_scheduled_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_users_phone` (`phone`),
  KEY `idx_users_role` (`role`),
  KEY `idx_users_status` (`status`),
  KEY `idx_users_created_at` (`created_at`),
  KEY `idx_users_deletion_scheduled_at` (`deletion_scheduled_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


INSERT INTO `scope_definitions` (`scope_key`, `display_name`, `description`, `enabled`, `developer_selectable`, `is_system`, `updated_at`) VALUES
('email', '邮箱资料', '允许读取账号邮箱地址。', 1, 1, 1, NOW()),
('gateway.read', '网关受保护资源读取', '允许访问系统里受 scope 保护的网关或 API 资源。', 1, 1, 1, NOW()),
('openid', '基础登录', '确认用户身份并建立 OIDC 登录会话。', 1, 1, 1, NOW()),
('phone', '手机号资料', '允许读取账号绑定手机号。', 1, 1, 1, NOW()),
('profile', '公开资料', '允许读取昵称、头像等公开资料。', 1, 1, 1, NOW()),
('role', '账号角色信息', '允许读取账号当前角色标识，例如 user、developer、admin。', 1, 1, 1, NOW());

INSERT INTO `gateway_policies` (`id`, `name`, `path`, `method`, `scopes`, `claims`, `enabled`, `description`, `updated_at`) VALUES
('0de83c9b-cc28-4e0a-8660-540489bc250a', 'Read Gateway Metrics', '/api/gateway/protected', 'GET', '[\"gateway.read\"]', '[\"sub\",\"scope\"]', 1, 'Demo protected route.', NOW());

INSERT INTO system_settings (setting_key, setting_value, updated_at)
VALUES
    ('login_code_subject_template_en', 'MySSO Login Verification Code', NOW()),
    ('login_code_body_template_en', 'Hello,\n\nYour login verification code is {{code}}. It is valid for {{minutes}} minutes.\n\nEmail: {{email}}\n\nIf this was not you, please ignore this email.', NOW()),
    ('register_code_subject_template_en', 'MySSO Registration Verification Code', NOW()),
    ('register_code_body_template_en', 'Hello,\n\nYour registration verification code is {{code}}. It is valid for {{minutes}} minutes.\n\nEmail: {{email}}\nCountry/Region: {{country}}\n\nIf this was not you, please ignore this email.', NOW()),
    ('reset_password_code_subject_template_en', 'MySSO Password Reset Verification Code', NOW()),
    ('reset_password_code_body_template_en', 'Hello,\n\nYou are resetting the password for your MySSO account by email verification code. Your code is {{code}} and it is valid for {{minutes}} minutes.\n\nEmail: {{email}}\n\nIf this was not you, please ignore this email.', NOW()),
    ('delete_account_code_subject_template_en', 'MySSO Account Deletion Verification Code', NOW()),
    ('delete_account_code_body_template_en', 'Hello,\n\nYou are requesting deletion of your MySSO account. Your verification code is {{code}} and it is valid for {{minutes}} minutes.\n\nAccount email: {{email}}\n\nIf this was not you, please review your account security immediately.', NOW()),
    ('change_email_code_subject_template', 'MySSO 邮箱变更验证码', NOW()),
    ('change_email_code_body_template', '你好，\n\n你正在修改 MySSO 账号绑定邮箱，验证码是 {{code}} ，{{minutes}} 分钟内有效。\n\n新邮箱：{{email}}\n\n如果这不是你的操作，请忽略此邮件。', NOW()),
    ('change_email_code_subject_template_en', 'MySSO Email Change Verification Code', NOW()),
    ('change_email_code_body_template_en', 'Hello,\n\nYou are changing the email address bound to your MySSO account. Your verification code is {{code}} and it is valid for {{minutes}} minutes.\n\nNew email: {{email}}\n\nIf this was not you, please ignore this email.', NOW())
ON DUPLICATE KEY UPDATE
    setting_value = VALUES(setting_value),
    updated_at = VALUES(updated_at);
