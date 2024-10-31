export function loadDataFromLocalStorage() {
    const chatContainer = document.querySelector(".chat-container");
    const themeButton = document.querySelector("#theme-btn");
    const themeColor = localStorage.getItem("theme-color");
    document.body.classList.toggle("light-mode", themeColor === "light_mode");
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";
    const defaultText = `<div class = "default-text">
    <img class="header-logo" src="./src/images/dark-lion-high-resolution-logo-grayscale-transparent.png"
                alt="Logo" />
                            <h1>Hello, there!</h1>
                            <p>How can I help you today?</p>
                        </div>`;
    chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;
    chatContainer.scrollTo(0, chatContainer.scrollHeight);

    const savedHistory = JSON.parse(localStorage.getItem("conversation-history") || "[]");
    conversationHistory.push(...savedHistory);
}