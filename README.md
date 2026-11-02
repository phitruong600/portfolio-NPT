# Portfolio Nguyễn Phi Trường

Multimedia Creative & Creative Technologist. Trang mở đầu bằng một phim 3D (WebGL2) bay dọc chính trang này rồi đáp xuống thẻ tiêu đề.
Trang đang chạy tại https://phitruong600.github.io/portfolio-NPT/

## Các mục trên trang

Giới thiệu · Kinh nghiệm (Unite Group) · Dự án · Nền tảng & Công cụ · Dịch vụ và quy trình · Liên hệ

Mục Dự án chia theo mảng:

- Sản phẩm số & Công cụ: trang tuyển dụng, Unite Staycation, bảng vinh danh, Brand Image Studio
- Thiết kế đồ họa & Truyền thông: Sân Khấu Mới, Leadership Sói Đầu Đàn, linh vật Nai Con, logo NPT
- Sản xuất Video & Nội dung: The Goldview, Fight100, kênh TikTok CEO, AI Agency Studio
- Nhiếp ảnh & Hậu kỳ: Chân dung, Sự kiện cộng đồng, Nội thất & BĐS, Phong cảnh & Đời sống (bấm ảnh để xem cả bộ)

Muốn thêm ảnh hoặc link, gửi cho Claude (hoặc bỏ vào thư mục `media` theo từng mảng) để Claude nén ảnh và cập nhật trang.

## Giao diện

Phong cách nhận diện vàng: nền ngà, khung kính mờ viền vàng, chữ Noto Serif Display cho tiêu đề và Lexend cho nội dung.
Màu chính: Vàng ấm #E5C158, Champagne #F9F6F0, Ngà #FFFBF5, Đồng #8C6A3B.

## Cấu trúc

- `index.html`: nội dung trang
- `assets/site.css`, `assets/site.js`: giao diện, menu, nút Zalo nổi, bộ ảnh của từng mảng, xem ảnh lớn
- `assets/film.js`: phim mở đầu; mọi khung hình được tính từ thời gian (hàm `seek(t)`)
- `assets/film/`: ảnh chụp trang và các lớp nổi mà phim dùng
- `assets/img/`: ảnh đã nén cho web (bản 900 px cho trang, bản 1800 px khi xem lớn)
- `assets/fonts/`: phông chữ có dấu tiếng Việt
- `assets/CV_Nguyen_Phi_Truong.pdf`: CV tải về
- `media/`: kho tài nguyên gốc theo từng mảng (không hiện trên trang)

Sau khi sửa chữ hay ảnh trong `index.html`, chụp lại cho phim để phim khớp với trang:

```
pip install playwright pillow
python -m playwright install chromium
python tools/capture.py
```

Xem một khung hình cố định của phim: thêm `?t=11` vào cuối đường dẫn (ví dụ `index.html?t=2.5`).
