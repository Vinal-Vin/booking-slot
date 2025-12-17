<script lang="ts">
  import Dialog from "$lib/components/ui/Dialog.svelte";
  import DialogHeader from "$lib/components/ui/DialogHeader.svelte";
  import DialogTitle from "$lib/components/ui/DialogTitle.svelte";
  import DialogDescription from "$lib/components/ui/DialogDescription.svelte";
  import DialogFooter from "$lib/components/ui/DialogFooter.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import Input from "$lib/components/ui/Input.svelte";
  import Label from "$lib/components/ui/Label.svelte";
  import Alert from "$lib/components/ui/Alert.svelte";
  import AlertDescription from "$lib/components/ui/AlertDescription.svelte";
  import { Clock, AlertTriangle } from "lucide-svelte";

  interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { name: string; email: string }) => Promise<void>;
    timeSlot: string;
    isLoading?: boolean;
  }

  let { 
    isOpen = $bindable(false), 
    onClose, 
    onSubmit, 
    timeSlot, 
    isLoading = false 
  }: Props = $props();

  let formData = $state({
    name: "",
    email: ""
  });

  let errors = $state<Record<string, string>>({});

  function handleClose() {
    formData = { name: "", email: "" };
    errors = {};
    onClose();
  }

  function validateForm() {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    errors = newErrors;
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error("Cancellation failed:", error);
      errors = { ...errors, submit: "Failed to cancel booking. Please verify your details and try again." };
    }
  }
</script>

<Dialog open={isOpen} onClose={handleClose}>
  <DialogHeader>
    <DialogTitle>Cancel Booking</DialogTitle>
    <DialogDescription>
      Please enter the name and email used for the original booking to cancel this slot.
    </DialogDescription>
  </DialogHeader>

  <div class="flex items-center gap-2 p-3 bg-muted rounded-lg">
    <Clock class="h-4 w-4 text-muted-foreground" />
    <span class="text-sm font-medium">{timeSlot}</span>
  </div>

  <Alert class="border-amber-200 bg-amber-50 text-amber-800">
    <AlertTriangle class="h-4 w-4" />
    <AlertDescription>
      This action will cancel your booking and make the slot available for others.
    </AlertDescription>
  </Alert>

  <form onsubmit={handleSubmit} class="space-y-4">
    <div class="space-y-2">
      <Label for="cancel-name">Name *</Label>
      <Input
        id="cancel-name"
        type="text"
        placeholder="Enter the name used for booking"
        bind:value={formData.name}
        class={errors.name ? "border-destructive" : ""}
      />
      {#if errors.name}
        <p class="text-sm text-destructive">{errors.name}</p>
      {/if}
    </div>

    <div class="space-y-2">
      <Label for="cancel-email">Email *</Label>
      <Input
        id="cancel-email"
        type="email"
        placeholder="Enter the email used for booking"
        bind:value={formData.email}
        class={errors.email ? "border-destructive" : ""}
      />
      {#if errors.email}
        <p class="text-sm text-destructive">{errors.email}</p>
      {/if}
    </div>

    {#if errors.submit}
      <Alert variant="destructive">
        <AlertDescription>{errors.submit}</AlertDescription>
      </Alert>
    {/if}

    <DialogFooter>
      <Button type="button" variant="outline" onclick={handleClose}>
        Keep Booking
      </Button>
      <Button type="submit" variant="destructive" disabled={isLoading}>
        {isLoading ? "Cancelling..." : "Cancel Booking"}
      </Button>
    </DialogFooter>
  </form>
</Dialog>
