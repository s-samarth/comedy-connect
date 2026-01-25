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
   - `GOOGLE_CLIENT_ID` / `SECRET`.
6. Click **"Deploy"**.

---

## 🎨 Step 3: Configuring the Frontend (UI)

Repeat the import process for the Frontend:

1. **Project Name**: `comedy-connect-ui`.
2. **Framework Preset**: Next.js.
3. **Root Directory**: Select `packages/frontend`.
4. **Environment Variables**:
   - `NEXT_PUBLIC_USE_NEW_BACKEND`: `true`
   - `NEXT_PUBLIC_BACKEND_URL`: `https://your-api-url.vercel.app` (The URL from Step 2).
5. Click **"Deploy"**.

---

## 🔗 Step 4: Final Connection (CORS & Auth)

Once both are deployed, you must update the Backend environment variables to allow the Frontend to communicate:

1. Go to **`comedy-connect-api`** > **Settings** > **Environment Variables**.
2. Update/Add:
   - `FRONTEND_URL_PROD`: `https://your-frontend-url.vercel.app`
3. **Redeploy** the backend to pick up the updated CORS whitelist.

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
Verify that both projects are on the same root domain (e.g., `api.example.com` and `app.example.com`) for the best cookie compatibility, though Vercel's default subdomains will work for testing.
