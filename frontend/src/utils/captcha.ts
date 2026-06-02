import { api } from "../api/client";
import { fetchPublicSettings } from "../publicSettings";

export type CaptchaChallenge = {
  image: string;
  ticket: string;
  challenge: string;
  sign: string;
};

export type CaptchaPayload = {
  captcha?: string;
  captcha_ticket?: string;
  captcha_challenge?: string;
  captcha_sign?: string;
};

export type CaptchaContext = {
  flow: string;
  purpose: string;
  target: string;
};

export async function isCaptchaEnabled() {
  const settings = await fetchPublicSettings({ force: true });
  return Boolean(settings.captcha_enabled);
}

export async function fetchCaptchaChallenge(context: CaptchaContext) {
  const precheck = await api<{
    data: {
      required?: boolean;
      challenge?: string;
      sign?: string;
    };
  }>("/public/captcha/precheck", {
    method: "POST",
    body: JSON.stringify(context),
    timeout_ms: 5000,
  });
  if (!precheck.data.required) {
    return null;
  }
  const challenge = precheck.data.challenge || "";
  const sign = precheck.data.sign || "";
  const result = await api<{ data: { image: string; ticket: string } }>("/public/captcha", {
    method: "POST",
    body: JSON.stringify({
      ...context,
      challenge,
      sign,
    }),
    timeout_ms: 5000,
  });
  return {
    ...result.data,
    challenge,
    sign,
  };
}
