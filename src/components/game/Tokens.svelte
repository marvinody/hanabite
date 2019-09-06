<script>
  import { game } from "../../stores";
  $: ({ info, fuse } = $game.tokens);

  // make arrays of how current, starting-current
  // the arrays will hold true/false and then we concat them
  // in a certain order
  // traversing this, we can display with the flag as
  $: currentInfoTokens = new Array(info.current).fill(true);
  $: usedInfoTokenCount = Math.max(0, info.starting - info.current);
  $: usedInfoTokens = new Array(usedInfoTokenCount).fill(false);
  $: infoTokens = [].concat(currentInfoTokens, usedInfoTokens);

  $: currentFuseTokens = new Array(fuse.current).fill(false);
  $: usedFuseTokenCount = Math.max(0, fuse.starting - fuse.current);
  $: usedFuseTokens = new Array(usedFuseTokenCount).fill(true);
  $: fuseTokens = [].concat(usedFuseTokens, currentFuseTokens);
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
    {#each infoTokens as token}
      <span class:active={token} class:inactive={!token}>
        <i class="fas fa-info-circle" />
      </span>
    {/each}
  </div>
  <div class="fuse-tokens">
    {#each fuseTokens as token}
      <span class:active={token} class:inactive={!token}>
        <i class="fas fa-bomb" />
      </span>
    {/each}
  </div>
</div>
