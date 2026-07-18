# Kasulatan

Kasulatan is a private transaction-agreement application for creating, reviewing, electronically signing, and preserving a clear evidence trail for agreements in the Philippines.

Kasulatan is a record-keeping and workflow product. It does not provide legal advice or guarantee the outcome of a dispute.

## Project documentation

- [Product and delivery plan](docs/PROJECT_PLAN.md)
- [Technical reference](docs/TECH_STACK.md)

## Local development

Requirements: a supported Node.js/npm installation and a PostgreSQL database.

1. Install dependencies with `npm install`.
2. Create an ignored `.env` containing `DATABASE_URL`.
3. Apply development migrations with `npx prisma migrate dev`.
4. Start the application with `npm run dev`.
5. Before handing off changes, run `npm run check` and `npm run build`.

Never commit `.env` files or production credentials.
