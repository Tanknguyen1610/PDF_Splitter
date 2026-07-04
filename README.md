# 📄 Visual PDF Splitter

Công cụ tách file PDF trực quan — xem trước toàn bộ trang dưới dạng thumbnail, click chọn điểm cắt, và nhận về nhiều file PDF nhỏ được đóng gói trong 1 file `.zip`.

Dự án gồm 2 phần độc lập:
- **Backend:** Python 3.12 + FastAPI + PyMuPDF (xử lý PDF, render thumbnail, cắt file)
- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS v4 (giao diện tương tác)

---

## ✨ Tính năng chính

- Kéo thả (drag & drop) hoặc chọn file PDF để tải lên.
- Xem trước toàn bộ các trang PDF dưới dạng ảnh, chất lượng cao (PNG, không nén mất dữ liệu).
- Click vào bất kỳ trang nào để đánh dấu đó là điểm bắt đầu của một văn bản mới.
- Xem trước danh sách file sẽ được tạo ra trước khi thực hiện tách.
- Tách file và tải về ngay 1 file `.zip` chứa tất cả các văn bản đã tách, đặt tên tuần tự có zero-padding.
- Giao diện hỗ trợ Dark Mode / Light Mode.

---

## 🗂️ Cấu trúc dự án

```
PDF_Splitter/
├── backend/
│   ├── main.py                 # FastAPI app, 2 endpoints chính
│   ├── requirements.txt
│   └── temp_storage/           # Thư mục lưu file PDF/zip tạm (tự tạo khi chạy, không commit)
└── frontend/
    ├── app/
    │   ├── page.tsx             # Trang chính
    │   ├── layout.tsx
    │   └── globals.css          # Design tokens (theme màu, font, dark mode)
    ├── components/
    │   ├── UploadZone.tsx        # Khu vực kéo thả / chọn file
    │   ├── PageGrid.tsx           # Khung hiển thị danh sách trang (viewport)
    │   ├── PageThumbnail.tsx      # 1 trang PDF dạng ảnh, có thể click chọn
    │   └── SplitControlPanel.tsx  # Panel điều khiển: xem điểm cắt, nút Tách/Reset
    ├── lib/
    │   └── types.ts              # Type definitions dùng chung
    ├── package.json
    ├── postcss.config.mjs
    └── next.config.mjs
```

---

## 🚀 Cài đặt & Chạy dự án

### Yêu cầu hệ thống

- Python 3.12+
- Node.js 18+ (khuyến nghị 20+)
- npm (hoặc yarn/pnpm)

### 1. Backend (FastAPI)

```bash
cd backend

# Tạo môi trường ảo
python -m venv venv

# Kích hoạt môi trường ảo
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Cài đặt dependencies
pip install -r requirements.txt

# Chạy server (mặc định cổng 8000)
uvicorn main:app --reload --port 8000
```

Backend sẽ chạy tại: `http://localhost:8000`
Kiểm tra hoạt động: mở `http://localhost:8000` → thấy phản hồi `{"status": "ok", ...}`

### 2. Frontend (Next.js)

Mở terminal mới:

```bash
cd frontend

# Cài đặt dependencies
npm install

# Chạy dev server (mặc định cổng 3000)
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:3000`

> **Lưu ý:** Cần chạy **cả backend và frontend cùng lúc** (2 terminal riêng biệt) để ứng dụng hoạt động đầy đủ.

### 3. (Tùy chọn) Cấu hình API URL

Nếu backend chạy ở địa chỉ khác `http://localhost:8000`, tạo file `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://<địa-chỉ-backend-của-bạn>:8000
```

---

## 📖 Hướng dẫn sử dụng

1. Truy cập `http://localhost:3000`.
2. Kéo thả file PDF vào khung upload, hoặc click để chọn file từ máy tính.
3. Chờ hệ thống render xong toàn bộ trang thành ảnh xem trước.
4. Click vào trang bất kỳ để đánh dấu đó là **điểm bắt đầu của một văn bản mới**:
   - Ví dụ chọn trang `1, 6, 12` → hệ thống hiểu: File 1 = trang 1–5, File 2 = trang 6–11, File 3 = trang 12–hết.
5. Xem lại danh sách file sẽ được tạo ra ở panel bên phải.
6. Bấm **"Thực hiện tách"** → trình duyệt tự động tải về 1 file `.zip` chứa toàn bộ các văn bản đã tách.
7. Nếu chọn sai, bấm **"Reset"** để hủy toàn bộ điểm đã đánh dấu và chọn lại từ đầu.

**Quy tắc đặt tên file kết quả:**
`<tên-file-gốc>-01.pdf`, `<tên-file-gốc>-02.pdf`, ... (số thứ tự có zero-padding 2 chữ số)

---

## 🔌 API Endpoints

### `POST /api/pdf/upload`
Tải lên file PDF, nhận về danh sách thumbnail toàn bộ các trang.

**Input:** `multipart/form-data`, field `file` (PDF)

**Output:**
```json
{
  "file_id": "uuid-string",
  "original_name": "ten-file-goc",
  "total_pages": 118,
  "thumbnails": [
    { "page_number": 1, "thumbnail": "data:image/png;base64,...", "width": 1240, "height": 1754 }
  ]
}
```

### `POST /api/pdf/split`
Tách file PDF theo danh sách điểm cắt, trả về file `.zip`.

**Input:**
```json
{
  "file_id": "uuid-string",
  "split_pages": [1, 6, 12]
}
```

**Output:** File `.zip` (`application/zip`) — tải về trực tiếp.

---

## ⚠️ Giới hạn hiện tại (dự án dạng demo/độc lập)

- File PDF và metadata được lưu **tạm thời trong bộ nhớ** (dict in-memory) và thư mục `backend/temp_storage/` — sẽ mất khi khởi động lại server. Không phù hợp chạy nhiều worker song song hoặc môi trường production như hiện tại.
- Chưa có cơ chế dọn dẹp tự động file tạm (khuyến nghị thêm cron job nếu triển khai thật).
- Chưa giới hạn dung lượng file upload tối đa — nên cân nhắc thêm validate nếu public ra ngoài.

## 🛠️ Định hướng mở rộng (nếu tích hợp vào hệ thống lớn hơn)

- Thay `FILE_REGISTRY` in-memory bằng Redis/Database.
- Chuyển thumbnail từ base64-nhúng-JSON sang endpoint ảnh tĩnh riêng (giảm tải payload khi PDF nhiều trang).
- Thêm xác thực (authentication) cho các endpoint.
- Thêm giới hạn kích thước file và số trang tối đa.

---

## 📝 License

Dự án nội bộ / mini project — bổ sung license phù hợp nếu công khai hoặc tích hợp vào hệ thống production.
