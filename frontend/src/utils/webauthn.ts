function base64UrlToArrayBuffer(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = window.atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes.buffer;
}

function arrayBufferToBase64Url(buffer: ArrayBufferLike) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return window.btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function normalizeCredentialDescriptors(items?: Array<{ id: string; type: PublicKeyCredentialType; transports?: AuthenticatorTransport[] }>) {
  if (!Array.isArray(items)) {
    return undefined;
  }
  return items.map((item) => ({
    ...item,
    id: base64UrlToArrayBuffer(item.id)
  }));
}

function serializeCredential(credential: PublicKeyCredential) {
  const response = credential.response;
  if (response instanceof AuthenticatorAttestationResponse) {
    return JSON.stringify({
      id: credential.id,
      rawId: arrayBufferToBase64Url(credential.rawId),
      type: credential.type,
      response: {
        clientDataJSON: arrayBufferToBase64Url(response.clientDataJSON),
        attestationObject: arrayBufferToBase64Url(response.attestationObject)
      },
      clientExtensionResults: credential.getClientExtensionResults()
    });
  }
  const assertionResponse = response as AuthenticatorAssertionResponse;
  return JSON.stringify({
    id: credential.id,
    rawId: arrayBufferToBase64Url(credential.rawId),
    type: credential.type,
    response: {
      clientDataJSON: arrayBufferToBase64Url(assertionResponse.clientDataJSON),
      authenticatorData: arrayBufferToBase64Url(assertionResponse.authenticatorData),
      signature: arrayBufferToBase64Url(assertionResponse.signature),
      userHandle: assertionResponse.userHandle ? arrayBufferToBase64Url(assertionResponse.userHandle) : null
    },
    clientExtensionResults: credential.getClientExtensionResults()
  });
}

export function browserSupportsPasskey() {
  return typeof window !== "undefined" && typeof window.PublicKeyCredential !== "undefined";
}

export async function createPasskeyCredential(options: any) {
  const publicKey: PublicKeyCredentialCreationOptions = {
    ...options.publicKey,
    challenge: base64UrlToArrayBuffer(options.publicKey.challenge),
    user: {
      ...options.publicKey.user,
      id: base64UrlToArrayBuffer(options.publicKey.user.id)
    },
    excludeCredentials: normalizeCredentialDescriptors(options.publicKey.excludeCredentials)
  };
  const credential = await navigator.credentials.create({ publicKey });
  if (!(credential instanceof PublicKeyCredential)) {
    throw new Error("passkey browser unsupported");
  }
  return serializeCredential(credential);
}

export async function getPasskeyAssertion(options: any) {
  const publicKey: PublicKeyCredentialRequestOptions = {
    ...options.publicKey,
    challenge: base64UrlToArrayBuffer(options.publicKey.challenge),
    allowCredentials: normalizeCredentialDescriptors(options.publicKey.allowCredentials)
  };
  const credential = await navigator.credentials.get({ publicKey });
  if (!(credential instanceof PublicKeyCredential)) {
    throw new Error("passkey browser unsupported");
  }
  return serializeCredential(credential);
}
