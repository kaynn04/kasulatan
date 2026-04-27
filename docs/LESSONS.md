# Lessons

## Lesson 1: Full-Stack Thinking

A full-stack feature is not just frontend or backend alone.

A full-stack feature is this whole flow:

User action -> UI form -> request to server -> server validation -> database write -> server response -> UI update

If I understand this chain, integration becomes much easier.

Important idea:
- Frontend collects input and displays output
- Backend receives input, validates it, applies rules, and returns a response
- Database stores the real state of the system

## Lesson 2: Why We Started With Planning

Before coding, I created:
- PROJECT_PLAN.md
- DATA_MODEL.md
- FEATURE_CREATE_AGREEMENT.md

These files help me avoid confusion because they define:
- what the app does
- what data exists
- how a feature works end to end

If I skip planning, the frontend, backend, and database can become disconnected.

## Lesson 3: What Makes FE-BE Integration Hard

Integration feels difficult when I do not clearly know:
- what the frontend should send
- what the backend expects
- what the backend returns
- what the UI should do after success or failure

The solution is to define a feature contract before coding.

A feature contract includes:
- the goal of the feature
- frontend responsibility
- backend responsibility
- request data
- validation rules
- business rules
- response shape
- success flow
- failure flow

## Lesson 4: The Frontend Does Not Invent the System

The frontend does not invent business rules or permanent data.

The frontend:
- shows forms
- captures user input
- sends requests
- renders results
- shows errors

The backend:
- decides if the request is valid
- decides what records to create or update
- enforces business rules

The database:
- stores the system state

## Lesson 5: Database First Helps Me Think Clearly

We defined the data model before writing code.

Why this helps:
- pages need data
- API routes need data
- validation depends on data
- business rules depend on relationships between data

If I understand the entities and relationships first, then the UI and backend logic become easier to design.

## Lesson 6: Every Feature Should Be Explained As A Flow

Example: Create Agreement

1. User opens create agreement page
2. Frontend shows the form
3. User fills out the form
4. Frontend sends the request
5. Backend validates the request
6. Backend creates records in the database
7. Backend returns the result
8. Frontend redirects to the agreement details page

This is how I should think about features from now on.

## Lesson 7: Questions I Should Ask For Any Backend Task

When I work on a backend task, I should ask:

- Who will call this?
- What data will they send?
- What validation is needed?
- What business rule should happen?
- What database records will be created or changed?
- What response should be returned?
- What should the frontend do with that response?

These questions connect backend work to the whole product.

## Lesson 8: My Current Project Structure In My Head

Right now, I should think about the app in layers:

Product layer:
- What problem does the app solve?

Feature layer:
- What can the user do?

Data layer:
- What information must be stored?

Request layer:
- What does the frontend send to the backend?

Logic layer:
- What rules does the backend apply?

UI layer:
- What should the user see before and after the action?

## Personal Reminder

Feeling confused during integration does not mean I am bad at development.

Usually it means the system flow is not yet clear in my head.

When I feel lost, I should draw or write:

UI -> Request -> Validation -> Database -> Response -> UI

## Lesson 9: Why Tech Stack Choice Matters

A tech stack is not just a list of popular tools.

Each tool solves a specific problem in the system.

For this project:
- Next.js helps connect frontend and backend in one app
- TypeScript helps define data clearly
- Tailwind helps build the UI faster
- Prisma helps connect code to the database
- PostgreSQL stores relational data
- Auth handles user identity
- Stripe handles payments
- Vercel helps deploy the app

I should always ask:
- What problem does this tool solve?
- Why is it a good fit for this project?
- What concept am I supposed to learn from it?

## Lesson 10: Setup Is Part Of System Design

Project setup is not just installation work.

Each setup step prepares one part of the full stack:
- Next.js prepares app structure
- TypeScript prepares safer code
- Prisma prepares database access
- environment variables prepare configuration
- auth prepares user identity
- Stripe prepares payment integration

If I understand why each setup step exists, I understand the system better.

## Lesson 11: Check The Environment Before Setup

Before creating a project, I should check whether the machine already has the required tools.

Commands:
- node -v
- npm -v
- git --version

Why this matters:
- setup depends on these tools
- many errors come from missing or incompatible versions
- checking early reduces confusion later

A working development environment is part of the system, not separate from it.

## Lesson 13: Folder Name Is Not Always The Package Name

A project can have:
- a folder name
- a product name
- a package name

These are related, but not always identical.

In npm, package names must follow naming rules such as:
- lowercase only
- no invalid characters

So even if my folder is named `Kasulatan`, the package name should be something like `kasulatan`.

## Lesson 14: Read The Generated Structure

A framework generator creates many files for me, but I should not treat them like mystery files.

I should learn the responsibility of the important ones:
- app/ for routes and UI
- layout.tsx for shared layout
- page.tsx for route pages
- globals.css for global styles
- package.json for scripts and dependencies
- tsconfig.json for TypeScript config

Understanding generated files helps me feel less lost in a new codebase.

## Lesson 15: Read package.json To Understand The Project

package.json is one of the most important files in a JavaScript or TypeScript project.

It tells me:
- the package name
- the available scripts
- the installed dependencies
- the development tools being used

From package.json, I can understand what kind of project I am working with and how to run it.

## Lesson 16: Connect Browser Output Back To The Code

When I see something in the browser, I should learn to trace it back to the files that created it.

For a Next.js page, I should ask:
- Which file renders this UI?
- Which file wraps this page?
- Which file styles this content?

This habit helps me understand how code becomes the user interface.

## Lesson 17: A Route Is Backed By A Page File

In the Next.js App Router, a page file represents a route.

Example:
- app/page.tsx -> /
- app/about/page.tsx -> /about

A page is a function that returns JSX.

That means the route and the UI are directly connected through the file structure.

## Lesson 18: Global CSS Affects The Whole App

A file like app/globals.css is loaded for the whole application.

This is useful for:
- base font styles
- background colors
- spacing resets
- box sizing
- reusable global defaults

Because it affects all pages, I should use it carefully.

## Lesson 19: In App Router, Folders Become Routes

In Next.js App Router, the folder structure inside app/ defines the route structure.

Examples:
- app/page.tsx -> /
- app/dashboard/page.tsx -> /dashboard
- app/login/page.tsx -> /login

This means I can understand routes by looking at the file tree.

## Lesson 20: Shared UI Belongs In Layouts

A layout is useful for UI that should appear across multiple pages.

Examples:
- headers
- navigation
- footers
- providers
- wrappers

If I put navigation in app/layout.tsx, it appears across all routes inside that layout.

This helps me separate:
- page-specific UI
- shared app UI

## Lesson 21: Link vs a Tag In Next.js

In Next.js, I should use Link for navigation between internal routes.

Why:
- it is the standard Next.js way
- it supports app-aware navigation
- it is faster and smoother than normal full page reload behavior

Use Link for:
- internal pages in the same app

Use a normal a tag for:
- external websites
- links that should use normal browser behavior

## Lesson 22: Components Make UI Reusable

A component is a reusable piece of UI.

Instead of repeating the same markup across many pages, I can extract it into a component.

This helps with:
- reuse
- cleaner pages
- easier maintenance

A component can receive data through props and render different output based on those values.
## Lesson 23: Prisma Connects App Code To The Database

Prisma is not the database itself.

Prisma is a tool that helps my app code talk to the database.

Mental model:
Next.js code -> Prisma -> Database

This helps me define models, create migrations, and query data in a structured way.

## Lesson 24: The Schema Turns Planning Into Real Data Structure

The Prisma schema file is where planned entities become real models.

This is where I define:
- what data exists
- what fields each model has
- how models relate to each other

This is one of the main links between product planning and backend implementation.## Lesson 27: Prisma Has Configuration And Schema Responsibilities

Prisma setup has two important parts:

- schema.prisma
  defines the models and relationships

- prisma.config.ts
  tells Prisma where the schema is, where migrations go, and how to get the database URL

The schema defines the structure.
The config tells Prisma how to operate.

## Lesson 25: Prisma Has Configuration And Schema Responsibilities

Prisma setup has two important parts:

- schema.prisma
  defines the models and relationships

- prisma.config.ts
  tells Prisma where the schema is, where migrations go, and how to get the database URL

The schema defines the structure.
The config tells Prisma how to operate.

## Lesson 26: A Running Database And A Connection String Are Different Things

A connection string is only useful if the database it points to is actually running.

In this step:
- Prisma started a local Postgres server
- Prisma printed the real DATABASE_URL
- I can now store that URL in .env
- Prisma can use it for migrations and future queries

So the backend data flow now has a real database target.

## Lesson 27: Relations Connect Models Together

A database model is not just about fields.
It is also about relationships.

Examples in this project:
- one User can create many Agreements
- one Agreement can have many AgreementParty records

This helps represent real-world relationships in data.

When I design models, I should ask:
- does one record belong to one other record?
- can one record have many related records?

## Lesson 28: Centralize Database Access In One Reusable File

Even if many parts of the app need database access, I should not create a new Prisma client everywhere.

It is better to create one reusable Prisma client file and import it where needed.

This keeps database access cleaner and avoids development issues from creating too many client instances.

## Lesson 29: A Real Folder Is Not Always A Valid Import Target

Even if a folder exists, I cannot always import the folder directly.

A folder import usually needs an entry file like:
- index.ts
- or a package export definition

In my Prisma generated output, the main server entry was client.ts, so the correct import was:
@/app/generated/prisma/client

## Lesson 30: A Page Can Read Data Before Rendering

A page can become async if it needs to fetch data before rendering.

Example:
- page requests data from the database
- waits for the result
- then returns JSX using that result

This means the UI can directly reflect real backend data.

## Lesson 31: Server Code And Client Code Do Not Run In The Same Place

In a full-stack app, some code runs on the server and some runs in the browser.

Server-side code is used for:
- database queries
- secrets
- backend logic
- validation

Client-side code is used for:
- clicks
- typing
- UI state
- browser interactions

In Next.js App Router, page files are server components by default unless I add "use client".

## Lesson 32: Write Changes The Truth, Read Shows The Truth

A useful way to think about full-stack flow:

- a write changes the database state
- the database state is the current truth
- a read asks for that current truth
- the browser output shows that truth to the user

Example:
- script creates a user
- database now has 1 user
- page reads user count
- browser shows 1

## Lesson 33: A Form UI Alone Is Not Yet A Working Feature

A form can display fields and buttons without actually doing anything.

For a form to become a real feature, it still needs:
- submission handling
- server-side validation
- database writes
- success or error feedback

So form fields are the UI surface, not the full feature by themselves.

## Lesson 34: Redirect Can Be Part Of Backend Flow

After a successful server-side action, the app can redirect the user to another page.

Example flow:
- form submits
- server action writes to database
- redirect sends user to another route
- the new route reads updated data and displays it

This makes the feature flow feel complete for the user.

## Lesson 35: Server-Side Validation Is The Backend's Gate

The backend must validate input before writing to the database. The frontend can show errors, but the backend decides what's valid. Never trust form input blindly.

## Lesson 36: The State Object Is How BE Talks Back To FE

A server action can return an object to the form. This object carries error messages. The form reads it and displays the errors. This is the contract between backend and frontend.

## Lesson 37: useActionState Connects Forms To Server Actions With Feedback

useActionState(serverAction, initialState) gives you three things:

state — the returned object from the server action
action — what you pass to <form action={action}>
pending — true while submitting
The server action must take two parameters: (prevState, formData) — React passes the previous state automatically as the first argument.

## Lesson 38: "use server" Files Can Only Export Functions

A "use server" file is special — every export becomes a server action (a network endpoint). Only async functions are allowed. Data like objects, constants, or types should live in regular files.

## Lesson 39: Split Server And Client Code Into Separate Files

When a feature needs both server logic (validation, DB) and client logic (hooks, interactivity), split them into separate files. This mirrors how real teams work — BE devs write the actions, FE devs write the components, and the state object shape is their shared contract.
















