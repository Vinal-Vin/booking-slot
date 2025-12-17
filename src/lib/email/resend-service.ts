import { Resend } from 'resend';

const resend = process.env.SMTP_PASS ? new Resend(process.env.SMTP_PASS) : null; // Using SMTP_PASS as the Resend API key

// For development, you can use onboarding@resend.dev
// For production, you'll need to verify your own domain
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';

interface BookingEmailData {
  name: string;
  email: string;
  country: string;
  date: string;
  startTime: string;
  endTime: string;
  slotId: string;
}

interface CancellationEmailData {
  name: string;
  email: string;
  country: string;
  date: string;
  startTime: string;
  endTime: string;
  slotId: string;
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });
};

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

export async function sendBookingNotification(bookingData: BookingEmailData) {
  const { name, email, country, date, startTime, endTime } = bookingData;
  const formattedDate = formatDate(date);
  const formattedStartTime = formatTime(startTime);
  const formattedEndTime = formatTime(endTime);

  console.log('🔧 Email Debug Info:');
  console.log('API Key exists:', !!process.env.SMTP_PASS);
  console.log('API Key preview:', process.env.SMTP_PASS?.substring(0, 10) + '...');
  console.log('FROM_EMAIL:', FROM_EMAIL);
  console.log('TO_EMAIL:', process.env.ORGANIZER_EMAIL);

  if (!resend) {
    console.warn('⚠️ Resend not configured. Email notification skipped.');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    // Send notification to organizer
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: [process.env.ORGANIZER_EMAIL!],
      subject: `New Booking: EU-${country} Meeting - ${formattedDate}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
            .header { background-color: #1e40af; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9fafb; }
            .booking-details { background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
            .label { font-weight: bold; color: #374151; }
            .value { margin-left: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>11th IEPA Trade Committee Bilateral</h1>
              <p>New Booking Confirmation</p>
            </div>
            
            <div class="content">
              <h2>New Meeting Booked</h2>
              <p>A new meeting slot has been booked with the EU delegation.</p>
              
              <div class="booking-details">
                <h3>Meeting Details</h3>
                <p><span class="label">Date:</span><span class="value">${formattedDate}</span></p>
                <p><span class="label">Time:</span><span class="value">${formattedStartTime} – ${formattedEndTime}</span></p>
                <p><span class="label">Attendees:</span><span class="value">EU – ${country}</span></p>
              </div>
              
              <div class="booking-details">
                <h3>Contact Information</h3>
                <p><span class="label">Name:</span><span class="value">${name}</span></p>
                <p><span class="label">Email:</span><span class="value">${email}</span></p>
                <p><span class="label">Country:</span><span class="value">${country}</span></p>
              </div>
            </div>
            
            <div class="footer">
              <p>IEPA Trade Committee Bilateral System</p>
              <p>This is an automated notification. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log('✅ Email sent successfully:', result);
    return { success: true };
  } catch (error) {
    console.error('❌ Email send failed:');
    console.error('Error details:', error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    return { success: false, error: error instanceof Error ? error.message : 'Email service unavailable' };
  }
}

export async function sendCancellationNotification(cancellationData: CancellationEmailData) {
  const { name, email, country, date, startTime, endTime } = cancellationData;
  const formattedDate = formatDate(date);
  const formattedStartTime = formatTime(startTime);
  const formattedEndTime = formatTime(endTime);

  console.log('🔧 Cancellation Email Debug Info:');
  console.log('API Key exists:', !!process.env.SMTP_PASS);
  console.log('FROM_EMAIL:', FROM_EMAIL);
  console.log('TO_EMAIL:', process.env.ORGANIZER_EMAIL);

  if (!resend) {
    console.warn('⚠️ Resend not configured. Email notification skipped.');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    // Send notification to organizer
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: [process.env.ORGANIZER_EMAIL!],
      subject: `Booking Cancelled: EU-${country} Meeting - ${formattedDate}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
            .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9fafb; }
            .booking-details { background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
            .label { font-weight: bold; color: #374151; }
            .value { margin-left: 10px; }
            .available { color: #059669; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>11th IEPA Trade Committee Bilateral</h1>
              <p>Booking Cancellation Notice</p>
            </div>
            
            <div class="content">
              <h2>Meeting Booking Cancelled</h2>
              <p>A meeting slot has been cancelled and is now available for booking.</p>
              
              <div class="booking-details">
                <h3>Cancelled Meeting Details</h3>
                <p><span class="label">Date:</span><span class="value">${formattedDate}</span></p>
                <p><span class="label">Time:</span><span class="value">${formattedStartTime} – ${formattedEndTime}</span></p>
                <p><span class="label">Previous Attendees:</span><span class="value">EU – ${country}</span></p>
                <p><span class="available">Status: Now Available for Booking</span></p>
              </div>
              
              <div class="booking-details">
                <h3>Cancelled By</h3>
                <p><span class="label">Name:</span><span class="value">${name}</span></p>
                <p><span class="label">Email:</span><span class="value">${email}</span></p>
                <p><span class="label">Country:</span><span class="value">${country}</span></p>
              </div>
            </div>
            
            <div class="footer">
              <p>IEPA Trade Committee Bilateral System</p>
              <p>This is an automated notification. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log('✅ Cancellation email sent successfully:', result);
    return { success: true };
  } catch (error) {
    console.error('❌ Cancellation email send failed:');
    console.error('Error details:', error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    return { success: false, error: error instanceof Error ? error.message : 'Email service unavailable' };
  }
}