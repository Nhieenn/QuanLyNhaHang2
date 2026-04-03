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

## 3. Đang thực hiện (In Progress)
- [ ] Nhánh làm việc: `feat/vietnamese-pos-overhaul` (Đã push lên GitHub).
- [ ] Chờ Người dùng xác nhận chuẩn chức năng để Merge vào `main`.

## 4. Việc tiếp theo (To-Do)
- [ ] Xây dựng màn hình Quản lý Kho (Inventory Management).
- [ ] Xây dựng Dashboard báo cáo doanh thu.
- [ ] Tích hợp Gemini AI Assistant để phân tích hiệu suất phục vụ.

## 5. Quyết định Kỹ thuật & Lỗi đã biết (Technical Notes & Known Issues)
- **Cấu trúc dữ liệu:** Sử dụng `KitchenStore` (Zustand) làm trung tâm đồng bộ trạng thái món ăn giữa Bếp và Bàn.
- **Lỗi đã fix:** 
  - Fix crash màn hình Order do sai định dạng Props truyền vào `ProductCard`.
  - Fix lỗi KDS bị khóa `overflow` không thể cuộn.
  - Fix lỗi giỏ hàng bị xóa sạch sau khi gửi bếp (Giờ đây đã giữ lại lịch sử gọi món).

## 6. Liên kết nhanh (Quick Links)
- [RULES.md](file:///d:/elevated-pos/RULES.md)
- [Git Workflow](file:///d:/elevated-pos/.agent/workflows/git_version_control.md)
