"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookingModal } from "../components/booking-modal"
import { CancelModal } from "../components/cancel-modal";
import { Clock, MapPin } from "lucide-react";

interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  country?: string;
  name?: string;
  email?: string;
  isAvailable: boolean;
}

interface TimeSlotCardProps {
  slot: TimeSlot;
  onBook: (slotId: string, bookingData: { name: string; email: string; country: string }) => Promise<void>;
  onCancel: (slotId: string, cancelData: { name: string; email: string }) => Promise<void>;
}

export function TimeSlotCard({ slot, onBook, onCancel }: TimeSlotCardProps) {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleBook = async (bookingData: { name: string; email: string; country: string }) => {
    setIsLoading(true);
    try {
      await onBook(slot.id, bookingData);
      setShowBookingModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (cancelData: { name: string; email: string }) => {
    setIsLoading(true);
    try {
      await onCancel(slot.id, cancelData);
      setShowCancelModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric"
    });
  };

  const formatTime = (time: string) => {
    // Convert 24-hour format to 12-hour format
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'pm' : 'am';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes}${ampm}`;
  };

  return (
    <>
      <Card className={`transition-all duration-200 ${!slot.isAvailable ? 'opacity-75 bg-muted/50' : 'hover:shadow-md'}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                </span>
                <Badge variant={slot.isAvailable ? "secondary" : "default"}>
                  {slot.isAvailable ? "Available" : "Booked"}
                </Badge>
              </div>
              
              <div className="text-sm text-muted-foreground">
                {formatDate(slot.date)}
              </div>

              {!slot.isAvailable && slot.country ? (
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <span className="text-muted-foreground">Attendees:</span>
                  <span className="text-primary">EU – {slot.country}</span>
                </div>
              ) : slot.isAvailable ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>EU – Available for booking</span>
                </div>
              ) : null}
            </div>

            <div className="flex gap-2 ml-4">
              {slot.isAvailable ? (
                <Button 
                  onClick={() => setShowBookingModal(true)}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Book
                </Button>
              ) : (
                <Button 
                  onClick={() => setShowCancelModal(true)}
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700 text-white border-red-600"
                  size="sm"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onSubmit={handleBook}
        timeSlot={`${formatDate(slot.date)} • ${formatTime(slot.startTime)} – ${formatTime(slot.endTime)}`}
        isLoading={isLoading}
      />

      <CancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onSubmit={handleCancel}
        timeSlot={`${formatDate(slot.date)} • ${formatTime(slot.startTime)} – ${formatTime(slot.endTime)}`}
        isLoading={isLoading}
      />
    </>
  );
}