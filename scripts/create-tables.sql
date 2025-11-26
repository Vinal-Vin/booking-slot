-- Create improved database schema with separate slots and bookings tables
-- Run this SQL in your Supabase SQL Editor

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

-- Create policies for public access (adjust as needed for your security requirements)
CREATE POLICY "Allow public read access on slots" ON slots FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read access on bookings" ON bookings FOR SELECT USING (true);
CREATE POLICY "Allow public delete access on bookings" ON bookings FOR DELETE USING (true);