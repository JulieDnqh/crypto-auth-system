"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Button } from "../components/button"
import { Input } from "../components/input"
import { Label } from "../components/label"
import { Checkbox } from "../components/checkbox"
import { SuccessModal } from "../components/SuccessModal"
import { RecoveryCodeModal } from "../components/RecoveryCodeModal"
import { Eye, EyeOff } from "lucide-react"
import toast from 'react-hot-toast'; // Import toast
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [recoveryCode, setRecoveryCode] = useState("")
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dateOfBirth: "", 
    countryCode: "+84", 
    phoneNumber: "",    
    address: "",
    password: "",
    confirmPassword: "",
    terms: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked; 

    setFormData((prevData) => {
      const newData = {
        ...prevData,
        [id]: type === "checkbox" ? checked : value,
      };
      if (id === "dateOfBirth") {
        console.log("dateOfBirth changed to:", newData.dateOfBirth); // Log on change
      }
      return newData;
    });
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Email format validation
    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Email format is invalid."); 
      return;
    }

    // Password match validation
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!"); 
      return
    }

    // Password strength validation
    const password = formData.password;
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      toast.error("Password must contain at least one uppercase letter.");
      return;
    }
    if (!/[0-9]/.test(password)) {
      toast.error("Password must contain at least one number.");
      return;
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      toast.error("Password must contain at least one special character.");
      return;
    }

    // Terms agreement validation
    if (!formData.terms) {
      toast.error("You must agree to the Terms of Use and Privacy Policy."); 
      return
    }

    console.log("Dữ liệu gửi đi:", formData); // Log before sending

    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        setIsSuccessModalOpen(true);
        toast.success("Registration successful!");
        setRecoveryCode(result.recoveryCode);
        setIsRecoveryModalOpen(true);
      } else {
        toast.error(`Registration failed: ${result.message || 'An error occurred'}`); 
      }
    } catch (error) {
      console.error("Lỗi khi gửi form:", error)
      toast.error("A client-side error occurred. Please try again."); 
    }
  }

  return (
    <> 
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-[calc(100vh-120px)]">
        <div className="w-12 bg-[#0C5776]"></div>

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-start">
            <div className="bg-[#F8DAD0] p-8 rounded-lg">
              <h2 className="text-2xl font-bold text-[#001C44] mb-6">Sign up</h2>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-sm font-medium text-[#001C44]">
                      First name
                    </Label>
                    <Input id="firstName" placeholder="Enter first name" autoComplete="given-name" className="mt-1 bg-[#F3F4F6] border-[#F3F4F6] text-[#9095A1]"
                      value={formData.firstName} onChange={handleChange} required />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-sm font-medium text-[#001C44]">
                      Last name
                    </Label>
                    <Input id="lastName" placeholder="Enter last name" autoComplete="family-name" className="mt-1 bg-[#F3F4F6] border-[#F3F4F6] text-[#9095A1]"
                      value={formData.lastName} onChange={handleChange} required />
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
                    value={formData.email} onChange={handleChange} required />
                </div>

                {/* Date of Birth Field - Reverted to native icon */}
                <div>
                  <Label htmlFor="dateOfBirth" className="text-sm font-medium text-[#001C44]">
                    Date of Birth
                  </Label>
                  <Input 
                    id="dateOfBirth" 
                    type="date" 
                    className="mt-1 bg-[#F3F4F6] border-[#F3F4F6] text-[#9095A1]" 
                    value={formData.dateOfBirth} 
                    onChange={handleChange} 
                    required 
                  />
                </div>

                {/* Phone Number Field */}
                <div>
                  <Label htmlFor="phoneNumber" className="text-sm font-medium text-[#001C44]">
                    Phone Number
                  </Label>
                  <div className="flex mt-1">
                    <select
                      id="countryCode"
                      value={formData.countryCode}
                      onChange={handleChange}
                      className="border border-[#F3F4F6] rounded-l-md p-2 bg-[#F3F4F6] text-[#9095A1] focus:ring-[#2D99AE] focus:border-[#2D99AE]"
                    >
                      <option value="+84">+84 (VN)</option>
                      <option value="+1">+1 (US)</option>
                      <option value="+44">+44 (UK)</option>
                      {/* Add more country codes as needed */}
                    </select>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="e.g., 901234567"
                      className="flex-1 border-l-0 rounded-l-none bg-[#F3F4F6] border-[#F3F4F6] text-[#9095A1]"
                      value={formData.phoneNumber} onChange={handleChange} required />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address" className="text-sm font-medium text-[#001C44]">
                    Address
                  </Label>
                  <Input id="address" placeholder="HCMC" className="mt-1 bg-[#F3F4F6] border-[#F3F4F6] text-[#9095A1]"
                    value={formData.address} onChange={handleChange} required />
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
                      value={formData.password} onChange={handleChange} required />
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
                      value={formData.confirmPassword} onChange={handleChange} required
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

                {/* Terms of Use Checkbox */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.terms}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, terms: Boolean(checked) }))}
                    className="border-2 border-[#2D99AE] data-[state=checked]:bg-[#2D99AE] data-[state=checked]:text-white focus:ring-2 focus:ring-[#2D99AE] focus:ring-offset-2"
                  />
                  <label htmlFor="terms" className="text-sm font-medium text-[#001C44] cursor-pointer">
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
                      <Image
                        src="/images/icon-bacteria.png"
                        alt="Bacteria Icon"
                        width={54} 
                        height={54} 
                        className="object-contain" 
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
                        width={63} 
                        height={63} 
                        className="object-contain" 
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
                        width={60} 
                        height={60} 
                        className="object-contain" 
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

        <div className="w-12 bg-[#0C5776]"></div>
      </div>
    </div>

    <SuccessModal 
        isOpen={isSuccessModalOpen} 
        onClose={() => setIsSuccessModalOpen(false)} 
    />

    <RecoveryCodeModal 
        isOpen={isRecoveryModalOpen}
        code={recoveryCode}
        onClose={() => {
            setIsRecoveryModalOpen(false);
        }}
    />

    </>
  )
}