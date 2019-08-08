<script>
  import { messages } from "../stores";

  const getClassForMsg = msg => {
    if (msg.from) {
      return "user-msg";
    }
    return "server-msg";
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
    <p class="control is-expanded">
      <input class="input" type="text" placeholder="Send a message" />
    </p>
    <div class="control">
      <a class="button is-info">Send</a>
    </div>
  </div>
</div>
