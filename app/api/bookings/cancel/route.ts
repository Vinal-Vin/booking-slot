import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { sendCancellationNotification } from '@/lib/email/resend-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slotId, name, email } = body;

    if (!slotId || !name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // First, find the booking for this slot
    const { data: slot, error: fetchError } = await supabase
      .from('slots')
      .select(`
        *,
        bookings!inner (
          id,
          name,
          email,
          country
        )
      `)
      .eq('id', slotId)
      .single();

    if (fetchError) {
      console.error('Error fetching slot:', fetchError);
      return NextResponse.json(
        { error: 'Slot not found or no booking exists' },
        { status: 404 }
      );
    }

    if (!slot || !slot.bookings) {
      return NextResponse.json(
        { error: 'No booking found for this slot' },
        { status: 400 }
      );
    }

    // With !inner join, bookings is an object, not an array
    const booking = slot.bookings;
    
    // Check if booking object is valid
    if (!booking || !booking.name || !booking.email) {
      return NextResponse.json(
        { error: 'Booking data is invalid' },
        { status: 500 }
      );
    }

    // Verify the name and email match the booking
    if (booking.name !== name || booking.email !== email) {
      return NextResponse.json(
        { error: 'Name and email do not match the booking details' },
        { status: 401 }
      );
    }

    // Delete the booking to make the slot available again
    const { error: deleteError } = await supabase
      .from('bookings')
      .delete()
      .eq('id', booking.id);

    if (deleteError) {
      console.error('Error deleting booking:', deleteError);
      return NextResponse.json(
        { error: 'Failed to cancel booking' },
        { status: 500 }
      );
    }

    // TODO: Send cancellation email notification here
    // Send email notification to organizer
    try {
      await sendCancellationNotification({
        name: booking.name,
        email: booking.email,
        country: booking.country,
        date: slot.date,
        startTime: slot.start_time,
        endTime: slot.end_time,
        slotId
      });
    } catch (emailError) {
      console.error('Email notification failed:', emailError);
      // Don't fail the cancellation if email fails
    }

    return NextResponse.json({
      id: slot.id,
      date: slot.date,
      start_time: slot.start_time,
      end_time: slot.end_time,
      is_available: true,
      country: null,
      name: null,
      email: null,
      booking_id: null
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}