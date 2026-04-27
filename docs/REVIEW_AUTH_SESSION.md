# Review: Authentication & Session Management

## What We Built

A complete auth flow: Register → Login → Session → Protected Pages → Logout

---

## The Big Picture: Why Auth Exists

Every multi-user app needs to answer two questions:

1. **Who are you?** (Authentication — login/register)
2. **Are you allowed to be here?** (Protection — guarding pages and actions)

Without auth, everyone sees everything. With auth, the app knows which human is making each request.

---

## How To Think About Auth (The Mental Model)

```
Register: User gives credentials → BE validates → BE creates user in DB
Login:    User gives credentials → BE validates → BE checks DB → BE sets cookie
Session:  Every request carries cookie → BE reads cookie → BE knows who you are
Protect:  Page/action reads session → No session? → Redirect to login
Logout:   Delete the cookie → User is nobody again
```

This is the same pattern in almost every web app. The tools change, the flow doesn't.

---

## Step 1: Registration

**What happens:**
1. User fills out a form (name, email, password)
2. Server action receives the form data
3. Server validates (all fields present? email valid? password strong enough?)
4. Server checks if email already exists in DB
5. Server hashes the password (NEVER store plain text passwords)
6. Server creates the user record
7. Redirect to login page

**Key concept — Password Hashing:**
- `bcrypt.hash(password, saltRounds)` turns "mypassword123" into "$2b$10$xyz..."
- This is one-way — you cannot reverse it back to the original password
- Even if someone steals the database, they can't read passwords
- To verify later: `bcrypt.compare(inputPassword, storedHash)` returns true/false

**Where the code lives:**
- `app/register/page.tsx` — the page (server component)
- `app/register/RegisterForm.tsx` — the form (client component, uses `useActionState`)
- `app/register/actions.ts` — the server action (validates, hashes, creates user)

---

## Step 2: Login

**What happens:**
1. User fills out email + password
2. Server action receives form data
3. Server validates (fields present?)
4. Server finds user by email in DB
5. Server compares input password against stored hash using `bcrypt.compare()`
6. If match → set a cookie with the user's ID → redirect to dashboard
7. If no match → return error to form

**Key concept — Cookies:**
- A cookie is a small piece of data the server tells the browser to store
- The browser sends it back with every future request automatically
- `httpOnly: true` means JavaScript in the browser can't read it (security)
- We store the user's ID in the cookie — this is how the server knows who you are later

**The cookie is the bridge between login and everything after.**

**Where the code lives:**
- `app/login/page.tsx` — the page
- `app/login/LoginForm.tsx` — the form (same pattern as register)
- `app/login/actions.ts` — the server action (find user, compare password, set cookie)

---

## Step 3: Session Helper

**What it does:**
One reusable function that answers: "Who is the current user?"

**The flow inside `getSession()`:**
1. Read the cookie store (`await cookies()` — async in Next.js 16)
2. Get the `sessionId` cookie value
3. If no cookie → return `null` (not logged in)
4. Use the cookie value to look up the user in DB (`prisma.user.findUnique`)
5. Return the user object (id, name, email) or `null`

**Why a helper?**
- Every protected page needs this same logic
- Without a helper, you'd copy-paste the same 10 lines everywhere
- One function, import it anywhere

**Key concept — `select`:**
- `select: { id: true, name: true, email: true }` means only return these fields
- Don't fetch the password hash or other sensitive fields you don't need
- Less data = safer, faster

**Where it lives:** `lib/session.ts`

**Common mistakes to watch for:**
- Forgetting `await` on `cookies()` (Next.js 16 made it async)
- Using the wrong cookie name (must match what login sets)
- Using `where: { sessionId }` instead of `where: { id: sessionId }` (the cookie stores the user ID, not a field called sessionId)

---

## Step 4: Protecting Pages

**The pattern (same for every protected page):**
```
const session = await getSession();
if (!session) redirect("/login");
// ... rest of page logic (DB queries, rendering, etc.)
```

**Order matters:**
- Session check FIRST, before any database queries
- Why? If someone isn't logged in, don't waste a DB call — just redirect immediately
- This is both a performance and security habit

**Where to protect:**
- Every page that should require login (dashboard, agreements, etc.)
- NOT login and register pages (those are for unauthenticated users)

**Pages vs Server Actions:**
- In a **page** (server component): use `redirect("/login")`
- In a **server action**: you can't redirect cleanly on auth failure — return an error state instead: `{ success: false, errors: { ... } }`

---

## Step 5: Using Session Data

**Before:** Hardcoded values like `createdById: "cmo6ro4kk000050fe568qg35i"`

**After:** Dynamic values from the session: `createdById: session.id`

**The thinking:**
- Any place that says "who did this?" should use `session.id`
- Any place that shows the current user's name/email should use `session.name` / `session.email`
- If you need more user fields later, add them to `getSession()`'s `select`

---

## Step 6: Logout

**What happens:**
1. User clicks logout
2. Server action deletes the `sessionId` cookie
3. Redirect to login page
4. Now `getSession()` returns `null` everywhere → user is locked out of protected pages

**That's it.** Logout is just "forget who this person is."

**Where the code lives:**
- `app/logout/actions.ts` — the server action (delete cookie, redirect)
- A button/form on the dashboard (or wherever) that calls the action

---

## The Complete Flow (How It All Connects)

```
REGISTER
  Form → action → validate → hash password → save user → redirect to /login

LOGIN
  Form → action → validate → find user → compare password → set cookie → redirect to /dashboard

ANY PROTECTED PAGE
  getSession() → read cookie → find user → got user? continue : redirect to /login

CREATE AGREEMENT (or any protected action)
  getSession() → no session? return error : use session.id for createdById

LOGOUT
  action → delete cookie → redirect to /login
```

---

## Thinking Patterns To Remember

### When building any auth feature, ask:
1. What credentials does the user provide?
2. Where do I validate them?
3. What do I store in the database?
4. How does the server remember the user between requests? (cookies, tokens, etc.)
5. How does the server forget the user? (logout)

### When protecting a page or action, ask:
1. Should this require login?
2. Am I checking the session BEFORE doing any real work?
3. What happens if there's no session? (redirect vs error return)

### When using session data, ask:
1. Am I still using any hardcoded user IDs? Replace them.
2. Does `getSession()` return everything I need? If not, add to the `select`.
3. Am I accidentally exposing sensitive fields (like password hash)?

---

## Key Vocabulary

| Term | What it means |
|------|--------------|
| **Authentication** | Proving who you are (login/register) |
| **Authorization** | Checking if you're allowed to do something |
| **Session** | The server's memory of who you are between requests |
| **Cookie** | Small data the browser stores and sends with every request |
| **httpOnly** | Cookie flag that prevents JavaScript from reading it (security) |
| **bcrypt** | Library for hashing passwords (one-way, can't reverse) |
| **Hash** | The scrambled version of a password stored in the database |
| **Salt** | Random data added before hashing to make each hash unique |
| **Server action** | A function that runs on the server, called from a form or client code |
| **Server component** | A component that runs on the server (can access DB, cookies, etc.) |
| **Client component** | A component that runs in the browser (handles clicks, state, etc.) |

---

## What This Session Pattern Is NOT

This is a **simple cookie-based session** — good for learning, but production apps often use:
- **JWT tokens** — stateless auth (no DB lookup per request)
- **Auth libraries** (NextAuth, Clerk, Lucia) — handle sessions, refresh, OAuth, etc.
- **Session tables** — a separate Session model with expiry, device info, etc.

What we built teaches the core concept. The libraries just automate and harden it.
