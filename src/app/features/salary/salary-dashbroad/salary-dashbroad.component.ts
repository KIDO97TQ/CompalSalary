import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-salary-dashbroad',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './salary-dashbroad.component.html',
  styleUrl: './salary-dashbroad.component.css',
})
export class SalaryDashbroadComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private apiUrl = environment.apiUrl;

  maNhanVien: string = '';
  salaryData: any[] = [];

  thangNamHienTai: string = '';
  thangDuocChon: string = '';
  danhSachThang: any[] = [];

  congTieuChuan: string = '0';
  thucLinh: string = '0';
  ghiChu: string = '';

  ngOnInit() {
    this.khoiTaoDanhSachThangHeThong();

    this.route.queryParams.subscribe(params => {
      this.maNhanVien = params['employeeId'];
      if (this.maNhanVien) {
        this.fetchSalary(this.maNhanVien, this.thangDuocChon);
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
    if (this.maNhanVien) {
      this.fetchSalary(this.maNhanVien, this.thangDuocChon);
    }
  }

  fetchSalary(maNV: string, thangNam: string) {
    this.http.post<any>(`${this.apiUrl}/salary/query`, {
      emp: maNV,
      dateYM: thangNam
    }).subscribe({
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
        this.ghiChu = 'Tháng này chưa có dữ liệu hoặc lỗi kết nối!';
        this.cdr.detectChanges();
      }
    });
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