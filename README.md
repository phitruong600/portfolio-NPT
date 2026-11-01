# Portfolio Nguyễn Phi Trường

Website portfolio, mở đầu bằng một phim 3D (WebGL2) bay dọc chính trang này rồi đáp xuống thẻ tiêu đề.
Trang đang chạy tại https://phitruong600.github.io/portfolio-NPT/

## Các mục trên trang

Giới thiệu · Kinh nghiệm (Unite Group) · Dự án · Khách hàng nói về tôi · Dịch vụ và quy trình · Liên hệ

Mục Dự án chia theo mảng, bấm vào ảnh bìa để xem cả bộ:

- Nhiếp ảnh: Chân dung, Sự kiện cộng đồng, Sự kiện công ty, Nội thất, Sản phẩm, Poster phim & kịch, Phong cảnh & đời sống
- Thiết kế: Poster fanpage Unite Group, Poster kịch & lịch diễn, Poster tuyển dụng, Thiết kế logo

Mảng nào chưa có ảnh sẽ hiện "Đang cập nhật". Muốn thêm ảnh hoặc link "Xem thêm", gửi ảnh và link cho Claude
(hoặc bỏ vào thư mục `_anh-them` trên máy, mỗi mảng một thư mục) để Claude nén ảnh và cập nhật trang.

## Đưa lên mạng

Trên máy có thư mục `C:\AI VIDEO\portfolio-NPT-main`: bấm đúp `DAY-LEN-GITHUB.bat`.
Bản cũ của trang được giữ ở nhánh `ban-cu` trên GitHub.

## Cấu trúc

- `index.html`: nội dung trang
- `assets/site.css`, `assets/site.js`: giao diện, menu, bộ ảnh của từng mảng, xem ảnh lớn
- `assets/film.js`: phim mở đầu; mọi khung hình được tính từ thời gian (hàm `seek(t)`)
- `assets/film/`: ảnh chụp trang và các lớp nổi mà phim dùng
- `assets/img/`: ảnh portfolio đã nén cho web (bản 900 px cho trang, bản 1800 px khi xem lớn)

Sau khi sửa chữ hay ảnh trong `index.html`, chụp lại cho phim để phim khớp với trang:

```
pip install playwright pillow
python -m playwright install chromium
python tools/capture.py
```

Xem một khung hình cố định của phim: thêm `?t=11` vào cuối đường dẫn (ví dụ `index.html?t=2.5`).
