type TranslateFn = (key: string) => string;

export function translateAccountError(rawMessage: string, t: TranslateFn) {
  switch (rawMessage) {
    case "invalid or expired current phone verification code":
      return t("errors.invalidCurrentPhoneVerificationCode");
    case "invalid or expired new phone verification code":
      return t("errors.invalidNewPhoneVerificationCode");
    case "current phone verification code is required":
      return t("errors.currentPhoneVerificationCodeRequired");
    case "current phone is not bound":
      return t("errors.currentPhoneNotBound");
    case "phone does not match current bound phone":
      return t("errors.phoneDoesNotMatchCurrentBoundPhone");
    case "phone already bound":
      return t("errors.phoneAlreadyBound");
    case "new phone must be different from current phone":
      return t("errors.newPhoneMustBeDifferent");
    case "phone and new phone verification code are required":
      return t("errors.phoneAndVerificationCodeRequired");
    case "sms not configured":
      return t("errors.smsNotConfigured");
    case "unsupported mfa method":
      return t("errors.unsupportedMfaMethod");
    case "mfa is not enabled":
      return t("errors.mfaNotEnabled");
    case "email is not bound":
      return t("errors.emailNotBound");
    case "phone is not bound":
      return t("errors.phoneNotBound");
    case "email verification code is required":
      return t("errors.emailVerificationCodeRequired");
    case "invalid or expired email verification code":
      return t("errors.invalidEmailVerificationCode");
    case "phone verification code is required":
      return t("errors.phoneVerificationCodeRequired");
    case "invalid or expired phone verification code":
      return t("errors.invalidPhoneVerificationCode");
    case "current password is incorrect":
      return t("security.currentPasswordIncorrect");
    case "current password is required":
      return t("security.currentPasswordPlaceholder");
    case "new password must be different from current password":
      return t("errors.newPasswordMustBeDifferentFromCurrentPassword");
    case "current mfa code is required":
      return t("security.currentMfaCodePlaceholder");
    case "invalid current mfa code":
    case "invalid mfa code":
      return t("errors.invalidMfaCode");
    case "current account uses a manual mfa code":
      return t("errors.manualMfaCodeNotSendable");
    case "rate_limit_exceeded":
      return t("errors.rateLimitExceeded");
    case "passkey challenge expired":
      return t("errors.passkeyChallengeExpired");
    case "passkey verification failed":
      return t("errors.passkeyVerificationFailed");
    case "passkey already exists":
      return t("errors.passkeyAlreadyExists");
    case "passkey not found":
      return t("errors.passkeyNotFound");
    case "passkey browser unsupported":
      return t("errors.passkeyBrowserUnsupported");
    case "passkey user handle invalid":
      return t("errors.passkeyUserHandleInvalid");
    default:
      return rawMessage;
  }
}

