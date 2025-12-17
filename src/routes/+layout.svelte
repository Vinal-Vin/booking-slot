<script lang="ts">
  import "../app.css";
  import type { Snippet } from "svelte";

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();
</script>

<svelte:head>
  <title>EU Delegation Meeting Booking</title>
  <meta name="description" content="Book 1-hour meeting slots with the EU delegation for January 26-28, 2025" />
</svelte:head>

<div class="font-sans antialiased">
  {@render children()}
</div>
