# Admin Decap CMS — đăng bài

## 1. Cấu hình GitHub trong `admin/config.yml`

Mở file `admin/config.yml` và sửa:

```yaml
repo: TEN_GITHUB_CUA_BAN/TEN_REPO
```

(ví dụ: `minh-duc/minh-duc-main`).

## 2. Đăng nhập GitHub OAuth (bắt buộc để lưu bài)

Decap CMS dùng **GitHub** để commit file `index.md` vào repo.

1. Vào GitHub → **Settings** → **Developer settings** → **OAuth Apps** → **New OAuth App**.
2. **Application name**: tùy ý (vd: Decap CMS Đức Minh).
3. **Homepage URL**: domain site của bạn, ví dụ `https://thumuacapdonggiacao.com`.
4. **Authorization callback URL** (Decap + GitHub backend):  
   `https://api.netlify.com/auth/done`  
   (đây là callback chuẩn của Decap khi dùng backend `github`; không cần host trên Netlify).

5. Tạo xong, lấy **Client ID** và tạo **Client secret** (nếu được hỏi).

Một số hướng dẫn cũ yêu cầu thêm biến môi trường hoặc file `admin/index.html` với snippet `config` — nếu đăng nhập báo lỗi, xem tài liệu mới nhất: [Decap CMS — GitHub backend](https://decapcms.org/docs/github-backend/).

## 3. Mở admin

Trên site đã deploy: `https://DOMAIN_CUA_BAN/admin/`

- **Đăng nhập bằng GitHub** (tài khoản có quyền push vào repo).
- Tạo bài mới trong **Tin tức**, điền **Slug** (vd: `bai-moi-ve-gia-dong`), viết nội dung Markdown, **Publish**.

## 4. Build HTML sau khi có file `.md`

Mỗi bài nằm tại `tin-tuc/<slug>/index.md`. File hiển thị trên web là `index.html` do script tạo:

```bash
npm install
npm run build
```

- Trên máy: chạy lệnh trên rồi commit cả `index.md` và `index.html` (nếu muốn bản local đồng bộ).
- Trên **GitHub Actions** (đã cấu hình trong repo): mỗi lần push, workflow sẽ chạy `npm run build` trước khi deploy — **HTML được tạo trong CI**, không bắt buộc commit `index.html` nếu bạn chỉ dựa vào deploy.

## 5. Thêm link bài mới vào trang danh sách

Trang `tin-tuc/index.html` đang gắn tay các bài. Khi có bài mới, thêm một mục (tiêu đề + link) vào danh sách tin và (tuỳ chọn) cập nhật `sitemap.xml`.

## 6. Ảnh trong bài

- Ảnh upload qua CMS sẽ vào `img/uploads/`.
- Trong Markdown: `![mô tả](/img/uploads/ten-file.webp)`.
