# Setup Plan

## Goal
Set up the project foundation in a clean way so the app is ready for frontend, backend, database, authentication, and payments later.

## Setup Order

1. Check development tools
2. Create the Next.js project
3. Review the generated project structure
4. Run the app locally
5. Clean up unneeded starter code
6. Install Prisma and database tools
7. Create the initial Prisma schema
8. Prepare authentication setup
9. Prepare environment variables
10. Prepare Stripe for later integration

## 1. Check Development Tools

What to check:
- Node.js
- npm
- Git

Why this matters:
- These are needed to create and run the project
- If versions are broken or missing, setup will fail

What I should understand:
- Node.js runs JavaScript tools outside the browser
- npm installs packages
- Git tracks project history

## 2. Create the Next.js Project

What to do:
Create a new Next.js app with TypeScript and Tailwind.

Why this matters:
- This gives us the base full-stack app
- It creates the project structure for pages, components, and configs

What I should understand:
- A framework gives me a structure so I do not start from nothing
- Project generators create a standard baseline

## 3. Review the Generated Project Structure

What to review:
- app/
- public/
- package.json
- tsconfig.json
- next.config.ts
- tailwind config if present
- eslint config

Why this matters:
- I should not blindly use generated files
- I need to know what each important file is for

What I should understand:
- app/ contains routes and UI
- package.json defines scripts and dependencies
- tsconfig.json controls TypeScript behavior

## 4. Run the App Locally

What to do:
Start the dev server and open the app in the browser.

Why this matters:
- Confirms the setup works
- Gives me feedback early before I add more complexity

What I should understand:
- Development mode lets me test changes quickly
- I should verify the base app before modifying it

## 5. Clean Up Unneeded Starter Code

What to do:
Remove or simplify the default Next.js starter content.

Why this matters:
- Makes the project easier to understand
- Reduces noise when we start building real features

What I should understand:
- Clean codebases are easier to navigate
- Simpler starting points reduce confusion

## 6. Install Prisma and Database Tools

What to install:
- prisma
- @prisma/client

Why this matters:
- Prisma will connect our backend code to the database
- We need it before building data-driven features

What I should understand:
- A package can help code talk to the database
- ORM tools map models to database tables

## 7. Create the Initial Prisma Schema

What to do:
Create the schema file and define the initial models.

Why this matters:
- This turns planning into real database structure
- Backend logic depends on this

What I should understand:
- Schema design comes before query code
- Models define what data exists in the system

## 8. Prepare Authentication Setup

What to do:
Plan how users will register, log in, and stay signed in.

Why this matters:
- Most important features depend on user identity
- Agreements must be tied to real accounts

What I should understand:
- Authentication answers: who is this user?
- Authorization answers: what is this user allowed to do?

## 9. Prepare Environment Variables

What to prepare:
- database URL
- auth secret
- Stripe keys later

Why this matters:
- Secrets should not be hardcoded in source code
- Different environments use different values

What I should understand:
- Environment variables hold configuration
- Sensitive values should be protected

## 10. Prepare Stripe for Later Integration

What to plan:
- service fee amount
- checkout flow
- success and cancel redirects

Why this matters:
- Payments affect agreement finalization
- We should already understand where Stripe fits before coding it

What I should understand:
- External services become part of the app flow
- Payment completion often changes backend state

# Important Full-Stack Reminder

Project setup is not separate from full-stack learning.

Each setup step connects to a layer of the system:
- framework
- frontend
- backend
- database
- authentication
- external services

# Success Condition

The setup phase is successful when:
- the app runs locally
- the project structure is understood
- Prisma is installed
- the app is ready for real feature development
