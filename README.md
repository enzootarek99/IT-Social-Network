# NexusIT

A modern platform for IT professionals, students, freelancers and tech communities. Connect, share, collaborate, join activities and grow your career.

Most product pages are member-only: visitors can access login/register/admin-login, then authenticated users access the NexusIT feed, network, marketplace, activities, saved posts, messages and dashboards.

## Features

- **Feed** - Share text/image updates, projects and insights, like/comment, and delete your own posts.
- **Image uploads** - Upload feed photos directly from phone or computer.
- **Saved posts and reports** - Save useful posts and report content to moderation.
- **Freelance reviews** - Rate and review missions/clients.
- **Global search and dashboard** - Search across the platform and track personal activity.
- **Profile & CV** - Showcase skills, bio, company, location, experiences, education, portfolio projects and public profile pages.
- **Network discovery** - Search IT professionals and follow/unfollow profiles.
- **Freelance Marketplace** - Find, publish, inspect and apply to freelance opportunities.
- **Events** - Discover, create, inspect and join IT events and meetups.
- **NexusIT-style pages** - Dark dashboard-inspired layouts for freelance and activities pages.
- **Notifications** - Track follows, comments, applications and event participation.
- **Private messaging** - Start direct conversations and exchange messages with network members.
- **Admin panel** - WordPress-style back-office with access to users, posts, comments, missions, events, conversations, messages and notifications.
- **Naming votes** - Team voting page for platform name proposals.
- **Authentication** - Register, login, logout and maintain sessions with JWT cookies.

## Tech Stack

- **Frontend**: Next.js 16, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT, bcrypt password hashing, HTTP-only cookies
- **Deployment**: Vercel/Railway

## Getting Started

### Prerequisites

- Node.js 20.9+
- PostgreSQL
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/enzootarek99/IT-Social-Network.git
cd IT-Social-Network
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Update DATABASE_URL and JWT_SECRET for your environment
```

Prisma CLI reads `.env`, so for local development you can also copy the same values:
```bash
cp .env.example .env
```

4. Set up the database and Prisma client:
```bash
npm run db:setup
```

5. Optional: add demo data:
```bash
npm run db:seed
```

Demo login after seeding:
- Email: `demo@example.com`
- Password: `password123`

Admin login after seeding:
- Email: `admin@example.com`
- Password: `admin123`

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Troubleshooting Auth Locally

If registration or the demo login fails on a local machine, check the database setup first:

```bash
cp .env.example .env.local
cp .env.example .env
# Make sure DATABASE_URL points to your running PostgreSQL database
npm run prisma:migrate
npm run db:seed
npm run dev
```

The demo account exists only after `npm run db:seed`:
- Email: `demo@example.com`
- Password: `password123`

If the login page shows a generic connection error, restart the dev server after migrations so
Next.js reloads the generated Prisma Client:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
npm run dev
```

## Useful Scripts

```bash
npm run dev              # Start the Next.js development server
npm run build            # Build for production
npm run start            # Start the production server
npm run lint             # Run ESLint
npm run typecheck        # Run TypeScript checks
npm run db:setup         # Generate Prisma Client, migrate DB and seed demo data
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Create/apply a local Prisma migration
npm run prisma:studio    # Open Prisma Studio
npm run db:seed          # Seed demo users, posts, missions and events
```

Seeded admin account:
- Email: `admin@example.com`
- Password: `admin123`

## Project Structure

```
IT-Social-Network/
├── src/
│   ├── app/              # Next.js app directory
│   ├── components/       # Reusable components
│   ├── contexts/         # React context providers
│   ├── lib/             # Utility functions
│   └── proxy.ts          # Route protection proxy
├── prisma/              # Database schema, migrations and seed script
├── public/              # Static files
└── README.md
```

## Main API Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/users`
- `GET|POST /api/posts`
- `PATCH|DELETE /api/posts/[postId]`
- `POST /api/posts/[postId]/like`
- `POST /api/posts/[postId]/save`
- `POST /api/uploads`
- `POST /api/posts/[postId]/comments`
- `PATCH|DELETE /api/posts/[postId]/comments/[commentId]`
- `GET|PUT /api/profile`
- `GET|POST /api/opportunities`
- `GET /api/opportunities/[opportunityId]`
- `PATCH|DELETE /api/opportunities/[opportunityId]`
- `POST /api/opportunities/[opportunityId]/apply`
- `POST /api/opportunities/[opportunityId]/reviews`
- `GET|POST /api/events`
- `GET /api/events/[eventId]`
- `PATCH|DELETE /api/events/[eventId]`
- `POST /api/events/[eventId]/attend`
- `GET|POST /api/follow`
- `GET|PATCH /api/notifications`
- `GET|POST /api/conversations`
- `GET|PATCH /api/conversations/[conversationId]`
- `POST /api/conversations/[conversationId]/messages`
- `GET /api/search`
- `GET /api/dashboard`
- `GET|POST /api/name-votes`
- `POST /api/reports`
- `GET /api/saved-posts`
- `GET /api/admin`
- `PATCH|DELETE /api/admin/users/[userId]`
- `DELETE /api/admin/content/[contentType]/[contentId]`

## Main Pages

- `/` - Home and feed
- `/dashboard` - Authenticated activity dashboard
- `/search` - Global search
- `/name-proposals` - Platform naming proposals and votes
- `/saved` - Saved posts
- `/network` - User discovery and follow/unfollow
- `/profile` - Authenticated profile editor
- `/profile/[username]` - Public profile page
- `/marketplace` - Freelance opportunities
- `/marketplace/[opportunityId]` - Opportunity details and received applications
- `/events` - Community events
- `/events/[eventId]` - Event details and attendee list
- `/notifications` - Activity notifications and unread state
- `/messages` - Private conversations and direct messages
- `/admin/login` - Dedicated admin login
- `/admin` - Separate admin back-office for moderation and platform stats
- `/login` and `/register` - Authentication

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for your own purposes.

## Contact

For questions or suggestions, please reach out to the development team.
