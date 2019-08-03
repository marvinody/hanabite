<script>
  import { onMount } from "svelte";
  import { stores } from "@sapper/app";
  const { page } = stores();
  const { params } = $page;
  const { slug } = params;

  import { joinRoom, room } from "../../stores";
  onMount(() => {
    joinRoom(slug);
  });
  import Room from "../../components/Room";
  let title = "Loading room";
  $: {
    if ($room.loaded && $room.id > 0) {
      title = $room.name;
    } else if ($room.loaded && !$room.id) {
      title = "Connection issue";
    }
  }
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<Room />
