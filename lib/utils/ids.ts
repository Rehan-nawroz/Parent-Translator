/** Request-scoped identifiers. Never derived from a filename, email, or other personal data. */
export function createRequestId(): string {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi && typeof cryptoApi.randomUUID === "function") {
    return `req_${cryptoApi.randomUUID().replace(/-/g, "")}`;
  }
  return `req_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
}
