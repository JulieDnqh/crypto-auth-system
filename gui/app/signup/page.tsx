"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Button } from "../components/button"
import { Input } from "../components/input"
import { Label } from "../components/label"
import { Checkbox } from "../components/checkbox"
import { SuccessModal } from "../components/SuccessModal"
import { Eye, EyeOff } from "lucide-react"

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  // const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(true)

  // BƯỚC 1: QUẢN LÝ TRẠNG THÁI CỦA FORM
  // Tạo một state duy nhất để lưu tất cả dữ liệu form
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    birthDate: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
    terms: false,
  })

  // Hàm này sẽ cập nhật state mỗi khi người dùng gõ vào một ô input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [id]: type === "checkbox" ? checked : value,
    }))
  }

  // BƯỚC 2: TẠO HÀM XỬ LÝ SUBMIT
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault() // Ngăn form tự động tải lại trang

    // Kiểm tra cơ bản (bạn có thể thêm nhiều validation hơn)
    if (formData.password !== formData.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!")
      return
    }

    if (!formData.terms) {
      alert("Bạn phải đồng ý với Điều khoản sử dụng và Chính sách bảo mật.")
      return
    }

    console.log("Dữ liệu gửi đi:", formData) // In ra console để kiểm tra

    // Gửi dữ liệu đến backend API
    try {
      // Thay thế '/api/auth/signup' bằng endpoint API thực tế của bạn
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        // alert("Đăng ký thành công!")
        setIsSuccessModalOpen(true);

        // Chuyển hướng đến trang đăng nhập hoặc trang dashboard
        // window.location.href = '/signin'
      } else {
        // Hiển thị lỗi từ server
        alert(`Đăng ký thất bại: ${result.message || 'Có lỗi xảy ra'}`)
      }
    } catch (error) {
      console.error("Lỗi khi gửi form:", error)
      alert("Đã có lỗi xảy ra phía client. Vui lòng thử lại.")
    }
  }

  return (
    <> {/* Dùng Fragment để bọc cả trang và modal */}
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {/* <div className="bg-[#0C5776] h-16"> */}
        {/* <h1 className="text-lg font-medium">Sign up</h1> */}
      {/* </div> */}

      {/* Main Content */}
      <div className="flex min-h-[calc(100vh-120px)]">
        {/* Left Sidebar */}
        <div className="w-12 bg-[#0C5776]"></div>

        {/* Content Area */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Side - Form */}
            <div className="bg-[#F8DAD0] p-8 rounded-lg">
              <h2 className="text-2xl font-bold text-[#001C44] mb-6">Sign up</h2>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-sm font-medium text-[#001C44]">
                      First name
                    </Label>
                    <Input id="firstName" placeholder="Enter first name" autoComplete="given-name" className="mt-1 bg-[#F3F4F6] border-[#F3F4F6] text-[#9095A1]"
                      value={formData.firstName} onChange={handleChange} />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-sm font-medium text-[#001C44]">
                      Last name
                    </Label>
                    <Input id="lastName" placeholder="Enter last name" autoComplete="family-name" className="mt-1 bg-[#F3F4F6] border-[#F3F4F6] text-[#9095A1]"
                      value={formData.lastName} onChange={handleChange} />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-[#001C44]">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example.email@gmail.com"
                    autoComplete="email"
                    className="mt-1 bg-[#F3F4F6] border-[#F3F4F6] text-[#9095A1]"
                    value={formData.email} onChange={handleChange} />
                </div>

                <div>
                  <Label htmlFor="birthDate" className="text-sm font-medium text-[#001C44]">
                    Birth of Date
                  </Label>
                  <Input id="birthDate" placeholder="mm-dd-yyyy" className="mt-1 bg-[#F3F4F6] border-[#F3F4F6] text-[#9095A1]"
                    value={formData.birthDate} onChange={handleChange} />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-[#001C44]">
                    Phone Number
                  </Label>
                  <Input id="phone" placeholder="(+84)xxx xxx xxx" className="mt-1 bg-[#F3F4F6] border-[#F3F4F6] text-[#9095A1]"
                    value={formData.phone} onChange={handleChange} />
                </div>

                <div>
                  <Label htmlFor="address" className="text-sm font-medium text-[#001C44]">
                    Address
                  </Label>
                  <Input id="address" placeholder="HCMC" className="mt-1 bg-[#F3F4F6] border-[#F3F4F6] text-[#9095A1]"
                    value={formData.address} onChange={handleChange} />
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
                      autoComplete="new-password"
                      className="bg-[#F3F4F6] border-[#F3F4F6] text-[#9095A1] pr-10"
                      value={formData.password} onChange={handleChange} />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? <Eye className="w-4 h-4 text-gray-500 hover:text-gray-700" /> : <EyeOff className="w-4 h-4 text-gray-500 hover:text-gray-700" />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-[#001C44]">
                    Confirm Password
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Enter at least 8+ characters"
                      autoComplete="new-password"
                      className="bg-[#F3F4F6] border-[#F3F4F6] text-[#9095A1] pr-10"
                      value={formData.confirmPassword} onChange={handleChange}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showConfirmPassword ? <Eye className="w-4 h-4 text-gray-500 hover:text-gray-700" /> : <EyeOff className="w-4 h-4 text-gray-500 hover:text-gray-700" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" checked={formData.terms} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, terms: Boolean(checked) }))}/>
                  <label htmlFor="terms" className="text-sm text-[#001C44]">
                    By signing up, I agree with the{" "}
                    <Link href="#" className="text-[#2D99AE] hover:underline">
                      Terms of Use
                    </Link>{" "}
                    &{" "}
                    <Link href="#" className="text-[#2D99AE] hover:underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                <Button type="submit" className="w-full bg-[#2D99AE] hover:bg-[#0C5776] text-white py-3 rounded-md">Sign up</Button>

                <p className="text-center text-sm text-[#001C44]">
                  Already have an account?{" "}
                  <Link href="/signin" className="text-[#2D99AE] hover:underline">
                    Sign in
                  </Link>
                </p>
              </form>
            </div>

            {/* Right Side - Features */}
            <div className="space-y-8">
              <div>
                <h3 className="text-3xl font-bold text-[#001C44] mb-2">Join our secure platform</h3>
                <div className="w-16 h-1 bg-[#2D99AE] rounded"></div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center">
                      {/* <Shield className="w-6 h-6 text-teal-600" /> */}
                      <Image
                        src="/images/icon-bacteria.png"
                        alt="Bacteria Icon"
                        width={54} // Resize ảnh lớn
                        height={54} // Giữ tỉ lệ hoặc điều chỉnh cho phù hợp
                        className="object-contain" // Đảm bảo ảnh không bị méo
                      />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#001C44]">Protect your data</h4>
                    <p className="text-[#001C44] text-sm">
                      Encrypt files, sign documents, and manage your RSA keys with confidence.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center">
                      <Image
                        src="/images/icon-face-lock.png"
                        alt="Face Lock Icon"
                        width={63} // Resize ảnh lớn
                        height={63} // Giữ tỉ lệ hoặc điều chỉnh cho phù hợp
                        className="object-contain" // Đảm bảo ảnh không bị méo
                      />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#001C44]">Authenticate safely</h4>
                    <p className="text-[#001C44] text-sm">
                      Experience secure login with multi-factor authentication (OTP & TOTP).
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center">
                      <Image
                        src="/images/icon-colaborate.png"
                        alt="Colaboration Icon"
                        width={60} // Resize ảnh lớn
                        height={60} // Giữ tỉ lệ hoặc điều chỉnh cho phù hợp
                        className="object-contain" // Đảm bảo ảnh không bị méo
                      />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#001C44]">Collaborate securely</h4>
                    <p className="text-[#001C44] text-sm">
                      Exchange encrypted files and verified public keys with other trusted users.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-12 bg-[#0C5776]"></div>
      </div>

      {/* Footer */}
      {/* <div className="bg-[#0C5776] h-16"></div> */}
    </div>

    <SuccessModal 
        isOpen={isSuccessModalOpen} 
        onClose={() => setIsSuccessModalOpen(false)} 
    />
    </>
  )
}