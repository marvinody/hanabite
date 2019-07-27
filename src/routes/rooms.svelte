<script>
  import { onMount } from "svelte";
  import { fetchRoomList, roomList } from "../stores";
  onMount(() => {
    fetchRoomList();
  });
</script>

<svelte:head>
  <title>Room list</title>
</svelte:head>

<ul>
  {#if $roomList.loaded && $roomList.length > 0}
    {#each $roomList as room}
      <li />
    {/each}
  {:else if $roomList.loaded && $roomList.length === 0}
    <p>No lobbies</p>
  {:else}
    <p>Loading lobbies</p>
  {/if}
</ul>
