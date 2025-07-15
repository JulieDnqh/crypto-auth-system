// File: gui/app/components/dashboard-components/FileProcessing.tsx
"use client";

import { useState } from 'react';
// Import các hàm từ service module
import { encryptLargeFile, decryptChunkedFile, calculateFileHash } from '@/lib/chunkingService'; 

const FileProcessing = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [verificationLogs, setVerificationLogs] = useState<string[]>([]);
  const [verificationResult, setVerificationResult] = useState<string>('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files) {
          setSelectedFile(event.target.files[0]);
          setVerificationLogs([]);
          setVerificationResult('');
      }
  };
  
  const handleVerifyFeature12 = async () => {
      if (!selectedFile) {
          alert('Please select a file to verify.');
          return;
      }
      
      const LARGE_FILE_THRESHOLD = 5 * 1024 * 1024;
      if (selectedFile.size <= LARGE_FILE_THRESHOLD) {
          alert(`This verification is for large files (>5MB) only. Please select a larger file.\nYour file is ${selectedFile.size} bytes.`);
          return;
      }

      setIsTesting(true);
      const logs: string[] = [];
      const log = (message: string) => {
          console.log(message);
          logs.push(message);
          setVerificationLogs([...logs]);
      };

      try {
          log("--- VERIFYING FEATURE 12: LARGE FILE CHUNKING ---");
          log(`Selected file: ${selectedFile.name} (${selectedFile.size} bytes)`);

          log("\n[STEP 1] Calculating original file hash (SHA-256)...");
          const originalFileHash = await calculateFileHash(selectedFile);
          log(`Original Hash: ${originalFileHash}`);
          
          log("\n[NEW STEP] Generating AES-GCM session key (simulating Feature 6)...");
          const sessionKey = await window.crypto.subtle.generateKey(
              { name: "AES-GCM", length: 256 },
              true,
              ["encrypt", "decrypt"]
          );
          log("Session key generated successfully.");

          log("\n[STEP 2] Calling encryption function (encryptLargeFile)...");
          const encryptedResultPayload = await encryptLargeFile(selectedFile, sessionKey);
          log("Encryption function returned:");
          log(`- Encrypted chunks count: ${encryptedResultPayload.chunks.length}`);

          log("\n[STEP 3] Calling decryption function (decryptChunkedFile)...");
          const decryptedFileBlob = await decryptChunkedFile(encryptedResultPayload, sessionKey);
          log(`Reassembled file blob size: ${decryptedFileBlob.size} bytes`);
          
          log("\n[STEP 4] Calculating decrypted file hash...");
          const decryptedFileHash = await calculateFileHash(decryptedFileBlob);
          log(`Decrypted Hash: ${decryptedFileHash}`);

          log("\n[STEP 5] Comparing hashes and concluding...");
          if (originalFileHash === decryptedFileHash) {
              const successMsg = "✅ SUCCESS: Original and decrypted file hashes MATCH.";
              log(successMsg);
              setVerificationResult(successMsg);
          } else {
              const errorMsg = "❌ FAILURE: Original and decrypted file hashes DO NOT MATCH.";
              log(errorMsg);
              setVerificationResult(errorMsg);
          }
      } catch (error: any) {
          const errorMsg = `An error occurred during verification: ${error.message}`;
          log(errorMsg);
          setVerificationResult(errorMsg);
      } finally {
          setIsTesting(false);
      }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-8">
        {/* --- Your Original Feature Sections --- */}
        <div>
            <h3 className="text-xl font-semibold text-[#001C44] mb-3">Encrypt File for Others</h3>
            <p className="text-gray-700">This is where Feature 6 logic will be. It will check file size and call `encryptLargeFile` from the service if needed.</p>
        </div>
        <div>
            <h3 className="text-xl font-semibold text-[#001C44] mb-3">Decrypt File</h3>
            <p className="text-gray-700">This is where Feature 7 logic will be. It will detect the format and call `decryptChunkedFile` if needed.</p>
        </div>
        <div>
            <h3 className="text-xl font-semibold text-[#001C44] mb-3">Sign File</h3>
            <p className="text-gray-700">Content for signing files.</p>
        </div>
        <div>
            <h3 className="text-xl font-semibold text-[#001C44] mb-3">Verify Signature</h3>
            <p className="text-gray-700">Content for verifying signatures.</p>
        </div>
        
        {/* --- STANDALONE VERIFICATION AREA FOR FEATURE 12 --- */}
        <div className="pt-8 border-t">
            <h3 className="text-xl font-semibold text-[#001C44] mb-3">🧪 Standalone Verification for Feature 12</h3>
            <p className="text-gray-700 mb-4">Select a large file (> 5MB) to test the chunking, encryption, and integrity verification process.</p>
            
            <div className="space-y-4">
                <input 
                    type="file" 
                    onChange={handleFileChange} 
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <button
                    onClick={handleVerifyFeature12}
                    disabled={!selectedFile || isTesting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400 hover:bg-blue-700 transition-colors"
                >
                    {isTesting ? 'Verifying...' : 'Start Verification'}
                </button>

                {verificationLogs.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-gray-800">Process Log:</h4>
                        <pre className="p-3 mt-2 bg-gray-100 rounded-md text-xs text-gray-600 whitespace-pre-wrap max-h-60 overflow-y-auto">
                            {verificationLogs.join('\n')}
                        </pre>
                    </div>
                )}

                {verificationResult && (
                    <div>
                        <h4 className="font-semibold text-gray-800">Final Result:</h4>
                        <div className={`p-3 mt-2 font-medium rounded-md ${verificationResult.includes('SUCCESS') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {verificationResult}
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default FileProcessing;