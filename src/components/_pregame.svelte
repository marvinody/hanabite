<script>
  import { room } from "../stores";
</script>

<style>
  .room-player-info {
    margin-top: 10px;
  }
  .room-player-info > .title {
    margin-bottom: 5px;
  }
  .host::before {
    content: "*";
  }
</style>

<div class="columns">
  <div class="column">
    <div class="room-basic-info">
      <h1 class="title is-4">{$room.name}</h1>
      <h2 class="subtitle is-6">
        {$room.players.length} / {$room.size} players {$room.spectators.length > 0 ? ` + ${$room.spectators.length} spect.` : ''}
      </h2>
    </div>
    <div class="room-player-info">
      <h1 class="title is-4">Players:</h1>
      <div class="room-player-list columns">
        {#each $room.players as player (player.id)}
          <div class="column" class:host={player.id === $room.host.id}>
            {player.name}
          </div>
        {/each}
      </div>
    </div>
  </div>
  <div class="column">CHAT</div>
</div>
