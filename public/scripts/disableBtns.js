const disButtons = document.querySelectorAll(".btn-disable");

for (let button of disButtons) {
  button.addEventListener("click", (event) => {
    setTimeout(() => {
      button.disabled = true;
    }, 1);
  });
}
