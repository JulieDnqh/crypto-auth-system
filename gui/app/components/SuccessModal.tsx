"use client"

import Image from "next/image"
import { CheckCircle2, X } from "lucide-react"
import { Button } from "./button" // Giả sử bạn có component Button
import { useRouter } from "next/navigation" // Dùng để điều hướng

// Định nghĩa các props mà component này sẽ nhận
interface SuccessModalProps {
  isOpen: boolean; // State để quyết định modal có hiện hay không
  onClose: () => void; // Hàm để đóng modal khi nhấn nút X
}

export const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  
  // Nếu không mở, không render gì cả
  if (!isOpen) {
    return null;
  }

  const handleGoToDashboard = () => {
    // Điều hướng đến trang dashboard khi nhấn nút
    router.push('/dashboard'); // Thay '/dashboard' bằng đường dẫn thực tế của bạn
  };

  const handleSignIn = () => {
    router.push('/signin');
  }

  return (
    // Lớp phủ nền mờ
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      {/* Hộp modal */}
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full relative text-center">
        {/* Nút đóng (X) */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        {/* Icon check */}
        <div className="flex justify-center mb-4">
          {/* <CheckCircle2 className="w-16 h-16 text-[#2D99AE] mx-auto" strokeWidth={1.5} /> */}
          <Image
            src="/images/icon-checked.png"
            alt="Security System Graphic"
            width={75} // Resize ảnh lớn
            height={75} // Giữ tỉ lệ hoặc điều chỉnh cho phù hợp
            className="object-contain" // Đảm bảo ảnh không bị méo
          />
        </div>
        
        {/* Tiêu đề */}
        <h2 className="text-3xl font-bold text-[#001C44] mb-2">
          Registration successful
        </h2>
        
        {/* Mô tả */}
        <p className="text-[#001C44] mb-8">
          Thank you for registering! Your account is now ready. You can log in to access secure authentication and encryption features.
        </p>
        
        {/* Nút chính */}
        <Button 
          onClick={handleGoToDashboard} 
          className="w-full bg-[#2D99AE] hover:bg-[#0C5776] text-white py-3 rounded-full text-base font-semibold"
        >
          Go to Dashboard
        </Button>
        
        {/* Link phụ */}
        <div className="mt-4">
          <button 
            onClick={handleSignIn} 
            className="text-sm text-gray-500 hover:text-gray-800 hover:underline"
          >
            Or Sign in
          </button>
        </div>
      </div>
    </div>
  )
}