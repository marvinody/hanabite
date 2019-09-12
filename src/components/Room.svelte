<script>
  import { onDestroy } from "svelte";
  import PregameRoom from "./Pregame.svelte";
  import IngameRoom from "./Ingame.svelte";
  import { room, leaveRoom } from "../stores/";
  $: ({ loaded, id, state } = $room);

  onDestroy(leaveRoom);
</script>

{#if loaded && id > 0}
  <!-- So loaded and valid, now let's check the state -->
  {#if state === 'ROOM_PREGAME'}
    <PregameRoom />
  {:else if state === 'ROOM_INGAME'}
    <IngameRoom />
  {/if}
{:else if loaded && !id}
  <div>Connection issue. Try reconnecting or picking a different room.</div>
{:else}
  <div>Loading...</div>
{/if}
