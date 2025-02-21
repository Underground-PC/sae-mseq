// script.js

let audioContext = new (window.AudioContext || window.webkitAudioContext)();
let audioPlayer = document.getElementById("audioPlayer");
audioPlayer.controls = false;  // Disable the native audio controls

let analyser = audioContext.createAnalyser();
let sourceNode;
let gainNode = audioContext.createGain();

// Create the EQ filter nodes
let lowShelfFilter = audioContext.createBiquadFilter();
lowShelfFilter.type = "lowshelf";  // Low Shelf Filter (0Hz to 800Hz)
let midBandFilter = audioContext.createBiquadFilter();
midBandFilter.type = "peaking";  // Peak Band Filter (800Hz to 5000Hz)
let highShelfFilter = audioContext.createBiquadFilter();
highShelfFilter.type = "highshelf";  // High Shelf Filter (5000Hz to 20000Hz)

// Set default values for filters (we'll update these dynamically based on user input)
lowShelfFilter.frequency.value = 100;  // Default frequency for low shelf filter
midBandFilter.frequency.value = 2500;  // Default frequency for mid-band filter
highShelfFilter.frequency.value = 10000;  // Default frequency for high shelf filter

// Set up EQ controls
let lowShelfFrequencyControl = document.getElementById("low-shelf-frequency");
let lowShelfGainControl = document.getElementById("low-shelf-gain");
let midBandFrequencyControl = document.getElementById("mid-band-frequency");
let midBandGainControl = document.getElementById("mid-band-gain");
let midBandQControl = document.getElementById("mid-band-q");
let highShelfFrequencyControl = document.getElementById("high-shelf-frequency");
let highShelfGainControl = document.getElementById("high-shelf-gain");

// Display the frequency values for user feedback
let lowShelfFrequencyValue = document.getElementById("low-shelf-frequency-value");
let midBandFrequencyValue = document.getElementById("mid-band-frequency-value");
let highShelfFrequencyValue = document.getElementById("high-shelf-frequency-value");

function applyEQ() {
    // Apply the frequency and gain for each filter dynamically
    lowShelfFilter.frequency.value = lowShelfFrequencyControl.value;
    lowShelfFilter.gain.value = lowShelfGainControl.value;

    midBandFilter.frequency.value = midBandFrequencyControl.value;
    midBandFilter.gain.value = midBandGainControl.value;

    // Apply Q factor dynamically to the mid-band filter (peak filter)
    midBandFilter.Q.value = parseFloat(midBandQControl.value);  // Apply Q factor dynamically

    highShelfFilter.frequency.value = highShelfFrequencyControl.value;
    highShelfFilter.gain.value = highShelfGainControl.value;

    // Update the displayed frequency values for each band
    lowShelfFrequencyValue.textContent = `${lowShelfFrequencyControl.value} Hz`;
    midBandFrequencyValue.textContent = `${midBandFrequencyControl.value} Hz`;
    highShelfFrequencyValue.textContent = `${highShelfFrequencyControl.value} Hz`;
}

// Load the audio file
audioFileInput.addEventListener('change', function(event) {
    let file = event.target.files[0];
    if (file) {
        let reader = new FileReader();
        reader.onload = function(e) {
            audioContext.decodeAudioData(e.target.result, function(buffer) {
                // Create the audio source node from the buffer
                if (sourceNode) {
                    sourceNode.disconnect();
                }
                sourceNode = audioContext.createBufferSource();
                sourceNode.buffer = buffer;

                // Connect the source -> lowShelf -> midBand -> highShelf -> gain -> audio context
                sourceNode.connect(lowShelfFilter);
                lowShelfFilter.connect(midBandFilter);
                midBandFilter.connect(highShelfFilter);
                highShelfFilter.connect(gainNode);
                gainNode.connect(audioContext.destination);

                // Play the audio manually through Web Audio API
                sourceNode.start();
            });
        };
        reader.readAsArrayBuffer(file);
    }
});

// Event listeners for EQ control changes
lowShelfFrequencyControl.addEventListener("input", applyEQ);
lowShelfGainControl.addEventListener("input", applyEQ);
midBandFrequencyControl.addEventListener("input", applyEQ);
midBandGainControl.addEventListener("input", applyEQ);
midBandQControl.addEventListener("input", applyEQ);
highShelfFrequencyControl.addEventListener("input", applyEQ);
highShelfGainControl.addEventListener("input", applyEQ);

// Initialize EQ with default values
applyEQ();
