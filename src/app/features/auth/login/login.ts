import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private http = inject(HttpClient);
  toastr = inject(ToastrService);
  cdr = inject(ChangeDetectorRef);
  private apiUrl = environment.apiUrl;

  loginForm!: FormGroup;
  isLoading = false;

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const loginData = this.loginForm.value;

    // 🌟 Nhận thêm trường 'token' trả về từ Backend mới nâng cấp
    this.http.post<{ success: boolean; message: string; token: string }>(
      `${this.apiUrl}/auth/login`,
      loginData
    ).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.toastr.success('Đăng nhập thành công!', 'Thông báo');

        if (response.token) {
          this.authService.login(response.token);
        }

        this.router.navigate(['/salary']);

        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        if (err.status === 401) {
          this.toastr.error(err.error?.message || 'Tài khoản hoặc mật khẩu không chính xác!', 'Đăng nhập thất bại');
        } else {
          this.toastr.error('Không thể kết nối đến máy chủ. Vui lòng thử lại sau!', 'Đăng nhập thất bại');
        }
      }
    });
  }
}
