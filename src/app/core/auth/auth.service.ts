
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {

    isLoggedIn(): boolean {
        return !!sessionStorage.getItem('user_token');
    }

    login(token: string) {
        sessionStorage.setItem('user_token', token);
    }

    logout() {
        sessionStorage.removeItem('user_token');
    }

    getToken(): string | null {
        return sessionStorage.getItem('user_token');
    }
}