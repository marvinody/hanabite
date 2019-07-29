<script>
  export let options = [];
  export let label = "Unnamed Dropdown";
  export let name = "unnamed-dropdown";
  export let getOptionText = opt => opt;
  export let selected;
</script>

<label class="label" for={name}>{label}:</label>
<div class="select is-rounded">
  <select {name} bind:value={selected}>
    {#each options as option}
      <option value={option}>{getOptionText(option)}</option>
    {/each}
  </select>
</div>
