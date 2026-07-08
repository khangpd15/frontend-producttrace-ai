# Hướng Dẫn Tích Hợp Frontend - Backend (Frontend-Backend Integration Guide)
**Dự án:** ProductTrace-AI (Hệ thống truy xuất nguồn gốc sản phẩm tích hợp AI)  
**Tài liệu dành cho:** Backend Developer  
**Phiên bản:** 1.0.0  

---

## 1. Tổng quan Frontend

Frontend của dự án ProductTrace-AI được phát triển để cung cấp giao diện quản trị cho Doanh nghiệp/Admin (`AdminApp`) và giao diện quét mã, tra cứu cho Khách hàng cuối (`CustomerApp`).

* **Framework:** React 19, TypeScript, Vite.
* **Styling:** TailwindCSS v4, Bootstrap CSS 5.3 (qua `react-bootstrap`).
* **Main modules:**
  * **`Admin Module`** (`src/admin`): Dashboard giám sát, quản lý người dùng, danh mục sản phẩm, biến thể, tạo lô hàng, quản lý bảo hành, cấu hình vị trí địa lý đại lý và xem nhật ký audit log hệ thống.
  * **`Customer Module`** (`src/customer`): Giao diện di động để quét mã QR truy xuất nguồn gốc, đăng ký quyền sở hữu chính chủ sản phẩm, gửi yêu cầu bảo hành và quản lý hồ sơ cá nhân khách hàng.
  * **`Shared Module`** (`src/shared`): Chứa các UI components dùng chung (Buttons, Cards, Breadcrumbs, Modals) và các kiểu dữ liệu TypeScript dùng chung (`types/domain`).
* **Routing:** Hiện tại đang sử dụng cơ chế chuyển đổi component dựa trên state tĩnh (`useState(window.location.pathname)`). Cần được nâng cấp lên **React Router Dom v7** ở chế độ SPA thực sự để hỗ trợ định tuyến sạch.
* **State management:** Hiện tại chỉ sử dụng React Component State. Cần tích hợp **Zustand** hoặc **Redux Toolkit** để quản lý token session đăng nhập của người dùng.
* **API layer:** Hiện tại đang sử dụng dữ liệu tĩnh (Mock Data). Khi tích hợp, toàn bộ API layer sẽ sử dụng **Axios client** với cấu hình Base URL trỏ đến Kong API Gateway.

---

## 2. Setup Frontend

### Requirements
* Cài đặt **Node.js** phiên bản LTS (khuyến nghị `Node 20+` hoặc `Node 22+`).
* Cài đặt trình quản lý gói `npm` (đi kèm Node.js) hoặc `yarn`.

### Install Dependency
Di chuyển vào thư mục `frontend-producttrce-ai` và chạy lệnh sau để cài đặt toàn bộ thư viện cần thiết:
```bash
npm install
```
Hoặc nếu dùng Yarn:
```bash
yarn install
```

### Environment Configuration
Tạo file `.env` ở thư mục gốc của Frontend (`frontend-producttrce-ai/.env`) và cấu hình các biến sau:
```ini
# URL của API Gateway (Kong Gateway) trỏ tới backend
VITE_API_URL=http://localhost:8000/api

# URL của Socket server (nếu có tính năng thông báo real-time)
VITE_SOCKET_URL=http://localhost:8000
```

---

## 3. API Contract

Dưới đây là các API chính mà Backend phải đảm bảo cung cấp đúng định dạng để Frontend có thể tích hợp. Tất cả các endpoint đều đi qua cổng Gateway mặc định `8000` (được cấu hình qua Kong Gateway tới Go Core Service).

### 3.1. Authentication

#### Register (Đăng ký tài khoản)
* **Method:** `POST`
* **Endpoint:** `/api/auth/register`
* **Request Payload:**
```json
{
  "email": "user@example.com",
  "phone": "0987654321",
  "full_name": "Nguyen Van A",
  "password": "strongpassword123"
}
```
* **Response (Success - 201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully. Please verify your email with OTP.",
  "data": {
    "email": "user@example.com",
    "phone": "0987654321",
    "full_name": "Nguyen Van A",
    "status": "PENDING"
  }
}
```

#### Verify OTP (Xác thực tài khoản qua OTP)
* **Method:** `POST`
* **Endpoint:** `/api/auth/verify-otp`
* **Request Payload:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```
* **Response (Success - 200 OK):**
```json
{
  "success": true,
  "message": "Account verified successfully. You can now log in.",
  "data": null
}
```

#### Login (Đăng nhập)
* **Method:** `POST`
* **Endpoint:** `/api/auth/login`
* **Request Payload:**
```json
{
  "email": "user@example.com",
  "password": "strongpassword123"
}
```
* **Response (Success - 200 OK):**
```json
{
  "success": true,
  "message": "Logged in successfully",
  "data": {
    "access_token": "eyJhbGciOi...",
    "refresh_token": "user-uuid.rand-token-string"
  }
}
```

#### Refresh Token (Lấy Access Token mới)
* **Method:** `POST`
* **Endpoint:** `/api/auth/refresh`
* **Request Payload:**
```json
{
  "refresh_token": "user-uuid.rand-token-string"
}
```
* **Response (Success - 200 OK):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "access_token": "new-access-token-string",
    "refresh_token": "new-refresh-token-string"
  }
}
```

---

## 4. Authentication Flow

Frontend quản lý trạng thái đăng nhập của người dùng qua luồng kiểm soát Token như sau:

```
[Register] ──> [Verify OTP] ──> [Login] ──> [Lưu Access & Refresh Token]
                                                 │
                                                 ▼
[Gửi Authorization Header] <── [Call Protected API] <── [Interceptor check 401]
                                                             │
                                                             ▼
                                                    [Call Refresh Token]
```

### Chi tiết luồng xử lý:
1. **Lưu Token:** Sau khi đăng nhập thành công, Frontend sẽ lưu:
   - `access_token` vào bộ nhớ tạm (Memory / React State) hoặc LocalStorage để sử dụng nhanh.
   - `refresh_token` vào LocalStorage hoặc Cookie an toàn.
2. **Header Format:** Đối với tất cả các API nằm trong nhóm bảo vệ (Protected Routes), Frontend sẽ tự động đính kèm Token vào Header theo chuẩn Bearer Token:
   ```http
   Authorization: Bearer <access_token>
   ```
3. **Refresh Token Flow:**
   - Frontend cấu hình Axios Interceptors. Khi một request bất kỳ trả về lỗi **HTTP 401 Unauthorized** (do Access Token hết hạn), Axios sẽ tạm dừng các request khác, tự động gọi API `/api/auth/refresh` để lấy cặp token mới.
   - Nếu lấy token mới thành công, Frontend cập nhật lại bộ nhớ, thực hiện lại request bị lỗi ban đầu.
   - Nếu Refresh Token cũng hết hạn (hoặc trả về lỗi), Frontend sẽ xóa sạch bộ nhớ lưu trữ và chuyển hướng người dùng về màn hình Login.
4. **Logout Flow:**
   - Khi người dùng bấm Logout, Frontend gửi request `POST /api/auth/logout` gửi kèm `refresh_token`.
   - Backend sẽ xóa token đó khỏi Redis và đưa vào danh sách đen (blacklist).
   - Frontend xóa toàn bộ token ở Client và quay về trạng thái chưa đăng nhập.

---

## 5. Backend Requirement

Phần này đặc tả các API có mã bảo vệ mà Backend bắt buộc phải cung cấp cho Frontend để vận hành các chức năng nghiệp vụ:

### 5.1. User Profile API
Dùng để lấy thông tin chi tiết của người dùng đang đăng nhập để hiển thị ở góc header và trang thiết lập cài đặt cá nhân.

* **Endpoint:** `GET /api/users/profile`
* **Authentication:** `Required` (Bearer Token)
* **Response (Success - 200 OK):**
```json
{
  "success": true,
  "message": "Get profile successfully",
  "data": {
    "id": "a6b8c9d0-1234-5678-abcd-ef0123456789",
    "email": "admin@producttrace.vn",
    "phone": "0988123456",
    "full_name": "Admin User",
    "role": "ADMIN",
    "avatar_url": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
    "status": "ACTIVE"
  }
}
```

### 5.2. Product Detail API
Dùng để hiển thị thông tin sản phẩm khi người dùng quét mã QR chứa thông tin định danh sản phẩm hoặc tìm kiếm trực tiếp.

* **Endpoint:** `GET /api/products/:id`
* **Authentication:** `None` (Public API)
* **Response (Success - 200 OK):**
```json
{
  "success": true,
  "message": "Product detail retrieved successfully",
  "data": {
    "id": "e6a2bc34-3142-4521-ba32-abcdef123456",
    "name": "Máy lọc nước RO Kangaroo VT3",
    "slug": "may-loc-nuoc-ro-kangaroo-vt3",
    "category": "Thiết bị gia dụng",
    "description": "Mô tả sản phẩm lọc nước Kangaroo...",
    "thumbnail_url": "https://images.unsplash.com/photo-1621217742914-72a39211fb85",
    "status": "ACTIVE",
    "tags": ["Gia dụng", "Lọc nước", "Kangaroo"]
  }
}
```

---

## 6. Error Response Standard

Để Frontend xử lý lỗi đồng bộ và hiển thị thông báo thân thiện tới người dùng (Toast, Alert popup), Backend cần cam kết trả về lỗi theo format chuẩn sau cho tất cả các mã trạng thái HTTP `>= 400`:

```json
{
  "success": false,
  "message": "Thông báo lỗi ngắn gọn, hiển thị cho người dùng (ví dụ: Mật khẩu không chính xác)",
  "error": "Mã lỗi kỹ thuật hoặc chi tiết từ hệ thống phục vụ Debug (ví dụ: crypto/bcrypt: hashedPassword is not the hash of the given password)",
  "data": null
}
```

### Các HTTP Status Code Backend cần tuân thủ:
* `400 Bad Request`: Sai định dạng đầu vào (ví dụ: gửi JSON sai cú pháp).
* `422 Unprocessable Entity`: Dữ liệu đầu vào không vượt qua tầng Validation (ví dụ: email sai định dạng, mật khẩu ngắn hơn 6 ký tự).
* `401 Unauthorized`: Token không hợp lệ, hết hạn, hoặc thông tin đăng nhập sai.
* `403 Forbidden`: Người dùng đã đăng nhập nhưng không có vai trò phù hợp (ví dụ: Customer truy cập vào API tạo lô hàng).
* `404 Not Found`: Không tìm thấy tài nguyên (User, Product, Batch không tồn tại).
* `500 Internal Server Error`: Lỗi hệ thống bất ngờ ở backend (lỗi kết nối DB, lỗi RabbitMQ).

---

## 7. CORS Configuration

Vì ứng dụng Frontend chạy trên port khác (hoặc domain khác) so với Backend API Gateway, Backend Developer cần thêm cấu hình Cross-Origin Resource Sharing (CORS) như sau:

### Cho phép các Origin:
* Môi trường Local: `http://localhost:3000` (hoặc port chạy Vite dev).
* Môi trường Production: Domain chính thức của ứng dụng Frontend.

### Cho phép các HTTP Methods:
* `GET`
* `POST`
* `PUT`
* `DELETE`
* `PATCH`
* `OPTIONS` (Bắt buộc phục vụ cho preflight requests của trình duyệt).

### Cho phép các Headers:
* `Authorization`
* `Content-Type`
* `X-Request-ID`

---

## 8. Development Workflow

Luồng công việc phối hợp chạy thử nghiệm dự án ở môi trường phát triển local:

1. **Khởi chạy Infrastructure và Backend (Docker):**
   Backend Developer di chuyển vào thư mục dự án backend `producttrace-ai` và chạy lệnh khởi động toàn bộ services nền:
   ```bash
   docker compose up -d
   ```
   Lệnh này sẽ khởi động Postgres, Redis, RabbitMQ, chạy các script migrations tự động, sau đó bật `go-core-service`, `worker-service` và `nest-ai-service`.

2. **Khởi chạy API Gateway (Kong):**
   ```bash
   docker compose -f docker-compose.kong.yml up -d
   ```

3. **Khởi chạy Frontend:**
   Di chuyển vào thư mục dự án frontend `frontend-producttrce-ai` và khởi chạy server phát triển local:
   ```bash
   npm run dev
   ```
   Ứng dụng sẽ chạy ở địa chỉ mặc định `http://localhost:3000`.

4. **Kiểm tra kết nối thực tế (Flow Test):**
   ```
   [Vite Dev Server (Port 3000)]
                 │
                 ▼ (Gửi request HTTP)
   [Kong Gateway (Port 8000/api)]
                 │
                 ▼ (Phân tuyến định tuyến)
   [Go Core API (Port 8080)]
                 │
                 ├─(Query)─> [PostgreSQL (Port 5433)]
                 ├─(Cache)─> [Redis (Port 6379)]
                 └─(Event)─> [RabbitMQ (Port 5672)] ──> [NestJS Mail (Port 3000)]
   ```

---

## 9. Những lưu ý khi Backend phát triển thêm API

Để đảm bảo không xảy ra xung đột làm sập ứng dụng Frontend khi Backend phát triển thêm các API mới:

1. **Không thay đổi Response Format tùy ý:** Luôn bao bọc dữ liệu trong cấu trúc `{ success, message, data }`. Việc thay đổi tên trường (ví dụ: đổi từ `access_token` thành `accessToken` hay `token`) mà không báo trước sẽ làm hỏng logic của client.
2. **Cập nhật API Documentation:** Luôn cập nhật tài liệu API (Swagger / Postman Collection) ngay khi deploy endpoint mới.
3. **Giữ Naming Convention đồng bộ:** Sử dụng kiểu định dạng `snake_case` cho toàn bộ các trường JSON trong Request và Response để đồng bộ với cơ sở dữ liệu và cấu trúc Go struct.
4. **Phiên bản hóa API (Versioning):** Khi thực hiện các thay đổi lớn làm thay đổi cấu trúc dữ liệu cũ (breaking changes), hãy tăng version API (ví dụ: chuyển từ `/api/v1/products` lên `/api/v2/products`).
5. **Validate Input chặt chẽ phía Server:** Không bao giờ tin tưởng hoàn toàn vào validation của Frontend. Luôn xác thực lại cấu trúc dữ liệu và phân quyền Role của người dùng ở mức API Backend.

---

## 10. Checklist trước khi Merge Code Backend

Trước khi Backend Developer thực hiện pull request (PR) hoặc merge code vào nhánh chính để sẵn sàng deploy, hãy hoàn thành checklist sau:

- [ ] **API tested:** Đã chạy thử nghiệm API thành công trên Postman, không có lỗi logic hay sập service.
- [ ] **Response match FE:** Cấu trúc JSON trả về khớp hoàn toàn với DTO mà Frontend đang định nghĩa trong tài liệu tích hợp này.
- [ ] **Swagger updated:** Cập nhật tài liệu API chi tiết về endpoint mới và các tham số truyền vào.
- [ ] **Error handled:** Đã try-catch đầy đủ, không để lộ lỗi thô từ database (như error code GORM, stacktrace SQL) ra client.
- [ ] **Auth checked:** Đã áp dụng đúng middleware `AuthMiddleware` và `RoleMiddleware` để bảo vệ tài khoản, phân quyền chính xác.
- [ ] **Environment updated:** Nếu API mới yêu cầu thêm biến môi trường (ví dụ: API key dịch vụ thứ 3), đã khai báo biến đó vào file `.env.example`.
