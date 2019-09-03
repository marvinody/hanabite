<script>
  import { room, self, game, hands } from "../stores/";
  import Chat from "./Chat";
  import Field from "./game/Board.svelte";
  import Hands from "./game/Hands.svelte";

  $: ({ field, tokens } = $game);
</script>

<style>

</style>

<div class="columns">
  <div class="column">
    <div class="game">
      {#if !$game.loaded}
        <div>Loading...</div>
      {:else}
        <Field {field} {tokens} />
      {/if}

      {#if !$hands.loaded}
        <div>Loading Hands...</div>
      {:else}
        <Hands hands={$hands} />
      {/if}
    </div>
  </div>
  <Chat />
</div>
