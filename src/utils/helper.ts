import forge from 'node-forge';
import { v4 as uuidv4 } from 'uuid';

export function generateSHA512(data: string) {
    const sha512 = forge.md.sha512.create();
    sha512.update(data);
    return sha512.digest().toHex();
}

export function getUUIDV4(): string {
    return uuidv4();
}
