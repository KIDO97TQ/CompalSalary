import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {

    isLoggedIn(): boolean {
        return !!sessionStorage.getItem('user_token');
    }

    login(username: string, password: string) {
        sessionStorage.setItem('user_token', 'fake-jwt-token-cho-phien-nay');
    }

    logout() {
        sessionStorage.removeItem('user_token');
    }
}