document.querySelector('.chat-button').addEventListener('click', async function (e) {
    e.preventDefault();
    const userInput = document.getElementById('userInput').value;
    const resultDiv = document.getElementById('result');
    const chatTitle = document.getElementById('chatTitle');

    // Move the title to the top left
    chatTitle.classList.add('top-left');

    try {
        const requestBody = {
            contents: [{
                parts: [{ text: userInput }]
            }]
        };
        function typeWriter(element, text, i = 0, speed = 50) {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(() => typeWriter(element, text, i, speed), speed);
            }
        }
        console.log('Request Body:', JSON.stringify(requestBody)); // Log request body

        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=(your api key))', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        console.log('Response status:', response.status); // Log response status
        console.log('Response status text:', response.statusText); // Log response status text

        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Full response data:', data); // Debugging data

        // Check and display the response from the API
        if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
            const responseText = data.candidates[0].content.parts[0].text;

            // Create a formatted response with highlighting
            const formattedResponse = formatResponse(responseText);

            // Display the formatted response (no copy button)
            resultDiv.innerHTML = formattedResponse + `
                <button class="read-button">Read</button>
            `;
        } else {
            resultDiv.textContent = 'No content generated.';
        }

        resultDiv.classList.add('show');
    } catch (error) {
        console.error('Error:', error); // Debugging error
        if (error.name === 'TypeError') {
            resultDiv.textContent = 'Error: Failed to fetch. Please check your network connection and API endpoint.';
        } else {
            resultDiv.textContent = 'Error: ' + error.message;
        }
        resultDiv.classList.add('show');
    }

    // Clear user input field
    document.getElementById('userInput').value = '';
});

// Voice input functionality
if ('webkitSpeechRecognition' in window) {
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = function (event) {
        const userInput = event.results[0][0].transcript;
        document.getElementById('userInput').value = userInput;
        document.querySelector('.chat-button').dispatchEvent(new Event('click'));
    };

    document.getElementById('voiceInputButton').addEventListener('click', function () {
        recognition.start();
    });
}

// Read button functionality (with Stop functionality)
let currentUtterance = null;

document.addEventListener('click', function (e) {
    const resultDiv = document.getElementById('result');
    if (e.target && e.target.classList.contains('read-button')) {
        const responseText = resultDiv.innerText;

        // Create an utterance for speech synthesis
        currentUtterance = new SpeechSynthesisUtterance(responseText);
        
        // Increase the rate to make the speech faster (default is 1, increase it to 1.5 or 2 for faster speed)
        currentUtterance.rate = 1.5;  // You can adjust this as needed (e.g., 2 for faster speed)
        
        // Speak the text
        speechSynthesis.speak(currentUtterance);

        // Change button to "Stop" while reading
        resultDiv.innerHTML += '<button class="stop-button">Stop</button>';
        document.querySelector('.read-button').style.display = 'none'; // Hide Read button
    }
    
    if (e.target && e.target.classList.contains('stop-button')) {
        // Stop the speech
        if (currentUtterance) {
            speechSynthesis.cancel();  // Stop the ongoing speech
        }

        // Change button back to "Read" and remove "Stop" button
        resultDiv.innerHTML = resultDiv.innerHTML.replace('<button class="stop-button">Stop</button>', '');
        resultDiv.innerHTML += '<button class="read-button">Read</button>';
    }
});

// Function to format the response (highlight important words and code)
function formatResponse(responseText) {
    // Example: highlight certain keywords or phrases in the response
    const codeRegex = /```(.*?)```/gs;
    const highlightedText = responseText.replace(codeRegex, (match) => {
        return `<pre class="bg-gray-900 text-green-300 p-4 rounded-lg">${match}</pre>`;
    });

    // Highlight keywords
    const boldedText = highlightedText.replace(/\b(code|Python|JavaScript|HTML|CSS|loop|function|variable|condition|iterable)\b/gi, (match) => {
        return `<span class="text-yellow-400 font-bold">${match}</span>`;
    });

    // Split the response into lines, add <p> tags for better structure
    return boldedText.split("\n").map(line => `<p>${line}</p>`).join('');
}


document.addEventListener('keypress', function(e){
    if(e.key === 'Enter'){
        document.querySelector('.chat-button').dispatchEvent(new Event('click'));
    }
})
