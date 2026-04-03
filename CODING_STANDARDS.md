# Tiêu chuẩn Code (Coding Standards)

1. **TypeScript Strictness:**
   - Cấm sử dụng type `any`. Nếu không xác định được kiểu, sử dụng `unknown` hoặc định nghĩa Interface rõ ràng trong thư mục `Models/`.
2. **Component Structure:**
   - Sử dụng Functional Component với React Hooks. Không dùng Class Component.
   - Destructure Props ngay tại tham số của hàm.
   - *Ví dụ:* `const TableCard = ({ tableId, status }: TableCardProps) => { ... }`
3. **Styling:**
   - Toàn bộ style phải sử dụng Tailwind CSS.
   - Để tránh HTML lộn xộn, nếu một element có quá 5 class Tailwind, hãy cân nhắc bóc tách thành component nhỏ hơn hoặc dùng `clsx`/`tailwind-merge`.
