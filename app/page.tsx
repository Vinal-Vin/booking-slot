"use client";

import { useEffect, useState } from "react";
import { TimeSlotCard } from "@/components/time-slot-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Globe } from "lucide-react";

interface TimeSlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  country?: string;
  name?: string;
  email?: string;
  is_available: boolean;
}

interface BookingData {
  name: string;
  email: string;
  country: string;
}

interface CancelData {
  name: string;
  email: string;
}

export default function Home() {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      setError(null);
      const response = await fetch("/api/bookings");
      
      if (!response.ok) {
        throw new Error("Failed to fetch slots");
      }
      
      const data = await response.json();
      setSlots(data);
    } catch (err) {
      console.error("Error fetching slots:", err);
      setError("Failed to load booking slots. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (slotId: string, bookingData: BookingData) => {
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slotId, ...bookingData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to book slot");
      }

      // Refresh slots to show updated status
      await fetchSlots();
    } catch (error) {
      console.error("Booking error:", error);
      throw error;
    }
  };

  const handleCancellation = async (slotId: string, cancelData: CancelData) => {
    try {
      const response = await fetch("/api/bookings/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slotId, ...cancelData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to cancel booking");
      }

      // Refresh slots to show updated status
      await fetchSlots();
    } catch (error) {
      console.error("Cancellation error:", error);
      throw error;
    }
  };

  const groupSlotsByDate = (slots: TimeSlot[]) => {
    return slots.reduce((groups, slot) => {
      const date = slot.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(slot);
      return groups;
    }, {} as Record<string, TimeSlot[]>);
  };

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  };

  const getAvailableCount = (slots: TimeSlot[]) => {
    return slots.filter(slot => slot.is_available).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Clock className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">Loading meeting slots...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const groupedSlots = groupSlotsByDate(slots);
  const totalAvailable = slots.filter(slot => slot.is_available).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="flex justify-center items-center gap-2 mb-2">
            <Globe className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">11<sup className="text-2xl">th</sup> IEPA Trade Committee</h1>
          </div>
          <h2 className="text-2xl font-semibold text-muted-foreground">
            Bilateral Meeting Slot Booking
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Book your 1-hour meeting slot with the EU delegation for January 26–28, 2026. 
            Select an available slot and provide your details to confirm your booking.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Badge variant="secondary" className="text-sm">
              {totalAvailable} slots available
            </Badge>
          </div>
        </div>

        {/* Booking Slots */}
        <div className="space-y-8">
          {Object.entries(groupedSlots).map(([date, dateSlots]) => (
            <div key={date} className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-xl font-semibold">{formatDateHeader(date)}</h3>
                </div>
                <Badge variant="outline">
                  {getAvailableCount(dateSlots)} of {dateSlots.length} available
                </Badge>
              </div>
              
              <div className="grid gap-4">
                {dateSlots.map((slot) => (
                  <TimeSlotCard
                    key={slot.id}
                    slot={{
                      id: slot.id,
                      date: slot.date,
                      startTime: slot.start_time,
                      endTime: slot.end_time,
                      country: slot.country,
                      name: slot.name,
                      email: slot.email,
                      isAvailable: slot.is_available,
                    }}
                    onBook={handleBooking}
                    onCancel={handleCancellation}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>
            All meetings are 1-hour sessions. Please ensure you arrive on time for your scheduled slot.
          </p>
          <p className="mt-2">
            For technical support or questions, please contact the meeting organizer: fijimfaet.11iepatradecommittee@gmail.com.
          </p>
        </div>
      </div>
    </div>
  );
}
