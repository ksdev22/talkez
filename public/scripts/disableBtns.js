const disButtons = document.querySelectorAll(".btn-disable");
const disLinks = document.querySelectorAll(".home-page-contacts-link");

for (let toDis of [...disButtons, ...disLinks]) {
  toDis.addEventListener("click", (event) => {
    setTimeout(() => {
      for (let toDis of [...disButtons, ...disLinks]) {
        toDis.disabled = true;
      }
    }, 0);
  });
}
