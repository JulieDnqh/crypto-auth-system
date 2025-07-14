// File: gui/app/forgot-password/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/app/components/button";
import { Input } from "@/app/components/input";
import { Label } from "@/app/components/label";
import { LoaderCircle } from "lucide-react";
// ... import các component UI

export default function ForgotPasswordPage() {
  const [formData, setFormData] = useState({
    email: "",
    recoveryCode: "",
    newPassword: "",
    confirmNewPassword: ""
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (formData.newPassword !== formData.confirmNewPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (formData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'New password must be at least 8 characters.' });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          recoveryCode: formData.recoveryCode,
          newPassword: formData.newPassword
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage({ type: 'success', text: data.message + " Redirecting to sign-in page..." });
        setTimeout(() => router.push('/signin'), 3000); // Chờ 3s rồi chuyển hướng
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to connect to the server.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#001C44]">Account Recovery</h2>
          <p className="mt-2 text-gray-600">
            Enter your email, recovery code, and new password.
          </p>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-[#001C44]">Email</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required className="mt-1 bg-[#F3F4F6] border-[#F3F4F6] text-[#9095A1]" />
            </div>

            {/* Recovery Code */}
            <div>
              <Label htmlFor="recoveryCode" className="text-sm font-medium text-[#001C44]">Recovery Code</Label>
              <Input id="recoveryCode" name="recoveryCode" type="text" value={formData.recoveryCode} onChange={handleChange} required className="mt-1 bg-[#F3F4F6] border-[#F3F4F6] text-[#9095A1]" />
            </div>

            {/* New Password */}
            <div>
              <Label htmlFor="newPassword" className="text-sm font-medium text-[#001C44]">New Password</Label>
              <Input id="newPassword" name="newPassword" type="password" value={formData.newPassword} onChange={handleChange} required className="mt-1 bg-[#F3F4F6] border-[#F3F4F6] text-[#9095A1]" />
            </div>

            {/* Confirm New Password */}
            <div>
              <Label htmlFor="confirmNewPassword" className="text-sm font-medium text-[#001C44]">Confirm New Password</Label>
              <Input id="confirmNewPassword" name="confirmNewPassword" type="password" value={formData.confirmNewPassword} onChange={handleChange} required className="mt-1 bg-[#F3F4F6] border-[#F3F4F6] text-[#9095A1]" />
            </div>

            {/* Nút Submit */}
            <Button type="submit" className="w-full bg-[#2D99AE] hover:bg-[#0C5776] text-white" disabled={isLoading}>
              {isLoading ? <LoaderCircle className="animate-spin mx-auto" /> : "Reset Password"}
            </Button>
            
            {/* Thông báo */}
            {message.text && (
              <p className={`text-sm text-center mt-4 ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {message.text}
              </p>
            )}
          </form>
        </div>

        <div className="text-center">
            <Link href="/signin" className="font-medium text-[#0C5776] hover:text-[#2D99AE]">
              ← Back to Sign in
            </Link>
        </div>
      </div>
    </div>
  );
}