---
applyTo: '**/*'
---

# 🇪🇺 Time Slot Booking Web Application

A web application for booking 1-hour meeting slots with the EU delegation.  
Built using **Next.js**, **Tailwind CSS**, **shadcn/ui**, **Supabase**, and **Vercel** with free SMTP email notifications.

This application allows country representatives to book available slots, cancel bookings using their email/name, and automatically notifies meeting organizers via email.

---

## ✨ Features

- 📅 Predefined meeting slots for **26–28 January 2025**
- 📝 Booking form with validation (Name, Email, Country)
- ❌ Self-service booking cancellation with verification
- � Clear attendee display ("Attendees: EU – Country" format)
- 🏛️ Professional government-appropriate neutral design
- 🛡 Normalized Supabase database with proper foreign keys
- 🎨 Modern UI using Tailwind CSS v4 and shadcn/ui components
- 📱 Fully responsive design (mobile-first approach)
- ⚡ Real-time slot availability updates
- 🔒 Row Level Security implementation
- 🚀 Hosted on Vercel with serverless API functions
- 📧 Email notification system (ready for SMTP integration)

---

## 📆 Available Time Slots

### **26 January**
- EU – Fiji (2:00pm – 3:00pm)  
- EU – XX (3:30pm – 4:30pm)

### **27 January**
- EU – XX (2:00pm – 3:00pm)  
- EU – XX (3:00pm – 4:00pm)

### **28 January — Morning**
- EU – XX (9:00am – 10:00am)  
- EU – XX (10:00am – 11:00am)  
- EU – XX (11:00am – 12:00pm)  
- EU – XX (12:00pm – 1:00pm)

### **28 January — Afternoon**
- EU – XX (12:00pm – 1:00pm)  
- EU – XX (2:00pm – 3:00pm)  
- EU – XX (3:00pm – 4:00pm)

“XX” represents the booking country.

---

# 🧰 Tech Stack

| Layer          | Technology |
|----------------|------------|
| Frontend       | Next.js 16 (App Router), React 19, TypeScript |
| Styling        | Tailwind CSS v4, shadcn/ui components |
| Database       | Supabase (PostgreSQL) - Normalized Schema |
| Authentication | Supabase Row Level Security |
| API            | Next.js API Routes (Serverless) |
| Hosting        | Vercel with Edge Runtime |
| Icons          | Lucide React |
| Email          | SMTP Integration (Brevo / Resend / Mailersend) |

---

# 🗄️ Database Architecture (Normalized Schema)

## Current Implementation: Two-Table Design

### **`slots` Table** (Predefined Time Slots)
```sql
CREATE TABLE slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  start_time text NOT NULL,
  end_time text NOT NULL,
  created_at timestamp DEFAULT now(),
  UNIQUE(date, start_time)
);
```

### **`bookings` Table** (Booking Information)
```sql
CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id uuid NOT NULL REFERENCES slots(id) ON DELETE CASCADE,
  country text NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  created_at timestamp DEFAULT now(),
  UNIQUE(slot_id) -- Each slot can only have one booking
);
```

### **Benefits of Normalized Design:**
- ✅ **Separation of Concerns**: Slots and bookings are separate entities
- ✅ **Data Integrity**: Foreign key constraints ensure consistency  
- ✅ **Flexibility**: Easy to modify slots without affecting bookings
- ✅ **Scalability**: Foundation for future enhancements (recurring slots, multiple booking types)
- ✅ **Performance**: Optimized queries with proper indexing

## 🔌 API Implementation

### **GET /api/bookings**
- Fetches all time slots with booking information
- Uses JOIN to combine slots and bookings tables
- Returns availability status and attendee details

### **POST /api/bookings**  
- Creates new booking for available slot
- Validates slot availability before booking
- Parameters: `slotId`, `name`, `email`, `country`

### **POST /api/bookings/cancel**
- Cancels existing booking with verification
- Requires exact name/email match for security
- Deletes booking record to make slot available again

---

## 🎨 UI + Functionality Implementation

### **Single Page Application (SPA)**
- Displays time slots grouped by date (Jan 26-28, 2025)
- Mobile-responsive design using Tailwind CSS
- Professional neutral color scheme for government use
- Centered layout with modern card-based design

### **Time Slot Cards**
Each slot displays:
- **Time**: Formatted as "2:00pm – 3:00pm" 
- **Date**: Full date format "Sunday, January 26"
- **Status Badge**: "Available" (secondary) or "Booked" (primary)
- **Attendees**: "Attendees: EU – [Country]" for booked slots
- **Action Buttons**: "Book" or "Cancel" based on availability

### **Modal Interactions**

#### **Booking Modal** (`BookingModal` component)
- Triggered by "Book" button on available slots
- Form fields: Name*, Email*, Country* (all required)
- Real-time validation with error messages
- Displays selected time slot information
- Submit creates booking via API

#### **Cancellation Modal** (`CancelModal` component)  
- Triggered by "Cancel" button on booked slots
- Verification fields: Name*, Email* (must match booking)
- Warning message about cancellation action
- Security validation before allowing cancellation
- Submit removes booking via API

### **State Management**
- Real-time slot updates after booking/cancellation
- Loading states during API operations
- Error handling with user-friendly messages
- Automatic data refresh after operations

### **Responsive Design Features**
- Mobile-first approach with touch-friendly buttons
- Tablet and desktop optimizations
- Accessible form controls and navigation
- Professional typography and spacing

---

## 📧 Email System (Next Phase)

### **SMTP Configuration**
Environment variables for email integration:
```env
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
FROM_EMAIL=your_from_email
ORGANIZER_EMAIL=organizer@example.com
```

### **Email Templates**
- **Booking Confirmation**: Sent to user after successful booking
- **Cancellation Confirmation**: Sent to user after cancellation
- **Organizer Notification**: Sent to meeting organizer for new bookings
- **Meeting Reminder**: Optional day-before reminder (future enhancement)

### **Recommended SMTP Providers**
- **Brevo** (formerly Sendinblue): Free tier with 300 emails/day
- **Resend**: Developer-friendly with generous free tier
- **Mailersend**: Professional features with free allowance

### **Implementation Requirements**
- Email notifications for all booking/cancellation actions
- Professional email templates matching government standards
- Error handling for email delivery failures
- Optional: Email queue system for high volume 