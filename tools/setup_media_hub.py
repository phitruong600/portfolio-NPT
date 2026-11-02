# -*- coding: utf-8 -*-
"""
Script tạo cấu trúc thư mục media hoàn chỉnh, chuyên nghiệp cho Portfolio Nguyễn Phi Trường.
Bao gồm:
- Toàn bộ thư mục phân loại theo từng nhóm dự án (Web, Graphic Design, Video, Photo, Profile, Documents)
- File hướng dẫn README chi tiết
- File bảng tổng hợp link toàn bộ dự án
- File THONG_TIN_VA_LINK.txt mẫu và chi tiết cho từng dự án
- Tự động sao chép các tài nguyên hiện có (CV, ảnh chân dung, logo) vào đúng vị trí
"""

import os
import shutil

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MEDIA_DIR = os.path.join(ROOT_DIR, 'media')

# Cấu trúc thư mục và nội dung thông tin
STRUCTURE = {
    "01_web_and_digital_products": {
        "title": "01. Sản Phẩm Số & Lập Trình Web (Web & Digital Products)",
        "desc": "Chứa ảnh chụp màn hình giao diện (desktop/mobile/tablet), file demo và link web của các sản phẩm số.",
        "projects": [
            {
                "folder": "01_unite_recruitment_website",
                "name": "Unite Group Recruitment Website",
                "role": "Tham gia xây dựng website tuyển dụng & tổ chức nội dung, form đăng ký ứng tuyển",
                "tech": "HTML5, CSS3, JavaScript, React, GitHub Pages",
                "web_link": "https://unitemedia2010-oss.github.io/JD_UNITEGROUP/",
                "git_link": "https://github.com/unitemedia2010-oss/JD_UNITEGROUP",
                "video_link": "",
                "drive_link": "",
                "note": "Website tuyển dụng chính thức của Unite Group."
            },
            {
                "folder": "02_unite_staycation_website",
                "name": "Unite Staycation Website & Dashboard",
                "role": "Tham gia xây dựng website phục vụ quy trình kinh doanh và dashboard quản lý",
                "tech": "Web Development, Business Solutions, Dashboard",
                "web_link": "https://unitestaycation.com.vn/dashboard.html",
                "git_link": "",
                "video_link": "",
                "drive_link": "",
                "note": "Hệ thống quản lý và giới thiệu căn hộ Staycation."
            },
            {
                "folder": "03_unite_group_recognition",
                "name": "Unite Group Recognition Website (Vinh Danh)",
                "role": "Tham gia xây dựng giao diện hiển thị vinh danh, hiệu ứng motion tương tác",
                "tech": "Vue / React, CSS Motion, Responsive",
                "web_link": "https://unitemedia2010-oss.github.io/unite-vinh-danh/#/share",
                "git_link": "https://github.com/unitemedia2010-oss/unite-vinh-danh",
                "video_link": "",
                "drive_link": "",
                "note": "Website tôn vinh và trao giải thưởng nội bộ."
            },
            {
                "folder": "04_batch_logo_avatar_framing",
                "name": "Batch Logo & Avatar Framing Tool (GanLoGo)",
                "role": "Tham gia xây dựng công cụ đóng khung avatar & gắn watermark hàng loạt",
                "tech": "JavaScript Canvas, Client-side Processing, GitHub Pages",
                "web_link": "https://nitegroup-design.github.io/GanLoGo/",
                "git_link": "https://github.com/nitegroup-design/GanLoGo",
                "video_link": "",
                "drive_link": "",
                "note": "Tool xử lý ảnh nhân sự tự động tiện lợi."
            },
            {
                "folder": "05_ai_agency_studio",
                "name": "AI Agency Studio (Workflow Automation)",
                "role": "Nghiên cứu kiến trúc đa agent tự động hóa sản xuất nội dung đa kênh",
                "tech": "Python, Multi-Agent, LLM API, Automation Workflows",
                "web_link": "",
                "git_link": "",
                "video_link": "",
                "drive_link": "",
                "note": "Dự án nghiên cứu thử nghiệm (In Progress - Đang phát triển)."
            },
            {
                "folder": "06_personal_portfolio_site",
                "name": "Personal Portfolio Website (Nguyễn Phi Trường)",
                "role": "Thiết kế & Lập trình toàn diện Portfolio cá nhân với Film WebGL2 3D",
                "tech": "HTML5, CSS Modern Fluid, WebGL2 3D, Responsive, GitHub Pages",
                "web_link": "https://phitruong600.github.io/portfolio-NPT/",
                "git_link": "https://github.com/phitruong600/portfolio-NPT",
                "video_link": "",
                "drive_link": "",
                "note": "Portfolio chính thức đang hoạt động."
            }
        ]
    },
    "02_graphic_design_and_branding": {
        "title": "02. Thiết Kế Đồ Họa & Nhận Diện Thương Hiệu (Graphic Design & Branding)",
        "desc": "Chứa file ảnh thiết kế (poster, banner, standee, key visual, logo, mascot) và đường link source thiết kế (Canva/Figma/Drive).",
        "projects": [
            {
                "folder": "01_san_khau_moi_theatre_poster",
                "name": "Poster Kịch Sân Khấu Mới (Trần Hữu Trang)",
                "role": "Thiết kế poster vở diễn kịch, lịch diễn 4 suất và ấn phẩm quà tặng 20/10",
                "tech": "Photoshop, Typography, Key Visual",
                "web_link": "",
                "git_link": "",
                "video_link": "",
                "drive_link": "",
                "note": "Biểu diễn tại Nhà hát Trần Hữu Trang tháng 10/2026."
            },
            {
                "folder": "02_leadership_soi_dau_dan_banner",
                "name": "Leadership — Sói Đầu Đàn (Event Visual)",
                "role": "Thiết kế poster diễn giả và key visual chương trình đào tạo kỹ năng lãnh đạo",
                "tech": "Photoshop, Typography Bold, Tone Dark-Orange",
                "web_link": "",
                "git_link": "",
                "video_link": "",
                "drive_link": "",
                "note": "Sự kiện đào tạo nội bộ Unite Group tháng 10/2026."
            },
            {
                "folder": "03_nai_con_mascot",
                "name": "Mascot Nai Con — Unite Group",
                "role": "Sáng tạo nhân vật hoạt hình linh vật phục vụ bài đăng mạng xã hội",
                "tech": "Character Design, Digital Art, AI Image Tools",
                "web_link": "https://www.facebook.com/share/1G6RXWeVKw/",
                "git_link": "",
                "video_link": "",
                "drive_link": "",
                "note": "Hình ảnh linh vật thương hiệu trên Fanpage Unite Group."
            },
            {
                "folder": "04_npt_personal_logo_brand",
                "name": "NPT Personal Brand & Logo",
                "role": "Thiết kế biểu tượng nhận diện cá nhân NPT (kết hợp ruy băng vàng)",
                "tech": "Illustrator, Photoshop, Vector, Brand Identity",
                "web_link": "",
                "git_link": "",
                "video_link": "",
                "drive_link": "",
                "note": "Hệ thống logo và nhận diện thương hiệu cá nhân."
            },
            {
                "folder": "05_unite_fanpage_posters",
                "name": "Unite Group Fanpage & Social Media Content",
                "role": "Thiết kế ấn phẩm truyền thông, bài đăng mạng xã hội hàng tuần",
                "tech": "Canva, Photoshop, Social Media Layouts",
                "web_link": "",
                "git_link": "",
                "video_link": "",
                "drive_link": "",
                "note": "Ấn phẩm truyền thông thường kỳ của Unite Group."
            },
            {
                "folder": "06_tuyen_dung_posters",
                "name": "Tuyển Dụng & Đào Tạo Posters",
                "role": "Thiết kế bộ poster truyền thông tuyển dụng nhân sự",
                "tech": "Graphic Design, Layout, Typography",
                "web_link": "",
                "git_link": "",
                "video_link": "",
                "drive_link": "",
                "note": "Poster tuyển dụng các vị trí tại Unite Group."
            }
        ]
    },
    "03_video_and_motion": {
        "title": "03. Sản Xuất Video & Chuyển Động (Video Production & Motion)",
        "desc": "Chứa video clip, video ngắn (Reels/TikTok/Shorts), thumbnail và các link video online.",
        "projects": [
            {
                "folder": "01_the_goldview_real_estate_video",
                "name": "The Goldview — Video Bất Động Sản (Quận 4)",
                "role": "Xây dựng kịch bản, quay dựng video giới thiệu căn hộ 2 phòng ngủ cao cấp",
                "tech": "CapCut, Gimbal, Premiere, Color Grading",
                "web_link": "",
                "git_link": "",
                "video_link": "",
                "drive_link": "",
                "note": "Video giới thiệu và trải nghiệm căn hộ thực tế The Goldview."
            },
            {
                "folder": "02_fight100_boxing_vlog",
                "name": "Fight100 Boxing Experience — Lifestyle Vlog",
                "role": "Lên ý tưởng, kịch bản, quay dựng trải nghiệm buổi tập boxing tại CLB Fight100",
                "tech": "Action Cam / Mobile Video, CapCut, Voiceover, Sound Design",
                "web_link": "",
                "git_link": "",
                "video_link": "",
                "drive_link": "",
                "note": "Vlog trải nghiệm phong cách sống và tập luyện thể thao."
            },
            {
                "folder": "03_ceo_tiktok_channel",
                "name": "Kênh TikTok CEO — Unite Group",
                "role": "Sản xuất nội dung, quay dựng và vận hành kênh TikTok định vị thương hiệu CEO",
                "tech": "Short-form Video, Hook Scripting, TikTok Trends",
                "web_link": "https://www.tiktok.com/@naoondoitennha",
                "git_link": "",
                "video_link": "https://www.tiktok.com/@naoondoitennha",
                "drive_link": "",
                "note": "Kênh TikTok xây dựng nhân hiệu và kết nối kinh doanh."
            },
            {
                "folder": "04_ai_motion_and_reels",
                "name": "AI Motion & Thử Nghiệm Video Ngắn Khác",
                "role": "Thử nghiệm ứng dụng AI video, hiệu ứng motion poster và intro chuyển động",
                "tech": "AI Video Tools, CapCut, Motion Loops",
                "web_link": "",
                "git_link": "",
                "video_link": "",
                "drive_link": "",
                "note": "Các video hiệu ứng AI và animation chuyển động."
            }
        ]
    },
    "04_photography_and_retouching": {
        "title": "04. Nhiếp Ảnh & Retouching (Photography & Photo Editing)",
        "desc": "Chứa các bộ ảnh chụp chuyên nghiệp theo từng thể loại, ảnh trước/sau hậu kỳ, link album Drive/Flickr.",
        "projects": [
            {
                "folder": "01_chan_dung_art_portrait",
                "name": "Nhiếp Ảnh Chân Dung Nghệ Thuật (Art Portrait)",
                "role": "Nhiếp ảnh & Color grading, Retouch da tự nhiên",
                "tech": "Sony / Canon, 85mm / 50mm, Lightroom, Photoshop Retouch",
                "web_link": "",
                "git_link": "",
                "video_link": "",
                "drive_link": "",
                "note": "Bộ sưu tập ảnh chân dung cá nhân, nghệ sĩ, concept nghệ thuật."
            },
            {
                "folder": "02_su_kien_cong_dong_community",
                "name": "Sự Kiện Cộng Đồng & Xã Hội (Community Events)",
                "role": "Chụp phóng sự sự kiện, ghi lại khoảnh khắc chân thực",
                "tech": "Event Photography, Flash On-camera, Rapid Capture",
                "web_link": "",
                "git_link": "",
                "video_link": "",
                "drive_link": "",
                "note": "Các chương trình thiện nguyện, ngày hội, hoạt động cộng đồng."
            },
            {
                "folder": "03_su_kien_doanh_nghiep_corporate",
                "name": "Sự Kiện Doanh Nghiệp & Nội Bộ (Corporate Events)",
                "role": "Chụp ảnh hội thảo, lễ ký kết, team building, Year End Party",
                "tech": "Corporate Photography, Event Coverage",
                "web_link": "",
                "git_link": "",
                "video_link": "",
                "drive_link": "",
                "note": "Hoạt động truyền thông nội bộ và sự kiện doanh nghiệp."
            },
            {
                "folder": "04_noi_that_kien_truc_interior",
                "name": "Nhiếp Ảnh Nội Thất & Kiến Trúc (Interior & Architecture)",
                "role": "Cân chỉnh góc rộng, ánh sáng không gian, đường gióng thẳng kiến trúc",
                "tech": "Wide Lens, HDR / Exposure Bracketing, Lightroom Perspective Correction",
                "web_link": "",
                "git_link": "",
                "video_link": "",
                "drive_link": "",
                "note": "Căn hộ cao cấp, villa, studio, văn phòng và quán cafe."
            },
            {
                "folder": "05_san_pham_commercial_products",
                "name": "Chụp Ảnh Sản Phẩm Thương Mại (Commercial Packshot)",
                "role": "Setup ánh sáng studio, chụp packshot sản phẩm sắc nét",
                "tech": "Studio Lighting, Macro, Retouch chi tiết sản phẩm",
                "web_link": "",
                "git_link": "",
                "video_link": "",
                "drive_link": "",
                "note": "Sản phẩm thời trang, phụ kiện, đồ uống, mỹ phẩm."
            },
            {
                "folder": "06_phong_canh_doi_song_lifestyle",
                "name": "Phong Cảnh & Đời Sống (Landscape & Street Lifestyle)",
                "role": "Nhiếp ảnh đường phố, du lịch, bắt trọn khoảnh khắc đời thường",
                "tech": "Street Photography, Natural Light, Color Grading",
                "web_link": "",
                "git_link": "",
                "video_link": "",
                "drive_link": "",
                "note": "Ảnh du lịch, cảnh quan đô thị Sài Gòn, vẻ đẹp đời sống."
            }
        ]
    },
    "05_portrait_and_branding_assets": {
        "title": "05. Ảnh Chân Dung Profile & Nhận Diện Cá Nhân (Personal Branding Assets)",
        "desc": "Chứa ảnh chân dung chính thức của Nguyễn Phi Trường, ảnh đại diện avatar mạng xã hội, banner cover.",
        "projects": [
            {
                "folder": "01_chan_dung_chinh_thuc_official",
                "name": "Ảnh Chân Dung Chính Thức (Official Portrait)",
                "role": "Ảnh profile diện trang phục lịch sự, chuyên nghiệp dùng cho website & CV",
                "tech": "High-Res Photography, Professional Retouch, WebP & JPG",
                "web_link": "",
                "git_link": "",
                "video_link": "",
                "drive_link": "",
                "note": "Đã có sẵn file portrait-truong-1800.webp đang dùng trên web."
            },
            {
                "folder": "02_avatar_social_media",
                "name": "Ảnh Đại Diện Mạng Xã Hội (Avatar Social)",
                "role": "Ảnh đại diện vuông/tròn cho Facebook, LinkedIn, GitHub, TikTok, Zalo",
                "tech": "Avatar 1:1, Clean Background",
                "web_link": "",
                "git_link": "",
                "video_link": "",
                "drive_link": "",
                "note": "Kích thước khuyên dùng: 800x800 px hoặc 1080x1080 px."
            },
            {
                "folder": "03_banner_cover_social",
                "name": "Ảnh Bìa Cover Mạng Xã Hội (Social Banners)",
                "role": "Ảnh bìa Facebook cá nhân, Fanpage, LinkedIn background, GitHub header",
                "tech": "Banner 16:9, Facebook Cover (820x312), LinkedIn Banner (1584x396)",
                "web_link": "",
                "git_link": "",
                "video_link": "",
                "drive_link": "",
                "note": "Ảnh bìa đồng bộ thương hiệu cá nhân."
            }
        ]
    },
    "06_documents_and_cv": {
        "title": "06. Hồ Sơ & Tài Liệu (CV & Documents)",
        "desc": "Chứa các phiên bản CV (PDF, Word), hồ sơ năng lực, chứng chỉ bằng cấp, tài liệu dự án.",
        "projects": [
            {
                "folder": "01_cv_pdf",
                "name": "CV Bản PDF Chính Thức (Official PDF)",
                "role": "Bản CV PDF 2 trang chuẩn để gửi khách hàng và nhà tuyển dụng",
                "tech": "PDF High Quality Print & Screen",
                "web_link": "",
                "git_link": "",
                "video_link": "",
                "drive_link": "",
                "note": "Đã có sẵn file CV_Nguyen_Phi_Truong.pdf."
            },
            {
                "folder": "02_cv_word_source",
                "name": "CV Bản Word Nguồn (Editable DOCX)",
                "role": "Bản Word để dễ dàng chỉnh sửa, bổ sung thông tin khi cần",
                "tech": "Microsoft Word DOCX",
                "web_link": "",
                "git_link": "",
                "video_link": "",
                "drive_link": "",
                "note": "Đã có sẵn file CV_Nguyen_Phi_Truong_2_Page.docx."
            },
            {
                "folder": "03_bang_cap_chung_chi_certificates",
                "name": "Bằng Cấp & Chứng Chỉ (Certificates)",
                "role": "Bằng cấp, chứng chỉ học tập tại IUH, chứng chỉ khóa học, giải thưởng",
                "tech": "Scan JPG / PDF",
                "web_link": "",
                "git_link": "",
                "video_link": "",
                "drive_link": "",
                "note": "Lưu các chứng chỉ chuyên môn, thiết kế, lập trình nếu có."
            }
        ]
    }
}

def create_structure():
    print(f"Creating media root at: {MEDIA_DIR}")
    os.makedirs(MEDIA_DIR, exist_ok=True)
    
    # 1. Tạo các thư mục con và file chi tiết
    all_projects_table = []
    
    for cat_key, cat_data in STRUCTURE.items():
        cat_path = os.path.join(MEDIA_DIR, cat_key)
        os.makedirs(cat_path, exist_ok=True)
        
        # README cho từng chuyên mục
        cat_readme = f"""# {cat_data['title']}

{cat_data['desc']}

## Danh sách các thư mục dự án bên trong:
"""
        for p in cat_data['projects']:
            p_path = os.path.join(cat_path, p['folder'])
            os.makedirs(p_path, exist_ok=True)
            
            # Tạo file .gitkeep để giữ thư mục trong git
            with open(os.path.join(p_path, '.gitkeep'), 'w', encoding='utf-8') as f:
                f.write('')
                
            # Nội dung file THONG_TIN_VA_LINK.txt
            p_info = f"""================================================================================
DỰ ÁN: {p['name']}
Phân loại: {cat_data['title']}
================================================================================

1. THÔNG TIN CHUNG:
- Tên hiển thị: {p['name']}
- Vai trò thực hiện: {p['role']}
- Công cụ / Công nghệ: {p['tech']}
- Ghi chú: {p['note']}

2. CÁC ĐƯỜNG LINK LIÊN KẾT (Điền hoặc cập nhật link vào đây):
- Link Website / Demo Trực Tiếp : {p['web_link']}
- Link Mã Nguồn GitHub        : {p['git_link']}
- Link Video (TikTok/YouTube)  : {p['video_link']}
- Link Thiết Kế (Figma/Canva)  : 
- Link Google Drive / Cloud    : {p['drive_link']}
- Link Bài Viết / Mạng Xã Hội  : 

3. HƯỚNG DẪN BỎ ẢNH & VIDEO VÀO THƯ MỤC NÀY:
- Bỏ từ 3 đến 8 hình ảnh đẹp nhất của dự án vào thư mục này.
- Ảnh bìa đại diện nên đặt tên là: 01_cover.jpg (hoặc 01_cover.png, 01_cover.webp)
- Các ảnh tiếp theo đặt tên là: 02.jpg, 03.jpg, 04.jpg...
- Nếu có file video ngắn (dưới 50MB): có thể bỏ file .mp4 vào đây hoặc dán link online ở mục số 2.
- Quy cách ảnh gợi ý:
  + Giao diện Web / Desktop: tỉ lệ 16:9 (khoảng 1920x1080 px).
  + Thiết kế poster / banner: tỉ lệ gốc chất lượng cao.
  + Ảnh chân dung / sự kiện: chiều rộng tối thiểu 1600px.

4. GHI CHÚ BỔ SUNG CỦA BẠN:
(Bạn có thể viết thêm bất kỳ lưu ý hoặc yêu cầu hiển thị nào vào đây)
"""
            with open(os.path.join(p_path, 'THONG_TIN_VA_LINK.txt'), 'w', encoding='utf-8') as f:
                f.write(p_info)
                
            cat_readme += f"- `/{p['folder']}/`: {p['name']}\n"
            
            all_projects_table.append({
                "category": cat_data['title'].split('.')[1].split('(')[0].strip(),
                "name": p['name'],
                "folder": f"media/{cat_key}/{p['folder']}",
                "web": p['web_link'] if p['web_link'] else "---",
                "video": p['video_link'] if p['video_link'] else "---",
                "role": p['role']
            })
            
        with open(os.path.join(cat_path, 'README.md'), 'w', encoding='utf-8') as f:
            f.write(cat_readme)

    # 2. Tạo README.md gốc trong media/
    root_readme = """# 📁 THƯ MỤC TỔNG HỢP MEDIA & TÀI NGUYÊN — PORTFOLIO NGUYỄN PHI TRƯỜNG

Chào bạn Trường! Đây là thư mục trung tâm được thiết kế để bạn **tập hợp toàn bộ tài nguyên** (Hình ảnh, Video, Bản vẽ thiết kế, Đường link web, Hồ sơ CV) một cách gọn gàng, có hệ thống và chuyên nghiệp nhất.

---

## 🗂️ CẤU TRÚC THƯ MỤC CHI TIẾT

```text
media/
├── README.md                               <-- Hướng dẫn này
├── BANG_TONG_HOP_TOAN_BO_DU_AN.md          <-- Bảng tra cứu tất cả link web, demo, video
├── DANH_SACH_LINK_NHANH.txt                <-- File text mở nhanh copy link
│
├── 01_web_and_digital_products/            <-- Ảnh chụp web, link demo, mã nguồn
│   ├── 01_unite_recruitment_website/
│   ├── 02_unite_staycation_website/
│   ├── 03_unite_group_recognition/
│   ├── 04_batch_logo_avatar_framing/
│   ├── 05_ai_agency_studio/
│   └── 06_personal_portfolio_site/
│
├── 02_graphic_design_and_branding/         <-- Poster kịch, banner, mascot, logo cá nhân
│   ├── 01_san_khau_moi_theatre_poster/
│   ├── 02_leadership_soi_dau_dan_banner/
│   ├── 03_nai_con_mascot/
│   ├── 04_npt_personal_logo_brand/
│   ├── 05_unite_fanpage_posters/
│   └── 06_tuyen_dung_posters/
│
├── 03_video_and_motion/                    <-- Video bđs, boxing vlog, TikTok CEO
│   ├── 01_the_goldview_real_estate_video/
│   ├── 02_fight100_boxing_vlog/
│   ├── 03_ceo_tiktok_channel/
│   └── 04_ai_motion_and_reels/
│
├── 04_photography_and_retouching/          <-- Bộ sưu tập ảnh chụp 6 thể loại
│   ├── 01_chan_dung_art_portrait/
│   ├── 02_su_kien_cong_dong_community/
│   ├── 03_su_kien_doanh_nghiep_corporate/
│   ├── 04_noi_that_kien_truc_interior/
│   ├── 05_san_pham_commercial_products/
│   └── 06_phong_canh_doi_song_lifestyle/
│
├── 05_portrait_and_branding_assets/        <-- Ảnh chân dung profile, avatar, cover
│   ├── 01_chan_dung_chinh_thuc_official/
│   ├── 02_avatar_social_media/
│   └── 03_banner_cover_social/
│
└── 06_documents_and_cv/                    <-- File CV bản PDF, Word và Bằng cấp
    ├── 01_cv_pdf/
    ├── 02_cv_word_source/
    └── 03_bang_cap_chung_chi_certificates/
```

---

## 🚀 CÁCH SỬ DỤNG RẤT ĐƠN GIẢN

1. **Thêm hình ảnh vào từng dự án:**
   - Kéo thả file ảnh (JPG, PNG, WebP) vào đúng thư mục của dự án đó.
   - Ảnh bìa chính nên đặt tên là: `01_cover.jpg` (hoặc `01_cover.png`).
   - Các ảnh minh họa tiếp theo đặt tên là: `02.jpg`, `03.jpg`, `04.jpg`...

2. **Cập nhật link web & link video:**
   - Trong mỗi thư mục con đều có sẵn 1 file `THONG_TIN_VA_LINK.txt`.
   - Bạn chỉ cần mở file đó lên và dán thêm link Google Drive, link TikTok, YouTube, Figma, Canva nếu có.
   - Hoặc bạn có thể cập nhật trực tiếp tại file `BANG_TONG_HOP_TOAN_BO_DU_AN.md`.

3. **Đưa ảnh/video mới lên website:**
   - Sau khi bạn đã bỏ ảnh vào thư mục xong, bạn chỉ cần nhắn:
     > *"Mình đã bỏ ảnh mới vào thư mục media rồi, hãy cập nhật lên web cho mình nhé"*
   - AI sẽ tự động tối ưu hóa, nén ảnh sang WebP siêu nhẹ, cập nhật vào file `index.html`, render lại hiệu ứng 3D và đẩy lên GitHub Pages cho bạn!

---

## 📌 LƯU Ý VỀ DUNG LƯỢNG KHI ĐẨY LÊN GIT
- Thư mục này đã được cài đặt tự động để lưu trữ hình ảnh, link, tài liệu văn bản.
- Đối với các file video quá nặng (> 100MB) hoặc file thiết kế gốc nặng (PSD, AI, ZIP): Khuyên bạn nên tải lên Google Drive / YouTube / TikTok rồi dán link vào file `THONG_TIN_VA_LINK.txt` để kho lưu trữ Git luôn nhanh và nhẹ.
"""
    with open(os.path.join(MEDIA_DIR, 'README.md'), 'w', encoding='utf-8') as f:
        f.write(root_readme)

    # 3. Tạo file BANG_TONG_HOP_TOAN_BO_DU_AN.md
    bang_tong_hop = """# 📋 BẢNG TỔNG HỢP TOÀN BỘ DỰ ÁN & ĐƯỜNG LINK — NGUYỄN PHI TRƯỜNG

Bảng này liệt kê đầy đủ tất cả các sản phẩm số, thiết kế đồ họa, video, bộ ảnh nhiếp ảnh và tài liệu cá nhân. Bạn có thể tra cứu và dán link nhanh tại đây:

| STT | Phân Loại | Tên Dự Án | Thư Mục Trong Media | Link Trực Tiếp / Demo | Link Video / Social |
|:---:|:---|:---|:---|:---|:---|
"""
    for idx, item in enumerate(all_projects_table, 1):
        bang_tong_hop += f"| {idx} | {item['category']} | **{item['name']}** | `{item['folder']}` | {item['web']} | {item['video']} |\n"

    bang_tong_hop += """
---

## 🔗 LIÊN HỆ & CÁC KÊNH MẠNG XÃ HỘI CHÍNH THỨC
- **Website Portfolio:** https://phitruong600.github.io/portfolio-NPT/
- **GitHub:** https://github.com/phitruong600/portfolio-NPT
- **Email:** nguyenphitruong1807@gmail.com
- **Số điện thoại / Zalo:** 0782 800 789 (hoặc 0938 835 498)
- **TikTok:** https://www.tiktok.com/@naoondoitennha
- **Facebook cá nhân:** https://www.facebook.com/share/1bp5kH6R7M/
- **Instagram:** @metaal526
"""
    with open(os.path.join(MEDIA_DIR, 'BANG_TONG_HOP_TOAN_BO_DU_AN.md'), 'w', encoding='utf-8') as f:
        f.write(bang_tong_hop)

    # 4. Tạo DANH_SACH_LINK_NHANH.txt
    danh_sach_nhanh = """DANH SACH LINK TRUY CAP NHANH - NGUYEN PHI TRUONG
==================================================

1. WEBSITE PORTFOLIO CHINH THUC:
   https://phitruong600.github.io/portfolio-NPT/

2. SAN PHAM WEB & DIGITAL PRODUCTS:
   - Unite Recruitment: https://unitemedia2010-oss.github.io/JD_UNITEGROUP/
   - Unite Staycation Dashboard: https://unitestaycation.com.vn/dashboard.html
   - Unite Vinh Danh: https://unitemedia2010-oss.github.io/unite-vinh-danh/#/share
   - Tool GanLoGo Hang Loat: https://nitegroup-design.github.io/GanLoGo/

3. THIET KE & VIDEO:
   - Mascot Nai Con: https://www.facebook.com/share/1G6RXWeVKw/
   - Kenh TikTok CEO: https://www.tiktok.com/@naoondoitennha

4. SOCIAL MEDIA & LIEN HE:
   - Facebook: https://www.facebook.com/share/1bp5kH6R7M/
   - Email: nguyenphitruong1807@gmail.com
   - Zalo / Phone: 0782 800 789
==================================================
"""
    with open(os.path.join(MEDIA_DIR, 'DANH_SACH_LINK_NHANH.txt'), 'w', encoding='utf-8') as f:
        f.write(danh_sach_nhanh)

    # 5. Sao chép các tài nguyên có sẵn vào các thư mục tương ứng
    # - Portrait
    src_portrait = os.path.join(ROOT_DIR, 'assets', 'img', 'portrait-truong-1800.webp')
    dst_portrait = os.path.join(MEDIA_DIR, '05_portrait_and_branding_assets', '01_chan_dung_chinh_thuc_official', 'portrait-truong-1800.webp')
    if os.path.exists(src_portrait):
        shutil.copy2(src_portrait, dst_portrait)
        print("Copied official portrait to media/05_portrait_and_branding_assets")

    # - Logos
    src_logo = os.path.join(ROOT_DIR, 'assets', 'img', 'logo-mark.png')
    dst_logo = os.path.join(MEDIA_DIR, '02_graphic_design_and_branding', '04_npt_personal_logo_brand', 'logo-mark.png')
    if os.path.exists(src_logo):
        shutil.copy2(src_logo, dst_logo)
        
    src_logo_webp = os.path.join(ROOT_DIR, 'assets', 'img', 'logo-npt-1800.webp')
    dst_logo_webp = os.path.join(MEDIA_DIR, '02_graphic_design_and_branding', '04_npt_personal_logo_brand', 'logo-npt-1800.webp')
    if os.path.exists(src_logo_webp):
        shutil.copy2(src_logo_webp, dst_logo_webp)
        print("Copied logos to media/02_graphic_design_and_branding/04_npt_personal_logo_brand")

    # - CV files
    src_cv_pdf = os.path.join(ROOT_DIR, 'assets', 'CV_Nguyen_Phi_Truong.pdf')
    dst_cv_pdf = os.path.join(MEDIA_DIR, '06_documents_and_cv', '01_cv_pdf', 'CV_Nguyen_Phi_Truong.pdf')
    if os.path.exists(src_cv_pdf):
        shutil.copy2(src_cv_pdf, dst_cv_pdf)
        print("Copied CV PDF to media/06_documents_and_cv/01_cv_pdf")

    src_cv_docx = os.path.join(ROOT_DIR, '_unpacked_pkg', 'CV_Nguyen_Phi_Truong_2_Page.docx')
    dst_cv_docx = os.path.join(MEDIA_DIR, '06_documents_and_cv', '02_cv_word_source', 'CV_Nguyen_Phi_Truong_2_Page.docx')
    if os.path.exists(src_cv_docx):
        shutil.copy2(src_cv_docx, dst_cv_docx)
        print("Copied CV DOCX to media/06_documents_and_cv/02_cv_word_source")

    print("Media hub structure successfully created!")

if __name__ == '__main__':
    create_structure()
