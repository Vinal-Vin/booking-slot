<script lang="ts">
  import Card from "$lib/components/ui/Card.svelte";
  import CardContent from "$lib/components/ui/CardContent.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import Badge from "$lib/components/ui/Badge.svelte";
  import BookingModal from "$lib/components/BookingModal.svelte";
  import CancelModal from "$lib/components/CancelModal.svelte";
  import { Clock } from "lucide-svelte";

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

  interface Props {
    slot: TimeSlot;
    onBook: (slotId: string, bookingData: { name: string; email: string; country: string }) => Promise<void>;
    onCancel: (slotId: string, cancelData: { name: string; email: string }) => Promise<void>;
  }

  let { slot, onBook, onCancel }: Props = $props();

  let showBookingModal = $state(false);
  let showCancelModal = $state(false);
  let isLoading = $state(false);

  async function handleBook(bookingData: { name: string; email: string; country: string }) {
    isLoading = true;
    try {
      await onBook(slot.id, bookingData);
      showBookingModal = false;
    } finally {
      isLoading = false;
    }
  }

  async function handleCancel(cancelData: { name: string; email: string }) {
    isLoading = true;
    try {
      await onCancel(slot.id, cancelData);
      showCancelModal = false;
    } finally {
      isLoading = false;
    }
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric"
    });
  }

  function formatTime(time: string) {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'pm' : 'am';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes}${ampm}`;
  }

  const timeSlotStr = $derived(`${formatDate(slot.date)} • ${formatTime(slot.startTime)} – ${formatTime(slot.endTime)}`);
</script>

<Card class={!slot.isAvailable ? 'opacity-75 bg-muted/50' : 'hover:shadow-md transition-all duration-200'}>
  <CardContent class="p-6">
    <div class="flex items-center justify-between">
      <div class="flex-1 space-y-2">
        <div class="flex items-center gap-2">
          <Clock class="h-4 w-4 text-muted-foreground" />
          <span class="font-medium">
            {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
          </span>
          <Badge variant={slot.isAvailable ? "secondary" : "default"}>
            {slot.isAvailable ? "Available" : "Booked"}
          </Badge>
        </div>
        
        <div class="text-sm text-muted-foreground">
          {formatDate(slot.date)}
        </div>

        {#if !slot.isAvailable && slot.country}
          <div class="flex items-center gap-2 text-sm font-medium text-foreground">
            <span class="text-muted-foreground">Attendees:</span>
            <span class="text-primary">EU – {slot.country}</span>
          </div>
        {:else if slot.isAvailable}
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <span>EU – Available for booking</span>
          </div>
        {/if}
      </div>

      <div class="flex gap-2 ml-4">
        {#if slot.isAvailable}
          <Button 
            onclick={() => showBookingModal = true}
            disabled={isLoading}
            class="bg-green-600 hover:bg-green-700 text-white"
          >
            Book
          </Button>
        {:else}
          <Button 
            onclick={() => showCancelModal = true}
            disabled={isLoading}
            class="bg-red-600 hover:bg-red-700 text-white border-red-600"
            size="sm"
          >
            Cancel
          </Button>
        {/if}
      </div>
    </div>
  </CardContent>
</Card>

<BookingModal
  bind:isOpen={showBookingModal}
  onClose={() => showBookingModal = false}
  onSubmit={handleBook}
  timeSlot={timeSlotStr}
  {isLoading}
/>

<CancelModal
  bind:isOpen={showCancelModal}
  onClose={() => showCancelModal = false}
  onSubmit={handleCancel}
  timeSlot={timeSlotStr}
  {isLoading}
/>
