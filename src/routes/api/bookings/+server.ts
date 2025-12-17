import { createClient } from '$lib/supabase/server';
import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { sendBookingNotification } from '$lib/email/resend-service';

export async function GET({ cookies }: RequestEvent) {
  try {
    const supabase = createClient(cookies);
    
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
      return json(
        { error: 'Failed to fetch slots' },
        { status: 500 }
      );
    }

    const transformedSlots = slots.map(slot => {
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

    return json(transformedSlots);
  } catch (error) {
    console.error('Unexpected error:', error);
    return json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST({ request, cookies }: RequestEvent) {
  try {
    const body = await request.json();
    const { slotId, name, email, country } = body;

    if (!slotId || !name || !email || !country) {
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
        bookings (id)
      `)
      .eq('id', slotId)
      .single();

    if (fetchError) {
      console.error('Error fetching slot:', fetchError);
      return json(
        { error: 'Slot not found' },
        { status: 404 }
      );
    }

    if (slot.bookings && slot.bookings.length > 0) {
      return json(
        { error: 'Slot is no longer available' },
        { status: 409 }
      );
    }

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
      return json(
        { error: 'Failed to create booking' },
        { status: 500 }
      );
    }

    try {
      await sendBookingNotification({
        name,
        email,
        country,
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
      is_available: false,
      country,
      name,
      email,
      booking_id: newBooking.id
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
