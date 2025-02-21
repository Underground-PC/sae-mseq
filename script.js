// script.js

let audioContext = new (window.AudioContext || window.webkitAudioContext)();
let audioPlayer = document.getElementById("audioPlayer");
let audioFileInput = document.getElementById("audioFileInput");

let analyser = audioContext.createAnalyser();
let sourceNode;
let gainNode = audioContext.createGain();

// Create the EQ (filter) node
let filterNode = audioContext.createBiquadFilter();
filterNode.type = "peaking";  // This is for parametric EQ

// Set up the EQ controls
let frequencyControl = document.getElementById("frequency");
let gainControl = document.getElementById("gain");
let qControl = document.getElementById("q-factor");

function applyEQ() {
    // Apply changes to filter node based on control values
    filterNode.frequency.value = frequencyControl.value;
    filterNode.gain.value = gainControl.value;
    filterNode.Q.value = qControl.value;
}

// Load the audio file
audioFileInput.addEventListener('change', function(event) {
    let file = event.target.files[0];
    if (file) {
        let reader = new FileReader();
        reader.onload = function(e) {
            audioContext.decodeAudioData(e.target.result, function(buffer) {
                // Create source from the audio buffer
                if (sourceNode) {
                    sourceNode.disconnect();
                }
                sourceNode = audioContext.createBufferSource();
                sourceNode.buffer = buffer;
                
                // Connect to the EQ, gain, and then to the audio context's destination (speakers)
                sourceNode.connect(filterNode);
                filterNode.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                // Play the audio
                audioPlayer.src = URL.createObjectURL(file);
                sourceNode.start();
            });
        };
        reader.readAsArrayBuffer(file);
    }
});

// Event listeners for EQ controls
frequencyControl.addEventListener("input", applyEQ);
gainControl.addEventListener("input", applyEQ);
qControl.addEventListener("input", applyEQ);

// Initialize EQ with default values
applyEQ();
