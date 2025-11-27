import { createClient } from '@supabase/supabase-js';

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const timeSlots = [
  // 26 January
  { date: '2026-01-26', start_time: '14:00', end_time: '15:00' },
  { date: '2026-01-26', start_time: '15:30', end_time: '16:30' },

  // 27 January
  { date: '2026-01-27', start_time: '14:00', end_time: '15:00' },
  { date: '2026-01-27', start_time: '15:00', end_time: '16:00' },

  // 28 January - Morning
  { date: '2026-01-28', start_time: '09:00', end_time: '10:00' },
  { date: '2026-01-28', start_time: '10:00', end_time: '11:00' },
  { date: '2026-01-28', start_time: '11:00', end_time: '12:00' },
  { date: '2026-01-28', start_time: '12:00', end_time: '13:00' },

  // 28 January - Afternoon
  { date: '2026-01-28', start_time: '14:00', end_time: '15:00' },
  { date: '2026-01-28', start_time: '15:00', end_time: '16:00' },
];

// Pre-existing booking for demonstration
const existingBooking = {
  date: '2026-01-26',
  start_time: '14:00',
  country: 'Fiji',
  name: 'Monika',
  email: 'fijimfaet.11iepatradecommittee@gmail.com'
};

async function seedDatabase() {
  console.log('Starting database seeding...');

  try {
    // Clear existing data (bookings first due to foreign key constraint)
    console.log('Clearing existing bookings...');
    const { error: deleteBookingsError } = await supabase
      .from('bookings')
      .delete()
      .gte('id', '00000000-0000-0000-0000-000000000000');

    if (deleteBookingsError) {
      console.error('Error clearing existing bookings:', deleteBookingsError);
    }

    console.log('Clearing existing slots...');
    const { error: deleteSlotsError } = await supabase
      .from('slots')
      .delete()
      .gte('id', '00000000-0000-0000-0000-000000000000');

    if (deleteSlotsError) {
      console.error('Error clearing existing slots:', deleteSlotsError);
    }

    console.log('Cleared existing data');

    // Insert time slots first
    console.log('Inserting time slots...');
    const { data: insertedSlots, error: slotsError } = await supabase
      .from('slots')
      .insert(timeSlots)
      .select();

    if (slotsError) {
      console.error('Error inserting slots:', slotsError);
      return;
    }

    console.log(`✓ Added ${insertedSlots.length} time slots`);

    // Find the slot for the existing booking and create it
    const fijiSlot = insertedSlots.find(slot => 
      slot.date === existingBooking.date && slot.start_time === existingBooking.start_time
    );

    if (fijiSlot) {
      console.log('Creating existing booking for Fiji...');
      const { error: bookingError } = await supabase
        .from('bookings')
        .insert([{
          slot_id: fijiSlot.id,
          country: existingBooking.country,
          name: existingBooking.name,
          email: existingBooking.email,
        }]);

      if (bookingError) {
        console.error('Error creating Fiji booking:', bookingError);
      } else {
        console.log('✓ Created existing booking for Fiji');
      }
    }

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Unexpected error during seeding:', error);
  }
}

seedDatabase();