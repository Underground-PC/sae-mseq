// script.js

let audioContext = new (window.AudioContext || window.webkitAudioContext)();
let audioPlayer = document.getElementById("audioPlayer");
let audioFileInput = document.getElementById("audioFileInput");

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

// Set initial values for the filters
lowShelfFilter.frequency.value = 800;  // Set the cutoff frequency for low shelf filter
midBandFilter.frequency.value = 2500;  // Set the center frequency for the peak filter (middle band)
highShelfFilter.frequency.value = 5000;  // Set the cutoff frequency for high shelf filter

// Set up EQ controls
let lowShelfGainControl = document.getElementById("low-shelf-gain");
let midBandGainControl = document.getElementById("mid-band-gain");
let highShelfGainControl = document.getElementById("high-shelf-gain");

function applyEQ() {
    // Apply the gain for each filter
    lowShelfFilter.gain.value = lowShelfGainControl.value; 
    midBandFilter.gain.value = midBandGainControl.value;
    highShelfFilter.gain.value = highShelfGainControl.value;
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

                // Connect the filters in series: source -> lowShelf -> midBand -> highShelf -> gain -> output
                sourceNode.connect(lowShelfFilter);
                lowShelfFilter.connect(midBandFilter);
                midBandFilter.connect(highShelfFilter);
                highShelfFilter.connect(gainNode);
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
lowShelfGainControl.addEventListener("input", applyEQ);
midBandGainControl.addEventListener("input", applyEQ);
highShelfGainControl.addEventListener("input", applyEQ);

// Initialize EQ with default values
applyEQ();
