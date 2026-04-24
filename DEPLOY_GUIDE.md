# 🚀 Hướng dẫn Auto Deploy

Dự án đã được cấu hình GitHub Actions để tự động build & deploy khi push code. Chọn một trong 3 tùy chọn dưới đây:

---

## **Option 1: Deploy lên Vercel (Khuyến nghị ⭐)**

### Bước 1: Tạo tài khoản Vercel

- Truy cập https://vercel.com
- Đăng ký bằng GitHub account của bạn

### Bước 2: Tạo Project trên Vercel

- Click "Add New" → "Project"
- Import repository GitHub của bạn
- Vercel sẽ auto-detect Vite project
- Click "Deploy"

### Bước 3: Lấy Vercel Tokens

Chạy trong terminal:

```bash
npm i -g vercel
vercel login
vercel link
```

Hoặc lấy manual tại: https://vercel.com/account/tokens

### Bước 4: Thêm GitHub Secrets

Vào GitHub repo → Settings → Secrets and variables → Actions
Thêm 3 secrets:

- `VERCEL_TOKEN`: Token từ bước 3
- `VERCEL_ORG_ID`: Lấy từ `vercel link` output
- `VERCEL_PROJECT_ID`: Lấy từ `vercel link` output

### Bước 5: Push code

```bash
git add .
git commit -m "Setup auto deploy"
git push origin main
```

✅ **Xong!** Mỗi khi push, GitHub Actions sẽ tự động deploy lên Vercel

---

## **Option 2: Deploy lên Netlify**

### Bước 1: Tạo tài khoản Netlify

- Truy cập https://netlify.com
- Đăng ký bằng GitHub

### Bước 2: Tạo Site

- Click "Add new site" → "Import an existing project"
- Chọn GitHub repository
- Build command: `npm run build`
- Publish directory: `dist`
- Deploy

### Bước 3: Lấy Netlify Token

- Vào User Settings → Applications → Personal access tokens
- Tạo new token, copy lại

### Bước 4: Lấy Site ID

- Vào Site settings → General
- Copy "Site ID"

### Bước 5: Thêm GitHub Secrets

Vào GitHub repo → Settings → Secrets and variables → Actions
Thêm 2 secrets:

- `NETLIFY_AUTH_TOKEN`: Token từ bước 3
- `NETLIFY_SITE_ID`: Site ID từ bước 4

### Bước 6: Push code

```bash
git add .
git commit -m "Setup auto deploy"
git push origin main
```

✅ **Xong!** Deploy tự động lên Netlify

---

## **Option 3: Deploy lên GitHub Pages (Free, nhưng có hạn chế)**

### Bước 1: Enable GitHub Pages

- Vào GitHub repo → Settings → Pages
- Source: "GitHub Actions"

### Bước 2: Push code

```bash
git add .
git commit -m "Setup auto deploy"
git push origin main
```

✅ **Xong!** Site sẽ available tại: `https://[username].github.io/[repo-name]/`

> ⚠️ **Lưu ý**: Cần update `vite.config.ts` với base URL nếu repo không phải root

---

## **Disable Workflows**

Nếu không dùng, xóa file workflow tương ứng:

- Vercel: Xóa `.github/workflows/deploy-vercel.yml`
- Netlify: Xóa `.github/workflows/deploy-netlify.yml`
- GitHub Pages: Xóa `.github/workflows/deploy-github-pages.yml`

---

## **Troubleshooting**

### Build failed?

- Kiểm tra logs tại GitHub repo → Actions
- Chắc chắn `npm run build` chạy ok locally
- Check package.json có tất cả dependencies

### Deploy không push?

- Check secrets được set đúng
- Verify branch name (main hoặc master)

---

**Bạn chọn cách nào? 🎯**
