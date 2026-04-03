# Quy tắc Vận hành (Business & Architecture Rules)

1. **Tablet-First Mobile Design:**
   - Toàn bộ giao diện phải được thiết kế cho màn hình cảm ứng ngang (Landscape Touch).
   - Vùng bấm (Touch targets) tối thiểu phải đạt 44x44px. Không thiết kế nút bấm quá nhỏ.
   - Không sử dụng các sự kiện `hover` làm luồng chính vì thiết bị cảm ứng không có chuột.

2. **Quản lý Trạng thái (State Management):**
   - Giỏ hàng (Order Cart) và ID Nhân viên (Session) bắt buộc quản lý tập trung bằng Zustand.
   - Không truyền props (Prop-drilling) quá 2 cấp độ.

3. **Luồng Dữ liệu (Data Flow):**
   - Mọi truy vấn Data đều phải đi qua thư mục `Services/`. UI Component chỉ làm nhiệm vụ hiển thị và gọi hàm, không chứa logic tính toán phức tạp (như trừ kho BOM).

# Tiêu chuẩn Version Control (Git Rules)

1. **Chiến lược Phân nhánh (Branching Strategy):**
   - Không commit trực tiếp vào nhánh `main` hoặc `master`.
   - Mọi thay đổi phải được thực hiện trên nhánh riêng: 
     - Tự động tạo nhánh `feature/tên-chức-năng` cho tính năng mới.
     - Tự động tạo nhánh `fix/tên-lỗi` khi sửa bug.
     - Tự động tạo nhánh `ui/tên-giao-diện` khi chỉ cập nhật UI.

2. **Tiêu chuẩn Commit (Conventional Commits):**
   - Định dạng bắt buộc: `<type>: <description>`
   - Các `type` được phép sử dụng:
     - `feat:` (Thêm chức năng/UI mới)
     - `fix:` (Sửa lỗi logic hoặc giao diện)
     - `refactor:` (Tối ưu hóa code, không đổi logic)
     - `chore:` (Cài đặt package, cấu hình hệ thống)
     - `style:` (Format code, xóa khoảng trắng, không ảnh hưởng logic)
   - *Ví dụ:* `feat: add KDS ticket object pooling` hoặc `fix: resolve crash on checkout screen`.

3. **Atomic Commits (Commit nguyên tử):**
   - Mỗi commit chỉ giải quyết một vấn đề duy nhất. Nếu làm 2 tính năng, phải chia thành 2 commit khác nhau.

# Chính sách Sát nhập (Merging Policy)

1. **Kỷ luật Sát nhập (Merge Discipline):**
   - Tuyệt đối không tự động `merge` nhánh tính năng vào `main`.
   - Việc `merge` chỉ được thực hiện sau khi **NGƯỜI DÙNG XÁC NHẬN** trực tiếp các yếu tố:
     - Chức năng hoạt động đúng 100% kịch bản nghiệp vụ.
     - Đã kiểm tra (Verify) qua Agent trình duyệt, không có lỗi Runtime (màn hình trắng).
     - Code đạt tiêu chuẩn Bistro Block và không có lỗi Lint nghiêm trọng.
   - Nhánh `main` phải luôn ở trạng thái "Sẵn sàng bàn giao" (Production-Ready).

2. **Làm việc liên tục (Continuous Feature Dev):**
   - Khi một tính năng đang chờ xác nhận, Agent tiếp tục làm việc trên các nhánh `feature/` hoặc `fix/` mới để không làm gián đoạn tiến độ.