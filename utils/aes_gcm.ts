/**
 * Derives a 256-bit key from the provided key string using SHA-256.
 */
async function deriveKey(key: string) {
	const encodedKey = new TextEncoder().encode(key)
	const hash = await globalThis.crypto.subtle.digest('SHA-256', encodedKey)
	return globalThis.crypto.subtle.importKey('raw', hash, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'])
}

/**
 * Decrypts the text using AES-GCM algorithm using Web Crypto API.
 * @param encryptedText base64
 * @param key
 * @returns utf8
 */
export async function aesDecrypt(encryptedText: string, key: string) {
	if (!encryptedText || typeof encryptedText !== 'string') throw new Error('[encryptedText] must be a non-empty string.')
	if (!key || typeof key !== 'string') throw new Error('[key] must be a non-empty string.')

	const key_1 = await deriveKey(key)
	const buffer = new Uint8Array(
		atob(encryptedText /*.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (encryptedText.length % 4)) % 4)*/)
			.split('')
			.map(char => char.charCodeAt(0))
	)
	const iv = buffer.slice(0, 12)
	const encryptedData = buffer.slice(12)

	const decrypted = await globalThis.crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key_1, encryptedData)
	return new TextDecoder().decode(decrypted)
}
