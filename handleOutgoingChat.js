import { showTypingAnimation } from './showTypingAnimation.js';
import { createElement } from './createElement.js';

let conversationHistory = [];

export function handleOutgoingChat(chatInput, initialHeight, chatContainer, genAI) {
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
    const outgoingChatDiv = createElement(html, 'outgoing');
    outgoingChatDiv.querySelector("p").textContent = userText;
    document.querySelector(".default-text")?.remove();
    chatContainer.appendChild(outgoingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);

    conversationHistory.push({ role: 'user', content: userText });

    setTimeout(() => showTypingAnimation(userText, chatContainer, genAI, conversationHistory), 500);
}