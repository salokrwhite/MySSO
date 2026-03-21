import {
  InfoCircleOutlined,
  MenuOutlined,
  QuestionCircleOutlined,
  SafetyCertificateOutlined,
  UserOutlined
} from "@ant-design/icons";
import type { ReactNode } from "react";
import type { TFunction } from "i18next";
import type { UserSectionKey } from "./types";

export type UserSectionItem = {
  key: UserSectionKey;
  label: string;
  icon: ReactNode;
};

export function getSectionItems(t: TFunction): UserSectionItem[] {
  return [
    { key: "security", label: t("nav.security"), icon: <SafetyCertificateOutlined /> },
    { key: "profile", label: t("nav.profile"), icon: <UserOutlined /> },
    { key: "privacy", label: t("nav.privacy"), icon: <InfoCircleOutlined /> },
    { key: "bindings", label: t("nav.bindings"), icon: <MenuOutlined /> },
    { key: "help", label: t("nav.help"), icon: <QuestionCircleOutlined /> }
  ];
}
