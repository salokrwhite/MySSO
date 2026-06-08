const locale = {
  translation: {
    header: {
      language: "Language",
      languageModalTitle: "Choose Language",
      languageModalDesc: "Select the interface language you want to use.",
      agreement: "User Agreement",
      privacy: "Privacy Policy",
      help: "Help Center",
      logout: "Logout",
      accountCenter: "Account Center",
    },
    captcha: {
      securityVerification: "Security Verification",
      refresh: "Refresh",
      imageCaptcha: "Image CAPTCHA",
      imageCaptchaRequired: "Enter the image CAPTCHA",
    },
    legal: {
      back: "Back to Home",
      updatedAt: "Last updated: {{date}}",
      agreement: {
        title: "User Agreement",
        updatedAt: "2026-06-06",
        intro:
          "Welcome to {{siteName}}. Before registering, signing in, integrating, or using the unified identity services, please read this agreement carefully. By continuing to use the service, you agree to be bound by this agreement.",
        sections: {
          accountTitle: "1. Account and Sign-In",
          accountP1:
            "You must provide true, lawful, and reachable registration information and keep your account, password, verification codes, and other credentials properly protected. You are responsible for losses caused by poor credential management on your side.",
          accountP2:
            "If abnormal sign-in activity, policy violations, frozen status, or security risks are detected, the platform may require additional verification, restrict sign-in, or suspend access for safety reasons.",
          accountP3:
            "To protect user and developer accounts, the platform may perform risk checks during password sign-in, code sign-in, passkey sign-in, QR sign-in, phone binding, email changes, phone changes, password changes, MFA settings, account deletion, data export, and developer app management. Depending on the result, the platform may require additional verification, delay processing, restrict an operation, or block access.",
          acceptableUseTitle: "2. Acceptable Use",
          acceptableUseP1:
            "You must not use this system for any unlawful activity, rights infringement, abuse of authentication interfaces, mass requests, credential stuffing, or any behavior that threatens platform stability or bypasses security controls.",
          acceptableUseP2:
            "If you violate this agreement or related rules, the platform may suspend or terminate part or all of your access and reserves the right to pursue responsibility when necessary.",
          authorizationTitle: "3. Authorization and Third-Party Apps",
          authorizationP1:
            "When you use a {{siteName}} account to sign in to a third-party app, the system will ask for your consent based on the permissions shown on the authorization page. You may decline or revoke that consent at any time in the account center.",
          authorizationP2:
            "Any use of your data by a third-party app after authorization is governed by that app's own service terms and privacy policy. The platform will assume responsibility only within the scope required by law.",
          developerTitle: "4. Developer Integration",
          developerP1:
            "Developers must ensure that app information, redirect URIs, requested scopes, and business purposes are truthful, complete, and continuously valid, and must not mislead users.",
          developerP2:
            "The platform may review, reject, delist, delete, or restrict connected apps to maintain the security and integrity of the unified identity ecosystem.",
          liabilityTitle: "5. Service Changes and Limitation of Liability",
          liabilityP1:
            "For security, compliance, operations, or maintenance reasons, the platform may adjust, upgrade, suspend, or terminate certain interfaces, flows, or functions, and will try to provide notice when appropriate.",
          liabilityP2:
            "To the extent permitted by law, the platform is not liable beyond statutory obligations for interruptions, abnormal data, or losses caused by force majeure, network failures, third-party reasons, or improper use on your side.",
        },
      },
      privacy: {
        title: "Privacy Policy",
        updatedAt: "2026-06-06",
        intro:
          "{{siteName}} values your personal information and account security. This policy explains how we collect, use, store, share, and protect your information, as well as the rights available to you.",
        sections: {
          dataCollectionTitle: "1. Information We Collect",
          dataCollectionP1:
            "When you register, sign in, or use account services, we may collect your registration country, email address, phone number, password hash, sign-in sessions, device IP address, User-Agent, authorization records, and necessary security logs.",
          dataCollectionP2:
            "When you upload an avatar, change your profile, bind a phone number, enable MFA, or authorize a third-party app, we process the information you submit as needed to provide that function.",
          dataCollectionP3:
            "To identify account takeover, credential stuffing, abnormal devices, abnormal networks, automated requests, and high-risk operations, we may also collect or generate device fingerprints, device public-key identifiers, client type, device risk signals, failed sign-in reasons, verification-code results, IP region or regional risk labels, sign-in history, risk scores, risk levels, and actions taken. We do not collect contacts, SMS content, call records, photos, precise location, microphone content, or camera content for account risk-control purposes.",
          dataUsageTitle: "2. How We Use Information",
          dataUsageP1:
            "We use relevant information to provide account registration, sign-in authentication, verification code delivery, risk control, authorization confirmation, developer app review, account security notifications, and service reliability maintenance.",
          dataUsageP2:
            "We also analyze logs and statistics on a minimal-necessary basis to detect abnormal activity, improve product experience, and strengthen security.",
          dataUsageP3:
            "Risk-control information is primarily used to decide whether to allow sign-in or sensitive operations, require email or SMS step-up verification, require phone binding, trigger failed-attempt lockout, record risk events, or help administrators investigate security issues. Client-reported risk information is used only as an auxiliary signal and is not used by itself to lower security decisions.",
          dataSharingTitle: "3. Sharing and Disclosure",
          dataSharingP1:
            "We only provide identity information or permission-related data to third-party apps when you explicitly authorize the scopes shown on the authorization page.",
          dataSharingP2:
            "Except where required by law, regulatory requests, public interest protection, or system security needs, we do not sell or unlawfully share your personal information with unrelated third parties.",
          userRightsTitle: "4. Your Rights",
          userRightsP1:
            "You may review and update your profile, bindings, authorization records, and security settings in the account center, and you may revoke app consents or submit an account deletion request.",
          userRightsP2:
            "If you believe your information is inaccurate, processed improperly, or used beyond necessity, you may contact the platform operator or exercise your rights under applicable law.",
          securityTitle: "5. Protection and Retention",
          securityP1:
            "We use access controls, password hashing, verification-code expiration, audit logs, and data minimization measures to protect your personal information and authentication data.",
          securityP2:
            "Subject to legal and business requirements, we retain your information only as long as necessary to fulfill service purposes; after account deletion or expiration of retention periods, we will delete or anonymize the data according to policy.",
          securityP3:
            "Risk logs, sign-in history, device profiles, and failed-attempt records are retained for the period necessary for security auditing, dispute handling, attack investigation, and compliance. We reduce leakage and misuse risks through hashing, access controls, least privilege, and audit records.",
        },
      },
    },
    auth: {
      noAccount: "No account?",
      registerNow: "Register now",
      registerPageTitle: "Create Account",
      registerPageSubtitle:
        "Complete registration with your country, email, and email verification code.",
      registerDisabled: "Registration is currently disabled",
      registerSuccess:
        "Registration successful. Please sign in with your password.",
      phoneBindingRequiredAfterRegister:
        "Registration succeeded. Please bind your phone number to activate the account first.",
      registerFailed: "Registration failed",
      country: "Country",
      countryRequired: "Select a country",
      registerCode: "Email Code",
      registerCodeRequired: "Enter the email verification code",
      registerCodePlaceholder: "Enter the 6-digit code",
      sendRegisterCode: "Send Code",
      sendRegisterCodeSuccess:
        "The verification code has been sent. Please check your inbox.",
      sendRegisterCodeFailed: "Failed to send verification code",
      legalConsentPrefix: "I have read and agree to the",
      legalConsentAnd: "and",
      accountAgreement: "Account Terms of Use",
      accountPrivacyPolicy: "Account Privacy Policy",
      legalConsentRequired:
        "Please read and agree to the Account Terms of Use and Account Privacy Policy",
      backToLoginWithAccount: "Already have an account? Sign in",
      forgotPassword: "Forgot password?",
      forgotPasswordPageTitle: "Reset Password",
      forgotPasswordPageSubtitle:
        "Reset your sign-in password with your registered email and verification code.",
      forgotPasswordPrompt: "Forgot your password?",
      forgotPasswordAction: "Recover it",
      forgotPasswordDesc:
        "After verifying your email with a code, you can set a new sign-in password directly.",
      forgotPasswordHint:
        "Enter your registered email, the verification code, and a new password. You can sign in with the new password right away after submission.",
      goToOtpLogin: "Use Email Code Login",
      resetCode: "Recovery Code",
      sendResetCode: "Send Recovery Code",
      sendResetCodeSuccess:
        "The recovery code has been sent. Please check your inbox.",
      sendResetCodeFailed: "Failed to send recovery code",
      resetPassword: "Reset Password",
      resetPasswordSuccess:
        "Password reset successfully. Please sign in with your new password.",
      resetPasswordFailed: "Failed to reset password",
      newPassword: "New Password",
      confirmNewPassword: "Confirm New Password",
      newPasswordPlaceholder: "Enter a password with at least 8 characters",
      confirmPassword: "Confirm Password",
      confirmPasswordPlaceholder: "Enter the password again",
      backToLogin: "Back to Sign In",
      emailRequired: "Enter your email",
      passwordRequired: "Enter your password",
      otpCodeRequired: "Enter the email verification code",
      phoneRequired: "Enter your phone number",
      phoneOtpCodeRequired: "Enter the SMS verification code",
      emailInvalid: "Enter a valid email address",
      resetCodeRequired: "Enter the recovery code",
      resetCodePlaceholder: "Enter the 6-digit recovery code",
      newPasswordRequired: "Enter a new password",
      confirmNewPasswordRequired: "Confirm the new password again",
      newPasswordMinLength: "New password must be at least 8 characters",
      passwordMinLength: "Password must be at least 8 characters",
      newPasswordMismatch: "The two new passwords do not match",
      passwordMismatch: "The two passwords do not match",
      registrationClosed: "Registration is currently closed",
      login: "Sign in",
      passkeyLogin: "Passkey",
      passkeyLoginDesc:
        "Use a passkey already bound to this site on your device or system account.",
      passkeyLoginButton: "Use Passkey",
      passkeyLoginHint:
        "You must bind a passkey in the account center before using it here.",
      passkeyLoginSuccess: "Passkey added successfully",
      passkeyNotAvailable:
        "No passkey for this site is available on this device. Use another sign-in method.",
      qrLogin: "QR Code",
      qrLoginDesc: "Scan the QR code with the MySSO Android app to sign in.",
      qrLoginScanned: "Scanned. Confirm sign-in in the mobile app.",
      qrLoginScannedMask: "This QR code has been scanned",
      qrLoginCancelled: "This QR sign-in was cancelled",
      qrLoginExpired: "QR code expired. Please refresh.",
      qrLoginRefresh: "Refresh QR Code",
      downloadApp: "Download App",
      passwordLogin: "Password",
      otpLogin: "Email Code",
      phoneOtpLogin: "Phone Code",
      email: "Email",
      phone: "Phone Number",
      password: "Password",
      otpCode: "Email Code",
      phoneOtpCode: "SMS Code",
      mfaCode: "2FA Code",
      mfaPlaceholder: "Leave blank if two-factor authentication is not enabled",
      sendOtpCode: "Send Email Code",
      sendOtpCodeSuccess:
        "The email code has been sent. Please check your inbox.",
      sendOtpCodeFailed: "Failed to send verification code",
      sendOtpCodeEmailRequired: "Enter your email before requesting a code",
      sendPhoneOtpCode: "Send SMS Code",
      sendPhoneOtpCodeSuccess:
        "The SMS code has been sent. Please check your phone.",
      sendPhoneOtpCodeFailed: "Failed to send SMS code",
      sendPhoneBindingCode: "Send Binding Code",
      sendPhoneBindingCodeSuccess:
        "The phone binding code has been sent. Please check your phone.",
      sendPhoneBindingCodeFailed: "Failed to send the phone binding code",
      securityCaptcha: "Security Check",
      securityCaptchaPlaceholder:
        "Enter the security check value and try again",
      securityCaptchaHelp:
        "When the current device or IP sends requests too frequently, complete this security check before requesting another code.",
      securityCaptchaRequiredTip:
        "Request volume is high. Complete the security check before requesting another code.",
      sendOtpCodePhoneRequired:
        "Enter your phone number before requesting a code",
      phoneBindingPageTitle: "Bind Phone Number",
      phoneBindingRegisterDesc:
        "This account hit the post-registration risk rule. Bind a phone number before continuing.",
      phoneBindingLoginDesc:
        "This account hit the login risk rule. Bind a phone number before continuing.",
      completePhoneBinding: "Bind and Continue",
      phoneBindingSuccess:
        "Phone number bound successfully. The account is active again.",
      mfaVerifyTitle: "Two-Factor Verification",
      mfaVerifyEmailHint:
        "A verification code was sent to {{target}}. Enter it to continue signing in.",
      mfaVerifyPhoneHint:
        "A verification code was sent to {{target}}. Enter it to continue signing in.",
      loginStepUpTitle: "Extra Sign-In Verification",
      loginStepUpEmailDesc:
        "This sign-in requires an additional email verification. A code will be sent to {{email}}.",
      loginStepUpSMSDesc:
        "This sign-in requires an additional phone verification. A code will be sent to {{phone}}.",
      loginStepUpDualDesc:
        "This sign-in requires both email and phone verification. Email: {{email}}, phone: {{phone}}.",
      loginStepUpExpired:
        "The extra sign-in verification session expired. Please sign in again.",
      forcedMfaEnrollmentTitle: "Two-Factor Authentication Must Be Enabled",
      forcedMfaEnrollmentDesc:
        "An administrator requires this account to enable two-factor authentication before this sign-in can finish.",
      forcedMfaEnrollmentExpired:
        "The forced MFA enrollment session expired. Please sign in again.",
      completeForcedMfaEnrollment: "Enable and Continue",
      cancelForcedMfaEnrollment: "Cancel and Return to Sign In",
      verifyAndLogin: "Verify and Sign In",
      deletionConfirmTitle: "Account Deletion Request Submitted",
      deletionConfirmScheduledAt: "Scheduled deletion time: {{date}}",
      deletionConfirmDesc:
        "Logging in again will cancel the deletion.",
      deletionConfirmContinue: "Continue and Cancel Deletion",
      deletionConfirmExpired: "Confirmation expired, please sign in again",
      deletionConfirmFailed: "Confirmation failed, please sign in again",
      logoutProgressTitle: "Signing out",
      logoutProgressDesc:
        "The identity session has been cleared and connected applications are being signed out.",
      loginFailed: "Sign in failed",
      oidcCallbackFailed: "OIDC Callback Failed",
      appRejected: "Application Rejected",
      appRejectedWithReason: "Application Rejected: {{reason}}",
      appNotFound: "Application Not Found",
      accessDenied: "Access Denied",
      tokenExchangeFailed: "Token exchange failed",
      authorize: {
        title: "Use {{siteName}} to sign in to {{appName}}",
        desc: "This app is requesting the following information and permissions. After confirmation, you will return to the business app to finish signing in.",
        chooseAccountTitle: "You are already signed in to {{siteName}}",
        chooseAccountDesc:
          "Choose whether to continue with the current account or sign in with a different account first.",
        currentAccountFallback: "Current account",
        useCurrentAccount: "Continue with this account",
        useAnotherAccount: "Sign in with another account",
        permissionTitle: "Requested permissions",
        permissionCount: "{{count}} items",
        agreement:
          "I have read and agree to grant the permissions listed above",
        confirm: "Confirm and Continue",
        cancel: "Cancel and Return to Sign In",
        errors: {
          applicationRejected: "Application Rejected",
          applicationRejectedWithReason: "Application Rejected: {{reason}}",
          applicationAccessRestricted: "Application access is restricted",
          applicationAccessBanned: "Application access is banned",
          applicationAccessBannedWithReason:
            "Application access is banned: {{reason}}",
          applicationNotApproved: "Application is not approved",
          applicationDisabled: "This application has been disabled",
          applicationNotFound: "Application Not Found",
          forbidden: "You do not have permission to access this application",
          unsupportedResponseType: "Unsupported response type",
          redirectUriMismatch: "The redirect URI does not match",
          scopeNotAllowed: "Requested scope is not allowed",
          openidScopeRequired: "The openid scope is required",
          codeChallengeMethodRequiresCodeChallenge:
            "A code challenge is required when code_challenge_method is provided",
          unsupportedCodeChallengeMethod: "Unsupported code challenge method",
          promptNoneMustNotBeCombinedWithOtherValues:
            "The prompt value none cannot be combined with other values",
          invalidMaxAge: "The max_age value is invalid",
          acrValuesNotSatisfied:
            "The current session does not satisfy the requested authentication context",
          consentRequired: "Additional consent is required",
          loginRequired: "Please sign in again to continue",
          authorizeFailed: "Authorization failed. Please try again.",
          loadAuthorizationSettingsFailed:
            "Failed to load authorization settings",
          networkRequestFailed:
            "Network request failed. Please check your connection and try again.",
          apiReturnedHtml:
            "The authorization service returned an unexpected page. Please check the API or reverse proxy configuration.",
        },
        scopes: {
          openidTitle: "Confirm your identity",
          openidDesc:
            "Used to verify that the current signed-in account belongs to you and establish the base sign-in session.",
          profileTitle: "Access your public profile",
          profileDesc:
            "Includes your display name, avatar, and similar public profile data for in-app presentation.",
          emailTitle: "Access your email information",
          emailDesc:
            "Used to show your account email or support notifications and account linking when needed.",
          phoneTitle: "Access your phone number",
          phoneDesc:
            "Used for account recognition, notifications, or security verification when needed.",
          gatewayReadTitle: "Access protected business APIs",
          gatewayReadDesc:
            "Allows the app to access protected resources as your authorized identity.",
          customTitle: "Requesting permission: {{scope}}",
          customDesc:
            "This app is requesting an additional business permission. Review it carefully before continuing.",
        },
      },
      sessionConflict: {
        title: "Different accounts were detected in this browser",
        desc: "The account remembered by this window does not match the browser's currently active account. Only one primary account can stay active in the same browser at a time. Choose which account to continue with.",
        browserAccount: "Browser active account",
        thisWindowAccount: "This window's previous account",
        useBrowserAccount: "Use the browser active account",
        useThisWindowAccount: "Switch back to this window's account",
        relogin: "Sign out and sign in again",
      },
    },
    nav: {
      security: "Sign-in & Security",
      profile: "Profile",
      privacy: "Privacy Center",
      bindings: "Authorized Apps",
      help: "Help Center",
    },
    common: {
      loadingFailed: "Failed to load",
      revokeFailed: "Failed to revoke consent",
      revokeSuccess: "Consent revoked",
      confirm: "Confirm",
      sendCode: "Send Code",
      sendCodeSuccess: "Verification code sent successfully",
      sendingCode: "Sending",
      save: "Save",
      saving: "Saving",
      edit: "Edit",
      cancel: "Cancel",
      uploadAvatar: "Upload Avatar",
      avatarUpdated: "Avatar updated",
      avatarUploadFailed: "Failed to upload avatar",
      profileUpdated: "Profile updated",
      profileUpdateFailed: "Failed to update profile",
      imageReadFailed: "Failed to read image",
      imageProcessUnsupported:
        "Image processing is not supported in this browser",
      avatarConvertFailed: "Failed to convert avatar",
      unset: "Not set",
      unsetShort: "Not set",
      notFilled: "Not provided",
      noRecord: "No records",
      normal: "Active",
      accountCenter: "Account Center",
      noAuthorizedApps: "No authorized apps",
    },
    errors: {
      applicationDisabled: "This application has been disabled",
      emailRequiredByServer: "Please enter your email",
      passwordRequiredByServer: "Please enter your password",
      invalidCredentials: "Invalid account or credentials",
      invalidOtpCode: "The verification code is invalid or expired",
      accountFrozen: "This account has been frozen",
      accountFrozenWithReason:
        "This account has been frozen. Reason: {{reason}}",
      userNotFound: "User not found",
      smsNotConfigured: "SMS sending is not configured",
      smtpNotConfigured: "Email sending is not configured",
      userStatusInvalid:
        "The current account status does not allow this action",
      invalidCurrentPhoneVerificationCode:
        "The current phone verification code is invalid or expired",
      invalidNewPhoneVerificationCode:
        "The new phone verification code is invalid or expired",
      currentPhoneVerificationCodeRequired:
        "Enter the current phone verification code",
      currentPhoneNotBound:
        "No phone number is currently bound to this account",
      phoneDoesNotMatchCurrentBoundPhone:
        "The phone number does not match the currently bound one",
      phoneAlreadyBound: "This phone number is already bound",
      newPhoneMustBeDifferent:
        "The new phone number must be different from the current one",
      phoneAndVerificationCodeRequired:
        "Enter the phone number and the new phone verification code",
      invalidMfaCode: "The two-factor verification code is invalid or expired",
      unsupportedMfaMethod: "Unsupported two-factor authentication method",
      mfaNotEnabled:
        "Two-factor authentication is not enabled for this account",
      emailNotBound: "No email is bound to this account",
      phoneNotBound: "No phone number is bound to this account",
      emailVerificationCodeRequired: "Enter the email verification code",
      invalidEmailVerificationCode:
        "The email verification code is invalid or expired",
      phoneVerificationCodeRequired: "Enter the phone verification code",
      invalidPhoneVerificationCode:
        "The phone verification code is invalid or expired",
      newPasswordMustBeDifferentFromCurrentPassword:
        "The new password must be different from the current password",
      phoneBindingChallengeExpired:
        "The phone binding session expired. Please sign in or register again.",
      manualMfaCodeNotSendable:
        "This account uses a manual MFA code and cannot send a code",
      emailAndPasswordRequired:
        "Enter your email and password before requesting a two-factor code",
      mfaChallengeExpiredOrInvalid:
        "The two-factor verification session expired. Please sign in again.",
      challengeRequired:
        "Complete the security challenge before requesting a code.",
      captchaRequired:
        "Request volume is high. Complete the security check first.",
      circuitOpen:
        "The delivery channel is temporarily protected. Please try again later.",
      cooldownActive:
        "This target has requested codes too frequently. Please try again later.",
      passkeyChallengeExpired: "The passkey session expired. Please try again.",
      passkeyVerificationFailed:
        "Passkey verification failed. Try again or use another sign-in method.",
      passkeyAlreadyExists: "This passkey is already bound.",
      passkeyNotFound: "Passkey not found.",
      passkeyBrowserUnsupported:
        "This browser or device does not support passkeys.",
      passkeyUserHandleInvalid:
        "The account for this passkey could not be identified.",
      invalidLoginStepUpVerificationCode:
        "The extra verification code is invalid or expired.",
      invalidMfaEnrollmentVerificationCode:
        "The MFA enrollment verification code is invalid or expired.",
      loginStepUpChallengeExpiredOrInvalid:
        "The extra verification session expired. Please sign in again.",
      mfaEnrollmentChallengeExpiredOrInvalid:
        "The forced MFA enrollment session expired. Please sign in again.",
      noAvailableMfaMethodForCurrentAccount:
        "No MFA method is available for this account.",
      noAvailableLoginVerificationTargetForCurrentAccount:
        "No extra verification target is available for this account.",
    },
    security: {
      loginMethods: "Sign-in Methods",
      phone: "Bind Phone Number",
      phoneDesc:
        "Used for additional sign-in methods, SMS verification, and account security notices",
      bindPhone: "Bind",
      bindPhoneTitle: "Bind Phone Number",
      bindPhoneHint:
        "Verify the phone number first before binding. The verification code will be sent to this phone number.",
      rebindPhoneHint:
        "To replace the bound phone number, verify the current phone number first and then verify the new one.",
      currentPhone: "Currently Bound Phone Number",
      currentPhoneCode: "Current Phone Verification Code",
      currentPhoneCodePlaceholder:
        "Enter the 6-digit code sent to the current phone number",
      sendCurrentPhoneCode: "Send Current Phone Code",
      newPhone: "Phone Number",
      newPhoneCode: "New Phone Verification Code",
      newPhonePlaceholder: "Enter a phone number, for example 13800138000",
      smsCode: "SMS Verification Code",
      smsCodePlaceholder: "Enter the 6-digit SMS code",
      safeEmail: "Secure Email",
      safeEmailDesc: "Primary credential used to sign in",
      editEmailTitle: "Change Secure Email",
      newEmail: "New Email",
      newEmailPlaceholder: "Enter the new email address",
      emailCode: "Email Code",
      emailCodePlaceholder: "Enter the 6-digit code",
      changeEmailHint:
        "The new email must be verified before the change is saved.",
      changePassword: "Change Password",
      changePasswordDesc:
        "Update your sign-in password regularly to improve account security",
      editPasswordTitle: "Change Sign-in Password",
      currentPassword: "Current Password",
      currentPasswordPlaceholder: "Enter your current password",
      currentPasswordIncorrect: "The current password is incorrect",
      newPassword: "New Password",
      newPasswordPlaceholder: "Enter a new password with at least 8 characters",
      confirmPassword: "Confirm New Password",
      confirmPasswordPlaceholder: "Enter the new password again",
      changePasswordHint:
        "Use the new password the next time you sign in, and avoid reusing the old one.",
      passwordMinLength: "Password must be at least 8 characters",
      passwordMismatch: "The two new passwords do not match",
      passwordUpdated: "Password updated",
      passwordUpdateFailed: "Failed to update password",
      mfa: "Two-Factor Authentication",
      mfaDesc: "When enabled, extra verification is required during sign-in",
      mfaTitle: "Configure Two-Factor Authentication",
      mfaHint: "Choose the second verification method used during sign-in.",
      mfaTitleEnable: "Enable Two-Factor Authentication",
      mfaTitleDisable: "Disable Two-Factor Authentication",
      mfaHintEnable:
        "Choose the second verification method used during sign-in.",
      mfaHintDisable:
        "After disabling, extra verification will no longer be required during sign-in.",
      mfaMethod: "Verification Method",
      mfaMethodEmail: "Email Code",
      mfaMethodSMS: "Phone Code",
      passkeys: "Passkeys",
      passkeysDesc:
        "After binding, you can sign in directly from the system passkey picker.",
      addPasskey: "Add Passkey",
      deletePasskey: "Delete Passkey",
      passkeyName: "Device Name",
      passkeyNamePlaceholder: "Enter a recognizable name",
      passkeyLastUsed: "Last used",
      passkeyLastUsedIP: "Last used IP",
      passkeyCreatedAt: "Created at",
      passkeyEmpty: "No passkeys bound",
      passkeyManageVerify:
        "To protect your account, verify your current credentials before adding or deleting a passkey.",
      currentMfaCode: "Current MFA Code",
      currentMfaCodePlaceholder: "Enter the code from the current MFA method",
      currentMfaCodeHintEmail:
        "Complete verification with the currently bound email code before saving.",
      currentMfaCodeHintSMS:
        "Complete verification with the currently bound phone code before saving.",
      currentMfaCodeHintManual:
        "Enter the currently configured manual MFA code before saving.",
      accountSecurity: "Account Security",
      recentLogin: "Recent Sign-in",
      recentLoginDesc: "Last successful sign-in time and device IP",
    },
    profile: {
      title: "Profile",
      avatar: "Avatar",
      avatarDesc:
        "The image will be center-cropped and converted to webp automatically",
      nickname: "Nickname",
      nicknameDesc: "Current display name",
      gender: "Gender",
      genderDesc: "Profile gender information for this account",
      languagePreference: "Language Preference",
      languagePreferenceDesc:
        "After sign-in, this language will be used first for page content",
      languagePreferenceSaved: "Language preference saved",
      languagePreferenceSaveFailed: "Failed to save language preference",
      genderMale: "Male",
      genderFemale: "Female",
      genderOther: "Other",
      userId: "User ID",
      userIdDesc: "Unique identifier of the current account in the system",
      nicknamePlaceholder: "Enter nickname",
      editNicknameTitle: "Edit Nickname",
      editGenderTitle: "Edit Gender",
      email: "Email Address",
      emailDesc: "Used for sign-in, verification, and security notifications",
      createdAt: "Registered At",
      createdAtDesc: "The time when this account was created",
      country: "Registration Country",
      countryDesc: "Country or region recorded at registration",
    },
    privacy: {
      title: "Privacy Center",
      exportTitle: "Download User Data",
      exportDesc:
        "Export profile data and non-revoked authorized apps in CSV format.",
      exportAction: "Download Data",
      exportPasswordVerifyDesc:
        "Verify your current sign-in password before downloading. The CSV will include profile data and non-revoked authorized apps.",
      exportSuccess: "User data download started",
      exportFailed: "Failed to export user data",
      minimizeTitle: "Data Minimization",
      minimizeDesc:
        "The system only keeps the registration country, email, consents, and essential sign-in security data.",
      scopeTitle: "Current Access Scope",
      scopeDesc:
        "You can review apps that accessed your account in Authorized Apps and revoke them at any time.",
      statusTitle: "Account Status",
      statusDesc:
        "If the account is frozen, sign-in will be blocked until an administrator resolves it.",
      deleteTitle: "Delete Account",
      deleteDesc:
        "If you sign in again within 7 days, the deletion request is canceled automatically. Otherwise the account and consent data will be removed.",
      deleteWarningPrimary:
        "Deleting the account is irreversible. Please back up any data related to this account first.",
      deleteWarningSecondary:
        "After the request is submitted, signing in again within 7 days cancels the deletion. If you do not sign in within 7 days, the system deletes the account and consent data automatically.",
      deleteAction: "I Have Read and Accept the Consequences",
      passwordVerifyTitle: "Verify Current Password",
      passwordVerifyDesc:
        "Enter your current sign-in password and complete email verification. If a phone number is bound, phone verification is also required.",
      emailVerifyCode: "Email Verification Code",
      emailVerifyCodePlaceholder: "Enter the 6-digit code sent to your email",
      sendDeleteEmailCode: "Send Email Code",
      sendDeleteEmailCodeSuccess:
        "The email verification code has been sent. Please check your inbox.",
      sendDeleteEmailCodeFailed: "Failed to send the email verification code",
      phoneVerifyCode: "Phone Verification Code",
      phoneVerifyCodePlaceholder: "Enter the 6-digit code sent to your phone",
      sendDeletePhoneCode: "Send Phone Code",
      sendDeletePhoneCodeSuccess:
        "The phone verification code has been sent. Please check your phone.",
      sendDeletePhoneCodeFailed: "Failed to send the phone verification code",
      confirmDeleteNow: "Submit Deletion Request",
      deleteSuccess:
        "Deletion request submitted. Signing in within 7 days will cancel it.",
      deleteFailed: "Failed to submit deletion request",
      deletePendingAt:
        "Deletion request submitted. Scheduled deletion time: {{date}}",
    },
    bindings: {
      title: "Authorized Apps",
      appId: "App Name",
      scopes: "Scopes",
      createdAt: "Authorized At",
      authorizedAt: "Authorized At",
      status: "Status",
      action: "Action",
      viewDetails: "Details",
      detailTitle: "Authorization Details",
      siteName: "Authorized Site",
      requestedPermissions: "Granted Permissions",
      accessStatus: "Access Status",
      reason: "Reason",
      effectiveAt: "Effective At",
      expiresAt: "Expires At",
      accessStatusNormal: "Active",
      accessStatusRestricted: "Restricted",
      accessStatusBanned: "Banned",
      scopeOpenIdTitle: "Confirm your identity",
      scopeOpenIdDesc:
        "Used to confirm that the signed-in account is really you and establish the basic sign-in session.",
      scopeProfileTitle: "Access your public profile",
      scopeProfileDesc:
        "Includes nickname, avatar, and other public profile data for display inside the app.",
      scopeEmailTitle: "Access your email address",
      scopeEmailDesc:
        "Used to display your account email or send notices and bind your account when needed.",
      scopePhoneTitle: "Access your phone number",
      scopePhoneDesc:
        "Used for account identification, notifications, or security verification when needed.",
      scopeGatewayReadTitle: "Access protected business APIs",
      scopeGatewayReadDesc:
        "Allows the app to access protected API resources on your behalf after authorization.",
      scopeCustomTitle: "Requested permission: {{scope}}",
      scopeCustomDesc:
        "This app is requesting an additional business permission. Review it carefully before continuing.",
      revoke: "Revoke",
      batchRevoke: "Batch Revoke",
      batchRevokeConfirmTitle: "Confirm batch revoke?",
      batchRevokeConfirmDesc:
        "{{count}} authorizations are selected. These apps will need to request consent again.",
    },
    help: {
      title: "Help Center",
      loginIssueTitle: "Can't Sign In",
      loginIssueDesc:
        "If you cannot sign in, first confirm that you are using the correct method for the account, such as password, email code, phone code, or passkey. If a verification code is rejected, make sure it is the latest one and still within its validity period. If the account is shown as frozen, pending activation, or otherwise restricted, the issue must be handled by a platform administrator. If you recently submitted an account deletion request, the system may also require deletion confirmation or phone binding before access is restored.",
      protectTitle: "Protect Your Account",
      protectDesc:
        "Enable two-factor authentication as soon as possible and bind passkeys on trusted devices to reduce the risk of password-only compromise. Never share email codes, SMS codes, or MFA codes with third parties, and do not re-enter credentials on pages you do not trust. If you use the same account across multiple devices, review recent sign-ins, bound passkeys, and authorized apps regularly, and remove devices or authorizations you no longer use.",
      authIssueTitle: "Authorization Issues",
      authIssueDesc:
        "If an app looks unfamiliar, requests unusual scopes, or you suspect it is misusing your account, open Authorized Apps to review its authorization time, granted scopes, and integration details, then revoke it immediately if needed. After revocation, the app will no longer be able to access protected resources with your account until you sign in again and approve a new consent request. If the problem may affect the entire account rather than a single app, you should also change your password, verify your MFA settings, and review recent sign-in and passkey activity.",
      contactTitle: "Contact Us",
      contactDesc:
        "If you need manual assistance, you can reach the platform support contact below. When reporting an issue, include the account email, the time the problem occurred, screenshots of error messages, the sign-in method you were using, and relevant device or browser details so the issue can be investigated faster.",
      contactMainlandTitle: "Mainland China",
      contactOverseasTitle: "Overseas",
      contactPersonLabel: "Contact person:",
      contactPhoneLabel: "Phone:",
      contactEmailLabel: "Email:",
      contactHoursLabel: "Support hours:",
      contactMainlandPersonValue: "YOUR_NAME",
      contactMainlandPhoneValue: "YOUR_PHONE_NUMBER",
      contactMainlandEmailValue: "YOUR_EMAIL",
      contactMainlandHoursValue: "Monday to Friday 09:00 - 18:00",
      contactOverseasPersonValue: "YOUR_NAME_Oversea",
      contactOverseasPhoneValue: "YOUR_PHONE_Oversea",
      contactOverseasEmailValue: "YOUR_EMAIL_Oversea",
      contactOverseasHoursValue: "Monday to Friday 09:00 - 18:00",
      contactRegionNotice:
        "Please contact the support channel for your region first. If you are unsure which region applies, start with the Mainland China contact for routing help.",
      contactNotice:
        "For issues such as frozen accounts, abnormal authorizations, lost passkeys, or deletion recovery, contact the administrator through the phone number or email above first. If your platform provides an official ticketing system, announcement board, or operations group, follow that official channel first.",
    },
  },
} as const;

export default locale;
