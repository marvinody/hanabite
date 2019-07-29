<script>
  export let value = "";
  export let label = "Unnamed label";
  export let name = "unnamed-field";
</script>

<label class="label" for={name}>{label}:</label>
<input {name} type="text" bind:value />
