<script lang="ts">
  import { cn } from "$lib/utils";
  import type { Snippet } from "svelte";

  interface Props {
    variant?: "default" | "destructive";
    class?: string;
    children: Snippet;
  }

  let { variant = "default", class: className = "", children }: Props = $props();

  const variantClasses = {
    default: "bg-background text-foreground",
    destructive: "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive"
  };
</script>

<div
  role="alert"
  class={cn(
    "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
    variantClasses[variant],
    className
  )}
>
  {@render children()}
</div>
