import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const useAuth = () => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      router.push('/signin'); // Chuyển hướng đến trang đăng nhập nếu không có token
    }
  }, [router]);

  // Có thể trả về thông tin người dùng từ token nếu cần
  // Ví dụ: const decodedToken = token ? JSON.parse(atob(token.split('.')[1])) : null;
  // return { isAuthenticated: !!token, user: decodedToken };
};

export default useAuth;
