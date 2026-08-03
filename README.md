# The Gift of Chess - Monorepo

This repository contains the monorepo structure for the **The Gift of Chess** nonprofit website.

## Stack & Architecture

- **Frontend (`frontend/`)**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Backend (`backend/`)**: Node.js + Express + TypeScript
- **Database & Auth**: Supabase (Postgres)
  - Supabase Auth is used strictly for admin login.
  - Postgres tables store all public content and transactional data.
  - Row Level Security (RLS) is enabled on all tables. Content tables have public `SELECT` policies, while transactional tables are fully private (accessible only from the backend via the service-role key).
- **Payments**: Safaricom Daraja API (M-Pesa STK Push), executed securely from the backend only.
- **Email**: Resend, sent from the backend to deliver transaction and inquiry alerts.

### Why No Headless CMS?
To minimize overhead, simplify content management, and maintain absolute consistency, **all content and transactional logs live inside one Supabase Postgres database**. Public pages display content queried from Postgres, and content editing is handled via a private Admin Dashboard, bypassing any third-party headless CMS dependencies (like Sanity, Strapi, or Contentful).

---

## Workspace Structure

```
gift-of-chess/
├── README.md             - This document
├── package.json          - Root configuration using npm workspaces
├── supabase/
│   └── schema.sql        - Full Postgres schema database script
├── frontend/             - Next.js 15 App Router website
│   ├── app/              - Public pages and admin dashboard views
│   ├── components/       - Reusable visual components and page sections
│   └── lib/              - API wrapper & browser Supabase client
└── backend/              - Node.js Express server
    ├── src/config/       - Supabase admin connection configuration
    ├── src/services/     - M-Pesa & Resend integration routines
    └── src/routes/       - Resource API endpoint definitions
```

---

## Setup Steps

Follow these three steps to spin up the applications locally:

### 1. Database Setup
Execute the SQL statements inside `supabase/schema.sql` within your Supabase project's SQL Editor to set up the necessary tables, indexes, and Row Level Security (RLS) policies.

### 2. Backend Setup
1. Move to the backend folder:
   ```bash
   cd backend
   ```
2. Install package dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file (copy `.env.example`) and fill in your keys (Supabase URLs, Safaricom Credentials, Resend API key):
   ```bash
   cp .env.example .env
   ```
4. Start the server in development mode:
   ```bash
   npm run dev
   ```
   *The server runs on port `5000` by default.*

### 3. Frontend Setup
1. Move to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Install package dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file (copy `.env.local.example`) and specify your public URLs and Supabase key:
   ```bash
   cp .env.local.example .env.local
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   *The website runs on port `3000` by default.*

---

## Monorepo Development Runner

For convenience, you can run both applications concurrently directly from the root workspace folder:

1. Install root workspace packages (loads `concurrently`):
   ```bash
   npm install
   ```
2. Start both the Next.js site and Express server together:
   ```bash
   npm run dev
   ```







Buy Goods, Till No. 4160809 

The Gift Of Chess Africa Ltd

can this be the information we use for the buy goods till number ?