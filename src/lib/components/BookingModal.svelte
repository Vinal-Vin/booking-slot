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
  import { Clock } from "lucide-svelte";

  interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { name: string; email: string; country: string }) => Promise<void>;
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
    email: "",
    country: ""
  });

  let errors = $state<Record<string, string>>({});

  function handleClose() {
    formData = { name: "", email: "", country: "" };
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

    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
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
      console.error("Booking failed:", error);
      errors = { ...errors, submit: "Failed to book slot. Please try again." };
    }
  }
</script>

<Dialog open={isOpen} onClose={handleClose}>
  <DialogHeader>
    <DialogTitle>Book Meeting Slot</DialogTitle>
    <DialogDescription>
      Please provide your details to book this time slot with the EU delegation.
    </DialogDescription>
  </DialogHeader>

  <div class="flex items-center gap-2 p-3 bg-muted rounded-lg">
    <Clock class="h-4 w-4 text-muted-foreground" />
    <span class="text-sm font-medium">{timeSlot}</span>
  </div>

  <form onsubmit={handleSubmit} class="space-y-4">
    <div class="space-y-2">
      <Label for="name">Name *</Label>
      <Input
        id="name"
        type="text"
        placeholder="Enter your full name"
        bind:value={formData.name}
        class={errors.name ? "border-destructive" : ""}
      />
      {#if errors.name}
        <p class="text-sm text-destructive">{errors.name}</p>
      {/if}
    </div>

    <div class="space-y-2">
      <Label for="email">Email *</Label>
      <Input
        id="email"
        type="email"
        placeholder="Enter your email address"
        bind:value={formData.email}
        class={errors.email ? "border-destructive" : ""}
      />
      {#if errors.email}
        <p class="text-sm text-destructive">{errors.email}</p>
      {/if}
    </div>

    <div class="space-y-2">
      <Label for="country">Country *</Label>
      <Input
        id="country"
        type="text"
        placeholder="Enter your country"
        bind:value={formData.country}
        class={errors.country ? "border-destructive" : ""}
      />
      {#if errors.country}
        <p class="text-sm text-destructive">{errors.country}</p>
      {/if}
    </div>

    {#if errors.submit}
      <Alert variant="destructive">
        <AlertDescription>{errors.submit}</AlertDescription>
      </Alert>
    {/if}

    <DialogFooter>
      <Button type="button" variant="outline" onclick={handleClose}>
        Cancel
      </Button>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Booking..." : "Book Slot"}
      </Button>
    </DialogFooter>
  </form>
</Dialog>
