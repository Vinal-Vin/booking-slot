import { createClient } from '$lib/supabase/server';
import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { sendCancellationNotification } from '$lib/email/resend-service';

export async function POST({ request, cookies }: RequestEvent) {
  try {
    const body = await request.json();
    const { slotId, name, email } = body;

    if (!slotId || !name || !email) {
      return json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createClient(cookies);
    
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
      return json(
        { error: 'Slot not found or no booking exists' },
        { status: 404 }
      );
    }

    if (!slot || !slot.bookings) {
      return json(
        { error: 'No booking found for this slot' },
        { status: 400 }
      );
    }

    const booking = slot.bookings;
    
    if (!booking || !booking.name || !booking.email) {
      return json(
        { error: 'Booking data is invalid' },
        { status: 500 }
      );
    }

    if (booking.name !== name || booking.email !== email) {
      return json(
        { error: 'Name and email do not match the booking details' },
        { status: 401 }
      );
    }

    const { error: deleteError } = await supabase
      .from('bookings')
      .delete()
      .eq('id', booking.id);

    if (deleteError) {
      console.error('Error deleting booking:', deleteError);
      return json(
        { error: 'Failed to cancel booking' },
        { status: 500 }
      );
    }

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
    }

    return json({
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
    return json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
