import { Button, Form, Input, Modal, Space } from "antd";
import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { fetchCaptchaChallenge, isCaptchaEnabled, type CaptchaChallenge, type CaptchaContext, type CaptchaPayload } from "../utils/captcha";

type PendingRequest = {
  resolve: (payload: CaptchaPayload) => void;
  reject: (error: Error) => void;
};

export function useCaptchaGate() {
  const { t } = useTranslation();
  const [form] = Form.useForm<{ captcha: string }>();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [challenge, setChallenge] = useState<CaptchaChallenge | null>(null);
  const pendingRef = useRef<PendingRequest | null>(null);
  const contextRef = useRef<CaptchaContext | null>(null);

  const loadChallenge = useCallback(async (context?: CaptchaContext) => {
    const nextContext = context || contextRef.current;
    if (!nextContext) {
      throw new Error("captcha context is required");
    }
    contextRef.current = nextContext;
    setLoading(true);
    try {
      const nextChallenge = await fetchCaptchaChallenge(nextContext);
      if (!nextChallenge) {
        return null;
      }
      setChallenge(nextChallenge);
      form.setFieldValue("captcha", "");
      return nextChallenge;
    } finally {
      setLoading(false);
    }
  }, [form]);

  const requestCaptcha = useCallback(async (context: CaptchaContext): Promise<CaptchaPayload> => {
    if (!(await isCaptchaEnabled())) {
      return {};
    }
    const nextChallenge = await loadChallenge(context);
    if (!nextChallenge) {
      return {};
    }
    setOpen(true);
    return new Promise<CaptchaPayload>((resolve, reject) => {
      pendingRef.current = { resolve, reject };
    });
  }, [loadChallenge]);

  const handleCancel = useCallback(() => {
    pendingRef.current?.reject(new Error("captcha cancelled"));
    pendingRef.current = null;
    setOpen(false);
  }, []);

  const handleOk = useCallback(async () => {
    const values = await form.validateFields();
    if (!challenge?.ticket) {
      await loadChallenge();
      return;
    }
    pendingRef.current?.resolve({
      captcha: values.captcha,
      captcha_ticket: challenge.ticket,
      captcha_challenge: challenge.challenge,
      captcha_sign: challenge.sign,
    });
    pendingRef.current = null;
    setOpen(false);
  }, [challenge?.ticket, form, loadChallenge]);

  const modal = useMemo(
    () => (
      <Modal
        title={t("captcha.securityVerification")}
        open={open}
        onOk={() => void handleOk()}
        onCancel={handleCancel}
        okText={t("common.confirm")}
        cancelText={t("common.cancel")}
        confirmLoading={loading}
        destroyOnClose
      >
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {challenge?.image ? <img src={challenge.image} alt="captcha" style={{ maxWidth: "100%", display: "block" }} /> : null}
            </div>
            <Button onClick={() => void loadChallenge()} loading={loading}>
              {t("captcha.refresh")}
            </Button>
          </div>
          <Form form={form} layout="vertical">
            <Form.Item
              name="captcha"
              label={t("captcha.imageCaptcha")}
              rules={[{ required: true, message: t("captcha.imageCaptchaRequired") }]}
            >
              <Input autoComplete="off" />
            </Form.Item>
          </Form>
        </Space>
      </Modal>
    ),
    [challenge?.image, form, handleCancel, handleOk, loadChallenge, loading, open, t]
  );

  return { requestCaptcha, captchaModal: modal };
}
