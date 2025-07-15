"use client";

import { Copy, Download, ShieldAlert } from "lucide-react";
import { Button } from "./button";

interface RecoveryCodeModalProps {
  isOpen: boolean;
  code: string;
  onClose: () => void;
}

export const RecoveryCodeModal: React.FC<RecoveryCodeModalProps> = ({ isOpen, code, onClose }) => {
  if (!isOpen) {
    return null;
  }

  // Hàm để copy mã vào clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    alert("Recovery code copied to clipboard!");
  };

  // === HÀM ĐỂ TẢI FILE .TXT ===
  const downloadRecoveryCode = () => {
    // 1. Tạo nội dung cho file .txt
    const fileContent = `Your CryptoAuthSystem Recovery Code:\n\n${code}\n\nPlease store this code in a safe and secure location. You will need it to recover your account if you forget your password. This code will only be shown once.`;
    
    // 2. Tạo một đối tượng Blob (Binary Large Object) từ nội dung
    const blob = new Blob([fileContent], { type: "text/plain" });

    // 3. Tạo một URL tạm thời cho Blob
    const url = URL.createObjectURL(blob);

    // 4. Tạo một thẻ <a> ẩn
    const link = document.createElement("a");
    link.href = url;
    link.download = "crypto-auth-recovery-code.txt"; // Tên file sẽ được tải xuống

    // 5. Thêm thẻ <a> vào DOM, giả lập một cú click, sau đó xóa đi
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 6. Giải phóng URL đã tạo
    URL.revokeObjectURL(url);
  };

  return (
    // Lớp phủ nền mờ
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      {/* Hộp modal */}
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full relative text-center">
        {/* Icon cảnh báo */}
        <div className="mx-auto mb-4">
          <ShieldAlert className="w-16 h-16 text-yellow-500 mx-auto" strokeWidth={1.5} />
        </div>
        
        {/* Tiêu đề */}
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Save Your Recovery Code
        </h2>
        
        {/* Cảnh báo quan trọng */}
        <p className="text-gray-600 mb-6">
          This is your unique recovery code. **This is the only time you will see it.** Please save it in a secure place, like a password manager.
        </p>
        
        {/* Khung hiển thị mã */}
        <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4 mb-6 flex items-center justify-between">
          <pre className="text-2xl font-mono tracking-widest text-gray-800">{code}</pre>
          <button
            onClick={copyToClipboard}
            className="p-2 text-gray-500 hover:bg-gray-200 rounded-md"
            title="Copy to clipboard"
          >
            <Copy size={20} />
          </button>
        </div>

        {/* Các nút hành động */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Nút Tải xuống */}
          <Button
            onClick={downloadRecoveryCode}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
          >
            <Download size={18} />
            Download Code (.txt)
          </Button>
          
          {/* Nút Đóng */}
          <Button
            onClick={onClose}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            I have saved my code
          </Button>
        </div>
      </div>
    </div>
  );
};