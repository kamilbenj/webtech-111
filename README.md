# WebTech Lab 1 — Next.js + Supabase Authentication

## Project Overview
This project is a Next.js application integrated with Supabase for authentication management.  
It demonstrates the use of Server-Side Rendering (SSR) sessions and Next.js middleware to protect private routes.  
The app is deployed on Vercel and uses Supabase Cloud as its backend.

---

## Main Features
- Authentication with email/password or magic link (Supabase Auth)
- Automatic session management with synced cookies
- Next.js middleware to protect routes such as /feed and /profile
- Deployment on Vercel
- Persistent data storage using Supabase PostgreSQL

---

## Project Structure
client/
├── app/
│ ├── login/ → Supabase login page
│ ├── feed/ → Protected page (only visible when logged in)
│ ├── layout.tsx → Global layout
│ └── page.tsx → Home / redirect page
│
├── lib/
│ └── supabaseClient.ts → SSR-aware Supabase client setup
│
├── middleware.ts → Middleware to sync Supabase session & cookies
├── package.json
└── README.md

---

## Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd client
```
### 2️. Install dependencies
```bash
npm install
```
### 3. Create environment variables
```bash
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```
You can find these values in your Supabase dashboard under
Settings → API → Project URL and anon public key.

## Useful Commands
| Command       | Description                           |
| ------------- | ------------------------------------- |
| npm run dev   | Start the project in development mode |
| npm run build | Build the production version          |
| npm start     | Run the production server             |
| vercel --prod | Deploy the app to Vercel              |

## Technologies
| Category           | Technology              |
| ------------------ | ----------------------- |
| Frontend Framework | Next.js 15+             |
| Auth & Database    | Supabase                |
| Hosting            | Vercel                  |
| Language           | TypeScript              |
| Styling (optional) | TailwindCSS / Bootstrap |

## Server-Side Authentication (SSR)

The app uses:
```bash
@supabase/auth-helpers-nextjs
```
This library allows:

Persistent sessions between client and server

Automatic cookie synchronization (sb-access-token, sb-refresh-token)

Route protection via middleware

## Deployment on Vercel

Connect your GitHub repository to Vercel.

In Project Settings → Environment Variables, add:

NEXT_PUBLIC_SUPABASE_URL

NEXT_PUBLIC_SUPABASE_ANON_KEY

Click Deploy.

How to Test

Visit /login

Enter your email

Click the magic link you receive

You’ll be redirected to /feed, a protected page accessible only when authenticated

## Author

Project created by Kamil Benjelloun

## License

This project is released under the MIT License.
You can modify and redistribute it freely as long as you keep the author’s attribution.

## Troubleshooting

404 after clicking the magic link:
Check if /auth/callback exists and if Supabase Redirect URLs include it.

“Please log in” still appears:
Ensure middleware.ts is configured correctly and cookies (sb-access-token, sb-refresh-token) are present.

500 (MIDDLEWARE_INVOCATION_FAILED):
Happens if createMiddlewareClient is imported from the wrong module. Make sure it comes from @supabase/auth-helpers-nextjs.

Magic link opens with #access_token but doesn’t redirect:
Ensure app/page.tsx parses the hash and calls supabase.auth.setSession() before redirecting.
