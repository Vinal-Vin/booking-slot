import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Fetch slots with their associated bookings
    const { data: slots, error } = await supabase
      .from('slots')
      .select(`
        *,
        bookings (
          id,
          country,
          name,
          email
        )
      `)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching slots:', error);
      return NextResponse.json(
        { error: 'Failed to fetch slots' },
        { status: 500 }
      );
    }

    // Transform data to match the frontend expectations
    const transformedSlots = slots.map(slot => {
      // Check if slot has booking data
      const hasBooking = slot.bookings && (Array.isArray(slot.bookings) ? slot.bookings.length > 0 : true);
      const booking = Array.isArray(slot.bookings) ? slot.bookings[0] : slot.bookings;
      
      return {
        id: slot.id,
        date: slot.date,
        start_time: slot.start_time,
        end_time: slot.end_time,
        is_available: !hasBooking,
        country: hasBooking ? booking?.country || null : null,
        name: hasBooking ? booking?.name || null : null,
        email: hasBooking ? booking?.email || null : null,
        booking_id: hasBooking ? booking?.id || null : null
      };
    });

    return NextResponse.json(transformedSlots);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slotId, name, email, country } = body;

    if (!slotId || !name || !email || !country) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // First, check if the slot exists and is available
    const { data: slot, error: fetchError } = await supabase
      .from('slots')
      .select(`
        *,
        bookings (id)
      `)
      .eq('id', slotId)
      .single();

    if (fetchError) {
      console.error('Error fetching slot:', fetchError);
      return NextResponse.json(
        { error: 'Slot not found' },
        { status: 404 }
      );
    }

    if (slot.bookings && slot.bookings.length > 0) {
      return NextResponse.json(
        { error: 'Slot is no longer available' },
        { status: 409 }
      );
    }

    // Create the booking
    const { data: newBooking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        slot_id: slotId,
        name,
        email,
        country
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Error creating booking:', bookingError);
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 }
      );
    }

    // TODO: Send email notification here
    // await sendBookingConfirmationEmail({ name, email, country, slot, booking: newBooking });

    return NextResponse.json({
      id: slot.id,
      date: slot.date,
      start_time: slot.start_time,
      end_time: slot.end_time,
      is_available: false,
      country,
      name,
      email,
      booking_id: newBooking.id
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}