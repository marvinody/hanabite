<script>
  import TextField from "./TextField";
  import DropdownField from "./DropdownField";
  import { fly, fade } from "svelte/transition";
  import { createRoom } from "../stores";

  let roomName = `My room is my room`;
  const lobbySizes = [2, 3, 4, 5];
  let selected;

  const handleSubmit = () => {
    createRoom({ name: roomName, size: selected });
  };

  let visible = false;
  const showForm = () => (visible = true);
</script>

{#if visible}
  <form on:submit|preventDefault={handleSubmit} transition:fly>
    <div class="field">
      <div class="control">
        <TextField bind:value={roomName} name="roomName" label="Room Name" />
      </div>
    </div>
    <div class="field">
      <div class="control">
        <DropdownField
          options={lobbySizes}
          getOptionText={opt => opt + ' players'}
          bind:selected
          label="Maximum Players"
          name="max-players" />
      </div>
    </div>
    <div class="field">
      <button type="submit" class="button is-link">Create Room</button>
    </div>
  </form>
{:else}
  <button transition:fade class="button is-link" on:click={showForm}>
    Make a Room?
  </button>
{/if}
