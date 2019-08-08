<script>
  import { room, self } from "../stores";
  import Chat from "./Chat";
  $: allPlayersReady =
    $room.players && $room.players.every(player => player.ready);
  $: emptyPlayers = $room.players
    ? new Array($room.size - $room.players.length)
    : [];
  $: host = $room && $room.host.id === $self.id;
</script>

<style>
  .room-basic-info h1 {
    text-align: center;
    text-decoration: underline;
  }
  .room-player-info {
    margin-top: 10px;
  }
  .room-player-info > .title {
    margin-bottom: 5px;
  }
  .self {
    font-weight: bolder;
  }
  .host::after {
    margin-left: 5px;
    content: "(HOST)";
    font-size: 0.8em;
  }
  .room-player-list {
    display: flex;
    flex-direction: column;
  }
  .room-sub-info {
    display: flex;
    justify-content: space-around;
  }
  .player {
    padding: 10px;
  }
</style>

<div class="columns">
  <div class="column">
    <div class="room-basic-info">
      <h1 class="title is-4">{$room.name}</h1>
      <div class="room-sub-info">
        <h2>
          {$room.players.length} / {$room.size} players {$room.spectators.length > 0 ? ` + ${$room.spectators.length} spect.` : ''}
        </h2>
        {#if host}
          <button disabled={!allPlayersReady} class="button is-info">
            Start
          </button>
        {:else}
          <button class="button is-info">
            {#if self.ready}Ready Down{:else}Ready Up{/if}
          </button>
        {/if}

      </div>
    </div>
    <div class="room-player-info">
      <h1 class="title is-4">Players:</h1>
      <div class="room-player-list">
        {#each $room.players as player (player.id)}
          <div class="player">
            {#if player.ready}
              <span class="icon has-text-success">
                <i class="fas fa-check-circle" />
              </span>
            {:else}
              <span class="icon has-text-warning">
                <i class="fas fa-dot-circle" />
              </span>
            {/if}
            <span
              class:host={player.id === $room.host.id}
              class:self={player.id === $self.id}>
              {player.name}
            </span>
          </div>
        {/each}
        <!-- Display placeholders for each player not yet in -->
        {#each emptyPlayers as empty}
          <div class="player">
            <span class="icon has-text-success">
              <i class="fas fa-check-circle" />
            </span>
            <span>AI Player</span>
          </div>
        {/each}
      </div>
    </div>
  </div>
  <Chat />
</div>
