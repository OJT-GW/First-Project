import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCgCzZQkejjqADT_2gJhPXQ9RDsWOsj4Y4",
  authDomain: "zero-api-a307a.firebaseapp.com",
  databaseURL:
    "https://zero-api-a307a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "zero-api-a307a",
  storageBucket: "zero-api-a307a.appspot.com",
  messagingSenderId: "332366664231",
  appId: "1:332366664231:web:6e2018d35d1595b55cf402",
  measurementId: "G-22Z3HN0S4Q",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

document.getElementById("btnGoogle").addEventListener("click", () => {
  signInWithPopup(auth, provider)
    .then(async (result) => {
      const user = result.user;
      await fetch("http://localhost:3010/api/users/login-firebase", {
        method: "POST", // Specify the method as POST
        headers: {
          "Content-Type": "application/json", // Add the content type
          Authorization: "Bearer " + user.accessToken,
        },
        body: JSON.stringify(user), // Send the user data as JSON
      }).then(async (response) => {
        if (!response.ok) {
          throw Error(response.status);
        }
        const data = await response.json();
        if (data) {
          localStorage.setItem("accessToken", data.token);
          const popup = document.getElementById("successPopup");
          popup.style.display = "block";
          setTimeout(() => {
            window.location.href = "./chat.html";
          }, 1000);
        }
      });
    })
    .catch((error) => {
      console.error("Error during login:", error);
    });
});

// Kiểm tra nếu đã có accessToken trong localStorage
if (localStorage.getItem("accessToken")) {
  window.location.href = "./chat.html"; // Chuyển hướng đến chat.html
}
