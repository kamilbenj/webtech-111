# WebTech Lab 1 — Next.js + Supabase Authentication

# WebTech Lab 1 — Next.js + Supabase Authentication

## Project Overview
CineVerse is a Next.js application fully integrated with Supabase for authentication, database storage, and file storage.  
It implements secure persistent sessions, protected routes, and user‑driven customization such as light/dark theme and button color selection.

This is the final version of the project, including:
- Authentication (email/password)
- Profile system with avatar upload
- Film reviews with ratings and comments
- Friends system (search, add, mutual friends)
- Middleware-protected routes
- Dynamic theme and UI customization
- Fully responsive interface

---

## Main Features
- Authentication with email and password (Supabase Auth)
- Persistent sessions stored in secure cookies
- Middleware protection for private routes (/feed, /profile, /friends, /posts)
- Profile editing (display name, bio, avatar, privacy)
- Film review system with comments
- Friends list, search, and requests
- Theme system: light/dark mode
- Dynamic button color system
- Deployed on Vercel with Supabase backend

---

## Project Structure
```bash
client/
├── app/
│   ├── (auth)/
│   │    └── login/
│   │    └── signup/
│   ├── feed/
│   ├── feed-public/
│   ├── posts/
│   ├── profile/
│   ├── friends/
│   │    └── [id]/
│   ├── settings/
│   ├── components/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── lib/
│   └── supabaseClient.ts
│
├── package-lock.js
└── package.json
server/
supabase/
package-lock.js
package.json
README.md

```

---

## Installation and Setup

### 1. Clone the repository
```bash
git clone https://github.com/kamilbenj/webtech-111.git
cd client
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create environment variables
Create a `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=https://annzicukozdmiszdfbci.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFubnppY3Vrb3pkbWlzemRmYmNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMDY3MTUsImV4cCI6MjA3NzY4MjcxNX0.g4_5WlgIWci0YNHDULUiF8mCUY5x3VtDNQ1UII3QtCg
```

---

## Technologies
| Category           | Technology              |
|------------------- |-------------------------|
| Frontend Framework | Next.js 15+             |
| Auth & Database    | Supabase                |
| Hosting            | Vercel                  |
| Language           | TypeScript              |
| Styling            | TailwindCSS             |

---

## Server-Side Authentication (SSR)

CineVerse uses:

```
@supabase/auth-helpers-nextjs
```

This enables:
- Persistent sessions between client and server
- Automatic cookie syncing
- Access token refresh
- Protected routes using middleware

---

## Protected Routes with Middleware

The **middleware.ts** file synchronizes Supabase sessions and restricts access to private routes such as:

- /feed  
- /profile  
- /friends  
- /posts  

Unauthenticated users are redirected to `/login`.

---

## How to Test Authentication

1. Go to `/signup` or `/login`  
2. Enter credentials  
3. Once authenticated, you will be redirected to `/feed`  
4. Try accessing any protected route to confirm middleware behavior

---

## Authors
- Kamil Benjelloun  
- Gabriel DALIBERT  
- Rayan GAAD  

---

## License
This project is released under the MIT License.  
You may modify and redistribute it as long as the original authors are credited.

---

## Troubleshooting

### 404 after authentication
Verify that your Supabase Redirect URLs include:
```
https://your-vercel-domain/auth/callback
http://localhost:3000/auth/callback
```

### “Please log in” still appears
Ensure:
- middleware.ts is correctly configured  
- The cookies `sb-access-token` and `sb-refresh-token` are present  

### Middleware error: MIDDLEWARE_INVOCATION_FAILED
Happens if `createMiddlewareClient` is imported from the wrong module.  
Use:
```
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
```