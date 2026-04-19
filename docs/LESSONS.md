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
