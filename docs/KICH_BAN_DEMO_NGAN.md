# KỊCH BẢN DEMO NGẮN (5 phút / 15 phút)

## Phiên bản 5 phút — Tóm tắt nhanh

1. **Mở** http://localhost:5173 → giới thiệu đề tài (30s)
2. **Đặt vé** `/trips` → chọn ghế → COMMIT qua `sp_DatVe` (1 phút)
3. **Simulation** `/simulation` → 2 tab, chế độ **BI_QUAN**, TX A + TX B (2 phút)
4. **Deadlock** SSMS — chạy Script A + B, show Error 1205 (1 phút)
5. **Kết** — Dashboard log (30s)

---

## Phiên bản 15 phút — Đầy đủ hơn

| Bước | Việc làm | Nói gì |
|------|----------|--------|
| 1 | Trang chủ + kiến trúc | "React gọi API, API gọi SP có Transaction" |
| 2 | Danh sách chuyến + đặt vé | "Dữ liệu từ SQL Server, không hard-code" |
| 3 | Admin CRUD | "Thêm khách / hủy vé — CRUD thật" |
| 4 | KHONG_KHOA | "Minh họa Lost Update" |
| 5 | BI_QUAN | "Pessimistic — transaction chờ nhau" |
| 6 | LE_QUAN | "Optimistic — rowversion conflict" |
| 7 | SSMS Deadlock | "Wait-For Graph, Victim, 1205" |
| 8 | Dashboard | Chỉ số COMMIT/ROLLBACK/Deadlock |

---

## Câu mở đầu gợi ý

> "Thưa thầy/cô, em xin trình bày hệ thống mô phỏng đặt vé xe khách trên SQL Server. Mục tiêu không phải xây website bán vé, mà là tạo các giao dịch đồng thời để minh họa Concurrency Control và Deadlock. Toàn bộ transaction được xử lý trong Stored Procedure với BEGIN, COMMIT, ROLLBACK."

## Câu kết gợi ý

> "Qua demo, em đã so sánh ba chế độ khóa và chứng minh Deadlock Error 1205 trên SSMS. Em xin kết thúc phần trình bày và rất mong nhận góp ý của thầy/cô."