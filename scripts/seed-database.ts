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
  { date: '2025-01-26', start_time: '14:00', end_time: '15:00', country: 'Fiji', is_available: false, name: 'Reserved', email: 'reserved@eu.delegation' },
  { date: '2025-01-26', start_time: '15:30', end_time: '16:30' },

  // 27 January
  { date: '2025-01-27', start_time: '14:00', end_time: '15:00' },
  { date: '2025-01-27', start_time: '15:00', end_time: '16:00' },

  // 28 January - Morning
  { date: '2025-01-28', start_time: '09:00', end_time: '10:00' },
  { date: '2025-01-28', start_time: '10:00', end_time: '11:00' },
  { date: '2025-01-28', start_time: '11:00', end_time: '12:00' },
  { date: '2025-01-28', start_time: '12:00', end_time: '13:00' },

  // 28 January - Afternoon
  { date: '2025-01-28', start_time: '14:00', end_time: '15:00' },
  { date: '2025-01-28', start_time: '15:00', end_time: '16:00' },
];

async function seedDatabase() {
  console.log('Starting database seeding...');

  try {
    // Clear existing data
    const { error: deleteError } = await supabase
      .from('bookings')
      .delete()
      .gte('id', '00000000-0000-0000-0000-000000000000');

    if (deleteError) {
      console.error('Error clearing existing data:', deleteError);
    } else {
      console.log('Cleared existing data');
    }

    // Insert new time slots
    for (const slot of timeSlots) {
      const slotData = {
        date: slot.date,
        start_time: slot.start_time,
        end_time: slot.end_time,
        is_available: slot.is_available ?? true,
        country: slot.country || null,
        name: slot.name || null,
        email: slot.email || null,
      };

      const { error } = await supabase
        .from('bookings')
        .insert([slotData]);

      if (error) {
        console.error(`Error inserting slot ${slot.date} ${slot.start_time}:`, error);
      } else {
        console.log(`✓ Added slot: ${slot.date} ${slot.start_time}-${slot.end_time}`);
      }
    }

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Unexpected error during seeding:', error);
  }
}

seedDatabase();