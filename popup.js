document.addEventListener('DOMContentLoaded', () => {
    loadChatHistory();
    applyWindowSize();
});

document.getElementById('send-button').addEventListener('click', async () => {
    const userInput = document.getElementById('user-input').value;
    if (userInput.trim() === '') return;

    document.getElementById('user-input').value = '';
    disableSendButton(true);

    addMessageToChat('User', userInput);
    saveMessageToHistory('User', userInput);

    const response = await fetchChatGPTResponse(userInput);
    addMessageToChat('ChatGPT', response);
    saveMessageToHistory('ChatGPT', response);

    disableSendButton(false);
});

function applyWindowSize() {
    const windowSize = localStorage.getItem('windowSize') || 'medium';
    document.querySelector('.chat-container').classList.add(windowSize);
}

function disableSendButton(disable) {
    document.getElementById('send-button').disabled = disable;
}

function addMessageToChat(sender, message) {
    const chatBox = document.getElementById('chat-box');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(sender === 'User' ? 'user-message' : 'chatgpt-message');

    messageElement.innerHTML = marked.parse(message);
    chatBox.appendChild(messageElement);

    setTimeout(() => {
        if (window.MathJax) {
            MathJax.typesetPromise([messageElement]).catch(function(err) {
                console.error('MathJax rendering failed:', err);
            });
        }
    }, 0);

    chatBox.scrollTop = chatBox.scrollHeight;
}

function saveMessageToHistory(sender, message) {
    const chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
    chatHistory.push({ sender, message });
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
}

function loadChatHistory() {
    const chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
    chatHistory.forEach(chat => {
        addMessageToChat(chat.sender, chat.message);
    });
}

async function fetchChatGPTResponse(userInput) {
    const apiKey = localStorage.getItem('chatgptApiKey');
    const model = localStorage.getItem('chatgptModel') || 'gpt-3.5-turbo';
    if (!apiKey) {
        alert('Please set your ChatGPT API key in the settings.');
        return 'API key not set';
    }

    const chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
    const messages = chatHistory.map(chat => ({
        role: chat.sender === 'User' ? 'user' : 'assistant',
        content: chat.message
    }));
    messages.push({ role: 'user', content: userInput });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model,
            messages
        })
    });
    const data = await response.json();
    return data.choices[0].message.content;
}
