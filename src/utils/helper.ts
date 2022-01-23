import forge from 'node-forge';
import { v4 as uuidv4 } from 'uuid';
import { scryptSync, randomBytes } from 'crypto';

export function generateSHA512(data: string) {
    const sha512 = forge.md.sha512.create();
    sha512.update(data);
    return sha512.digest().toHex();
}

export function getUUIDV4(): string {
    return uuidv4();
}

/**
 * https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-132.pdf
 * @param password - string password
 * @returns scrypt output in hex format
 */
export function hashAndSaltPasswordToHex(password: string): string {
    return scryptSync(password, randomBytes(16), 64).toString('hex');
}
