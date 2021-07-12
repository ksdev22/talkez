const disButtons = document.querySelectorAll(".btn-disable");

for (let button of disButtons) {
  button.addEventListener("click", (event) => {
    setTimeout(() => {
      for (let button of disButtons) {
        button.disabled = true;
      }
    }, 0);
  });
}
