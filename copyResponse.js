export const copyResponse = (copyBtn) => {
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