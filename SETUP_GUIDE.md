# Hostel Issue Tracker — Complete Setup Guide

## 1. What's In This Zip

```
hostel-tracker/
├── backend/          ← Express + Node.js API server
│   ├── src/
│   │   ├── index.ts         main entry point
│   │   ├── app.ts           Express app + CORS + routes
│   │   ├── seed.ts          seeds sample data on first start
│   │   ├── routes/
│   │   │   ├── auth.ts      OTP login / verify
│   │   │   ├── complaints.ts student & admin complaint routes
│   │   │   └── admin.ts     admin dashboard, reports
│   │   └── lib/
│   │       ├── auth.ts      JWT helpers
│   │       ├── email.ts     OTP email sender (nodemailer)
│   │       ├── qrcode.ts    QR code generator
│   │       └── ai.ts        keyword-based category/priority detection
│   ├── lib-db/              Drizzle ORM schema (tables + migrations)
│   ├── .env.example         copy this to .env and fill in values
│   └── package.standalone.json  rename to package.json for standalone use
│
└── frontend/         ← React + Vite web app
    ├── src/
    │   ├── App.tsx          routing
    │   ├── pages/           all pages (login, dashboard, complaints, admin)
    │   ├── components/      reusable components
    │   ├── hooks/           useAuth, useToast
    │   └── lib/             API client, auth token storage
    ├── .env.example         copy to .env and fill in values
    └── vite.standalone.config.ts  rename to vite.config.ts for standalone
```

---

## 2. Prerequisites

- **Node.js 20+** → https://nodejs.org
- **npm** (comes with Node) or **pnpm** (`npm install -g pnpm`)
- **PostgreSQL database** — any of these free options work:
  - **Neon** (recommended, free tier): https://neon.tech
  - **Supabase** (free tier): https://supabase.com
  - **Railway** (free trial): https://railway.app
  - Local PostgreSQL: https://www.postgresql.org/download

---

## 3. Step-by-Step Setup

### Step A — Extract the Zip

**Windows:**
Right-click the `.zip` file → "Extract All" → choose a folder.

**Mac/Linux:**
```bash
unzip hostel-tracker.zip -d hostel-tracker
cd hostel-tracker
```

---

### Step B — Set Up the Backend

```bash
# 1. Enter the backend folder
cd backend

# 2. Rename standalone package.json
#    (Windows: rename the file manually or use the command below)
cp package.standalone.json package.json     # Mac/Linux
# copy package.standalone.json package.json  # Windows CMD

# 3. Install dependencies
npm install

# 4. Create your .env file
cp .env.example .env      # Mac/Linux
# copy .env.example .env   # Windows CMD

# 5. Edit .env — fill in DATABASE_URL and JWT_SECRET (see Section 4)
```

**Edit the `.env` file** (open in Notepad, VS Code, or any text editor):
```env
DATABASE_URL=postgresql://user:password@host/dbname
JWT_SECRET=pick-any-long-random-string-here-32chars
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

```bash
# 6. Push the database schema (creates all tables)
npx drizzle-kit push

# 7. Start the backend server
npm run dev
```

You should see: `Server running on port 3001`
Test it: open http://localhost:3001/api/healthz in your browser — you should see `{"status":"ok"}`

---

### Step C — Set Up the Frontend

Open a **new terminal window** and:

```bash
# 1. Enter the frontend folder
cd frontend

# 2. Install dependencies
npm install

# 3. Copy the config files
cp vite.standalone.config.ts vite.config.ts   # Mac/Linux
# copy vite.standalone.config.ts vite.config.ts # Windows CMD

cp .env.example .env

# 4. Start the frontend
npm run dev
```

Open your browser at: **http://localhost:5173**

---

## 4. Getting a PostgreSQL Database URL

### Option A — Neon (Free, Easiest)
1. Go to https://neon.tech and create a free account
2. Create a new project → choose a region close to you
3. Click "Connect" → copy the connection string
4. It looks like: `postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`
5. Paste it as `DATABASE_URL` in your backend `.env`

### Option B — Supabase
1. Go to https://supabase.com → new project
2. Settings → Database → Connection string → "URI" tab
3. Replace `[YOUR-PASSWORD]` with your project password

### Option C — Local PostgreSQL
```bash
# Install PostgreSQL, then:
createdb hosteltracker
# DATABASE_URL = postgresql://postgres:yourpassword@localhost/hosteltracker
```

---

## 5. OTP Email Setup — How to Send OTPs to Real Devices

### Development Mode (No Setup Needed)
In dev mode, the OTP is **printed to the backend terminal/console** instead of being emailed.  
Look for this line in the server logs:
```
INFO: DEV MODE: OTP for login  email="user@example.com"  otp="123456"
```

### Production Mode — Send Real Emails

Add these to your backend `.env` file. Choose one provider:

---

#### Option 1 — Gmail (Quick, Free)
1. Go to https://myaccount.google.com/apppasswords (requires 2FA enabled)
2. Generate an "App Password" for "Mail"
3. Set in `.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=yourname@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx    ← 16-char app password (no spaces)
SMTP_FROM=Hostel Issue Tracker <yourname@gmail.com>
```

---

#### Option 2 — Resend.com (Best Free Tier — 3,000 emails/month free)
1. Sign up at https://resend.com
2. Get your API key from the dashboard
3. Set in `.env`:
```env
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=resend
SMTP_PASS=re_xxxxxxxxxxxxxxxxxxxx    ← your Resend API key
SMTP_FROM=Hostel Issue Tracker <onboarding@resend.dev>
```

---

#### Option 3 — Brevo / Sendinblue (300 emails/day free)
1. Sign up at https://brevo.com → SMTP & API → Generate SMTP key
2. Set in `.env`:
```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_brevo_login_email@example.com
SMTP_PASS=your-brevo-smtp-key
SMTP_FROM=Hostel Issue Tracker <noreply@yourdomain.com>
```

---

#### Option 4 — Twilio SendGrid (100 emails/day free)
1. Sign up at https://sendgrid.com → Settings → API Keys → Create
2. Set in `.env`:
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=SG.xxxxxxxxxxxxxxxxxxxx    ← SendGrid API key
SMTP_FROM=noreply@yourdomain.com
```

---

## 6. Admin vs Student Accounts

| Email | Role |
|-------|------|
| `admin@hostel.edu` | **ADMIN** — full dashboard, update complaints, weekly reports |
| Any other email | **STUDENT** — submit complaints, view own complaints |

You can change which email(s) get ADMIN role in `backend/src/routes/auth.ts`:
```typescript
const role = email === "admin@hostel.edu" ? "ADMIN" : "STUDENT";
// Change to:
const ADMIN_EMAILS = ["admin@hostel.edu", "principal@college.edu"];
const role = ADMIN_EMAILS.includes(email) ? "ADMIN" : "STUDENT";
```

---

## 7. Deploying to Production

### Backend — Deploy to Railway, Render, or Fly.io

**Railway (Easiest — free starter):**
1. Push your backend folder to GitHub
2. Go to https://railway.app → New Project → Deploy from GitHub
3. Add environment variables (DATABASE_URL, JWT_SECRET, SMTP_*, etc.)
4. It auto-detects Node.js and runs `npm start`

**Render (Free tier available):**
1. Push to GitHub → https://render.com → New Web Service
2. Build command: `npm install && npm run build`
3. Start command: `npm start`
4. Add env vars in the dashboard

### Frontend — Deploy to Vercel or Netlify

**Vercel (Recommended):**
1. Push frontend folder to GitHub
2. Go to https://vercel.com → Import project
3. Add env var: `VITE_API_URL=https://your-backend.railway.app`
4. Vite frontend builds automatically

**Netlify:**
1. https://netlify.com → Add new site → Deploy from Git
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add env var `VITE_API_URL`

---

## 8. Building a Backend Platform Like Replit (Logs, Analytics, Resources)

If you want to host this yourself with full monitoring/admin features, here's how to build each layer:

### A — Application Logs
The backend already uses **Pino** (a structured JSON logger). To view/store logs:

```bash
# Pretty print during development
npm run dev | npx pino-pretty

# Send logs to a log management platform:
# Option 1: Logtail / Better Stack (free tier)
#   npm install @logtail/pino
#   Set LOGTAIL_TOKEN env var

# Option 2: Axiom.co (free tier, excellent UI)
#   Set AXIOM_DATASET and AXIOM_TOKEN env vars
#   npm install @axiomhq/pino
```

### B — Analytics Dashboard
Track usage metrics using:
- **PostHog** (open source, self-hostable): https://posthog.com
  ```bash
  npm install posthog-node   # backend
  npm install posthog-js     # frontend
  ```
- **Plausible** (privacy-friendly): https://plausible.io
- **Umami** (self-hosted, free): https://umami.is

### C — Error Monitoring
- **Sentry** (free tier — 5,000 errors/month):
  ```bash
  npm install @sentry/node @sentry/react
  # Add SENTRY_DSN to env vars
  ```

### D — Uptime Monitoring
- **UptimeRobot** (free — checks every 5 min): https://uptimerobot.com
- **BetterStack** (free tier): https://betterstack.com

### E — Resource / Server Monitoring (CPU, Memory, Disk)
If self-hosting on a VPS (DigitalOcean, Linode, Hetzner):
- **Netdata** (real-time, free, self-hosted): https://netdata.cloud
  ```bash
  wget -O /tmp/netdata-kickstart.sh https://get.netdata.cloud/kickstart.sh
  sh /tmp/netdata-kickstart.sh
  # Opens dashboard at http://yourserver:19999
  ```
- **Grafana + Prometheus** (professional, free):
  - Prometheus scrapes metrics
  - Grafana renders dashboards with charts

### F — Full Self-Hosted Platform Stack (like Replit/Heroku)
To host multiple apps with logs + monitoring all in one UI:

| Component | Tool | Purpose |
|-----------|------|---------|
| Process manager | **PM2** | Keep Node apps running, restart on crash |
| Reverse proxy | **Caddy** or **Nginx** | Route domains, automatic HTTPS |
| Deployment | **Coolify** (free) | Git-based deploys, like Railway but self-hosted |
| Logs | **Dozzle** | Real-time Docker log viewer |
| Monitoring | **Uptime Kuma** | Self-hosted uptime dashboard |
| Database UI | **Adminer** or **pgAdmin** | View/edit PostgreSQL tables |

**Coolify** (https://coolify.io) gives you almost exactly the Replit-style dashboard:
- One-click deploys from GitHub
- Environment variable management
- Live logs
- Resource metrics (CPU, RAM)
- Automatic SSL certificates

---

## 9. Quick Reference — All Login Test Accounts

After first start, the backend seeds these accounts:
```
Admin:
  email: admin@hostel.edu
  role:  ADMIN

Students:
  email: rahul.sharma@student.edu
  email: priya.patel@student.edu
  email: amit.kumar@student.edu
```
OTP is printed to backend console in dev mode. Just look for `otp: "XXXXXX"` in the logs.

---

## 10. Troubleshooting

| Problem | Fix |
|---------|-----|
| `DATABASE_URL is required` | Create `.env` file and add `DATABASE_URL` |
| `Cannot find module` | Run `npm install` in the backend/frontend folder |
| `CORS error` in browser | Set `CORS_ORIGIN=http://localhost:5173` in backend `.env` |
| OTP not arriving by email | Check `SMTP_*` settings; in dev mode check the terminal |
| `Port already in use` | Change `PORT=3001` in backend `.env` |
| Blank page in frontend | Check browser console (F12), verify backend is running |
| Tables don't exist | Run `npx drizzle-kit push` in the backend folder |

