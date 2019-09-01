<script>
  export let color = "grey";
  export let value = "";
</script>

<style>
  .game-card {
    height: 70px;
    width: 50px;
    border: 1px solid gray;
    font-size: 3em;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .white {
    background-color: white;
  }
  .yellow {
    background-color: yellow;
  }
  .green {
    background-color: green;
  }
  .blue {
    background-color: blue;
  }
  .red {
    background-color: red;
  }
  .grey {
    background-color: #c8c8c8;
  }
  .outline {
    color: white;
    text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000,
      1px 1px 0 #000;
  }
</style>

<div class="game-card outline {color}">{value}</div>
