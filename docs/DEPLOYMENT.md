# Deployment Guide: Vercel Monorepo

This guide explains how to deploy the decoupled Comedy Connect architecture to **Vercel** by connecting your GitHub repository.

## 🏗️ Architecture Overview
Vercel allows you to deploy multiple projects from a single GitHub repository. We will create **two** separate Vercel projects:
1. `comedy-connect-api` (The Backend)
2. `comedy-connect-ui` (The Frontend)

---

## 🚀 Step 1: Connecting GitHub to Vercel

1. Log in to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **"Add New..."** > **"Project"**.
3. Select your **Comedy Connect** repository from the GitHub import list.
4. Click **"Import"**.

---

## 📂 Step 2: Configuring the Backend (API)

Repeat the import process specifically for the Backend:

1. **Project Name**: `comedy-connect-api`.
2. **Framework Preset**: Next.js.
3. **Root Directory**: Select `packages/backend`.
4. **Build & Development Settings**: 
   - Build Command: `npx prisma generate && next build`
   - Install Command: `npm install`
5. **Environment Variables**: Add all variables from `packages/backend/.env.example`.
   - `DATABASE_URL`: Your production PG URL.
   - `NEXTAUTH_URL`: `https://your-api-url.vercel.app`
   - `NEXTAUTH_SECRET`: A long random string.
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.
   - `ADMIN_EMAIL`: The email address allowed to access the admin panel.
   - `ALLOWED_ORIGIN`: `https://your-frontend-url.vercel.app` (The Frontend URL).
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Required for image uploads.
6. Click **"Deploy"**.

---

## 🎨 Step 3: Configuring the Frontend (UI)

Repeat the import process for the Frontend:

1. **Project Name**: `comedy-connect-ui`.
2. **Framework Preset**: Next.js.
3. **Root Directory**: Select `packages/frontend`.
4. **Environment Variables**:
   - `NEXT_PUBLIC_USE_NEW_BACKEND`: `true`
   - `NEXT_PUBLIC_BACKEND_URL`: `https://your-api-url.vercel.app` (The Backend URL).
   - `API_URL`: `https://your-api-url.vercel.app` (Required for API Rewrites).
   - `ADMIN_EMAIL`: Same as Backend, used for session validation.
5. Click **"Deploy"**.

---

## 🔗 Step 4: Final Connection (CORS & Auth)

Once both are deployed, ensure the variables cross-reference correctly:

1. **Backend**: `ALLOWED_ORIGIN` must match the **Frontend URL**.
2. **Frontend**: `NEXT_PUBLIC_BACKEND_URL` and `API_URL` must match the **Backend URL**.
3. **Redeploy** both services if you changed these variables.

---

## 📋 Environment Variables Reference

Ensure all the following variables are set in your Vercel Project Settings for proper functionality.

### Backend (`comedy-connect-api`)

| Variable | Description | Example / Note |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL Connection String | From Neon/Supabase/RDS |
| `NEXTAUTH_URL` | The URL of this Backend | `https://comedy-connect-backend.vercel.app` |
| `NEXTAUTH_SECRET` | Secret for session encryption | Long random string (Same as Frontend) |
| `ALLOWED_ORIGIN` | Allowed CORS Origin (The Frontend URL) | `https://comedyconnect.in` |
| `ADMIN_EMAIL` | Email allowed to access Admin Panel | `user@example.com` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Cloud Name | Required for Image Uploads |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | |
| `RAZORPAY_KEY_ID` | Razorpay Key ID | |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret | |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay Webhook Secret | |
| `EMAIL_SERVER_HOST` | SMTP Host | `smtp.gmail.com` |
| `EMAIL_SERVER_PORT` | SMTP Port | `587` |
| `EMAIL_SERVER_USER` | SMTP User | |
| `EMAIL_SERVER_PASSWORD` | SMTP Password | |
| `EMAIL_FROM` | Sender Email Address | `noreply@comedyconnect.com` |
| `ADMIN_ALLOWED_IPS` | Optional whitelist of Admin IPs | Comma separated IPs |

### Frontend (`comedy-connect-ui`)

| Variable | Description | Example / Note |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL Connection String | Same as Backend (for NextAuth Adapter) |
| `NEXTAUTH_URL` | The URL of this Frontend | `https://comedyconnect.in` |
| `NEXTAUTH_SECRET` | Secret for session encryption | **MUST match Backend** |
| `API_URL` | URL of the Backend API | `https://comedy-connect-backend.vercel.app` |
| `NEXT_PUBLIC_USE_NEW_BACKEND`| Enable Decoupled Mode | `true` |
| `NEXT_PUBLIC_BACKEND_URL` | Backend URL for Client-side calls | `https://comedy-connect-backend.vercel.app` |
| `ADMIN_EMAIL` | Email allowed to access Admin Panel | Same as Backend |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | Same as Backend |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | Same as Backend |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Cloud Name | |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | |
| `RAZORPAY_KEY_ID` | Razorpay Key ID | |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret | |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay Webhook Secret | |
| `EMAIL_SERVER_HOST` | SMTP Host | |
| `EMAIL_SERVER_PORT` | SMTP Port | |
| `EMAIL_SERVER_USER` | SMTP User | |
| `EMAIL_SERVER_PASSWORD` | SMTP Password | |
| `EMAIL_FROM` | Sender Email Address | |

---

## 🔄 Monorepo Dependency Management

Vercel handles npm workspaces automatically. When you deploy `packages/frontend`, Vercel will:
1. Detect it is part of a monorepo.
2. Build the shared `packages/types` if referenced.
3. Compile only the necessary code for that project.

## ⚠️ Troubleshooting

### Prisma Generation
If the build fails with "Prisma Client not found", ensure your **Build Command** includes `npx prisma generate` before `next build`.

### Authentication Redirects
If Google OAuth fails, ensure the **Authorized Redirect URI** in your Google Cloud Console includes the Backend URL:
`https://your-api-url.vercel.app/api/auth/callback/google`

### Cross-Origin Cookies
Verify that both projects are on the same root domain (e.g., `api.example.com` and `app.example.com`) for the best cookie compatibility. The backend is configured to use `SameSite: 'none'; Secure` in production to support cross-domain usage.

### Image Uploads
- **Limit**: Vercel Serverless Functions have a **4.5MB payload limit**. If you proxy uploads through `Next.js API Routes`, files larger than 4.5MB will fail.
- **Fix**: For large files, use client-side uploads directly to Cloudinary or ensure files are compressed < 4.5MB.
- **Config**: Ensure `CLOUDINARY_*` variables are set in the **Backend** environment.
