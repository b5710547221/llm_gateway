# AI-Sec Web App

A modern full-stack web application built with Next.js 14, TypeScript, PostgreSQL, Prisma, Zustand, and Zod.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: SQLite (for development) / PostgreSQL (for production)
- **ORM**: Prisma
- **State Management**: Zustand
- **Validation**: Zod
- **Styling**: Tailwind CSS
- **SSR**: Server-Side Rendering with React Server Components

## Features

- ✅ Server-Side Rendering (SSR) with Next.js App Router
- ✅ Type-safe database queries with Prisma
- ✅ Global state management with Zustand
- ✅ Schema validation with Zod
- ✅ RESTful API routes with validation
- ✅ Responsive UI with Tailwind CSS
- ✅ User and Post management

## Getting Started

### Prerequisites

- Node.js 18+ 
- SQLite (included) or PostgreSQL database (for production)

### Installation

1. **Clone and install dependencies**:
```bash
cd /Users/warat/Downloads/ai-sec
npm install
```

2. **Set up environment variables**:
The `.env` file is already configured for SQLite development:
```env
DATABASE_URL="file:./dev.db"
NODE_ENV="development"
```

For PostgreSQL in production, update to:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/ai_sec_db?schema=public"
```

3. **Set up the database**:
```bash
# Push the Prisma schema to your database
npm run db:push

# Generate Prisma Client
npm run db:generate
```

4. **Run the development server**:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/Users/warat/Downloads/ai-sec/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── api/               # API routes
│   │   │   ├── users/         # User endpoints
│   │   │   └── posts/         # Post endpoints
│   │   ├── users/             # User pages
│   │   ├── posts/             # Post pages
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page (SSR)
│   │   └── globals.css        # Global styles
│   ├── lib/
│   │   └── prisma.ts          # Prisma client
│   ├── schemas/
│   │   ├── user.schema.ts     # User Zod schemas
│   │   └── post.schema.ts     # Post Zod schemas
│   └── store/
│       ├── userStore.ts       # User Zustand store
│       └── postsStore.ts      # Posts Zustand store
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push Prisma schema to database
- `npm run db:generate` - Generate Prisma Client
- `npm run db:studio` - Open Prisma Studio

## API Endpoints

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user
- `GET /api/users/[id]` - Get a specific user
- `PATCH /api/users/[id]` - Update a user
- `DELETE /api/users/[id]` - Delete a user

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create a new post
- `GET /api/posts/[id]` - Get a specific post
- `PATCH /api/posts/[id]` - Update a post
- `DELETE /api/posts/[id]` - Delete a post

## Database Schema

### User
- `id`: String (CUID)
- `email`: String (unique)
- `name`: String (optional)
- `createdAt`: DateTime
- `updatedAt`: DateTime
- `posts`: Relation to Post[]

### Post
- `id`: String (CUID)
- `title`: String
- `content`: String (optional)
- `published`: Boolean
- `authorId`: String
- `author`: Relation to User
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Key Technologies Explained

### Server-Side Rendering (SSR)
Pages use React Server Components by default, fetching data directly on the server for optimal performance and SEO.

### Prisma
Type-safe ORM that provides a clean API for database operations with auto-generated types.

### Zustand
Lightweight state management with minimal boilerplate, using hooks for easy integration.

### Zod
TypeScript-first schema validation that ensures data integrity at runtime.

## License

MIT
