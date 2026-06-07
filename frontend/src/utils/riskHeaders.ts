const WEB_FINGERPRINT_KEY = "mysso_web_fingerprint";

function stableBrowserSeed() {
  if (typeof window === "undefined") {
    return "server";
  }
  const stored = window.localStorage.getItem(WEB_FINGERPRINT_KEY);
  if (stored) {
    return stored;
  }
  const seed =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  window.localStorage.setItem(WEB_FINGERPRINT_KEY, seed);
  return seed;
}

function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function buildRiskHeaders() {
  if (typeof window === "undefined") {
    return {};
  }
  const signals: string[] = [];
  let score = 0;
  if (navigator.webdriver) {
    signals.push("debugger_attached");
    score += 20;
  }
  if (Intl.DateTimeFormat().resolvedOptions().timeZone === "UTC") {
    signals.push("custom_rom");
    score += 5;
  }
  const fingerprintSource = [
    stableBrowserSeed(),
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    Intl.DateTimeFormat().resolvedOptions().timeZone
  ].join("|");
  return {
    "X-Client-Type": "web",
    "X-Device-Risk-Score": String(Math.min(score, 100)),
    "X-Device-Risk-Level": score >= 60 ? "high" : score >= 30 ? "medium" : "low",
    "X-Device-Fingerprint": hashString(fingerprintSource),
    "X-Device-Risk-Signals": signals.join(",")
  };
}
