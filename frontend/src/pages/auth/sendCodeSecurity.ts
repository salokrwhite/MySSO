import { ApiError, api } from "../../api/client";

export type SendChallengeResponse = {
  challenge_token?: string;
  expires_in?: number;
  captcha_required?: boolean;
};

export async function requestSendChallenge(purpose: string, channel: "email" | "sms", target?: string) {
  return api<SendChallengeResponse>("/auth/send-challenge", {
    method: "POST",
    body: JSON.stringify({
      purpose,
      channel,
      target: target || ""
    })
  });
}

export function getRetryAfterSeconds(err: unknown) {
  if (err instanceof ApiError) {
    return Number(err.payload.retry_after_seconds || 0);
  }
  return 0;
}
