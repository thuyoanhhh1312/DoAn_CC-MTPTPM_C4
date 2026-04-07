# CC-MTPTPM - Hệ Thống Website Bán Trang Sức

## Tác giả

- Phan Thị Huỳnh Ngọc - 2280602099
- Nguyễn Trần Huỳnh Thùy Oanh
- Nguyễn Trường Kỳ

## Mô tả dự án

Đây là hệ thống thương mại điện tử bán trang sức gồm 3 thành phần chính:

- Client: giao diện người dùng và trang quản trị (React + Vite).
- Server: REST API xử lý nghiệp vụ, xác thực, phân quyền, đơn hàng, sản phẩm, đánh giá.
- NLP Service: dịch vụ AI xử lý đánh giá (sentiment + toxic + pipeline duyệt review).

Hệ thống hỗ trợ:

- Luồng mua sắm khách hàng (xem sản phẩm, giỏ hàng, checkout, đơn hàng).
- Quản trị sản phẩm, danh mục, tin tức, khuyến mãi.
- Phân quyền theo vai trò (admin, staff, customer).
- Duyệt review thông minh qua pipeline NLP nhiều lớp.

## Tech stack

- Frontend: React 18, Vite 7, Redux, React Router, Ant Design, Tailwind CSS.
- Backend: Node.js, Express, Sequelize, MySQL, JWT.
- AI/NLP: FastAPI, Uvicorn, Transformers (PhoBERT + Toxic BERT).

## Cấu trúc thư mục chính

- client: mã nguồn giao diện web.
- server: mã nguồn API và logic nghiệp vụ.
- nlp-service: dịch vụ phân tích nội dung review.
- uploads: dữ liệu ảnh upload dùng chung.

## Yêu cầu môi trường

- Node.js 18+ (khuyến nghị Node 20 LTS).
- npm 9+.
- Python 3.10+.
- MySQL 8+.

## Cách chạy hệ thống

Hệ thống cần chạy đồng thời 3 service: nlp-service, server, client.

### 1) Chạy NLP Service (port 5002)

Mở terminal tại thư mục nlp-service:

```bash
cd nlp-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 5002
```

Hoặc dùng script có sẵn:

```powershell
cd nlp-service
.\start.ps1
```

### 2) Chạy Server API (port 3001)

Mở terminal mới tại thư mục server:

```bash
cd server
npm install
npm run dev
```

Server mặc định chạy tại:

- http://localhost:3001

### 3) Chạy Client (port 5173)

Mở terminal mới tại thư mục client:

```bash
cd client
npm install
npm run dev
```

Client mặc định chạy tại:

- http://localhost:5173

## Trình tự khởi động khuyến nghị

1. Khởi động nlp-service trước.
2. Khởi động server.
3. Khởi động client.

## Luồng kiểm tra nhanh sau khi chạy

1. Mở client tại http://localhost:5173.
2. Truy cập trang chi tiết sản phẩm.
3. Đăng nhập customer và gửi review.
4. Kiểm tra review có được tạo thành công ở DB và hiển thị đúng trạng thái.
5. Đăng nhập admin/staff để kiểm tra khu vực duyệt review toxic.

## Biến môi trường

Server sử dụng file .env trong thư mục server cho các thông số:

- Kết nối CSDL MySQL.
- JWT secret.
- Cấu hình tích hợp dịch vụ.

Lưu ý: không chia sẻ hoặc commit secret lên repository public.

## Các lỗi thường gặp

### 1) Lỗi không gọi được pipeline NLP

- Kiểm tra nlp-service đã chạy port 5002 chưa.
- Kiểm tra firewall/port local.

### 2) Lỗi kết nối database

- Kiểm tra MySQL đã chạy.
- Kiểm tra user/password/database trong cấu hình server.

### 3) CORS hoặc token

- Kiểm tra client đang gọi đúng API base URL.
- Kiểm tra header Authorization khi gọi endpoint cần đăng nhập.

## Ghi chú

- Tài khoản demo có thể được seed tự động khi chạy server ở môi trường development.
- Nếu có thay đổi schema DB, cần đồng bộ model và bảng dữ liệu trước khi chạy lại.

