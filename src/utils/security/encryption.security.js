import CryptoJS from "crypto-js";

// ✅ تشفير
export const generateEncryption = async ({
  plaintext = "",
  secretKey = process.env.ENCRYPTION_SECRET,
} = {}) => {
  if (!plaintext) {
    throw new Error("generateEncryption: plaintext is required");
  }
  if (!secretKey) {
    throw new Error("generateEncryption: secretKey is missing (check .env)");
  }

  try {
    const cipherText = CryptoJS.AES.encrypt(plaintext, secretKey).toString();
    return cipherText;
  } catch (error) {
    console.error("Encryption error:", error.message);
    throw error;
  }
};

 
export const decryptEncryption = async ({
  cipherText = "",
  secretKey = process.env.ENCRYPTION_SECRET,
} = {}) => {
  if (!cipherText) {
    throw new Error("decryptEncryption: cipherText is required");
  }
  if (!secretKey) {
    throw new Error("decryptEncryption: secretKey is missing (check .env)");
  }

  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, secretKey);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);

    if (!originalText) {
      throw new Error("decryptEncryption: Failed to decrypt. Invalid cipherText or secretKey");
    }

    return originalText;
  } catch (error) {
    console.error("Decryption error:", error.message);
    throw error;
  }
};
