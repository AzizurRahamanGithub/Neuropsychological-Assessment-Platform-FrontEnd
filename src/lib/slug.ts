export function makeSlug(len = 32) {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);

  // url-safe base64-ish (no + / =)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("").slice(0, len);
}
