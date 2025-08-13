import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY;

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
  throw new Error('VITE_ENCRYPTION_KEY must be exactly 32 characters long');
}

export class CryptoService {
  private static key = ENCRYPTION_KEY;

  /**
   * Chiffre une chaîne de caractères avec AES-256
   */
  static encrypt(text: string): string {
    try {
      const encrypted = CryptoJS.AES.encrypt(text, this.key).toString();
      return encrypted;
    } catch (error) {
      console.error('Erreur de chiffrement:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Déchiffre une chaîne de caractères avec AES-256
   */
  static decrypt(encryptedText: string): string {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedText, this.key);
      const result = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!result) {
        throw new Error('Decryption failed - invalid key or corrupted data');
      }
      
      return result;
    } catch (error) {
      console.error('Erreur de déchiffrement:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Chiffre un objet JavaScript
   */
  static encryptObject<T>(obj: T): string {
    const jsonString = JSON.stringify(obj);
    return this.encrypt(jsonString);
  }

  /**
   * Déchiffre un objet JavaScript
   */
  static decryptObject<T>(encryptedData: string): T {
    const decryptedString = this.decrypt(encryptedData);
    return JSON.parse(decryptedString);
  }

  /**
   * Chiffre les données sensibles d'une entrée quotidienne
   */
  static encryptEntry(entry: any): any {
    return {
      ...entry,
      sleep: this.encryptObject(entry.sleep),
      focus: this.encryptObject(entry.focus),
      tasks: this.encryptObject(entry.tasks),
      wellbeing: this.encryptObject(entry.wellbeing),
    };
  }

  /**
   * Déchiffre les données sensibles d'une entrée quotidienne
   */
  static decryptEntry(entry: any): any {
    return {
      ...entry,
      sleep: this.decryptObject(entry.sleep),
      focus: this.decryptObject(entry.focus),
      tasks: this.decryptObject(entry.tasks),
      wellbeing: this.decryptObject(entry.wellbeing),
    };
  }

  /**
   * Génère une clé de chiffrement sécurisée
   */
  static generateKey(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Vérifie si une chaîne est chiffrée
   */
  static isEncrypted(text: string): boolean {
    try {
      // Tentative de déchiffrement
      this.decrypt(text);
      return true;
    } catch {
      return false;
    }
  }
}

export default CryptoService; 