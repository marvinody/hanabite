<script>
  import { game } from "../../stores";
  $: ({ info, fuse } = $game.tokens);

  $: currentInfoTokens = new Array(info.current).fill(1);
  $: usedInfoTokenCount = Math.max(0, info.starting - info.current);
  $: usedInfoTokens = new Array(usedInfoTokenCount).fill(-1);

  $: currentFuseTokens = new Array(fuse.current).fill(2);
  $: usedFuseTokenCount = Math.max(0, fuse.starting - fuse.current);
  $: usedFuseTokens = new Array(usedFuseTokenCount).fill(-2);
</script>

<style>
  .tokens {
    display: flex;
    flex-direction: column;
    font-size: 2em;
  }
  .info-tokens,
  .fuse-tokens {
    display: flex;
    justify-content: space-around;
  }
  .info-tokens .active {
    color: #209cee;
  }
  .info-tokens .inactive {
    color: grey;
  }
  .fuse-tokens .active {
    color: black;
  }
  .fuse-tokens .inactive {
    color: grey;
    opacity: 0.3;
  }
</style>

<div class="tokens">
  <div class="info-tokens">
    {#each currentInfoTokens as _}
      <i class="fas fa-info-circle active" />
    {/each}
    {#each usedInfoTokens as _}
      <i class="fas fa-info-circle inactive" />
    {/each}
  </div>
  <div class="fuse-tokens">
    {#each usedFuseTokens as _}
      <i class="fas fa-bomb active" />
    {/each}
    {#each currentFuseTokens as _}
      <i class="fas fa-bomb inactive" />
    {/each}
  </div>
</div>
