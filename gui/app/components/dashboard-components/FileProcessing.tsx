// File: gui/app/components/dashboard-components/FileProcessing.tsx
"use client";

import { useState } from 'react';
// Import các hàm từ cả hai service
import { processEncryption, processDecryption, EncryptionResult } from '@/lib/fileProcessingService';
// Bạn có thể không cần import calculateFileHash ở đây nếu không dùng phần kiểm chứng
// import { calculateFileHash } from '@/lib/chunkingService'; 

// --- CÁC HÀM HELPER CHO VIỆC XỬ LÝ KHÓA (CLIENT-SIDE) ---

/**
 * Chuyển đổi một public key dạng chuỗi (PEM Base64) thành đối tượng CryptoKey.
 */
async function importRsaPublicKey(pemKey: string): Promise<CryptoKey> {
    const pemContents = pemKey.replace('-----BEGIN PUBLIC KEY-----', '').replace('-----END PUBLIC KEY-----', '').replace(/\s/g, '');
    const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
    return await window.crypto.subtle.importKey('spki', binaryDer, { name: "RSA-OAEP", hash: "SHA-256" }, true, ["wrapKey"]);
}

/**
 * Client-side equivalent of the backend's decryptPrivateKey function.
 * It uses Web Crypto API to decrypt the user's private key.
 */
async function decryptPrivateKeyClientSide(encryptedDataHex: string, passphrase: string, saltHex: string, ivHex: string): Promise<string> {
    const salt = Uint8Array.from(saltHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));
    const iv = Uint8Array.from(ivHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));
    const encryptedData = Uint8Array.from(encryptedDataHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));

    const passphraseKey = await window.crypto.subtle.importKey('raw', new TextEncoder().encode(passphrase), { name: 'PBKDF2' }, false, ['deriveKey']);
    
    const aesKey = await window.crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt: salt, iterations: 100000, hash: 'SHA-512' },
        passphraseKey,
        { name: 'AES-CBC', length: 256 },
        true,
        ['decrypt']
    );

    const decryptedPrivateKeyBuffer = await window.crypto.subtle.decrypt({ name: 'AES-CBC', iv: iv }, aesKey, encryptedData);
    return new TextDecoder().decode(decryptedPrivateKeyBuffer);
}

/**
 * Converts a PEM-formatted private key string to a CryptoKey object.
 */
async function importRsaPrivateKey(pemKey: string): Promise<CryptoKey> {
    const pemContents = pemKey.replace('-----BEGIN PRIVATE KEY-----', '').replace('-----END PRIVATE KEY-----', '').replace(/\s/g, '');
    const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
    return await window.crypto.subtle.importKey('pkcs8', binaryDer, { name: "RSA-OAEP", hash: "SHA-256" }, true, ["unwrapKey"]);
}


const FileProcessing = () => {
    // --- State cho Chức năng 6: Mã hóa ---
    const [fileToEncrypt, setFileToEncrypt] = useState<File | null>(null);
    const [recipientEmail, setRecipientEmail] = useState('');
    const [saveFormat, setSaveFormat] = useState<'combined' | 'split'>('combined');
    const [isEncrypting, setIsEncrypting] = useState(false);

    // --- State cho Chức năng 7: Giải mã ---
    const [filesToDecrypt, setFilesToDecrypt] = useState<FileList | null>(null);
    const [passphrase, setPassphrase] = useState('');
    const [isDecrypting, setIsDecrypting] = useState(false);

    // Xử lý download nhiều file
    const downloadFiles = (files: EncryptionResult[]) => {
        if (files.length === 0) return;
        files.forEach(file => {
            const url = URL.createObjectURL(file.blob);
            const a = document.createElement('a');
            a.style.display = 'none'; a.href = url; a.download = file.fileName;
            document.body.appendChild(a); a.click();
            URL.revokeObjectURL(url); document.body.removeChild(a);
        });
    };

    // --- HÀM MÃ HÓA VỚI API THẬT ---
    const handleEncryption = async () => {
        if (!fileToEncrypt || !recipientEmail) {
            alert("Please select a file and enter a recipient's email.");
            return;
        }
        setIsEncrypting(true);
        try {
            // Bước 1: Gọi API backend để lấy public key của người nhận
            console.log(`Fetching public key for ${recipientEmail}...`);

            const token = localStorage.getItem('jwtToken'); // Lấy token từ local storage
            const response = await fetch(`http://localhost:5000/api/users/key?email=${encodeURIComponent(recipientEmail)}`, {
                // Bổ sung header xác thực
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();

            if (!response.ok || !data.found || !data.publicKey) {
                throw new Error(data.message || "Recipient not found or has no public key.");
            }
            
            // Bước 2: Import public key nhận về thành đối tượng CryptoKey
            console.log("Public key found. Importing key...");
            const recipientPublicKey = await importRsaPublicKey(data.publicKey);
            
            // Bước 3: Gọi hàm mã hóa với key thật
            const encryptedFiles = await processEncryption(fileToEncrypt, recipientPublicKey, saveFormat);
            
            downloadFiles(encryptedFiles);
            alert("Encryption successful! File(s) have been downloaded.");

        } catch (err: any) {
            console.error("Encryption failed:", err);
            alert(`Encryption failed: ${err.message}`);
        } finally {
            setIsEncrypting(false);
        }
    };

    // --- HÀM GIẢI MÃ VỚI API THẬT ---
    const handleDecryption = async () => {
        if (!filesToDecrypt || filesToDecrypt.length === 0 || !passphrase) {
            alert("Please select file(s) and enter your passphrase.");
            return;
        }
        setIsDecrypting(true);
        try {
            // BƯỚC 1: GỌI API ĐỂ LẤY KHÓA RIÊNG TƯ ĐÃ MÃ HÓA CỦA BẠN
            console.log("Fetching encrypted private key from server...");
            const token = localStorage.getItem('jwtToken');
            const keyResponse = await fetch('http://localhost:5000/api/rsa/my-key', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!keyResponse.ok) {
                throw new Error("Could not fetch your RSA key from the server.");
            }
            const keyData = await keyResponse.json();

            // BƯỚC 2: DÙNG PASSPHRASE ĐỂ GIẢI MÃ PRIVATE KEY NGAY TẠI CLIENT
            console.log("Decrypting private key on client-side...");
            const decryptedPemKey = await decryptPrivateKeyClientSide(
                keyData.encryptedPrivateKey,
                passphrase,
                keyData.passphraseSalt,
                keyData.iv
            );

            // BƯỚC 3: IMPORT PRIVATE KEY VỪA GIẢI MÃ THÀNH ĐỐI TƯỢNG CRYPTOKEY
            console.log("Importing decrypted private key...");
            const userPrivateKey = await importRsaPrivateKey(decryptedPemKey);

            // BƯỚC 4: TIẾN HÀNH GIẢI MÃ FILE
            const decryptedResult = await processDecryption(Array.from(filesToDecrypt), userPrivateKey);
            
            downloadFiles([decryptedResult]);
            alert("Decryption successful! File has been downloaded.");

        } catch (err: any) {
            console.error("Decryption failed:", err);
            alert(`Decryption failed: ${err.message}`);
        } finally {
            setIsDecrypting(false);
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md space-y-8">
            <h2 className="text-2xl font-bold text-[#001C44] mb-4">File Processing</h2>
            
            {/* --- FEATURE 6: ENCRYPT FILE --- */}
            <div>
                <h3 className="text-xl font-semibold text-[#001C44] mb-3">Encrypt File for Others</h3>
                <div className="space-y-4 p-4 border rounded-lg">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">1. Select File to Encrypt</label>
                        <input type="file" onChange={(e) => setFileToEncrypt(e.target.files?.[0] || null)} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">2. Recipient's Email</label>
                        <input type="email" placeholder="recipient@example.com" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} className="mt-1 w-full p-2 border rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">3. Save Format (Feature 16)</label>
                        <div className="flex gap-4 mt-1">
                            <label className="flex items-center"><input type="radio" value="combined" name="saveFormat" checked={saveFormat === 'combined'} onChange={() => setSaveFormat('combined')} className="mr-2"/> Combined (.enc)</label>
                            <label className="flex items-center"><input type="radio" value="split" name="saveFormat" checked={saveFormat === 'split'} onChange={() => setSaveFormat('split')} className="mr-2"/> Split (.key + .enc)</label>
                        </div>
                    </div>
                    <button onClick={handleEncryption} disabled={isEncrypting} className="w-full px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400 hover:bg-blue-700">
                        {isEncrypting ? 'Encrypting...' : 'Encrypt and Download'}
                    </button>
                </div>
            </div>

            {/* --- FEATURE 7: DECRYPT FILE --- */}
            <div>
                <h3 className="text-xl font-semibold text-[#001C44] mb-3">Decrypt File</h3>
                <div className="space-y-4 p-4 border rounded-lg">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">1. Select Encrypted File(s)</label>
                        <input type="file" multiple accept=".enc,.key" onChange={(e) => setFilesToDecrypt(e.target.files)} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">2. Your Passphrase</label>
                        <input type="password" placeholder="Enter your passphrase" value={passphrase} onChange={(e) => setPassphrase(e.target.value)} className="mt-1 w-full p-2 border rounded-md" />
                    </div>
                    <button onClick={handleDecryption} disabled={isDecrypting} className="w-full px-4 py-2 bg-green-600 text-white rounded-md disabled:bg-gray-400 hover:bg-green-700">
                        {isDecrypting ? 'Decrypting...' : 'Decrypt and Download'}
                    </button>
                </div>
            </div>

            {/* --- Các chức năng gốc của bạn --- */}
            <div>
                <h3 className="text-xl font-semibold text-[#001C44] mb-3">Sign File</h3>
                <p className="text-gray-700">Content for signing files.</p>
            </div>
            <div>
                <h3 className="text-xl font-semibold text-[#001C44] mb-3">Verify Signature</h3>
                <p className="text-gray-700">Content for verifying signatures.</p>
            </div>
        </div>
    );
};

export default FileProcessing;