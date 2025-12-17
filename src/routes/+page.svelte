<script lang="ts">
  import { onMount } from "svelte";
  import TimeSlotCard from "$lib/components/TimeSlotCard.svelte";
  import Alert from "$lib/components/ui/Alert.svelte";
  import AlertDescription from "$lib/components/ui/AlertDescription.svelte";
  import Badge from "$lib/components/ui/Badge.svelte";
  import { Calendar, Clock, Globe } from "lucide-svelte";

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

  let slots = $state<TimeSlot[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);

  onMount(() => {
    fetchSlots();
  });

  async function fetchSlots() {
    try {
      error = null;
      const response = await fetch("/api/bookings");
      
      if (!response.ok) {
        throw new Error("Failed to fetch slots");
      }
      
      const data = await response.json();
      slots = data;
    } catch (err) {
      console.error("Error fetching slots:", err);
      error = "Failed to load booking slots. Please refresh the page.";
    } finally {
      loading = false;
    }
  }

  async function handleBooking(slotId: string, bookingData: BookingData) {
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

      await fetchSlots();
    } catch (error) {
      console.error("Booking error:", error);
      throw error;
    }
  }

  async function handleCancellation(slotId: string, cancelData: CancelData) {
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

      await fetchSlots();
    } catch (error) {
      console.error("Cancellation error:", error);
      throw error;
    }
  }

  function groupSlotsByDate(slots: TimeSlot[]) {
    return slots.reduce((groups, slot) => {
      const date = slot.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(slot);
      return groups;
    }, {} as Record<string, TimeSlot[]>);
  }

  function formatDateHeader(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  }

  function getAvailableCount(slots: TimeSlot[]) {
    return slots.filter(slot => slot.is_available).length;
  }

  const groupedSlots = $derived(groupSlotsByDate(slots));
  const totalAvailable = $derived(slots.filter(slot => slot.is_available).length);
</script>

{#if loading}
  <div class="min-h-screen bg-background flex items-center justify-center">
    <div class="text-center space-y-4">
      <Clock class="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
      <p class="text-muted-foreground">Loading meeting slots...</p>
    </div>
  </div>
{:else if error}
  <div class="min-h-screen bg-background flex items-center justify-center p-4">
    <Alert variant="destructive" class="max-w-md">
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  </div>
{:else}
  <div class="min-h-screen bg-background">
    <div class="container mx-auto px-4 py-8 max-w-4xl">
      <!-- Header -->
      <div class="text-center space-y-4 mb-12">
        <div class="flex justify-center items-center gap-2 mb-2">
          <Globe class="h-8 w-8 text-primary" />
          <h1 class="text-4xl font-bold text-foreground">11<sup class="text-2xl">th</sup> IEPA Trade Committee</h1>
        </div>
        <h2 class="text-2xl font-semibold text-muted-foreground">
          Bilateral Meeting Slot Booking
        </h2>
        <p class="text-muted-foreground max-w-2xl mx-auto">
          Book your 1-hour meeting slot with the EU delegation for January 26–28, 2026. 
          Select an available slot and provide your details to confirm your booking.
        </p>
        <div class="flex items-center justify-center gap-2 mt-4">
          <Badge variant="secondary" class="text-sm">
            {totalAvailable} slots available
          </Badge>
        </div>
      </div>

      <!-- Booking Slots -->
      <div class="space-y-8">
        {#each Object.entries(groupedSlots) as [date, dateSlots]}
          <div class="space-y-4">
            <div class="flex items-center justify-between border-b pb-2">
              <div class="flex items-center gap-3">
                <Calendar class="h-5 w-5 text-muted-foreground" />
                <h3 class="text-xl font-semibold">{formatDateHeader(date)}</h3>
              </div>
              <Badge variant="outline">
                {getAvailableCount(dateSlots)} of {dateSlots.length} available
              </Badge>
            </div>
            
            <div class="grid gap-4">
              {#each dateSlots as slot (slot.id)}
                <TimeSlotCard
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
              {/each}
            </div>
          </div>
        {/each}
      </div>

      <!-- Footer -->
      <div class="mt-16 pt-8 border-t text-center text-sm text-muted-foreground">
        <p>
          All meetings are 1-hour sessions. Please ensure you arrive on time for your scheduled slot.
        </p>
        <p class="mt-2">
          For technical support or questions, please contact the meeting organizer: fijimfaet.11iepatradecommittee@gmail.com.
        </p>
      </div>
    </div>
  </div>
{/if}
