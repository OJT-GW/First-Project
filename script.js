const typingForm = document.querySelector(".typing-container");
const chatContainer = document.querySelector("#chat-container");
const toggleThemeButton = document.querySelector("#theme-toggle-button");
const deleteChatButton = document.querySelector("#delete-chat-button");
const openSidebarButton = document.getElementById("open-sidebar");
const sidebar = document.querySelector(".sidebar");
const typingContainer = document.querySelector(".typing-container");
const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");

// State variables
let userMessage = null;
let isResponseGenerating = false;
let initialHeight = chatInput.scrollHeight;
let conversationHistory = [];

// API configuration
const API_KEY = "AIzaSyCRs5tf4vtFmOleGU0cpluAHIsiHCwpHuw";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

// Show/hide the sidebar and adjust chat layout
openSidebarButton.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    if (sidebar.classList.contains("open")) {
        chatContainer.classList.add("collapsed");
        typingContainer.classList.add("navbar-open");
        typingContainer.classList.remove("navbar-closed");
    } else {
        chatContainer.classList.remove("collapsed");
        typingContainer.classList.add("navbar-closed");
        typingContainer.classList.remove("navbar-open");
    }
});

// Load theme and chat data from local storage on page load
const loadDataFromLocalStorage = () => {
    const themeColor = localStorage.getItem("theme-color");
    document.body.classList.toggle("light-mode", themeColor === "light_mode");
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";

    const defaultText =
        `<div class="default-text">
            <img class="header-logo" src="./src/images/dark-lion-high-resolution-logo-grayscale-transparent.png" alt="Logo" />
            <h1>Hello, there!</h1>
            <p>How can I help you today?</p>
        </div>`;

    chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;
    chatContainer.scrollTo(0, chatContainer.scrollHeight);

    // Load conversation history correctly from localStorage
    const savedHistory = JSON.parse(localStorage.getItem("conversation-history") || "[]");
    conversationHistory = savedHistory;  // Use saved history to restore conversation
};

// Create a new message element and return it
const createElement = (html, className) => {
    const ChatDiv = document.createElement("div");
    ChatDiv.classList.add("chat", className);
    ChatDiv.innerHTML = html;
    return ChatDiv;
};

// Voice recognition initialization
const voiceButton = document.getElementById("voice-btn");
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'vi-VN'; // Set language to Vietnamese
recognition.interimResults = false;

voiceButton.addEventListener("click", () => {
    recognition.start(); // Start recording
});

recognition.addEventListener("result", (event) => {
    const transcript = event.results[0][0].transcript; // Convert speech to text
    chatInput.value = transcript; // Display the text in the input field
    handleOutgoingChat(); // Send the text
});

recognition.addEventListener("end", () => {
    recognition.stop(); // Stop recording
});

// Fetch response from the API based on user message
const generateAPIResponse = async (userMessage, chatContainer, API_URL, incomingChatDiv, conversationHistory) => {
    const textElement = incomingChatDiv.querySelector(".text");

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: conversationHistory.map(entry => ({
                    role: entry.role === 'bot' ? 'model' : entry.role,  // Use 'model' for AI responses
                    parts: [{ text: entry.content }]
                }))
            }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error.message);

        let text = data?.candidates?.[0]?.content?.parts?.[0]?.text.replace(/\*\*(.*?)\*\*/g, '$1') || "No response";
        console.log(text);

        // Additional formatting for the response
        text = text.replace(/\*/g, ''); // Remove all asterisks
        text = text.replace(/(\d+\.\s)/g, '<br>$1'); // Add line breaks for numbered lists
        text = text.replace(/•\s/g, '<br>• '); // Add line breaks for bullet points
        text = text.replace(/^(assistant|bot):\s*/i, '');  // Remove 'assistant:' or 'bot:' prefix

        // Check for code blocks and wrap them for Prism.js
        if (text.includes('```')) {
            text = text.split('```').map((part, index) => {
                if (index % 2 === 0) return part;
                const lines = part.split('\n');
                const language = lines[0].trim();
                const code = lines.slice(1).join('\n');
                return `<div class="code-container"><pre><code class="language-${language}">${escapeHtml(code)}</code></pre></div>`;
            }).join('');
        }

        // Add bot response to conversationHistory and update localStorage
        conversationHistory.push({ role: 'model', content: text });  // Store with 'model' role
        textElement.innerHTML = text;
        incomingChatDiv.querySelector(".typing-animation").remove();
        incomingChatDiv.querySelector(".chat-details").appendChild(textElement);

        Prism.highlightAll();

        // Add copy buttons to code blocks
        incomingChatDiv.querySelectorAll('.code-container').forEach(container => {
            const codeBlock = container.querySelector('pre code');
            addCopyButton(container, codeBlock);
        });

        chatContainer.scrollTo(0, chatContainer.scrollHeight);
        localStorage.setItem("all-chats", chatContainer.innerHTML);
        localStorage.setItem("conversation-history", JSON.stringify(conversationHistory));
    } catch (error) {
        textElement.innerText = `Error: ${error.message}`;
        textElement.parentElement.closest(".message").classList.add("error");
        incomingChatDiv.querySelector(".typing-animation").remove();
        incomingChatDiv.querySelector(".chat-details").appendChild(textElement);
    } finally {
        chatInput.disabled = false;
        incomingChatDiv.classList.remove("loading");
    }
};

// Handle outgoing chat messages
const handleOutgoingChat = () => {
    const userText = chatInput.value.trim();
    if (!userText) return;
    chatInput.value = "";
    chatInput.style.height = `${initialHeight}px`;

    // Disable the chat input field
    chatInput.disabled = true;

    const html = `<div class="chat-content">
    <div class="chat-details">
        <img src="./src/images/user1.png" alt="user-img">
        <p></p>
    </div>
</div>`;
    const outgoingChatDiv = createElement(html, "outgoing");
    outgoingChatDiv.querySelector("p").textContent = userText;
    document.querySelector(".default-text")?.remove();
    chatContainer.appendChild(outgoingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);

    // Add user message to the global conversationHistory array
    conversationHistory.push({ role: 'user', content: userText });

    // Show typing animation and generate a response
    setTimeout(() => showTypingAnimation(userText, chatContainer, API_URL, conversationHistory), 500);
};

// Function to show loading animation
const showTypingAnimation = (userText, chatContainer, API_URL, conversationHistory) => {
    const html = `<div class="chat-content incoming">
    <div class="chat-details">
        <div class="bot-img-container">
            <img src="./src/images/dark-lion-high-resolution-logo-grayscale-transparent.png" alt="bot-img" class="bot-img">
        </div>
        <div class="typing-animation">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
        </div>
    </div>
    <div class="text"></div> <!-- Ensure there is a text container -->
</div>`;

    const incomingChatDiv = createElement(html, 'incoming');
    chatContainer.appendChild(incomingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);

    generateAPIResponse(userText, chatContainer, API_URL, incomingChatDiv, conversationHistory);
};




// Event listener for theme button click
themeButton.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    localStorage.setItem("theme-color", themeButton.innerText);
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";
});

// Delete all chats from local storage
deleteButton.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete all the chats?")) {
        localStorage.removeItem("all-chats");
        loadDataFromLocalStorage();
    }
});

chatInput.addEventListener("input", () => {
    chatInput.style.height = initialHeight + 'px'; // Reset to initial height
    chatInput.style.height = chatInput.scrollHeight + 'px'; // Set to scroll height
});
// Handle send button click
sendButton.addEventListener("click", handleOutgoingChat);

// Handle Enter key press for sending messages
chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleOutgoingChat();
    }
});

// Function to escape HTML
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
function addCopyButton(container, codeBlock) {
    const button = document.createElement('button');
    button.className = 'copy-button';
    button.textContent = 'Copy Code';
    button.addEventListener('click', () => {
        navigator.clipboard.writeText(codeBlock.textContent).then(() => {
            button.textContent = 'Copied!';
            setTimeout(() => {
                button.textContent = 'Copy Code';
            }, 2000);
        });
    });
    container.appendChild(button);
}
const copyResponse = (copyBtn) => {
    // Copy the text content of response on clipboard
    const responseTextElement = copyBtn.parentElement.querySelector("p");

    if (responseTextElement) {
        navigator.clipboard.writeText(responseTextElement.textContent);
        copyBtn.textContent = "done";
        setTimeout(() => copyBtn.textContent = "content_copy", 1000);
    } else {
        console.error("Paragraph element not found.");
    }
};
// Load data on page load
loadDataFromLocalStorage();
