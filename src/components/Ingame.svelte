<script>
  import { room, self, game } from "../stores";
  import Chat from "./Chat";

  $: {
    console.groupCollapsed('changed game')
    console.log({$game})
    const field = $game.field;
    console.log({field})
    console.groupEnd()
  }
</script>

<style>

</style>

<div class="columns">
  <div class="column">
    {#if !$game.loaded}
      <div>Loading...</div>
    {:else}
      <div class="game">
        <div class="field">
          {#each Object.entries($game.field) as [color, count] (color)}
            <div>{color} - {count}</div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
  <Chat />
</div>
