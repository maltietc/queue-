# OmniPost (Content Scheduler)

A lightweight, multi-channel social media scheduler and content management hub built with Next.js and Prisma. Currently focused on Telegram, with architectural foundations for Instagram, YouTube, LinkedIn, and more.

## Features
- **Rich Text Editor**: Built-in Markdown-like editor (Tiptap) with support for headings, images, lists, and formatting.
- **Multi-Channel Support**: Manage multiple Telegram channels and chats from a single dashboard.
- **Background Scheduling**: Create drafts and schedule posts to be published automatically via background cron jobs.
- **Calendar & History**: Visualize your content plan on a monthly grid and track the status of all your publications.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database**: SQLite (via Prisma ORM)
- **Styling**: Tailwind CSS
- **Editor**: Tiptap
- **Deployment**: Ready for Docker (`docker-compose`)

## Local Development

1. Clone the repository and install dependencies:
   ```bash
   pnpm install
   ```

2. Configure environment variables. Create a `.env` file:
   ```env
   DATABASE_URL="file:./dev.db"
   TELEGRAM_BOT_TOKEN="your_telegram_bot_token"
   ```

3. Initialize the database:
   ```bash
   npx prisma db push
   ```

4. Run the development server:
   ```bash
   pnpm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment
The project includes a `Dockerfile` and `docker-compose.yml` for easy deployment on any Linux VPS.

```bash
docker-compose up -d --build
```
