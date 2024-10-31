import { handleOutgoingChat } from './handleOutgoingChat.js';
import { loadDataFromLocalStorage } from './loadDataFromLocalStorage.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { showTypingAnimation } from './showTypingAnimation.js';
// const openSidebarButton = document.getElementById("open-sidebar");
// const sidebar = document.querySelector(".sidebar");
// openSidebarButton.addEventListener("click", () => {
//     sidebar.classList.toggle("open");
// });

const openSidebarButton = document.getElementById("open-sidebar");
const sidebar = document.querySelector(".sidebar");
const typingContainer = document.querySelector(".typing-container");
openSidebarButton.addEventListener("click", () => {
    sidebar.classList.toggle("open");

    // Collapse or expand the chat-container and typing-container based on the sidebar state
    if (sidebar.classList.contains("open")) {
        chatContainer.classList.add("collapsed");
        typingContainer.classList.add("navbar-open"); // Add navbar-open class to typing-container
        typingContainer.classList.remove("navbar-closed"); // Remove navbar-closed class from typing-container
    } else {
        chatContainer.classList.remove("collapsed");
        typingContainer.classList.add("navbar-closed"); // Add navbar-closed class to typing-container
        typingContainer.classList.remove("navbar-open"); // Remove navbar-open class from typing-container
    }
});


// DOM element selectors
const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
// const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");

//Khởi tạo giọng nói
const voiceButton = document.getElementById("voice-btn");
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'vi-VN'; // Chọn ngôn ngữ tiếng Việt
recognition.interimResults = false;
voiceButton.addEventListener("click", () => {
    recognition.start(); // Bắt đầu ghi âm
});
recognition.addEventListener("result", (event) => {
    const transcript = event.results[0][0].transcript; // Chuyển âm thành văn bản
    chatInput.value = transcript; // Hiển thị văn bản trong ô nhập liệu
    handleOutgoingChat(chatInput, initialHeight, chatContainer, genAI); // Gửi văn bản đi
});
recognition.addEventListener("end", () => {
    recognition.stop(); // Dừng ghi âm
});


// Your API Key
const API_KEY = "AIzaSyCRs5tf4vtFmOleGU0cpluAHIsiHCwpHuw";

// Initialization of Google Generative AI
const genAI = new GoogleGenerativeAI(API_KEY);

let userText = null;
const initialHeight = chatInput.scrollHeight;

// Event listener for send button click
sendButton.addEventListener("click", () => handleOutgoingChat(chatInput, initialHeight, chatContainer, genAI));

// Event listener for theme button click
themeButton.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    localStorage.setItem("theme-color", themeButton.innerText);
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";
});

// Event listener for delete button click
deleteButton.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete all the chats?")) {
        localStorage.removeItem("all-chats");
        loadDataFromLocalStorage();
    }
});

// Event listener for chat input
chatInput.addEventListener("input", () => {
    chatInput.style.height = `${initialHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

// Event listener for Enter key press
chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleOutgoingChat(chatInput, initialHeight, chatContainer, genAI);
    }
});

// Initial loading of data from local storage
loadDataFromLocalStorage();