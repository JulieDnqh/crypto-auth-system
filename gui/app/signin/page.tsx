"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation";
import { useState } from "react"
import { Button } from "../components/button"
import { Input } from "../components/input"
import { Label } from "../components/label"
import { OtpModal } from "../components/OtpModal";
import { Eye, EyeOff} from "lucide-react"

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false)

  // Hàm xử lý giai đoạn 1: Xác thực mật khẩu
  const handleSignInStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch('http://localhost:5000/api/auth/signin-step1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Mở modal OTP thay vì chuyển trang
        setIsOtpModalOpen(true); 
      } else {
        setError(data.message || "Đã có lỗi xảy ra.");
      }
    } catch (err) {
      setError("Không thể kết nối đến máy chủ.");
    }
  };

  // Hàm xử lý giai đoạn 2: Xác thực OTP (truyền vào modal)
  const handleVerifyOtp = async (otp: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('authToken', data.token);
        alert('Đăng nhập thành công!');
        setIsOtpModalOpen(false); // Đóng modal
        router.push('/dashboard'); // Chuyển hướng
        return true; // Trả về true để modal biết là thành công
      } else {
        return false; // Trả về false để modal hiển thị lỗi
      }
    } catch (err) {
      return false;
    }
  };

  // Hàm gửi lại OTP (truyền vào modal)
  const handleResendOtp = async () => {
    try {
      await fetch('http://localhost:5000/api/auth/signin-step1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }), // Gửi lại email và pass để backend sinh OTP mới
      });
      alert('Một mã OTP mới đã được gửi đi.');
    } catch (err) {
      alert('Không thể gửi lại mã OTP.');
    }
  }

  return (
    <>
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="h-16 bg-[#0C5776] shrink-0">
        {/* <h1 className="text-lg font-medium">Sign in</h1> */}
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)] px-6">
        <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Welcome Content */}
          <div className="text-center lg:text-left">
            <div className="flex justify-center lg:justify-start mb-8">
              <div className="flex items-center justify-center">
                {/* <Shield className="w-8 h-8 text-teal-600" /> */}
                <Image
                    src="/images/icon-security.png"
                    alt="Security Icon"
                    width={80} // Resize ảnh lớn
                    height={80} // Giữ tỉ lệ hoặc điều chỉnh cho phù hợp
                    className="object-contain" // Đảm bảo ảnh không bị méo
                />
              </div>
            </div>

            <h1 className="text-4xl font-bold text-[#0C5776] mb-4">Welcome back to</h1>
            <h2 className="text-4xl font-bold text-[#0C5776] mb-6">CryptoAuthSystem!</h2>

            <p className="text-[#2D99AE] mb-4">Sign in to securely access your account and encrypted files. Your data stays safe with multi-factor authentication.</p>
            {/* <p className="text-[#2D99AE] mb-8">Your data stays safe with multi-factor authentication.</p> */}

            <div className="flex justify-center lg:justify-start">
              <div className="flex items-center justify-center">
                {/* <div className="w-8 h-8 bg-pink-300 rounded-full"></div> */}
                <Image
                    src="/images/icon-memories.png"
                    alt="Memories Icon"
                    width={65} // Resize ảnh lớn
                    height={65} // Giữ tỉ lệ hoặc điều chỉnh cho phù hợp
                    className="object-contain" // Đảm bảo ảnh không bị méo
                />
              </div>
            </div>
          </div>

          {/* Right Side - Sign In Form */}
          <div className="max-w-md mx-auto w-full">
            <div className="bg-white p-8 rounded-lg border-2 border-[#2D99AE] shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-[#001C44]">Sign in</h3>
                <div className="flex items-center justify-center">
                  {/* <Shield className="w-6 h-6 text-teal-600" /> */}
                  <Image
                    src="/images/icon-remember.png"
                    alt="Icon Remember"
                    width={85} // Resize ảnh lớn
                    height={85} // Giữ tỉ lệ hoặc điều chỉnh cho phù hợp
                    className="object-contain" // Đảm bảo ảnh không bị méo
                  />
                </div>
              </div>

              <form className="space-y-4" onSubmit={handleSignInStep1}>
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-[#001C44]">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example.email@gmail.com"
                    className="mt-1 border-gray-300"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-sm font-medium text-[#001C44]">
                    Password
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter at least 8+ characters"
                      className="border-gray-300 pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? <Eye className="w-4 h-4 text-gray-500" /> : <EyeOff className="w-4 h-4 text-gray-500" />}
                    </button>
                  </div>
                </div>

                {/* Hiển thị thông báo lỗi nếu có */}
                {error && (
                  <p className="text-sm text-red-600 text-center">{error}</p>
                )}

                <div className="flex items-center justify-end">
                  <Link href="#" className="text-sm text-[#0C5776] hover:underline">
                    Forgot password?
                  </Link>
                </div>

                <div className="flex items-center justify-between">
                  {/* <div className="flex items-center space-x-2">
                    <Checkbox id="remember" />
                    <label htmlFor="remember" className="text-sm text-gray-600">
                      Remember me
                    </label>
                  </div> */}
                  <Link href="#" className="text-sm text-[#0C5776] hover:underline">
                    Forgot password?
                  </Link>
                </div>

                <Button type="submit" className="w-full bg-[#2D99AE] hover:bg-[#0C5776] text-white py-3 rounded-md">Sign in</Button>

                <p className="text-center text-sm text-gray-600">
                  {"Don't have an account? "}
                  <Link href="/signup" className="text-[#0C5776] hover:underline">
                    Sign up
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="h-16 bg-[#0C5776] shrink-0"></div>
    </div>

    {/* Modal OTP được render ở đây */}
    <OtpModal
      isOpen={isOtpModalOpen}
      email={email}
      onClose={() => setIsOtpModalOpen(false)}
      onVerify={handleVerifyOtp}
      onResend={handleResendOtp}
    />
    </>
  )
}