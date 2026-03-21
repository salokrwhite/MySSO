import { API_BASE } from "../../../api/client";

export async function convertImageToWebp(file: File): Promise<string> {
  const imageUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("图片读取失败"));
      element.src = imageUrl;
    });

    const maxSize = 256;
    const ratio = Math.min(maxSize / image.width, maxSize / image.height, 1);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * ratio));
    canvas.height = Math.max(1, Math.round(image.height * ratio));

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("浏览器不支持图片转换");
    }

    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/webp", 0.92);
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

export async function convertImageToSquareWebp(file: File, size: number): Promise<string> {
  const imageUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("图片读取失败"));
      element.src = imageUrl;
    });

    const shortestEdge = Math.min(image.width, image.height);
    const offsetX = Math.max(0, Math.round((image.width - shortestEdge) / 2));
    const offsetY = Math.max(0, Math.round((image.height - shortestEdge) / 2));
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("浏览器不支持图片转换");
    }

    context.drawImage(image, offsetX, offsetY, shortestEdge, shortestEdge, 0, 0, size, size);
    return canvas.toDataURL("image/webp", 0.92);
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

export async function uploadSiteLogo(dataUrl: string, _sessionToken?: string): Promise<string> {
  const response = await fetch(`${API_BASE}/admin/system-settings/site-logo`, {
    method: "POST",
    credentials: "include",
    body: (() => {
      const formData = new FormData();
      const [meta, base64] = dataUrl.split(",", 2);
      const mime = meta.match(/data:(.*?);base64/)?.[1] || "image/webp";
      const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
      formData.append("file", new File([bytes], "site-logo.webp", { type: mime }));
      return formData;
    })()
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(payload.error || "图标上传失败");
  }

  const payload = (await response.json()) as { data?: { url?: string } };
  return payload.data?.url || "";
}

export async function uploadDeveloperAppIcon(dataUrl: string, _sessionToken?: string): Promise<string> {
  const response = await fetch(`${API_BASE}/developer/apps/icon`, {
    method: "POST",
    credentials: "include",
    body: (() => {
      const formData = new FormData();
      const [meta, base64] = dataUrl.split(",", 2);
      const mime = meta.match(/data:(.*?);base64/)?.[1] || "image/webp";
      const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
      formData.append("file", new File([bytes], "app-icon.webp", { type: mime }));
      return formData;
    })()
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(payload.error || "应用图标上传失败");
  }

  const payload = (await response.json()) as { data?: { url?: string } };
  return payload.data?.url || "";
}
