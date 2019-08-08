<script>
  import { messages, sendMessage } from "../stores";

  const getClassForMsg = msg => {
    if (msg.from) {
      return "user-msg";
    }
    return "server-msg";
  };

  let text = "";
  const send = () => {
    sendMessage(text);
    text = "";
  };
</script>

<style>
  .chat {
    height: 80vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .server-msg {
    color: grey;
  }
  .chat-history {
    overflow-y: scroll;
  }
</style>

<div class="column chat">
  <div class="chat-history">
    {#each $messages as message (message.id)}
      <div class={getClassForMsg(message)}>
        <span>{message.from ? message.from + ': ' : ''}</span>
        <span>{message.message}</span>
      </div>
    {/each}
  </div>
  <div class="field has-addons">
    <form on:submit|preventDefault={send}>
      <p class="control is-expanded">
        <input
          class="input"
          type="text"
          placeholder="Send a message"
          bind:value={text} />
      </p>
    </form>
    <div class="control">
      <button class="button is-info" on:click={send}>Send</button>
    </div>
  </div>
</div>
