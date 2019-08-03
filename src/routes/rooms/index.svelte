<script>
  import { onMount } from "svelte";
  import { fetchRoomList, roomList } from "../../stores";
  onMount(() => {
    fetchRoomList();
  });
  import RoomForm from "../../components/RoomForm";
  import RoomListItem from "../../components/RoomListItem";
</script>

<style>
  li {
    padding: 16px;
    margin: 8px;
    border: 2px solid black;
  }
  li:hover {
    background-color: #eee;
  }
</style>

<svelte:head>
  <title>Room list</title>
</svelte:head>

<RoomForm />
<ul>
  {#if $roomList.loaded && $roomList.length > 0}
    {#each $roomList as room (room.id)}
      <li>
        <RoomListItem {...room} />
      </li>
    {/each}
  {:else if $roomList.loaded && $roomList.length === 0}
    <p>No lobbies. Create your own!</p>
  {:else}
    <p>Loading lobbies</p>
  {/if}
</ul>
