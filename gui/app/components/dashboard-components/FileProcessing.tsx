// File: gui/app/components/dashboard-components/FileProcessing.tsx
"use client";

import { useState, useEffect } from 'react';
import { encryptLargeFile, decryptChunkedFile, calculateFileHash } from '@/lib/chunkingService'; 

interface OutputFile {
    name: string;
    url: string;
}

// Helper để download file
const downloadFile = (fileName: string, blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
};

const FileProcessing = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isTesting, setIsTesting] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [result, setResult] = useState<string>('');
    const [outputFiles, setOutputFiles] = useState<OutputFile[]>([]);

    useEffect(() => {
        return () => {
            outputFiles.forEach(file => URL.revokeObjectURL(file.url));
        };
    }, [outputFiles]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setSelectedFile(event.target.files[0]);
            setLogs([]);
            setResult('');
            outputFiles.forEach(file => URL.revokeObjectURL(file.url));
            setOutputFiles([]); 
        }
    };
    
    const handleScenario = async () => {
        if (!selectedFile) { alert('Please select a file.'); return; }
        
        const LARGE_FILE_THRESHOLD = 5 * 1024 * 1024;
        if (selectedFile.size <= LARGE_FILE_THRESHOLD) {
            alert(`This scenario is for large files (>5MB) only. Your file is ${selectedFile.size} bytes.`);
            return;
        }

        setIsTesting(true);
        setLogs([]);
        setResult('');
        outputFiles.forEach(file => URL.revokeObjectURL(file.url));
        setOutputFiles([]);

        const logMessages: string[] = [];
        const log = (message: string) => {
            console.log(message);
            logMessages.push(message);
            setLogs([...logMessages]);
        };

        try {
            log("--- START: 'Split and Encode Big File' Scenario ---");

            log("\n[Step 1] Calculating original file hash for integrity check...");
            const originalFileHash = await calculateFileHash(selectedFile);
            log(`Original Hash: ${originalFileHash}`);
            
            log("\n[Step 2] Generating AES-GCM session key...");
            const sessionKey = await window.crypto.subtle.generateKey(
                { name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]
            );
            log("Session key generated.");

            log("\n[Step 3] Calling Feature 12 (encryptLargeFile)...");
            const encryptedPayload = await encryptLargeFile(selectedFile, sessionKey);
            log(`Encryption complete. ${encryptedPayload.chunks.length} chunks created.`);

            log("\n[Step 4] Creating encrypted file blob...");
            const encryptedBlob = new Blob(encryptedPayload.chunks.map(c => c.data), { type: 'application/octet-stream' });
            
            log("\n[Step 5] Decrypting the result immediately...");
            const decryptedFileBlob = await decryptChunkedFile(encryptedPayload, sessionKey);

            log("\n[Step 6] Generating download links...");
            const encryptedUrl = URL.createObjectURL(encryptedBlob);
            const decryptedUrl = URL.createObjectURL(decryptedFileBlob);

            setOutputFiles([
                { name: `${selectedFile.name}.enc`, url: encryptedUrl },
                { name: `DECRYPTED_${selectedFile.name}`, url: decryptedUrl }
            ]);
            
            log("\n[Step 7] Calculating decrypted file hash for integrity check...");
            const decryptedFileHash = await calculateFileHash(decryptedFileBlob);
            log(`Decrypted Hash: ${decryptedFileHash}`);

            log("\n--- FINAL RESULT ---");
            if (originalFileHash === decryptedFileHash) {
                const successMsg = "✅ SUCCESS: Integrity check passed. Hashes MATCH.";
                log(successMsg);
                setResult(successMsg);
            } else {
                const errorMsg = "❌ FAILURE: Integrity check failed. Hashes DO NOT MATCH.";
                log(errorMsg);
                setResult(errorMsg);
            }
        } catch (error: any) {
            const errorMsg = `An error occurred: ${error.message}`;
            log(errorMsg);
            setResult(errorMsg);
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="pt-8">
                <h3 className="text-xl font-semibold text-[#001C44] mb-3">Split and Encode Big File</h3>
                <p className="text-gray-700 mb-4">This scenario demonstrates Feature 12. It will take a large file (larger than 5MB), encrypt it in chunks, and provide both the encrypted and decrypted files for verification.</p>
                
                <div className="space-y-4 p-4 border rounded-lg">
                    <input 
                        type="file" 
                        onChange={handleFileChange} 
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <button
                        onClick={handleScenario}
                        disabled={!selectedFile || isTesting}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400 hover:bg-blue-700"
                    >
                        {isTesting ? 'Processing...' : 'Run Scenario'}
                    </button>
                    
                    {outputFiles.length > 0 && !isTesting && (
                        <div className="pt-4 border-t">
                             <h4 className="font-semibold text-gray-800">Download Files:</h4>
                             <ul className="list-disc list-inside mt-2 space-y-1">
                                {outputFiles.map((file, index) => (
                                    <li key={index}>
                                        <a href={file.url} download={file.name} className="text-blue-600 hover:underline">
                                            {file.name}
                                        </a>
                                    </li>
                                ))}
                             </ul>
                        </div>
                    )}

                    {logs.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-gray-800">Process Log:</h4>
                            <pre className="p-3 mt-2 bg-gray-100 rounded-md text-xs text-gray-600 whitespace-pre-wrap max-h-60 overflow-y-auto">
                                {logs.join('\n')}
                            </pre>
                        </div>
                    )}

                    {result && (
                        <div>
                            <h4 className="font-semibold text-gray-800">Final Result:</h4>
                            <div className={`p-3 mt-2 font-medium rounded-md ${result.includes('SUCCESS') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {result}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FileProcessing;