"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "../button";
import { Input } from "../input";
import { Label } from "../label";
import { ErrorModal } from "../ErrorModal";
import {
  LoaderCircle,
  AlertTriangle,
  Trash2,
  Eye,
  EyeOff,
  Key,
} from "lucide-react";

// Cập nhật interface
interface KeyStatus {
  hasKey: boolean;
  publicKey?: string;
  createdAt?: string;
  expiresAt?: string;
  expiryStatus?: "active" | "expiring_soon" | "expired";
  expiresInDays?: number;
}

export default function RSAPersonalKeyManagement() {
  const [keyStatus, setKeyStatus] = useState<KeyStatus | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenewing, setIsRenewing] = useState(false);
  const [error, setError] = useState("");
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setIsErrorModalOpen(true); // Mở modal khi có lỗi
  };

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
      handleError(err.message);
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
    if (password.length < 8) {
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
        body: JSON.stringify({ password }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Key pair generated successfully!");
        // setKeyStatus({ hasKey: true, ...data }); // Cập nhật trạng thái
        fetchKeyStatus(); // Gọi lại để cập nhật trạng thái khóa mới
      } else {
        handleError(data.message || "Failed to generate keys.");
      }
    } catch (err: any) {
      handleError(err.message || "Failed to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteKey = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your current key? This action cannot be undone."
      )
    ) {
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
      handleError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRenewKey = async () => {
    console.log("Renew key button clicked"); // Log 1
    const token = localStorage.getItem("jwtToken");
    setIsRenewing(true);
    setError("");
    try {
      const response = await fetch("http://localhost:5000/api/rsa/renew", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      console.log("Response from /api/rsa/renew:", {
        status: response.status,
        data: data,
      }); // Log 2

      if (response.ok) {
        alert("Key renewed successfully.");
        fetchKeyStatus(); // Refresh key status
      } else {
        throw new Error(data.message || "Failed to renew key.");
      }
    } catch (err: any) {
      console.error("Error in handleRenewKey:", err); // Log 3
      handleError(err.message);
    } finally {
      setIsRenewing(false);
    }
  };

  if (isLoading) {
    return <div className="text-center p-6">Loading key status...</div>;
  }

  // if (error) {
  //   return <div className="text-center p-6 text-red-500">Error: {error}</div>;
  // }

  // Giao diện khi ĐÃ CÓ KHÓA
  if (keyStatus?.hasKey) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-[#001C44] mb-4">
          Personal RSA Key Management
        </h3>

        {/* Display key status */}
        {keyStatus.expiryStatus === "active" && (
          <div
            className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4"
            role="alert"
          >
            <p className="font-bold flex items-center">
              <Key className="w-5 h-5 mr-2" />
              Your key is active
            </p>
            <p>
              Your key will expire in {keyStatus.expiresInDays} days.
            </p>
          </div>
        )}
        {keyStatus.expiryStatus === "expiring_soon" && (
          <div
            className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4"
            role="alert"
          >
            <p className="font-bold flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Warning
            </p>
            <p>
              Your key will expire in {keyStatus.expiresInDays} days. Please consider generating a new key or renewing it.
            </p>
          </div>
        )}
        {keyStatus.expiryStatus === "expired" && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
            role="alert"
          >
            <p className="font-bold flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Key Expired
            </p>
            <p>
              Your key has expired. You should delete it and generate a new one.
            </p>
          </div>
        )}

        {/* Key Information */}
        <div className="space-y-2 text-sm">
          <p>
            <span className="font-bold text-[#001C44]">Created On:</span>
            <span className="ml-2 text-[#001C44]">
              {keyStatus.createdAt
                ? new Date(keyStatus.createdAt).toLocaleString()
                : "N/A"}
            </span>
          </p>
          <p>
            <span className="font-bold text-[#001C44]">Expires On:</span>
            <span className="ml-2 text-[#001C44]">
              {keyStatus.expiresAt
                ? new Date(keyStatus.expiresAt).toLocaleString()
                : "N/A"}
            </span>
          </p>
          <div className="pt-2">
            <p className="font-bold text-[#001C44]">Public Key:</p>
            <pre className="bg-[#F3F4F6] p-2 rounded text-xs overflow-x-auto mt-1 text-gray-900">
              {keyStatus.publicKey}
            </pre>
          </div>
        </div>

        {/* Cảnh báo hết hạn */}
        {keyStatus.expiryStatus === "expiring_soon" && (
          <div
            className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4"
            role="alert"
          >
            <p className="font-bold flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Warning
            </p>
            <p>
              Your key will expire in {keyStatus.expiresInDays} days. Please
              consider generating a new key.
            </p>
          </div>
        )}
        {keyStatus.expiryStatus === "expired" && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
            role="alert"
          >
            <p className="font-bold flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Key Expired
            </p>
            <p>
              Your key has expired. You should delete it and generate a new one.
            </p>
          </div>
        )}

        {/* Nút xóa và gia hạn khóa */}
        <div className="mt-6 border-t pt-4 flex space-x-4">
          <Button
            onClick={handleDeleteKey}
            className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            Delete Current Key
          </Button>
          <Button
            onClick={handleRenewKey} // Thêm hàm xử lý gia hạn
            className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center"
            disabled={isRenewing} // Thêm state isRenewing
          >
            {isRenewing ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <Key className="w-4 h-4 mr-2" />
            )}
            Renew Key
          </Button>
        </div>
      </div>
    );
  }

  // Giao diện khi chưa có khóa
  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-[#001C44] mb-4">
          Your RSA Key Details
        </h3>
        <p className="text-gray-600 mb-6 text-sm">
          Create a secure 2048-bit RSA key pair. Your private key will be
          encrypted with a passphrase that only you know.
        </p>
        <form onSubmit={handleGenerateKeys} className="space-y-4">
          <div>
            <Label
              htmlFor="passphrase"
              className="text-sm font-medium text-[#001C44]"
            >
              Enter a Strong Passphrase
            </Label>

            <div className="relative mt-1">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password here"
                className="mt-1 bg-[#F3F4F6] placeholder-[#9095A1] text-[#001C44] pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                {showPassword ? (
                  <Eye className="h-5 w-5 text-[#001C44]" />
                ) : (
                  <EyeOff className="h-5 w-5 text-[#001C44]" />
                )}
              </button>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button
            type="submit"
            className="w-full bg-[#2D99AE] hover:bg-[#0C5776] text-[#F3F4F6]"
            disabled={isLoading}
          >
            {isLoading ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              "Generate & Save Keys"
            )}
          </Button>
        </form>
      </div>

      {/* Render modal lỗi */}
      <ErrorModal
        isOpen={isErrorModalOpen}
        onClose={() => {
          setIsErrorModalOpen(false);
          // Tùy chọn: Xóa thông báo lỗi cũ khi đóng modal
          setError("");
        }}
        errorMessage={error}
      />
    </>
  );
}