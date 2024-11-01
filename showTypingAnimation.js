import { createElement } from './createElement.js';
import { getChatResponse } from './getchatResponse.js';

export function showTypingAnimation(userText, chatContainer, genAI, conversationHistory) {
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
</div>`;

    const incomingChatDiv = createElement(html, 'incoming');
    chatContainer.appendChild(incomingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);

    getChatResponse(userText, chatContainer, genAI, incomingChatDiv, conversationHistory);
}