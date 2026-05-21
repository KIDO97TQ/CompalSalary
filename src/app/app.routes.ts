import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
    // Nếu gõ đường dẫn trống, tự động chuyển về trang xem lương
    { path: '', redirectTo: 'salary', pathMatch: 'full' },

    // Trang đăng nhập (ai cũng vào được)
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login')
            .then(m => m.LoginComponent)
    },

    // Trang xem lương (Bắt buộc phải qua được authGuard)
    {
        path: 'salary',
        canActivate: [authGuard],
        loadComponent: () => import('./features/salary/salary-dashbroad/salary-dashbroad.component')
            .then(m => m.SalaryDashbroadComponent)
    },

    // Các trang không tồn tại sẽ đẩy về login hoặc trang 404
    { path: '**', redirectTo: 'login' }
];
