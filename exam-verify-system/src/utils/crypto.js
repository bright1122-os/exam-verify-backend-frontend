import CryptoJS from 'crypto-js';

const SECRET_KEY = import.meta.env.VITE_QR_SECRET_KEY || 'default-secret-change-me-in-prod-123';

/**
 * Encrypts data for the QR code using AES-256.
 * The output is a URL-safe string.
 */
export const encryptQRData = (data) => {
    try {
        const jsonString = JSON.stringify(data);
        const encrypted = CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString();
        return encrypted;
    } catch (error) {
        console.error('Encryption failed:', error);
        return null;
    }
};

/**
 * Decrypts data from the QR code using AES-256.
 * Returns the original JSON object or null if invalid.
 */
export const decryptQRData = (encryptedString) => {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedString, SECRET_KEY);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);

        if (!originalText) return null; // Decryption failed (wrong key or bad data)

        return JSON.parse(originalText);
    } catch (error) {
        console.error('Decryption failed:', error);
        return null;
    }
};
