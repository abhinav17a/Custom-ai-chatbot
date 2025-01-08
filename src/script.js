// Main functionality for the chat button
document
  .querySelector(".chat-button")
  .addEventListener("click", async function (e) {
    e.preventDefault();
    const userInput = document.getElementById("userInput").value;
    const resultDiv = document.getElementById("result");
    const chatTitle = document.getElementById("chatTitle");

    // Move the title to the top left
    chatTitle.classList.add("top-left");

    try {
      const requestBody = {
        contents: [{ parts: [{ text: userInput }] }],
      };

      function typeWriter(element, text, i = 0, speed = 10) {
        if (i < text.length) {
          element.innerHTML += text.charAt(i);
          i++;
          setTimeout(() => typeWriter(element, text, i, speed), speed);
        }
      }

      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyAMLkuViiEeM62s_cTU8O4cOoxwbSOmCK0",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok)
        throw new Error(`Network response was not ok: ${response.statusText}`);

      const data = await response.json();

      if (
        data.candidates?.length > 0 &&
        data.candidates[0]?.content?.parts?.length > 0
      ) {
        const responseText = data.candidates[0].content.parts[0].text;

        // Format and display the response
        const formattedResponse = formatResponse(responseText);
        resultDiv.innerHTML = ""; // Clear previous content
        typeWriter(resultDiv, formattedResponse);

        // Add the "Read" button in a separate control container
        let controlDiv = document.getElementById("controlDiv");
        if (!controlDiv) {
          // Dynamically create controlDiv if not present
          controlDiv = document.createElement("div");
          controlDiv.id = "controlDiv";
          controlDiv.style.marginTop = "10px";
          resultDiv.parentNode.appendChild(controlDiv);
        }

        // Clear any existing buttons in the controlDiv
        controlDiv.innerHTML = "";

        // Dynamically create the "Read" button
        const readButton = document.createElement("button");
        readButton.textContent = "Read";
        readButton.classList.add("read-button");

        // Append the button to the controlDiv
        controlDiv.appendChild(readButton);

        // Log for debugging
        console.log("Button added:", readButton.outerHTML);
      }

      resultDiv.classList.add("show");
    } catch (error) {
      console.error("Error:", error);
      resultDiv.textContent = `Error: ${error.message}`;
      resultDiv.classList.add("show");
    }

    // Clear user input field
    document.getElementById("userInput").value = "";
  });

// Voice input functionality
if ("webkitSpeechRecognition" in window) {
  const recognition = new webkitSpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "en-US";

  recognition.onresult = function (event) {
    const userInput = event.results[0][0].transcript;
    document.getElementById("userInput").value = userInput;
    document.querySelector(".chat-button").dispatchEvent(new Event("click"));
  };

  document
    .getElementById("voiceInputButton")
    .addEventListener("click", function () {
      recognition.start();
    });
}

// Speech Synthesis: Read/Stop button functionality
let currentUtterance = null; // Track the current speech instance
let isSpeaking = false; // Global flag to track the state of the speech synthesis

document.addEventListener("click", function (e) {
  const resultDiv = document.getElementById("result");
  const responseText = resultDiv.textContent.trim(); // Plain text content of the result div

  // Handle "Read" button click
// Handle "Read" button click
if (e.target && e.target.classList.contains("read-button") && !isSpeaking) {
    if (!responseText) {
      alert("No content to read!");
      return;
    }
  
    console.log("Read button clicked!");
  
    // Mark speech synthesis as active
    isSpeaking = true;
  
    // Create and configure a new utterance for speech synthesis
    currentUtterance = new SpeechSynthesisUtterance(responseText);
    currentUtterance.rate = 1.2; // Speed of speech (1 is normal)
    currentUtterance.pitch = 1; // Pitch of the voice
    currentUtterance.volume = 1; // Volume (1 is max)
  
    // Start speaking
    speechSynthesis.speak(currentUtterance);
  
  
    // When speech synthesis ends, reset the button
    currentUtterance.onend = function () {
      isSpeaking = false; // Reset the speaking flag

    };
  }
  

  // Handle "Stop" button click
  if (e.target && e.target.classList.contains("stop-button")) {
    console.log("Stop button clicked!");

    // Stop speech synthesis
    speechSynthesis.cancel();

    // Change button back to "Read"
    e.target.textContent = "Read";
    e.target.classList.remove("stop-button");
    e.target.classList.add("read-button");

    // Reset the speaking flag
    isSpeaking = false;
  }
});

// Utility to format response
function formatResponse(responseText) {
  const parser = new DOMParser();
  const parsedDoc = parser.parseFromString(responseText, "text/html");
  const rawText = parsedDoc.body.textContent || parsedDoc.body.innerText; // Extract plain text

  return rawText.replace(/\n+/g, "\n").trim(); // Clean up newlines
}
