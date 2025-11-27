// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.log('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment');
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

// Pre-existing booking for Fiji
const preBookings = [
  {
    slotDate: '2026-01-26',
    slotStartTime: '14:00',
    country: 'Fiji',
    name: 'Monika',
    email: 'fijimfaet.11iepatradecommittee@gmail.com'
  }
];

async function seedDatabase() {
  console.log('Starting database seeding...');
  console.log('Using Supabase URL:', supabaseUrl);

  try {
    // Clear existing data
    console.log('Clearing existing data...');
    const { error: deleteBookingsError } = await supabase
      .from('bookings')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    const { error: deleteSlotsError } = await supabase
      .from('slots')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if ((deleteBookingsError && deleteBookingsError.code !== 'PGRST116') || 
        (deleteSlotsError && deleteSlotsError.code !== 'PGRST116')) {
      console.error('Error clearing existing data:', deleteBookingsError || deleteSlotsError);
    } else {
      console.log('✓ Cleared existing data');
    }

    // Insert time slots
    console.log('Inserting time slots...');
    const insertedSlots = [];
    
    for (const slot of timeSlots) {
      const { data, error } = await supabase
        .from('slots')
        .insert([{
          date: slot.date,
          start_time: slot.start_time,
          end_time: slot.end_time
        }])
        .select()
        .single();

      if (error) {
        console.error(`✗ Error inserting slot ${slot.date} ${slot.start_time}:`, error.message);
      } else {
        console.log(`✓ Added slot: ${slot.date} ${slot.start_time}-${slot.end_time}`);
        insertedSlots.push(data);
      }
    }

    // Insert pre-existing bookings
    console.log('Adding pre-existing bookings...');
    for (const booking of preBookings) {
      // Find the slot for this booking
      const slot = insertedSlots.find(s => 
        s.date === booking.slotDate && s.start_time === booking.slotStartTime
      );

      if (slot) {
        const { data, error } = await supabase
          .from('bookings')
          .insert([{
            slot_id: slot.id,
            country: booking.country,
            name: booking.name,
            email: booking.email
          }])
          .select()
          .single();

        if (error) {
          console.error(`✗ Error creating booking for ${booking.country}:`, error.message);
        } else {
          console.log(`✓ Created booking: ${slot.date} ${slot.start_time}-${slot.end_time} for ${booking.country}`);
        }
      }
    }

    // Verify the data was inserted
    const { data: allSlots, error: fetchSlotsError } = await supabase
      .from('slots')
      .select(`
        *,
        bookings (
          country,
          name,
          email
        )
      `)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    if (fetchSlotsError) {
      console.error('Error fetching slots for verification:', fetchSlotsError);
    } else {
      console.log(`\n✓ Database seeding completed successfully! Total slots: ${allSlots.length}`);
      console.log('\nSlots in database:');
      allSlots.forEach(slot => {
        const isBooked = slot.bookings && slot.bookings.length > 0;
        const status = isBooked ? `Booked (${slot.bookings[0].country})` : 'Available';
        console.log(`  ${slot.date} ${slot.start_time}-${slot.end_time}: ${status}`);
      });
    }
  } catch (error) {
    console.error('Unexpected error during seeding:', error);
  }
}

seedDatabase();