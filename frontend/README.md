# Frontend - BusTicket Pro

React + Vite + TypeScript + Tailwind CSS, tích hợp giao diện Stitch.

## Chạy

```bash
# Terminal 1: Backend (port 3001)
cd ../backend && npm run dev

# Terminal 2: Frontend (port 5173)
cd frontend && npm run dev
```

Mở http://localhost:5173

## Các trang

| Route | Mô tả |
|-------|-------|
| `/` | Trang chủ - giới thiệu đề tài |
| `/trips` | Danh sách chuyến xe |
| `/trips/:id/booking` | Chọn ghế + đặt vé |
| `/tickets` | Vé của tôi |
| `/simulation` | Transaction Simulator |
| `/deadlock` | Deadlock Simulator |
| `/admin` | Quản trị CRUD |

## Cấu trúc

```
src/
  api/          - REST client (proxy → localhost:3001)
  components/   - UI components (shadcn-style)
  pages/        - 7 trang chính
  types/        - TypeScript interfaces
  lib/          - Utilities
```