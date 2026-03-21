import type { NavigateFunction } from "react-router-dom";
import { getSafeRedirect, pickAllowedSearchParams, withUpdatedSearch } from "../../utils/urlState";
import { applyPreferredLocaleFromSession } from "../../i18n/accountLocalePreference";
import { saveAuthorizationSession } from "./oidc";
import { authorizeAndRedirect, readAuthorizationParams, shouldAutoApproveAuthorization } from "./authorizationFlow";
import { buildStoredSessionMeta, persistBrowserAndTabSessionMeta, persistSessionAuth } from "../../authSession";

export type AuthFlowUser = {
  id?: string;
  email?: string;
  display_name?: string;
  role: "admin" | "developer" | "user";
};

export type LoginFlowResponse = {
  requires_mfa?: boolean;
  requires_phone_binding?: boolean;
  requires_deletion_confirmation?: boolean;
  requires_step_up_verification?: boolean;
  requires_mfa_enrollment_setup?: boolean;
  challenge_token?: string;
  mfa_method?: "email" | "sms";
  masked_target?: string;
  phone_binding_challenge_token?: string;
  phone_binding_reason?: string;
  deletion_challenge_token?: string;
  deletion_scheduled_at?: string;
  step_up_challenge_token?: string;
  step_up_mode?: "none" | "email" | "sms" | "email_and_sms";
  masked_email_target?: string;
  masked_phone_target?: string;
  mfa_enrollment_challenge_token?: string;
  available_mfa_methods?: Array<"email" | "sms">;
  user: AuthFlowUser;
};

type FlowContext = {
  locationSearch: string;
  navigate: NavigateFunction;
};

export async function handleLoginSuccessResult(
  result: { user: AuthFlowUser },
  context: FlowContext,
) {
  const { locationSearch, navigate } = context;
  const searchParams = pickAllowedSearchParams(locationSearch);
  const hasAuthorizationContext = Boolean(searchParams.get("client_id"));
  const usesAuthorizationFlowSession =
    searchParams.get("auth_flow") === "authorization";
  const authenticatedAt = new Date().toISOString();
  if (hasAuthorizationContext && usesAuthorizationFlowSession) {
    saveAuthorizationSession(result.user.role, authenticatedAt);
  } else {
    persistSessionAuth(result.user.role, authenticatedAt);
  }
  const profile =
    (await applyPreferredLocaleFromSession().catch(() => undefined)) ||
    result.user;
  if (!hasAuthorizationContext || !usesAuthorizationFlowSession) {
    persistBrowserAndTabSessionMeta(
      buildStoredSessionMeta(result.user.role, authenticatedAt, profile),
    );
  }
  if (hasAuthorizationContext) {
    const authorizationParams = readAuthorizationParams(searchParams);
    if (
      await shouldAutoApproveAuthorization(authorizationParams).catch(
        () => false,
      )
    ) {
      await authorizeAndRedirect(authorizationParams);
      return true;
    }
    const prompt = searchParams.get("prompt") || "";
    navigate({
      pathname: "/authorize",
      search: prompt.split(/\s+/).includes("login")
        ? withUpdatedSearch(locationSearch, { prompt_login_satisfied: "1" })
        : withUpdatedSearch(locationSearch, { prompt_login_satisfied: "1" }),
    });
    return true;
  }
  const redirect = getSafeRedirect(locationSearch);
  if (redirect) {
    navigate(redirect, { replace: true });
    return true;
  }
  navigate(
    result.user.role === "admin"
      ? "/admin"
      : result.user.role === "developer"
        ? "/developer"
        : "/me",
    { replace: true },
  );
  return true;
}

export async function handleLoginFlowResult(
  result: LoginFlowResponse,
  context: FlowContext,
) {
  const { locationSearch, navigate } = context;
  const nextSearch = new URLSearchParams(locationSearch);
  if (result.requires_mfa && result.challenge_token) {
    nextSearch.set("challenge_token", result.challenge_token);
    nextSearch.set("mfa_method", result.mfa_method || "");
    nextSearch.set("masked_target", result.masked_target || "");
    navigate(
      {
        pathname: "/login-mfa",
        search: `?${nextSearch.toString()}`,
      },
      { replace: true },
    );
    return true;
  }
  if (
    result.requires_deletion_confirmation &&
    result.deletion_challenge_token
  ) {
    nextSearch.delete("challenge_token");
    nextSearch.delete("mfa_method");
    nextSearch.delete("masked_target");
    nextSearch.set(
      "deletion_challenge_token",
      result.deletion_challenge_token,
    );
    nextSearch.set("deletion_scheduled_at", result.deletion_scheduled_at || "");
    navigate(
      {
        pathname: "/login-deletion-confirm",
        search: `?${nextSearch.toString()}`,
      },
      { replace: true },
    );
    return true;
  }
  if (result.requires_phone_binding && result.phone_binding_challenge_token) {
    const params = new URLSearchParams(locationSearch);
    params.set("challenge_token", result.phone_binding_challenge_token);
    params.set("reason", result.phone_binding_reason || "delayed_login_threshold");
    navigate(
      {
        pathname: "/phone-binding-required",
        search: `?${params.toString()}`,
      },
      { replace: true },
    );
    return true;
  }
  if (result.requires_step_up_verification && result.step_up_challenge_token) {
    const params = new URLSearchParams(locationSearch);
    params.set("step_up_challenge_token", result.step_up_challenge_token);
    params.set("step_up_mode", result.step_up_mode || "none");
    params.set("masked_email_target", result.masked_email_target || "");
    params.set("masked_phone_target", result.masked_phone_target || "");
    navigate(
      {
        pathname: "/login-step-up",
        search: `?${params.toString()}`,
      },
      { replace: true },
    );
    return true;
  }
  if (
    result.requires_mfa_enrollment_setup &&
    result.mfa_enrollment_challenge_token
  ) {
    const params = new URLSearchParams(locationSearch);
    params.set(
      "mfa_enrollment_challenge_token",
      result.mfa_enrollment_challenge_token,
    );
    params.set(
      "available_mfa_methods",
      (result.available_mfa_methods || []).join(","),
    );
    navigate(
      {
        pathname: "/forced-mfa-enrollment",
        search: `?${params.toString()}`,
      },
      { replace: true },
    );
    return true;
  }
  return handleLoginSuccessResult(result, context);
}
