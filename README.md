# IT Social Network

A modern social network platform designed specifically for IT professionals. Connect, share, collaborate, and grow your career in the tech industry.

## Features

- **Feed** - Share updates, projects and insights, like posts, and comment with the community.
- **Profile & CV** - Showcase skills, bio, company, location, experiences, education, portfolio projects and public profile pages.
- **Network discovery** - Search IT professionals and follow/unfollow profiles.
- **Freelance Marketplace** - Find, publish, inspect and apply to freelance opportunities.
- **Events** - Discover, create, inspect and join IT events and meetups.
- **Notifications** - Track follows, comments, applications and event participation.
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
npm run prisma:generate
npm run prisma:migrate
```

5. Optional: add demo data:
```bash
npm run db:seed
```

Demo login after seeding:
- Email: `demo@example.com`
- Password: `password123`

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Useful Scripts

```bash
npm run dev              # Start the Next.js development server
npm run build            # Build for production
npm run start            # Start the production server
npm run lint             # Run ESLint
npm run typecheck        # Run TypeScript checks
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Create/apply a local Prisma migration
npm run prisma:studio    # Open Prisma Studio
npm run db:seed          # Seed demo users, posts, missions and events
```

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
- `POST /api/posts/[postId]/like`
- `POST /api/posts/[postId]/comments`
- `GET|PUT /api/profile`
- `GET|POST /api/opportunities`
- `GET /api/opportunities/[opportunityId]`
- `POST /api/opportunities/[opportunityId]/apply`
- `GET|POST /api/events`
- `GET /api/events/[eventId]`
- `POST /api/events/[eventId]/attend`
- `GET|POST /api/follow`
- `GET|PATCH /api/notifications`

## Main Pages

- `/` - Home and feed
- `/network` - User discovery and follow/unfollow
- `/profile` - Authenticated profile editor
- `/profile/[username]` - Public profile page
- `/marketplace` - Freelance opportunities
- `/marketplace/[opportunityId]` - Opportunity details and received applications
- `/events` - Community events
- `/events/[eventId]` - Event details and attendee list
- `/notifications` - Activity notifications and unread state
- `/login` and `/register` - Authentication

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for your own purposes.

## Contact

For questions or suggestions, please reach out to the development team.
