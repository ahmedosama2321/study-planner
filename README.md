# 📚 Study Planner

A full-stack web app for organizing study tasks by subject, priority and deadline. Built with Next.js, with secure user authentication and a relational database.

![Screenshot](./screenshot.png)

## Features

- **Authentication**: sign up, log in and log out, with bcrypt-hashed passwords and JWT sessions stored in httpOnly cookies
- **Task management (CRUD)**: add, complete and delete tasks
- **Organization**: subject, priority (low / medium / high) and due date for each task
- **Filtering and progress**: view all, active or done tasks, with a progress bar and overdue highlighting
- **Data isolation**: every query is scoped to the logged-in user, so users can only access their own tasks

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 15 (App Router, Server Actions) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | SQLite via Prisma ORM |
| Auth | jose (JWT), bcryptjs |
| Validation | Zod |

## Getting Started

**Prerequisites:** Node.js 18.18 or higher

```bash
# 1. Clone the repository
git clone https://github.com/ahmedosama2321/study-planner.git
cd study-planner

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# then edit .env and set a strong SESSION_SECRET

# 4. Create the database
npx prisma migrate dev

# 5. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Database connection string (default: `file:./dev.db`) |
| `SESSION_SECRET` | Long random string used to sign sessions. Generate one with `openssl rand -base64 32` |

## Project Structure

```
app/            Pages and layouts (dashboard, login, register)
components/     Shared UI components
lib/            Database client, session handling, server actions
prisma/         Database schema and migrations
```

## Roadmap

- [ ] Edit existing tasks
- [ ] Dark mode
- [ ] Arabic (RTL) interface
- [ ] Switch to PostgreSQL for deployment
- [ ] Google sign-in

## Author

**Ahmed Osama**: Computer Science & AI student at Pharos University in Alexandria.
GitHub: [@ahmedosama2321](https://github.com/ahmedosama2321)
