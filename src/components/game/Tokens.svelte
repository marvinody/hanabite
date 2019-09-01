<script>
  export let info = {};
  export let fuse = {};

  const currentInfoTokens = Array.from(new Array(info.current));
  const usedInfoTokenCount = Math.max(0, info.starting - info.current);
  const usedInfoTokens = Array.from(new Array(usedInfoTokenCount));

  const currentFuseTokens = Array.from(new Array(fuse.current));
  const usedFuseTokenCount = Math.max(0, fuse.starting - fuse.current);
  const usedFuseTokens = Array.from(new Array(usedFuseTokenCount));
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
    {#each currentInfoTokens as _ (_)}
      <i class="fas fa-info-circle active" />
    {/each}
    {#each usedInfoTokens as _ (_)}
      <i class="fas fa-info-circle inactive" />
    {/each}
  </div>
  <div class="fuse-tokens">
    {#each usedFuseTokens as _ (_)}
      <i class="fas fa-bomb active" />
    {/each}
    {#each currentFuseTokens as _ (_)}
      <i class="fas fa-bomb inactive" />
    {/each}
  </div>
</div>
