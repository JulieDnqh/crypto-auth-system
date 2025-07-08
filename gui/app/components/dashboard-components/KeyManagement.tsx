"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "../button";
import { Input } from "../input";
import { Label } from "../label";
import { LoaderCircle, AlertTriangle, Trash2 } from "lucide-react";

// Cập nhật interface
interface KeyStatus {
  hasKey: boolean;
  publicKey?: string;
  createdAt?: string;
  expiresAt?: string;
  expiryStatus?: 'active' | 'expiring_soon' | 'expired';
  expiresInDays?: number;
}

export default function RSAPersonalKeyManagement() {
  const [keyStatus, setKeyStatus] = useState<KeyStatus | null>(null);
  const [passphrase, setPassphrase] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  // Tách logic fetch ra một hàm riêng để có thể gọi lại
  const fetchKeyStatus = useCallback(async () => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
        setError("Authentication token not found. Please log in again.");
        setIsLoading(false);
        return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/rsa/status", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 404) {
        // Server báo không tìm thấy khóa
        setKeyStatus({ hasKey: false });
      } else if (response.ok) {
        const data = await response.json();
        setKeyStatus(data);
      } else {
        // Các lỗi khác (401, 500...)
        const errData = await response.json();
        throw new Error(errData.message || "Failed to fetch key status.");
      }
    } catch (err: any) {
      setError(err.message);
      setKeyStatus(null); // Reset status khi có lỗi
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Gọi hàm fetch khi component mount lần đầu
  useEffect(() => {
    fetchKeyStatus();
  }, [fetchKeyStatus]);
  
  // Hàm xử lý khi nhấn nút tạo khóa
  const handleGenerateKeys = async (e: React.FormEvent) => {
      e.preventDefault();
      if (passphrase.length < 8) {
          setError("Passphrase must be at least 8 characters long.");
          return;
      }
      
      const token = localStorage.getItem("jwtToken");
      setIsLoading(true);
      setError("");

      try {
          const response = await fetch("http://localhost:5000/api/rsa/generate", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ passphrase }),
          });

          const data = await response.json();
          if (response.ok) {
              alert("Key pair generated successfully!");
              setKeyStatus({ hasKey: true, ...data }); // Cập nhật trạng thái
              fetchKeyStatus(); // Gọi lại để cập nhật trạng thái khóa mới
          } else {
              setError(data.message || "Failed to generate keys.");
          }
      } catch(err) {
          setError("Failed to connect to the server.");
      } finally {
          setIsLoading(false);
      }
  };

  const handleDeleteKey = async () => {
      if (!window.confirm("Are you sure you want to delete your current key? This action cannot be undone.")) {
          return;
      }

      const token = localStorage.getItem("jwtToken");
      setIsDeleting(true);
      setError("");
      try {
          const response = await fetch("http://localhost:5000/api/rsa/delete", {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
          });
          
          if (response.ok) {
              alert("Key deleted successfully.");
              setKeyStatus({ hasKey: false }); // Cập nhật UI ngay lập tức
          } else {
              const data = await response.json();
              throw new Error(data.message || "Failed to delete key.");
          }
      } catch (err: any) {
          setError(err.message);
      } finally {
          setIsDeleting(false);
      }
  };

  if (isLoading) {
    return <div className="text-center p-6">Loading key status...</div>;
  }

  if (error) {
    return <div className="text-center p-6 text-red-500">Error: {error}</div>;
  }
  
  // Giao diện khi ĐÃ CÓ KHÓA
  if (keyStatus?.hasKey) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-[2D99AE] mb-4">Your RSA Key is Active</h3>
            
            {/* Cảnh báo hết hạn */}
            {keyStatus.expiryStatus === 'expiring_soon' && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
                    <p className="font-bold flex items-center"><AlertTriangle className="w-5 h-5 mr-2" />Warning</p>
                    <p>Your key will expire in {keyStatus.expiresInDays} days. Please consider generating a new key.</p>
                </div>
            )}
            {keyStatus.expiryStatus === 'expired' && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                    <p className="font-bold flex items-center"><AlertTriangle className="w-5 h-5 mr-2" />Key Expired</p>
                    <p>Your key has expired. You should delete it and generate a new one.</p>
                </div>
            )}
            
            {/* Thông tin khóa */}
            <div className="space-y-2 text-sm">
              <p>
                  <span className="font-bold text-[#001C44]">Created On:</span>
                  <span className="ml-2">{keyStatus.createdAt ? new Date(keyStatus.createdAt).toLocaleString() : 'N/A'}</span>
              </p>
              <p>
                  <span className="font-bold text-[#001C44]">Expires On:</span>
                  <span className="ml-2">{keyStatus.expiresAt ? new Date(keyStatus.expiresAt).toLocaleString() : 'N/A'}</span>
              </p>
              <div className="pt-2">
                  <p className="font-bold text-[#001C44]">Public Key:</p>
                  <pre className="bg-[#BCFEFE] p-2 rounded text-xs overflow-x-auto mt-1 text-gray-900">
                      {keyStatus.publicKey}
                  </pre>
              </div>
            </div>

            {/* Nút xóa khóa */}
            <div className="mt-6 border-t pt-4">
                 <Button 
                    onClick={handleDeleteKey}
                    className="w-full bg-[#2D99AE] hover:bg-[#0C5776] text-white flex items-center justify-center"
                    disabled={isDeleting}
                >
                    {isDeleting ? <LoaderCircle className="animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                    Delete Current Key
                </Button>
            </div>
        </div>
    );
  }

  // Giao diện khi chưa có khóa
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold text-[#001C44] mb-4">Generate Your RSA Key Pair</h3>
      <p className="text-gray-600 mb-6 text-sm">Create a secure 2048-bit RSA key pair. Your private key will be encrypted with a passphrase that only you know.</p>
      <form onSubmit={handleGenerateKeys} className="space-y-4">
        <div>
          <Label htmlFor="passphrase">Enter a Strong Passphrase</Label>
          <Input 
            id="passphrase"
            type="password"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            placeholder="At least 8 characters"
            className="mt-1"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <LoaderCircle className="animate-spin" /> : "Generate & Save Keys"}
        </Button>
      </form>
    </div>
  );
}