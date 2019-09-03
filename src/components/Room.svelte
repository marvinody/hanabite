<script>
  const testRoom = {
    id: 5,
    name: "My room is my room",
    state: "ROOM_PREGAME",
    host: { name: "delicate_paper", id: 4 },
    size: 2,
    curPlayer: 0,
    players: [{ name: "delicate_paper", id: 4 }],
    spectators: [],
    loaded: true
  };
  import PregameRoom from "./Pregame.svelte";
  import IngameRoom from "./Ingame.svelte";
  import { room } from "../stores/";
  $: ({ loaded, id, state } = $room);
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
