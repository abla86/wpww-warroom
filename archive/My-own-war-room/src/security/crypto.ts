export async function computeSha256(data: string | object): Promise<string> {
  const text = typeof data === 'string' ? data : JSON.stringify(data);
  const cryptoSubtle = globalThis.crypto?.subtle;

  if (cryptoSubtle) {
    const msgBuffer = new TextEncoder().encode(text);
    const hashBuffer = await cryptoSubtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  // Last-resort deterministic non-cryptographic fallback.
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

export function syncHash(data: string | object): string {
  const text = typeof data === 'string' ? data : JSON.stringify(data);
  let hash = 5381;
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 33) ^ text.charCodeAt(i);
  }
  return (hash >>> 0).toString(16).padStart(8, '0') + text.length.toString(16);
}
