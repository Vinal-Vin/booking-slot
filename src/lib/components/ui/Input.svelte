<script lang="ts">
  import { cn } from "$lib/utils";

  interface Props {
    class?: string;
    type?: "text" | "email" | "password" | "number";
    id?: string;
    placeholder?: string;
    value?: string;
    disabled?: boolean;
    required?: boolean;
  }

  let { 
    class: className = "", 
    type = "text",
    id,
    placeholder,
    value = $bindable(""),
    disabled = false,
    required = false
  }: Props = $props();
</script>

<input
  {type}
  {id}
  {placeholder}
  {disabled}
  {required}
  bind:value
  class={cn(
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
    className
  )}
/>
