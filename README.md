# 🇪🇺 EU Delegation Meeting Booking System

A modern web application for booking 1-hour meeting slots with the EU delegation, built with **SvelteKit**, **Tailwind CSS**, and **Supabase**.

## ✨ Features

- 📅 Predefined meeting slots for **January 26–28, 2025**
- 📝 Easy booking form (Name, Email, Country)
- ❌ Self-service booking cancellation with verification
- 🏛️ Professional government-appropriate design
- 👥 Clear attendee display ("EU – Country" format)
- 🛡 Secure normalized database with proper foreign keys
- 🎨 Beautiful UI with Tailwind CSS and custom Svelte components
- 📱 Fully responsive design
- ⚡ Real-time slot availability updates
- 🚀 Ready for deployment on Vercel

## 🗄️ Database Architecture

The application uses a normalized database schema with two main tables:

### **`slots` Table** (Predefined Time Slots)
```sql
id          | uuid (Primary Key)
date        | date (Meeting date)
start_time  | text (Start time in HH:mm format)
end_time    | text (End time in HH:mm format) 
created_at  | timestamp (Creation timestamp)
```

### **`bookings` Table** (Booking Information)
```sql
id         | uuid (Primary Key)
slot_id    | uuid (Foreign Key → slots.id)
country    | text (Country name)
name       | text (Contact person name)
email      | text (Contact email)
created_at | timestamp (Booking timestamp)
```

### **Key Benefits:**
- ✅ **Separation of Concerns**: Slots and bookings are separate entities
- ✅ **Data Integrity**: Foreign key constraints ensure consistency
- ✅ **Flexibility**: Easy to modify slots without affecting bookings
- ✅ **Scalability**: Foundation for future enhancements

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

Create the normalized database schema in your Supabase SQL Editor:

```sql
-- Create improved database schema with separate slots and bookings tables
-- Drop existing tables if they exist
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS slots;

-- Create slots table for predefined time slots
CREATE TABLE slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  start_time text NOT NULL,
  end_time text NOT NULL,
  created_at timestamp DEFAULT now(),
  UNIQUE(date, start_time)
);

-- Create bookings table for booking information
CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id uuid NOT NULL REFERENCES slots(id) ON DELETE CASCADE,
  country text NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  created_at timestamp DEFAULT now(),
  UNIQUE(slot_id) -- Each slot can only have one booking
);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public read access on slots" ON slots FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read access on bookings" ON bookings FOR SELECT USING (true);
CREATE POLICY "Allow public delete access on bookings" ON bookings FOR DELETE USING (true);
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

Open [http://localhost:5173](http://localhost:5173) to see the booking interface.

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

- **Frontend**: SvelteKit 2.49+ (with Svelte 5.45+), TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL) with normalized schema
- **Authentication**: Supabase Row Level Security
- **Deployment**: Vercel-ready with serverless functions
- **Icons**: Lucide Svelte
- **Utilities**: dotenv for environment variables

## 🔌 API Routes

The application includes RESTful API endpoints:

### **GET /api/bookings**
- Fetches all time slots with booking information
- Returns joined data from slots and bookings tables
- Includes availability status and attendee details

### **POST /api/bookings**
- Creates a new booking for an available slot
- Validates slot availability before booking
- Parameters: `slotId`, `name`, `email`, `country`

### **POST /api/bookings/cancel**
- Cancels an existing booking with verification
- Requires exact name and email match for security
- Parameters: `slotId`, `name`, `email`

## 🎨 UI Components

The application uses custom Svelte components for a consistent and professional look:

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
npm run preview    # Preview production build
npm run check      # Run TypeScript and Svelte checks
npm run seed       # Seed database with time slots
```

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**: Commit and push your code
2. **Import to Vercel**: Connect your repository to Vercel
3. **Environment Variables**: Add these in Vercel dashboard:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```
4. **Deploy**: Vercel will automatically build and deploy

The application includes:
- ✅ Optimized for serverless deployment
- ✅ Automatic HTTPS and CDN
- ✅ Production environment variables
- ✅ SvelteKit adapter for various platforms

## 🛠 Troubleshooting

### **Database Issues**
```bash
# If seeding fails, check your environment variables
npm run seed

# Common issues:
# - Missing SUPABASE_SERVICE_ROLE_KEY
# - Wrong table permissions in Supabase
# - Network connectivity issues
```

### **Development Issues**
```bash
# Clear SvelteKit cache if you encounter build issues
rm -rf .svelte-kit
npm run dev

# Check if all dependencies are installed
npm install

# Verify environment variables are loaded
echo $NEXT_PUBLIC_SUPABASE_URL
```

### **API Errors**
- **500 errors**: Check Supabase connection and table schemas
- **404 errors**: Ensure API routes are properly deployed
- **Auth errors**: Verify Row Level Security policies

## 📧 Email Notifications (Coming Soon)

Future versions will include automatic email notifications for:
- Booking confirmations sent to users
- Cancellation confirmations
- Meeting organizer notifications
- Integration with SMTP providers (Brevo, Resend, Mailersend)

## 📝 Changelog

### **v2.0.0** (Current - Svelte Migration)
- ✅ Migrated from Next.js/React to SvelteKit/Svelte
- ✅ Converted all React components to Svelte components
- ✅ Rewrote API routes for SvelteKit
- ✅ Updated build and development tooling
- ✅ Maintained all existing functionality
- ✅ Improved performance with Svelte's reactivity

### **v1.0.0** (Previous)
- ✅ Normalized database schema (slots + bookings tables)
- ✅ Complete booking and cancellation workflow
- ✅ Professional government-appropriate UI
- ✅ Responsive design with custom components
- ✅ Real-time availability updates
- ✅ Input validation and error handling
- ✅ Attendee display ("EU – Country" format)
- ✅ Row Level Security implementation

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** with proper TypeScript types
4. **Test thoroughly** including API endpoints
5. **Update documentation** if needed
6. **Submit a pull request** with clear description

### **Development Guidelines**
- Follow TypeScript best practices
- Use Svelte 5 runes ($state, $derived, $props)
- Write reusable Svelte components
- Maintain responsive design patterns
- Include proper error handling
- Write meaningful commit messages

## 📄 License

This project is created for the EU delegation meeting booking system.
