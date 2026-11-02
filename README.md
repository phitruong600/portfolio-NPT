# Portfolio Nguyễn Phi Trường

Multimedia Creative & Creative Technologist. Trang mở đầu bằng một phim 3D (WebGL2) bay dọc chính trang này rồi đáp xuống thẻ tiêu đề.
Trang đang chạy tại https://phitruong600.github.io/portfolio-NPT/

## Các mục trên trang

Giới thiệu (ảnh chân dung, tên, vài dòng về mình) · Năng lực · Dự án · Hậu kỳ (khung hình vàng và bảng màu) · Kinh nghiệm · Công cụ · Dịch vụ và quy trình · Liên hệ

Phim mở đầu chạy xong sẽ tự cuộn xuống đầu trang; bấm "Bỏ qua" để xuống ngay.
Tên các app và công cụ hiện bằng icon nét vàng; rê chuột vào icon để thấy tên.

Mục Dự án chia bốn thẻ (bấm ảnh bìa để xem trọn bộ ảnh hoặc video):

- Sản phẩm số & Công cụ: trang tuyển dụng, Unite Staycation, bảng vinh danh, GanLoGo, AI Agency Studio, chính trang portfolio này (kèm link trải nghiệm và mã nguồn)
- Thiết kế đồ họa & Truyền thông: Sân Khấu Mới (Nhà hát Trần Hữu Trang), Leadership Sói Đầu Đàn, linh vật Nai Con, ấn phẩm Fanpage Unite Group, biểu trưng PT
- Sản xuất Video & Nội dung: vlog Fight100, kênh TikTok CEO, AI Motion TT Genesis
- Nhiếp ảnh & Hậu kỳ: Chân dung, Sự kiện cộng đồng, Sự kiện doanh nghiệp, Nội thất & Kiến trúc, Sản phẩm thương mại, Phong cảnh & Đời sống

Ảnh, video và link trên trang lấy từ thư mục `media`. Muốn thêm hoặc đổi, bỏ file vào đúng mảng trong `media` (và điền link vào `THONG_TIN_VA_LINK.txt`) rồi nhắn Claude để nén và cập nhật trang.

## Giao diện

Phong cách nhận diện vàng: nền ngà, khung kính mờ viền vàng, chữ Noto Serif Display cho tiêu đề và Lexend cho nội dung.
Màu chính: Vàng ấm #E5C158, Champagne #F9F6F0, Ngà #FFFBF5, Đồng #8C6A3B.

## Cấu trúc

- `index.html`: nội dung trang
- `assets/site.css`, `assets/site.js`: giao diện, menu, nút Zalo nổi, thẻ chia nhóm dự án, bộ ảnh và video của từng dự án, xem ảnh lớn
- bộ icon nằm ngay đầu `index.html` (khối `<svg class="sprite">`)
- `assets/film.js`: phim mở đầu; mọi khung hình được tính từ thời gian (hàm `seek(t)`)
- `assets/film/`: ảnh chụp trang và các lớp nổi mà phim dùng
- `assets/img/`: ảnh đã nén cho web (bản 900 px cho trang, bản 1600–1800 px khi xem lớn), logo PT, ảnh chia sẻ mạng xã hội `og-cover.jpg`
- `assets/video/`: video dọc nén cho web (Sói Đầu Đàn, Marketing Thực Chiến, TT Genesis)
- `assets/fonts/`: phông chữ có dấu tiếng Việt
- `assets/CV_Nguyen_Phi_Truong.pdf`: CV tải về (bản một trang)
- `media/`: kho tài nguyên gốc theo từng mảng (không hiện trên trang)

Sau khi sửa chữ hay ảnh trong `index.html`, chụp lại cho phim để phim khớp với trang:

```
pip install playwright pillow
python -m playwright install chromium
python tools/capture.py
```

Xem một khung hình cố định của phim: thêm `?t=11` vào cuối đường dẫn (ví dụ `index.html?t=2.5`).
