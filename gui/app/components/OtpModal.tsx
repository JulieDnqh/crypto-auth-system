"use client"

import { useState, useRef, useEffect } from "react"
import { X, LoaderCircle } from "lucide-react"
import { Button } from "./button"

// Định nghĩa các props mà component này sẽ nhận
interface OtpModalProps {
  isOpen: boolean;
  email: string; // Email để gửi lại OTP và xác thực
  onClose: () => void;
  onVerify: (otp: string) => Promise<boolean>; // Hàm xác thực trả về Promise<boolean>
  onResend: () => Promise<void>; // Hàm gửi lại OTP
}

export const OtpModal: React.FC<OtpModalProps> = ({ isOpen, email, onClose, onVerify, onResend }) => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(60); // Đếm ngược 60 giây
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Logic đếm ngược
  useEffect(() => {
    if (!isOpen) return;
    
    setTimer(300); // Reset timer khi modal mở
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);


  // Logic xử lý nhập liệu và tự động chuyển ô
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = e.target;
    // Chỉ cho phép nhập số
    if (!/^[0-9]$/.test(value) && value !== "") return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError(""); // Xóa lỗi khi người dùng bắt đầu nhập lại

    // Tự động chuyển đến ô tiếp theo
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // Xử lý nút Backspace để quay lại ô trước
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Hàm xử lý khi nhấn nút Verify
  const handleVerify = async () => {
    const combinedOtp = otp.join("");
    if (combinedOtp.length !== 6) {
      setError("Please enter a valid 6-digit code.");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    const isSuccess = await onVerify(combinedOtp);
    
    setIsLoading(false);
    if (!isSuccess) {
      setError("Please enter a valid code.");
    }
  };
  
  // Hàm xử lý khi nhấn Resend OTP
  const handleResend = async () => {
    if (timer > 0) return; // Chỉ cho phép gửi lại khi timer = 0
    await onResend();
    setTimer(60); // Reset lại timer
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full relative text-center">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>

        <h2 className="text-3xl font-bold text-[#001C44] mb-2">OTP Verification</h2>
        <p className="text-gray-600 mb-8">
          Enter the 6 digit verification code received on your Email
        </p>

        <div className="flex justify-center gap-2 mb-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {inputRefs.current[index] = el; }}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`w-12 h-14 text-center text-2xl font-semibold border rounded-lg focus:outline-none focus:ring-2 ${
                error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-[#2D99AE]"
              }`}
            />
          ))}
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        
        <Button
          onClick={handleVerify}
          disabled={isLoading}
          className={`w-full py-3 rounded-full text-base font-semibold transition-colors ${
            isLoading 
              ? "bg-cyan-200 cursor-not-allowed" 
              : "bg-[#2D99AE] hover:bg-[#0C5776] text-white"
          }`}
        >
          {isLoading ? <LoaderCircle className="animate-spin mx-auto" /> : "Verify"}
        </Button>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm mb-2">
            {timer > 0 ? `00:${timer.toString().padStart(2, '0')}` : "Didn't receive code?"}
          </p>
          <button
            onClick={handleResend}
            disabled={timer > 0}
            className={`text-sm ${
              timer > 0 
                ? "text-gray-400 cursor-not-allowed" 
                : "text-[#0C5776] hover:underline font-semibold"
            }`}
          >
            Resend OTP
          </button>
        </div>
      </div>
    </div>
  );
};