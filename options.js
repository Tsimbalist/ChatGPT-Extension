document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    fetchModels();

    document.getElementById('save-settings').addEventListener('click', saveSettings);
    document.getElementById('clear-history').addEventListener('click', clearHistory);
});

async function fetchModels() {
    const apiKey = localStorage.getItem('chatgptApiKey');
    if (!apiKey) {
        alert('Please set your API key first.');
        return;
    }

    try {
        const response = await fetch('https://api.openai.com/v1/models', {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });
        const data = await response.json();

        const modelSelect = document.getElementById('model-select');
        modelSelect.innerHTML = '';

        data.data.forEach(model => {
            if (model.id.startsWith('gpt-')) {
                const option = document.createElement('option');
                option.value = model.id;
                option.textContent = model.id;
                modelSelect.appendChild(option);
            }
        });

        const savedModel = localStorage.getItem('chatgptModel');
        if (savedModel) {
            modelSelect.value = savedModel;
        }
    } catch (error) {
        console.error('Error fetching models:', error);
    }
}

function saveSettings() {
    const apiKey = document.getElementById('api-key').value;
    const model = document.getElementById('model-select').value;
    const windowSize = document.getElementById('window-size').value;

    localStorage.setItem('chatgptApiKey', apiKey);
    localStorage.setItem('chatgptModel', model);
    localStorage.setItem('windowSize', windowSize);

    alert('Settings saved.');
}

function loadSettings() {
    const apiKey = localStorage.getItem('chatgptApiKey');
    const model = localStorage.getItem('chatgptModel');
    const windowSize = localStorage.getItem('windowSize');

    if (apiKey) {
        document.getElementById('api-key').value = apiKey;
    }

    if (model) {
        document.getElementById('model-select').value = model;
    }

    if (windowSize) {
        document.getElementById('window-size').value = windowSize;
    }
}

function clearHistory() {
    localStorage.removeItem('chatHistory');
    alert('Chat history cleared.');
}
