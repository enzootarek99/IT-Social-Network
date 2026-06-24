# IT Social Network 🚀

A modern social network platform designed specifically for IT professionals. Connect, share, collaborate, and grow your career in the tech industry.

## Features 🎯

- **📰 Feed** - Share updates, projects, and insights with the community
- **👤 Profile & CV** - Showcase your skills, experience, and portfolio
- **💼 Freelance Marketplace** - Find and post freelance opportunities
- **🎪 Events** - Discover and organize IT events and meetups

## Tech Stack ⚡

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT
- **Deployment**: Vercel/Railway

## Getting Started 🚀

### Prerequisites
- Node.js 18+
- PostgreSQL
- npm or yarn

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
# Update .env.local with your database URL and other configs
```

4. Set up the database:
```bash
npm run prisma:generate
npm run prisma:migrate
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure 📁

```
IT-Social-Network/
├── src/
│   ├── app/              # Next.js app directory
│   ├── components/       # Reusable components
│   ├── pages/           # API routes
│   ├── lib/             # Utility functions
│   ├── types/           # TypeScript types
│   └── middleware.ts    # Authentication middleware
├── prisma/              # Database schema
├── public/              # Static files
└── README.md
```

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request.

## License 📄

MIT License - feel free to use this project for your own purposes.

## Contact 📧

For questions or suggestions, please reach out to the development team.
