import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router'; // 🌟 Import thêm Router để đá người dùng ra nếu không có Token
import { HttpClient, HttpHeaders } from '@angular/common/http'; // 🌟 Import thêm HttpHeaders
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-salary-dashbroad',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './salary-dashbroad.component.html',
  styleUrl: './salary-dashbroad.component.css',
})
export class SalaryDashbroadComponent implements OnInit {
  private router = inject(Router); // 🌟 Inject Router
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private apiUrl = environment.apiUrl;
  private authService = inject(AuthService);

  salaryData: any[] = [];
  thangNamHienTai: string = '';
  thangDuocChon: string = '';
  danhSachThang: any[] = [];
  maNhanVien: string = '';

  congTieuChuan: string = '0';
  thucLinh: string = '0';
  ghiChu: string = '';

  ngOnInit() {
    this.khoiTaoDanhSachThangHeThong();

    const token = this.authService.getToken();
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.maNhanVien = payload.username || "Thành viên";
      } catch (e) {
        this.maNhanVien = "Thành viên";
      }
    }

    this.fetchSalary(this.thangDuocChon);
  }

  fetchSalary(thangNam: string) {
    const token = this.authService.getToken();
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.post<any>(`${this.apiUrl}/salary/query`,
      { dateYM: thangNam },
      { headers: headers }
    ).subscribe({
      next: (res) => {
        if (res.success) {
          this.salaryData = res.data;

          const rawMonth = this.findDataInArray('Năm tháng');
          this.thangNamHienTai = rawMonth.replace(':', '').trim();

          this.congTieuChuan = this.findDataInArray('Công tiêu chuẩn (h)');
          this.thucLinh = this.findDataInArray('VI. Thực lĩnh=(A)-(B)+(C)-(D)+(E)');
          this.ghiChu = this.findDataInArray('Ghi chú');

          this.cdr.detectChanges();

        }
      },
      error: (err) => {
        console.error('Lỗi tải bảng lương:', err);
        this.salaryData = [];
        this.thangNamHienTai = '';
        this.congTieuChuan = '0';
        this.thucLinh = '0';

        if (err.status === 401 || err.status === 403) {
          this.ghiChu = 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!';
          this.authService.logout();
          this.router.navigate(['/login']);
        } else {
          this.ghiChu = 'Tháng này chưa có dữ liệu hoặc lỗi kết nối đến máy chủ!';
        }
        this.cdr.detectChanges();
      }
    });
  }

  khoiTaoDanhSachThangHeThong() {
    const sysdate = new Date();
    const namHienTai = sysdate.getFullYear();
    const thangHienTaiRaw = sysdate.getMonth() + 1;

    this.thangDuocChon = `${namHienTai}${thangHienTaiRaw.toString().padStart(2, '0')}`;

    const mangTam = [];
    for (let i = 12; i >= 1; i--) {
      const chuoiThang = i.toString().padStart(2, '0');
      mangTam.push({
        value: `${namHienTai}${chuoiThang}`,
        label: `Tháng ${chuoiThang} / ${namHienTai}`
      });
    }
    this.danhSachThang = mangTam;
  }


  onMonthChange(newMonth: string) {
    this.thangDuocChon = newMonth;
    this.fetchSalary(this.thangDuocChon);
  }

  private findDataInArray(simplifyName: string): string {
    const target = this.salaryData.find(x => x.simplify === simplifyName);
    return target ? target.datainfo : '';
  }

  isHeader(simplifyName: string): boolean {
    if (!simplifyName) return false;
    return /^(I|II|III|IV|V|VI)\./.test(simplifyName);
  }

  isTotalRow(simplifyName: string): boolean {
    if (!simplifyName) return false;
    return simplifyName.toLowerCase().includes('tổng') || simplifyName.toLowerCase().includes('thực lĩnh');
  }
}