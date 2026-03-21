import { useEffect, useMemo, useState } from "react";

export type EmailCodePurpose =
  | "login"
  | "register"
  | "mfa_login"
  | "change_email"
  | "verify_current_phone"
  | "change_phone"
  | "reset_password"
  | "delete_account"
  | "risk_phone_binding";

const STORAGE_PREFIX = "email_code_cooldown";
const LAST_EMAIL_PREFIX = "email_code_last_email";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function buildStorageKey(email: string, purpose: EmailCodePurpose) {
  return `${STORAGE_PREFIX}:${purpose}:${normalizeEmail(email)}`;
}

function buildLastEmailKey(purpose: EmailCodePurpose) {
  return `${LAST_EMAIL_PREFIX}:${purpose}`;
}

function readExpireAt(email: string, purpose: EmailCodePurpose) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return 0;
  }
  const raw = localStorage.getItem(buildStorageKey(normalizedEmail, purpose));
  const expireAt = raw ? Number(raw) : 0;
  if (!Number.isFinite(expireAt) || expireAt <= Date.now()) {
    localStorage.removeItem(buildStorageKey(normalizedEmail, purpose));
    return 0;
  }
  return expireAt;
}

export function saveEmailCodeCooldown(email: string, purpose: EmailCodePurpose, seconds: number) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || seconds <= 0) {
    return;
  }
  localStorage.setItem(buildStorageKey(normalizedEmail, purpose), String(Date.now() + seconds * 1000));
  localStorage.setItem(buildLastEmailKey(purpose), normalizedEmail);
}

export function getEmailCodeCooldownRemaining(email: string, purpose: EmailCodePurpose) {
  const expireAt = readExpireAt(email, purpose);
  if (!expireAt) {
    return 0;
  }
  return Math.max(0, Math.ceil((expireAt - Date.now()) / 1000));
}

export function setLastEmailCodeTarget(email: string, purpose: EmailCodePurpose) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    localStorage.removeItem(buildLastEmailKey(purpose));
    return;
  }
  localStorage.setItem(buildLastEmailKey(purpose), normalizedEmail);
}

export function getLastEmailCodeTarget(purpose: EmailCodePurpose) {
  return localStorage.getItem(buildLastEmailKey(purpose)) || "";
}

export function useEmailCodeCooldown(email: string, purpose: EmailCodePurpose) {
  const normalizedEmail = useMemo(() => normalizeEmail(email), [email]);
  const [remainingSeconds, setRemainingSeconds] = useState(() => getEmailCodeCooldownRemaining(normalizedEmail, purpose));

  useEffect(() => {
    setRemainingSeconds(getEmailCodeCooldownRemaining(normalizedEmail, purpose));
    if (!normalizedEmail) {
      return undefined;
    }
    const timer = window.setInterval(() => {
      setRemainingSeconds(getEmailCodeCooldownRemaining(normalizedEmail, purpose));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [normalizedEmail, purpose]);

  return {
    remainingSeconds,
    startCooldown: (seconds: number, targetEmail?: string) => {
      const effectiveEmail = normalizeEmail(targetEmail || normalizedEmail);
      saveEmailCodeCooldown(effectiveEmail, purpose, seconds);
      setRemainingSeconds(getEmailCodeCooldownRemaining(effectiveEmail, purpose));
    }
  };
}
