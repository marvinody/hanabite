<script>
  import { onMount } from "svelte";
  import { fetchRoomList, roomList } from "../../stores";
  onMount(() => {
    fetchRoomList();
  });
  import RoomForm from "../../components/RoomForm";
</script>

<svelte:head>
  <title>Room list</title>
</svelte:head>

<RoomForm />
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
