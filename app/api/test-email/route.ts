import { NextRequest, NextResponse } from 'next/server';
import { sendBookingNotification } from '@/lib/email/resend-service';

export async function POST(request: NextRequest) {
  try {
    console.log('Testing email service...');
    console.log('Environment variables check:');
    console.log('SMTP_PASS exists:', !!process.env.SMTP_PASS);
    console.log('FROM_EMAIL:', process.env.FROM_EMAIL);
    console.log('ORGANIZER_EMAIL:', process.env.ORGANIZER_EMAIL);

    const result = await sendBookingNotification({
      name: 'Test User',
      email: 'test@example.com',
      country: 'Test Country',
      date: '2025-01-26',
      startTime: '14:00',
      endTime: '15:00',
      slotId: 'test-slot-id'
    });

    return NextResponse.json({
      success: true,
      emailResult: result,
      config: {
        hasApiKey: !!process.env.SMTP_PASS,
        fromEmail: process.env.FROM_EMAIL,
        organizerEmail: process.env.ORGANIZER_EMAIL
      }
    });
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      config: {
        hasApiKey: !!process.env.SMTP_PASS,
        fromEmail: process.env.FROM_EMAIL,
        organizerEmail: process.env.ORGANIZER_EMAIL
      }
    }, { status: 500 });
  }
}