<script>
  import { hands } from "../../stores/";

  import Hand from "./Hand.svelte";
</script>

<div class="hands">
  {#each $hands as { cards, id, name } (id)}
    <Hand {cards} {id} {name} />
  {/each}
</div>
