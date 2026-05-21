import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {

    // Kiểm tra trạng thái đăng nhập từ sessionStorage
    isLoggedIn(): boolean {
        return !!sessionStorage.getItem('user_token');
    }

    // Đăng nhập: Lưu token vào sessionStorage (tắt trình duyệt là mất)
    login(username: string, password: string) {
        sessionStorage.setItem('user_token', 'fake-jwt-token-cho-phien-nay');
    }

    // Đăng xuất: Xóa token
    logout() {
        sessionStorage.removeItem('user_token');
    }
}