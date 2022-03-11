export interface ChunkDTO {
    length: number;
    cipherText: Record<string, string>; // serialized CipherText
}
