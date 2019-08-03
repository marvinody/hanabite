<script>
  export let id;
  export let size;
  export let playerCount;
  export let spectatorCount;
  export let name;
  export let state;
  $: textState = stateToText(state);

  function stateToText(curState) {
    switch (curState) {
      case "ROOM_PREGAME":
        return "Waiting to Start";
    }
  }
</script>

<style>
  .title > .subtitle {
    font-size: 0.85em;
    color: grey;
  }
</style>

<a href="/rooms/{id}">
  <h5 class="title is-5">
    {name}
    <span class="subtitle">- {textState}</span>
  </h5>
  <h6 class="subtitle is-6">{playerCount} / {size} (+{spectatorCount})</h6>
</a>
