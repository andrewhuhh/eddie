# i miss my friends

A personal relationship management tool that helps maintain meaningful connections with friends and family.

## Features

- **🗺️ Relationship Map**: Visual network of your connections with health status tracking
- **📱 Multi-Platform Tracking**: WhatsApp, Instagram, Facebook, Phone, Email, and more
- **📝 Personal Journal**: Private notes and reflections about your relationships
- **⏰ Smart Reminders**: Automated prompts to stay in touch
- **📊 Interaction Timeline**: Track all your communications and meetings
- **🔒 Secure & Private**: Google Sign-In with Row Level Security

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Authentication**: Google OAuth via Supabase Auth
- **UI**: Framer Motion, Lucide Icons
- **Fonts**: Inter (sans-serif), Crimson Text (serif)

## Database Schema

The app uses a comprehensive PostgreSQL schema with:

- **people**: Your connections with relationship details
- **interactions**: All communications and meetings
- **journal_entries**: Personal notes with tags and mood tracking
- **reminders**: Smart notification system
- **Row Level Security**: Each user only sees their own data

## Getting Started

1. **Clone and install dependencies**:
   ```bash
   git clone <repo-url>
   cd eddie
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env.local` file with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Configure Google OAuth**:
   - Go to your Supabase project dashboard
   - Navigate to Authentication > Providers
   - Enable Google provider
   - Add your Google OAuth credentials

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)** and sign in with Google

## Authentication & Security

- **Google Sign-In**: Seamless authentication with your Google account
- **Row Level Security**: Your data is completely private and isolated
- **Automatic User Association**: All data is automatically linked to your account
- **Secure by Default**: No data leakage between users

## Usage

1. **Sign in** with your Google account
2. **Add connections** using the "Add Connection" button
3. **Track interactions** through the timeline
4. **Write journal entries** to reflect on relationships
5. **Set reminders** to stay in touch regularly
6. **View your relationship map** to see connection health

## Development

The app is built with modern React patterns:

- **TypeScript**: Full type safety with generated Supabase types
- **Context API**: Authentication state management
- **Protected Routes**: Automatic redirect for unauthenticated users
- **Real-time Updates**: Live data synchronization via Supabase
- **Responsive Design**: Works on desktop and mobile

## Privacy

Your relationship data is:
- ✅ Encrypted in transit and at rest
- ✅ Isolated per user with RLS
- ✅ Never shared or sold
- ✅ Stored securely on Supabase infrastructure
- ✅ Accessible only to you

---

*Built with ❤️ for meaningful connections* 