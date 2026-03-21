const roleLabelMap: Record<string, string> = {
  user: "普通用户",
  developer: "开发者",
  admin: "管理员"
};

export function getRoleLabel(role?: string, t: (key: string) => string = (key) => key) {
  if (!role) {
    return "-";
  }

  return t(roleLabelMap[role] || role);
}
