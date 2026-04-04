# THỐNG KÊ TIẾN ĐỘ DỰ ÁN (PROJECT STATE)
*Lưu ý cho Agent: Luôn đọc file này đầu tiên khi bắt đầu một phiên làm việc mới và tự động cập nhật file này sau mỗi lần hoàn thành tính năng hoặc trước khi kết thúc phiên làm việc.*

## 1. Trạng thái hiện tại (Current Phase)
- **Giai đoạn:** Hoàn thiện Quy trình Vận hành (Workflow Overhaul) chuẩn Việt Nam.
- **Mục tiêu chặng này:** Đạt trạng thái "Production-Ready" cho luồng: Đặt món -> Bếp -> Phục vụ -> Thanh toán -> Feedback.

## 2. Đã hoàn thành (Done)
- [x] Thiết lập Rule hệ thống (`RULES.md`, `git_version_control.md`).
- [x] Xây dựng màn hình Login (PIN-pad 123456).
- [x] Xây dựng màn hình Table Map (Hiển thị chuông báo món Ready và tiến độ phục vụ).
- [x] Xây dựng màn hình Kitchen KDS (Xử lý trạng thái Prepare, Ready, Serve to Table).
- [x] **Đại tu Order Menu Sidebar**: Hiển thị song song "Món mới" và "Món đã gọi" với trạng thái đồng bộ từ bếp.
- [x] Sửa lỗi cuộn trang (Scrolling) tại màn hình Bếp.
- [x] Hoàn thiện luồng Checkout & Thanh toán.
- [x] Tích hợp Feedback Modal sau khi thanh toán.
- [x] **Xây dựng Dashboard Quản lý Kho (Inventory)**: Hiển thị trạng thái tồn kho, tài sản và báo cáo lãng phí với hình ảnh chất lượng cao.
- [x] **Đồng bộ Đặt chỗ & Sơ đồ bàn (Reservation-Map Sync)**: 
    - Kết nối Form đặt chỗ với Store.
    - Bổ sung UI chọn bàn trống khi đặt.
    - Trạng thái "Reserved" (Hồng) tự động hiển thị trên sơ đồ.
    - Luồng "Xác nhận khách đến" tự động chuyển trạng thái bàn và mở Menu gọi món.
- [x] **Bền vững hóa dữ liệu (Persistence)**: Tích hợp LocalStorage cho `tableStore`, dữ liệu không bị mất khi Refresh trang.

## 3. Đang thực hiện (In Progress)
- [ ] Nhánh làm việc: `feature/reservation-sync-final` (Chuẩn bị push).
- [ ] Tích hợp Gemini AI Assistant để phân tích hiệu suất phục vụ.
- [ ] Quản lý Danh sách khách chờ (Waitlist) thực tế.

## 4. Việc tiếp theo (To-Do)
- [ ] Xây dựng Dashboard báo cáo doanh thu.
- [ ] Hoàn thiện chức năng quản lý công thức (BOM Formulas).
- [ ] Tỉ lệ quay vòng bàn (Turnover Rate) và thống kê thời gian thực.

## 5. Quyết định Kỹ thuật & Lỗi đã biết (Technical Notes & Known Issues)
- **Cấu trúc dữ liệu:** Sử dụng `KitchenStore` và `TableStore` (Zustand) với Middleware `persist` để lưu trữ dữ liệu tại trình duyệt (LocalStorage).
- **Lỗi đã fix:** 
  - Fix lỗi Table Map bị mất trạng thái khi Refresh trang (đã Persistence).
  - Fix lỗi "Implicit Any" và cú pháp TypeScript trong `tableStore.ts`.
  - Fix luồng xác nhận khách đến chưa tự động chuyển bàn sang "Occupied".

## 6. Liên kết nhanh (Quick Links)
- [RULES.md](file:///d:/elevated-pos/RULES.md)
- [Git Workflow](file:///d:/elevated-pos/.agent/workflows/git_version_control.md)
