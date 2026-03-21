import type { TFunction } from "i18next";

export function statusColor(status: string) {
  switch (status) {
    case "approved":
      return "green";
    case "rejected":
      return "red";
    default:
      return "gold";
  }
}

export function statusText(status: string, t: TFunction<"developer">) {
  switch (status) {
    case "approved":
      return t("status.approved");
    case "rejected":
      return t("status.rejected");
    case "pending_review":
    case "pending":
      return t("status.pending");
    default:
      return status;
  }
}
