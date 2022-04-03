import forge from 'node-forge';
import { v4 as uuidv4 } from 'uuid';
import { scryptSync, timingSafeEqual } from 'crypto';
import { Session } from 'express-session';
import { readdirSync, unlinkSync, writeFile, readFile } from 'fs';
import { join } from 'path';
import { EventEmitter } from 'events';

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
export function hashAndSaltPasswordToHex(password: string, salt: Buffer): string {
    return scryptSync(password, salt, 64).toString('hex');
}

const textEncoder = new TextEncoder();
export function timingSafeEqualStrings(a: string, b: string): boolean {
    return timingSafeEqual(textEncoder.encode(a), textEncoder.encode(b));
}

export async function regenerateSession(session: Session): Promise<void> {
    return new Promise((resolve) => {
        session.regenerate(() => {
            resolve();
        });
    });
}

export function cleanDirectory(directoryPath: string) {
    const files = readdirSync(directoryPath);
    for (const filePath of files) {
        unlinkSync(join(directoryPath, filePath));
    }
}

export function doNothing() {
    return;
}

export function writeFilePromise(
    inputPath: string,
    data: string | NodeJS.ArrayBufferView
): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        writeFile(inputPath, data, (err) => (err ? reject(err) : resolve()));
    });
}

export function readFilePromise(inputPath: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        readFile(
            inputPath,
            {
                encoding: 'utf-8',
            },
            (err, data) => (err ? reject(err) : resolve(data))
        );
    });
}
