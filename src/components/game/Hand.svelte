<script>
  export let cards = [];
  export let id = "";
  export let name = "";

  import { fade } from "svelte/transition";
  import {
    self as myself,
    game,
    selectedCard,
    playCard,
    discard
  } from "../../stores/";
  import PlayerCard from "./PlayerCard.svelte";

  $: self = $myself.id === id;
  $: rowSelect = id === $selectedCard.id;
  $: currentPlayer = $game.currentPlayer.id === id;
  $: active = $selectedCard.idx > -1 && $selectedCard.id > -1 && currentPlayer;
</script>

<style>
  .hand {
    display: flex;
    flex-direction: column;
    padding-top: 30px;
    border-top: 1px solid black;
  }

  .name.self {
    font-weight: bold;
  }
  .name.self::after {
    margin-left: 10px;
    content: "(you)";
  }

  .cards {
    display: flex;
    justify-content: space-around;
  }
  .cards > div {
    cursor: pointer;
  }
  .chevron {
    opacity: 0;
  }
  .buttons {
    display: flex;
    justify-content: space-around;
  }
  button {
    opacity: 0;
    cursor: default;
    transition: opacity 0.3s ease-in-out;
  }
  .active {
    opacity: 1;
  }
  button {
    cursor: pointer;
  }
</style>

<div class="hand">
  <div class="buttons" class:active>
    {#if self}
      <button
        class="button is-link"
        class:active={self && rowSelect}
        on:click={playCard}>
        Play
      </button>
      <button
        class="button is-link"
        class:active={self && rowSelect}
        on:click={discard}>
        Discard
      </button>
    {:else}
      <button
        class="button is-link"
        class:active={!self && rowSelect}
        on:click={playCard}>
        Color
      </button>
      <button
        class="button is-link"
        class:active={!self && rowSelect}
        on:click={playCard}>
        Value
      </button>
    {/if}
  </div>
  <div class="cards">
    {#each cards as { color, value }, idx}
      <PlayerCard {color} {value} {id} {idx} />
    {/each}
  </div>
  <div class="name" class:self>
    <span class="chevron" class:active={currentPlayer}>
      <i class="fa fa-chevron-right" />
    </span>
    {name}
  </div>
</div>
