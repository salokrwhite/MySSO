export type AccountRole = "admin" | "developer" | "user";

export function getRoleHomePath(role: AccountRole) {
  if (role === "admin") {
    return "/admin";
  }
  if (role === "developer") {
    return "/developer";
  }
  return "/me";
}

export function isPathAllowedForRole(path: string, role: AccountRole) {
  if (role === "admin") {
    return path === "/admin" || path.startsWith("/admin/");
  }
  if (role === "developer") {
    return path === "/developer" || path.startsWith("/developer/");
  }
  return path === "/me" || path.startsWith("/me/");
}

export function resolveRoleAwareRedirect(redirect: string, role: AccountRole) {
  if (!redirect) {
    return getRoleHomePath(role);
  }

  try {
    const url = new URL(redirect, "http://localhost");
    const nextPath = `${url.pathname}${url.search}`;
    if (isPathAllowedForRole(url.pathname, role)) {
      return nextPath;
    }
  } catch {
    if (isPathAllowedForRole(redirect.split("?")[0] || "", role)) {
      return redirect;
    }
  }

  return getRoleHomePath(role);
}
