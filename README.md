# 🇪🇺 EU Delegation Meeting Booking System

A modern web application for booking 1-hour meeting slots with the EU delegation, built with Next.js, Tailwind CSS, shadcn/ui, and Supabase.

## ✨ Features

- 📅 Predefined meeting slots for **January 26–28, 2025**
- 📝 Easy booking form (Name, Email, Country)
- ❌ Self-service booking cancellation
- 📧 Automatic email notifications (coming soon)
- 🛡 Secure database with Supabase
- 🎨 Beautiful UI with Tailwind CSS and shadcn/ui components
- 📱 Fully responsive design
- 🚀 Ready for deployment on Vercel

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd booking-slot
npm install
```

### 2. Environment Setup

Copy the environment template:

```bash
cp .env.example .env.local
```

Update `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Database Setup

Create the `bookings` table in your Supabase database:

```sql
create table bookings (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  start_time text not null,
  end_time text not null,
  country text,
  name text,
  email text,
  is_available boolean default true,
  created_at timestamp default now(),
  unique(date, start_time)
);
```

### 4. Seed the Database

Populate the database with predefined time slots:

```bash
npm run seed
```

### 5. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the booking interface.

## 📆 Available Time Slots

The application includes the following predefined slots:

### **January 26, 2025**
- 2:00pm – 3:00pm (Reserved for Fiji)
- 3:30pm – 4:30pm

### **January 27, 2025**
- 2:00pm – 3:00pm
- 3:00pm – 4:00pm

### **January 28, 2025**
- 9:00am – 10:00am
- 10:00am – 11:00am
- 11:00am – 12:00pm
- 12:00pm – 1:00pm
- 2:00pm – 3:00pm
- 3:00pm – 4:00pm

## 🛠 Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel-ready
- **Icons**: Lucide React

## 🎨 UI Components

The application uses shadcn/ui components for a consistent and professional look:

- **Cards**: Display time slots with booking status
- **Dialogs**: Modal forms for booking and cancellation
- **Buttons**: Primary and secondary actions
- **Forms**: Input validation and error handling
- **Badges**: Status indicators
- **Alerts**: User feedback and notifications

## 📱 Responsive Design

The interface is fully responsive with:
- Mobile-first design approach
- Tablet and desktop optimizations
- Touch-friendly interaction areas
- Professional neutral color scheme suitable for government use

## 🔧 Development Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run seed       # Seed database with time slots
```

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

The application is optimized for Vercel deployment with automatic builds and serverless functions.

## 📧 Email Notifications (Coming Soon)

Future versions will include automatic email notifications for:
- Booking confirmations
- Cancellation confirmations
- Meeting organizer notifications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is created for the EU delegation meeting booking system.