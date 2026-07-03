import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase.js";

// Check if user is already logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Redirect to main panel
    window.location.href = "/dashboard.html";
  }
});

const loginForm = document.getElementById("login-form");
const errorMsg = document.getElementById("error-message");
const btnLogin = document.getElementById("btn-login");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMsg.style.display = "none";
    btnLogin.disabled = true;
    btnLogin.innerText = "กำลังเข้าสู่ระบบ...";

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Success: onAuthStateChanged will handle redirection
    } catch (error) {
      console.error("Login failed:", error);
      errorMsg.innerText = "อีเมลหรือรหัสผ่านไม่ถูกต้อง หรือโปรเจกต์ยังไม่ได้ตั้งค่า";
      errorMsg.style.display = "block";
      btnLogin.disabled = false;
      btnLogin.innerText = "เข้าสู่ระบบ";
    }
  });
}
