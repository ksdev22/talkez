const loginForm = document.querySelector("#login-form");
const registerForm = document.querySelector("#register-form");
const registerBtn = document.querySelector("#register-btn");
const loginBtn = document.querySelector("#login-btn");

registerBtn.addEventListener("click", (event) => {
  loginBtn.classList.remove("hide");
  loginForm.classList.add("hide");
  registerBtn.classList.add("hide");
  registerForm.classList.remove("hide");
});
loginBtn.addEventListener("click", (event) => {
  loginBtn.classList.add("hide");
  loginForm.classList.remove("hide");
  registerBtn.classList.remove("hide");
  registerForm.classList.add("hide");
});

const registerPw = document.querySelector("#register-password");
const registerUsername = document.querySelector("#register-username");
const verifyPw = document.querySelector("#verify-password");
const registerFormBtn = document.querySelector("#register-form-btn");
for (let pwInput of [registerPw, verifyPw, registerUsername]) {
  pwInput.addEventListener("input", (event) => {
    if (
      registerPw.value === verifyPw.value &&
      registerPw.value.length >= 8 &&
      registerUsername.value.length > 0
    ) {
      registerPw.classList.add("border", "border-2", "border-success");
      verifyPw.classList.add("border", "border-2", "border-success");
      registerFormBtn.disabled = false;
    } else {
      registerPw.classList.remove("border", "border-2", "border-success");
      verifyPw.classList.remove("border", "border-2", "border-success");
      registerFormBtn.disabled = true;
    }
  });
}
