<script>
  import { messages, sendMessage } from "../stores/";
  import { beforeUpdate, afterUpdate } from "svelte";

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
  // keep the user scrolled to the bottom of the chat each update if they were originally scrolled done
  // without this code, the "view" will stay and the messages will be added out of view
  let chatHistoryDiv;
  let autoscroll = true;

  // https://svelte.dev/tutorial/update
  beforeUpdate(() => {
    autoscroll =
      chatHistoryDiv &&
      chatHistoryDiv.offsetHeight + chatHistoryDiv.scrollTop >
        chatHistoryDiv.scrollHeight - 20;
  });

  afterUpdate(() => {
    if (autoscroll) chatHistoryDiv.scrollTo(0, chatHistoryDiv.scrollHeight);
  });
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
    overflow-y: auto;
  }
</style>

<div class="column chat">
  <div class="chat-history" bind:this={chatHistoryDiv}>
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
