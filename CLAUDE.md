# HƯỚNG DẪN DÀNH CHO AGENT TIẾP QUẢN (CLAUDE.md)

## 🏗️ Kiến trúc & Công nghệ (Tech Stack)
Dự án **Elevated POS (QuanLyNhaHang2)** đã được di chuyển hoàn toàn từ LocalStorage sang **Supabase Cloud**.
- **Database**: PostgreSQL (Supabase)
- **Realtime**: Supabase Channels (Lắng nghe `tables`, `orders`, `reservations`, `ingredients`).
- **State Management**: Zustand (Các Store hiện tại đang gọi trực tiếp tới Supabase).

## 🗄️ Cấu trúc Cơ sở dữ liệu (Schema)
Các bảng chính nằm trong `public` schema của Supabase:
- `staff`: Quản lý nhân viên (PIN, Role).
- `menu_items`: Danh mục món ăn và giá (ID dạng TEXT).
- `floors`, `tables`: Sơ đồ bàn ăn đa tầng.
- `orders`: Chi tiết đơn gọi món, đồng bộ KDS.
- `reservations`: Quản lý đặt bàn.
- `ingredients`: Quản lý nguyên vật liệu kho (ID dạng TEXT).
- `bom_recipe`: Định mức khấu trừ món ăn.

## ⚙️ Logic quan trọng cần lưu ý
- **BOM Logic**: Hàm `deductInventory` trong `tableStore.ts` sẽ tự động thực hiện trừ tồn kho tại thời điểm **Checkout (clearOrders)**. Luôn đảm bảo `product_id` và `ingredient_id` trong `bom_recipe` khớp với dữ liệu thực tế.
- **Realtime**: StoreInitializer (`StoreInitializer.tsx`) khởi tạo kết nối realtime ngay khi ứng dụng chạy.

## 📁 Các tệp logic cốt lõi
- `src/lib/supabase.ts`: Khởi tạo client Supabase.
- `src/store/tableStore.ts`: Quản lý Bàn, Đơn hàng và Trừ kho tự động.
- `src/store/userStore.ts`: Quản lý Nhân sự & Đăng nhập PIN.
- `src/app/admin/`: Chứa các trang quản trị Menu, Kho và Định mức.

## 🚀 Việc cần làm tiếp theo
- Triển khai báo cáo doanh thu (`/admin/reports`).
- Quản lý Ca làm việc (`/admin/shifts`).
- Chụp ảnh và kiểm tra độ tương thích trên Mobile/Tablet.

*Lưu ý: Luôn kiểm tra `.env.local` để đảm bảo URL dự án và Anon Key đúng.*
