# Foodiffin 🍽️

A modern restaurant discovery and management platform built with Next.js 16, featuring user authentication, restaurant listings, and admin capabilities.

## Features

- **User Authentication**: Secure signup/login system powered by Supabase
- **Restaurant Discovery**: Browse and explore restaurants with an interactive interface
- **User Profiles**: Personalized user profiles with onboarding flow
- **Admin Dashboard**: Comprehensive admin panel for managing restaurants and users
- **Responsive Design**: Beautiful UI components with Tailwind CSS and shadcn/ui
- **Email Integration**: Email functionality powered by Resend
- **Dark Mode**: Theme support with next-themes

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) (App Router)
- **Language**: TypeScript
- **Database & Auth**: [Supabase](https://supabase.com)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com), lucide-react
- **Form Handling**: React Hook Form
- **Email**: [Resend](https://resend.com)
- **Notifications**: Sonner (toast notifications)

## Project Structure

```
foodiffin/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication routes
│   │   ├── login/           # Login page
│   │   └── signup/          # Signup page
│   ├── (dashboard)/         # User dashboard routes
│   │   ├── onboarding/      # User onboarding flow
│   │   └── profile/         # User profile page
│   └── admin/               # Admin routes
│       ├── dashboard/       # Admin dashboard
│       └── profile/         # Admin profile
├── components/              # React components
│   ├── DishComponents.tsx   # Dish-related components
│   ├── HeroCarousel.tsx     # Homepage carousel
│   ├── HomeClient.tsx       # Homepage client component
│   ├── Navbar.tsx           # Navigation bar
│   └── ui/                  # shadcn/ui components
├── lib/                     # Utilities and actions
│   ├── supabase/            # Supabase configuration
│   ├── email/               # Email utilities
│   ├── profile.action.ts    # Profile actions
│   └── restaurant.action.ts # Restaurant actions
└── public/                  # Static assets
```

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm, yarn, pnpm, or bun
- Supabase account and project

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd foodiffin
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=your_resend_api_key
```

4. Run the database migrations:

```bash
# Execute the migration.sql file in your Supabase project
```

### Development

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

| Variable                        | Description                              |
| ------------------------------- | ---------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Your Supabase project URL                |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key                   |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase service role key (admin access) |
| `RESEND_API_KEY`                | Resend API key for email functionality   |

## Deployment

### Vercel (Recommended)

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new):

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add your environment variables
4. Deploy!

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is private and proprietary.

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
