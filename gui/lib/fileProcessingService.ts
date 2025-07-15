// File: gui/lib/fileProcessingService.ts

import { encryptLargeFile, decryptChunkedFile, DecryptLargeFilePayload } from './chunkingService';

// --- TYPE DEFINITIONS ---
// Cấu trúc cho file .key khi lưu tách
interface SplitKeyFile {
  format: 'split_v1_key';
  algorithm: { file: 'AES-GCM'; key: 'RSA-OAEP' };
  encryptedSessionKey: string;
  isChunked: boolean;
  originalFileName: string;
  payload_ivs: string[] | string; // Mảng IVs cho file lớn, một IV cho file nhỏ
}

// Cấu trúc cho file gộp
interface CombinedFile {
  format: 'combined_v1';
  algorithm: { file: 'AES-GCM'; key: 'RSA-OAEP' };
  encryptedSessionKey: string;
  isChunked: boolean;
  originalFileName: string;
  payload: { iv: string; data: string }[] | { iv: string; data: string };
}

// Kiểu trả về của hàm mã hóa
export type EncryptionResult = {
    fileName: string;
    blob: Blob;
}

// --- LOGIC MÃ HÓA ---

async function encryptSmallFile(file: File, sessionKey: CryptoKey): Promise<{iv: Uint8Array, data: Uint8Array}> {
  const fileBuffer = await file.arrayBuffer();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encryptedData = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv }, sessionKey, fileBuffer);
  return { iv, data: new Uint8Array(encryptedData) };
}

export async function processEncryption(
    fileToEncrypt: File, 
    recipientPublicKey: CryptoKey,
    format: 'combined' | 'split'
): Promise<EncryptionResult[]> {
    console.log(`--- [Feature 6] START: Encryption Process (Format: ${format}) ---`);
    const LARGE_FILE_THRESHOLD = 5 * 1024 * 1024;
    const sessionKey = await window.crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "wrapKey"]);
    const isLargeFile = fileToEncrypt.size > LARGE_FILE_THRESHOLD;

    let encryptionPayload;
    if (isLargeFile) {
        encryptionPayload = await encryptLargeFile(fileToEncrypt, sessionKey);
    } else {
        const encryptedData = await encryptSmallFile(fileToEncrypt, sessionKey);
        encryptionPayload = { isChunked: false, originalFileName: fileToEncrypt.name, chunks: [encryptedData] };
    }

    const wrappedSessionKey = await window.crypto.subtle.wrapKey("raw", sessionKey, recipientPublicKey, { name: "RSA-OAEP" });
    const toBase64 = (buffer: ArrayBuffer | Uint8Array): string => {
        const uint8 = new Uint8Array(buffer);
        const CHUNK_SIZE = 8192; // Xử lý mỗi lần 8KB
        let binary = '';
        for (let i = 0; i < uint8.length; i += CHUNK_SIZE) {
            // Áp dụng fromCharCode cho từng khối nhỏ, tránh lỗi call stack
            binary += String.fromCharCode.apply(null, Array.from(uint8.subarray(i, i + CHUNK_SIZE)));
        }
        return btoa(binary);
    };

    // --- FEATURE 16: TẠO FILE DỰA TRÊN LỰA CHỌN ---
    if (format === 'combined') {
        const finalPackage: CombinedFile = {
            format: 'combined_v1',
            algorithm: { file: 'AES-GCM', key: 'RSA-OAEP' },
            encryptedSessionKey: toBase64(wrappedSessionKey),
            isChunked: encryptionPayload.isChunked,
            originalFileName: encryptionPayload.originalFileName,
            payload: encryptionPayload.isChunked 
                ? encryptionPayload.chunks.map(c => ({ iv: toBase64(c.iv), data: toBase64(c.data) }))
                : { iv: toBase64(encryptionPayload.chunks[0].iv), data: toBase64(encryptionPayload.chunks[0].data) }
        };
        const blob = new Blob([JSON.stringify(finalPackage, null, 2)], { type: 'application/octet-stream' });
        return [{ fileName: `${fileToEncrypt.name}.enc`, blob }];
    } else { // format === 'split'
        const keyFileContent: SplitKeyFile = {
            format: 'split_v1_key',
            algorithm: { file: 'AES-GCM', key: 'RSA-OAEP' },
            encryptedSessionKey: toBase64(wrappedSessionKey),
            isChunked: encryptionPayload.isChunked,
            originalFileName: encryptionPayload.originalFileName,
            payload_ivs: encryptionPayload.isChunked
                ? encryptionPayload.chunks.map(c => toBase64(c.iv))
                : toBase64(encryptionPayload.chunks[0].iv)
        };
        const keyFileBlob = new Blob([JSON.stringify(keyFileContent, null, 2)], { type: 'application/json' });

        const encryptedDataBlobs = encryptionPayload.chunks.map(c => c.data);
        const dataFileBlob = new Blob(encryptedDataBlobs, { type: 'application/octet-stream' });

        return [
            { fileName: `${fileToEncrypt.name}.key`, blob: keyFileBlob },
            { fileName: `${fileToEncrypt.name}.enc`, blob: dataFileBlob }
        ];
    }
}

// --- LOGIC GIẢI MÃ ---

export async function processDecryption(
    files: File[], 
    userPrivateKey: CryptoKey
): Promise<{fileName: string, blob: Blob}> {
    console.log(`--- [Feature 7] START: Decryption Process with ${files.length} file(s) ---`);
    const fromBase64 = (str: string) => Uint8Array.from(atob(str), c => c.charCodeAt(0));

    let keyFileContent: SplitKeyFile | CombinedFile;
    let encryptedData: ArrayBuffer;

    // --- FEATURE 16: TỰ ĐỘNG NHẬN DIỆN ĐỊNH DẠNG ---
    if (files.length === 1 && files[0].name.endsWith('.enc')) {
        console.log("[Feature 16] Detected: Combined file format. Trying to parse as JSON...");
        try {
            const combinedFile: CombinedFile = JSON.parse(await files[0].text());
            if (combinedFile.format !== 'combined_v1') throw new Error();
            keyFileContent = combinedFile;
            
            if (combinedFile.isChunked) {
              const chunks = (combinedFile.payload as any[]).map(p => fromBase64(p.data));
              encryptedData = (await new Blob(chunks).arrayBuffer());
            } else {
              encryptedData = fromBase64((combinedFile.payload as any).data).buffer;
            }
        } catch (e) {
            throw new Error("Invalid combined .enc file. It might be a split file missing its .key part.");
        }
    } else if (files.length === 2) {
        const keyFile = files.find(f => f.name.endsWith('.key'));
        const dataFile = files.find(f => f.name.endsWith('.enc'));
        if (!keyFile || !dataFile) {
            throw new Error("For split format, a .key and a .enc file are required.");
        }
        
        console.log("[Feature 16] Detected: Split file format.");
        keyFileContent = JSON.parse(await keyFile.text());
        encryptedData = await dataFile.arrayBuffer();
    } else {
        throw new Error("Invalid input. Please provide one .enc file (for combined format) or both .key and .enc files (for split format).");
    }
    
    const sessionKey = await window.crypto.subtle.unwrapKey( "raw", fromBase64(keyFileContent.encryptedSessionKey), userPrivateKey,
        { name: "RSA-OAEP" }, { name: "AES-GCM", length: 256 }, true, ["decrypt"] );

    let decryptedBuffer: ArrayBuffer;
    if (keyFileContent.isChunked) {
        // This logic handles both combined and split formats for chunked files
        const ivs = (keyFileContent as any).payload_ivs?.map(fromBase64) || (keyFileContent as any).payload.map((p: any) => fromBase64(p.iv));
        const chunks = [];
        let offset = 0;
        const CHUNK_SIZE = 1 * 1024 * 1024; // 1MB
        for (let i = 0; i < ivs.length; i++) {
            const chunkSize = (i === ivs.length - 1) ? (encryptedData.byteLength - offset) : CHUNK_SIZE;
            const chunk = encryptedData.slice(offset, offset + chunkSize);
            chunks.push(await window.crypto.subtle.decrypt({ name: "AES-GCM", iv: ivs[i] }, sessionKey, chunk));
            offset += chunkSize;
        }
        decryptedBuffer = await new Blob(chunks).arrayBuffer();
    } else {
        // This logic handles both combined and split formats for small files
        const iv = fromBase64((keyFileContent as any).payload_ivs || (keyFileContent as any).payload.iv);
        decryptedBuffer = await window.crypto.subtle.decrypt({ name: "AES-GCM", iv }, sessionKey, encryptedData);
    }
    
    return {
        fileName: `decrypted_${keyFileContent.originalFileName}`,
        blob: new Blob([decryptedBuffer])
    };
}