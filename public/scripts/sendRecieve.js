const messagesList = document.querySelector("#messages-list");
const messageSendForm = document.querySelector("#message-send-form");
const messageSendFormInput = document.querySelector("#message-send-form input");
const userOne = document.querySelector("div[data-user]").dataset.user;
const chatsBackBtn = document.querySelector("#chats-page-back-btn");

messageSendForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const body = messageSendFormInput.value.trim();
  messageSendFormInput.value = "";
  const action = messageSendForm.action;

  await axios.post(action, { body });
  messageSendBtn.disabled = false;
  chatsBackBtn.disabled = false;
});

const messageSendBtn = document.querySelector("#message-send-btn");
const getMessageData = async (messagesId) => {
  try {
    const result = await axios.get(messageSendForm.action + `/${messagesId}`);
    while (messagesList.childElementCount < result.data.numMessages) {
      const i = messagesList.childElementCount;
      const newItem = document.createElement("div");
      const newItemContainer = document.createElement("div");
      newItem.textContent = `${result.data.chats[i].body}`;
      newItemContainer.className = "my-1 d-flex";
      newItem.classList.add("message-styles");
      newItem.className += " fs-5 my-auto px-4";
      if (result.data.chats[i].sender !== userOne) {
        newItemContainer.className += " flex-row";
      } else {
        newItemContainer.className += " flex-row-reverse";
      }
      newItemContainer.append(newItem);
      messagesList.append(newItemContainer);
    }
  } catch (err) {
    window.location.reload();
    console.log("error while fetching messages");
  }
  messagesList.parentElement.scrollTo(0, `${messagesList.offsetHeight}`);
};
const messagesId = document.querySelector("div[data-messages-id]").dataset
  .messagesId;
getMessageData(messagesId);
setInterval(() => {
  getMessageData(messagesId);
}, 1000);
