// getChatResponse.js
import { createElement } from './createElement.js';

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

export async function getChatResponse(userText, chatContainer, genAI, incomingChatDiv, conversationHistory) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = conversationHistory.map(entry => `${entry.role}: ${entry.content}`).join('\n') + `\nuser: ${userText}`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text().trim();

        // Remove all asterisks from the response
        text = text.replace(/\*/g, ''); // Remove all asterisks
        text = text.replace(/(\d+\.\s)/g, '<br>$1'); // Add a line break before numbered lists
        text = text.replace(/•\s/g, '<br>• '); // Add a line break before bullet points

        // Remove any prefixes like 'assistant:' or 'bot:'
        text = text.replace(/^(assistant|bot):\s*/i, '');


        // Check for code blocks and wrap them for Prism.js
        if (text.includes('```')) {
            text = text.split('```').map((part, index) => {
                if (index % 2 === 0) return part;  // Regular text
                // Code block processing
                const lines = part.split('\n');
                const language = lines[0].trim();
                const code = lines.slice(1).join('\n');
                return `<div class="code-container"><pre><code class="language-${language}">${escapeHtml(code)}</code></pre></div>`;
            }).join('');
        }

        // Add the bot's response to the conversation history without the 'bot:' prefix
        conversationHistory.push({ role: 'bot', content: text });

        // Create a new div element for the response
        const responseDiv = document.createElement("div");
        responseDiv.innerHTML = text; // Use innerHTML to parse the HTML
        incomingChatDiv.querySelector(".typing-animation").remove();
        incomingChatDiv.querySelector(".chat-details").appendChild(responseDiv);

        // Highlight the code blocks using PrismJS
        Prism.highlightAll();

        // Add copy buttons to all code blocks
        responseDiv.querySelectorAll('.code-container').forEach(container => {
            const codeBlock = container.querySelector('pre code');
            addCopyButton(container, codeBlock);
        });

        // Scroll to the latest message in the chat
        chatContainer.scrollTo(0, chatContainer.scrollHeight);

        // Save the updated chat container and conversation history to local storage
        localStorage.setItem("all-chats", chatContainer.innerHTML);
        localStorage.setItem("conversation-history", JSON.stringify(conversationHistory));
    } catch (error) {
        // Error handling
        const pElement = document.createElement("p");
        pElement.classList.add("error");
        pElement.textContent = "Oops! Something went wrong while retrieving the response. Please try again.";
        incomingChatDiv.querySelector(".typing-animation").remove();
        incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
    } finally {
        // Enable the chat input field
        document.querySelector("#chat-input").disabled = false;
    }
}