# THỐNG KÊ TIẾN ĐỘ DỰ ÁN (PROJECT STATE)
*Lưu ý cho Agent: Dự án đã chuyển đổi hoàn toàn sang kiến trúc Cloud-First với Supabase. Luôn đọc file này để nắm bắt hiện trạng cơ sở dữ liệu.*

## 1. Trạng thái hiện tại (Current Phase)
- **Giai đoạn:** Production-Ready Cloud POS with Inventory Management.
- **Mục tiêu:** Vận hành đồng bộ đa thiết bị, quản lý kho hàng và định mức tự động (BOM).

## 2. Các cột mốc Đã Hoàn Thành (COMPLETED)
- [x] **Cloud Migration & Auth**: Chuyển đổi toàn bộ Staff, Menu, Tables lên Supabase Cloud.
- [x] **Real-time Synchronization**: Lắng nghe thay đổi từ cơ sở dữ liệu và đẩy cập nhật tức thì (0% độ trễ) cho Sơ đồ bàn, Bếp và Đơn hàng.
- [x] **Inventory Management (Kho)**: Xây dựng hệ thống quản lý nguyên vật liệu (Ingredients) trực tuyến.
- [x] **Automated BOM Deduction**: Tự động trừ tồn kho theo định mức khi khách thanh toán hóa đơn (Checkout).
- [x] **Admin Toolset**: 
    - Quản lý Nhân sự (`/staff`)
    - Quản lý Thực đơn (`/admin/menu`)
    - Quản lý Kho (`/admin/inventory`)
    - Quản lý Định mức (`/admin/bom`)
- [x] **KDS (Bếp)**: Đồng bộ đơn hàng từ Cloud, xử lý trạng thái Prepare -> Ready.

## 3. Kiến trúc Cơ sở dữ liệu (Supabase)
Dữ liệu đã được chuẩn hóa theo ERD của khách hàng (docs/Design/):
- **staff**: Mã PIN và Phân quyền.
- **menu_items**: Danh mục món ăn và giá.
- **floors / tables**: Sơ đồ tầng và bàn ăn.
- **orders**: Chi tiết đơn hàng và trạng thái chế biến.
- **ingredients**: Quản lý tồn kho nguyên liệu.
- **bom_recipe**: Công thức định mức món ăn.

## 4. Việc tiếp theo (Next Steps)
- [ ] **Sales Reporting**: Xây dựng biểu đồ báo cáo doanh thu và lợi nhuận ròng dựa trên BOM.
- [ ] **Shift Management**: Quản lý ca làm việc và bảng lương nhân viên.
- [ ] **Mobile Optimization**: Tối ưu hóa giao diện cho máy tính bảng/điện thoại và tích hợp Capacitor.
- [ ] **Waitlist**: Quản lý danh sách khách chờ tại chỗ.

---
*Cập nhật lần cuối: 2026-04-05 - Toàn bộ tính năng Cloud đã được kiểm thử và vận hành ổn định.*
