import Image from "next/image"
import Link from "next/link"
import { Button } from "app/components/button"
import { Shield } from "lucide-react"

export default function LandingPage() {
  // #001C44
  // #0C5776
  // #2D99AE
  // #BCFEFE
  // #F8DAD0

  // Another colors
  // #9095A1 - For Placeholder
  // #F3F4F6 - For Background of Placeholder

  const primaryColor = "#0C5776"
  const secondaryColor = "#2D99AE"
  const iconShieldColor = "#F8DAD0"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* === HEADER === */}
      <header className="flex items-center h-16 bg-[#0C5776] px-6 shrink-0">
        {/* <h1 className="text-lg font-medium">Sign up and Sign In</h1> */}
      </header>

      {/* === MAIN CONTENT === */}
      {/* flex-grow sẽ làm cho phần này lấp đầy không gian còn lại giữa header và footer */}
      <main className="flex items-center justify-center min-h-[calc(100vh-60px)] px-6">
        <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <div className="text-center lg:text-left">
            <div className="flex justify-center lg:justify-start mb-8">
              {/* Icon Shield */}
              {/* <div
                className={`w-24 h-24 rounded-lg flex items-center justify-center bg-[${iconShieldColor}]`}
              >
                <Image
                  src="/images/icon-user-shield.png" // Đường dẫn bắt đầu từ thư mục public
                  alt="User Authentication Shield"
                  width={56} // Resize ảnh nhỏ lại
                  height={56} // Resize ảnh nhỏ lại
                />
              </div> */}
              <Image
                  src="/images/icon-user-shield.png" // Đường dẫn bắt đầu từ thư mục public
                  alt="User Authentication Shield"
                  width={150} // Resize ảnh nhỏ lại
                  height={150} // Resize ảnh nhỏ lại
              />
            </div>

            <h1 className="text-4xl font-bold text-[#001C44] mb-4">Crypto Auth System</h1>

            <p className="text-lg text-[#0C5776] mb-8">To continue, kindly log in with your account</p>

            <div className="flex gap-4 justify-center lg:justify-start">
              <Link href="/signup">
                <Button className="bg-[#2D99AE] hover:bg-[#0C5776] text-white px-8 py-3 rounded-md transition-colors duration-200">Sign up</Button>
              </Link>
              <Link href="/signin">
                <Button className="bg-[#2D99AE] hover:bg-[#0C5776] text-white px-8 py-3 rounded-md transition-colors duration-200">Sign in</Button>
              </Link>
            </div>
          </div>

          {/* Right Side - Security Graphic */}
          <div className="flex justify-center">
            {/* Main Shield */}
            <Image
              src="/images/icon-cyber-security.png"
              alt="Security System Graphic"
              width={430} // Resize ảnh lớn
              height={430} // Giữ tỉ lệ hoặc điều chỉnh cho phù hợp
              className="object-contain" // Đảm bảo ảnh không bị méo
            />
          </div>
        </div>
      </main>

      {/* === FOOTER === */}
      <footer className="h-16 bg-[#0C5776] shrink-0"></footer>
    </div>
  )
}