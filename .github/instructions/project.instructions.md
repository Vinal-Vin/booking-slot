---
applyTo: '**/*'
---

# 🇪🇺 Time Slot Booking Web Application

A web application for booking 1-hour meeting slots with the EU delegation.  
Built using **Next.js**, **Tailwind CSS**, **shadcn/ui**, **Supabase**, and **Vercel** with free SMTP email notifications.

This application allows country representatives to book available slots, cancel bookings using their email/name, and automatically notifies meeting organizers via email.

---

## ✨ Features

- 📅 Predefined meeting slots for **26–28 January**
- 📝 Booking form (Name, Email, Country)
- ❌ Cancel an existing booking via Email + Name
- 📧 Automatic email notification to meeting organizers
- 🛡 Supabase database & API routes for booking/cancelation
- 🎨 UI using Tailwind and shadcn/ui components
- 🚀 Hosted on Vercel with free SMTP provider

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

| Layer       | Technology |
|-------------|------------|
| Frontend    | Next.js 15, Tailwind CSS, shadcn/ui |
| Backend     | Supabase (PostgreSQL) |
| Hosting     | Vercel |
| Email       | Free SMTP (Brevo / Resend / Mailersend) |

---

# 🗄️ Database Schema (Supabase)

Create the `bookings` table:

```sql
create table bookings (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  start_time text not null,
  end_time text not null,
  country text not null,
  name text not null,
  email text not null,
  is_available boolean default true,
  created_at timestamp default now(),
  unique(date, start_time)
);
```

## UI + Functionality Requirements

This will a single page application displaying the day and 1 hour available time slots. The view will be mobile responsive using Tailwind CSS for styling with a modern and centered look. 
Neutral colors will be needed as this will be shared from a Ministry. 

Need 2 actions buttons (Book, Cancel) in the same row as each slots. The "Cancel" button will be hidden by default unless the booking is made and the row is disabled. "Book" button action will popup a booking component displaying the booking form. Again, this will be an on-screen modal popup.Once the slot is booked, the row is disabled and the cancel button is unhidded. The "Cancel" button will also be a modal popup where the user will need to enter the name and email booked with in order to cancel the booking and make the slot available, and the "Book" button is unhidden. 