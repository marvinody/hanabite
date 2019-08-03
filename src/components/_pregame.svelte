<script>
  import { room } from "../stores";
</script>

<style>

</style>

<div class="columns">
  <div class="column">
    <div class="room-basic-info">
      <h1 class="title is-4">{$room.name}</h1>
      <h2 class="subtitle is-6">
        {$room.players.length} / {$room.size} players {$room.spectators.length > 0 ? ` + ${$room.spectators.length} spect.` : ''}
      </h2>
    </div>
  </div>
  <div class="column">CHAT</div>
</div>
