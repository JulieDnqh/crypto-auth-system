"use client";

import { X, AlertTriangle } from "lucide-react";
import { Button } from "./button";

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorMessage: string;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({ isOpen, onClose, errorMessage }) => {
  if (!isOpen) {
    return null;
  }

  return (
    // Lớp phủ nền mờ
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      {/* Hộp modal */}
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full relative text-center">
        {/* Icon tam giác cảnh báo */}
        <div className="mx-auto mb-4">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto" strokeWidth={1.5} />
        </div>
        
        {/* Tiêu đề */}
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          An Error Occurred
        </h2>
        
        {/* Nội dung lỗi */}
        <p className="text-gray-600 mb-8">
          {errorMessage}
        </p>
        
        {/* Nút đóng */}
        <Button 
          onClick={onClose} 
          className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-full text-base font-semibold"
        >
          Close
        </Button>
      </div>
    </div>
  );
};