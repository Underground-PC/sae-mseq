let audioContext = new (window.AudioContext || window.webkitAudioContext)();
let audioPlayer = document.getElementById("audioPlayer");
audioPlayer.controls = false;  // Disable native audio controls

let sourceNode;
let gainNode = audioContext.createGain();

// Create the EQ filter nodes for Mid (Center) and Side (Stereo) channels
let lowShelfFilterMid = audioContext.createBiquadFilter();
lowShelfFilterMid.type = "lowshelf";
let midBandFilterMid = audioContext.createBiquadFilter();
midBandFilterMid.type = "peaking";
let highShelfFilterMid = audioContext.createBiquadFilter();
highShelfFilterMid.type = "highshelf";

let lowShelfFilterSide = audioContext.createBiquadFilter();
lowShelfFilterSide.type = "lowshelf";
let midBandFilterSide = audioContext.createBiquadFilter();
midBandFilterSide.type = "peaking";
let highShelfFilterSide = audioContext.createBiquadFilter();
highShelfFilterSide.type = "highshelf";

// Set default values for Mid EQ filters
lowShelfFilterMid.frequency.value = 100;
midBandFilterMid.frequency.value = 2500;
highShelfFilterMid.frequency.value = 10000;

// EQ Control Elements for Mid and Side (Center and Stereo)
let lowShelfFrequencyControlMid = document.getElementById("low-shelf-frequency-mid");
let lowShelfGainControlMid = document.getElementById("low-shelf-gain-mid");
let midBandFrequencyControlMid = document.getElementById("mid-band-frequency-mid");
let midBandGainControlMid = document.getElementById("mid-band-gain-mid");
let highShelfFrequencyControlMid = document.getElementById("high-shelf-frequency-mid");
let highShelfGainControlMid = document.getElementById("high-shelf-gain-mid");

let lowShelfFrequencyControlSide = document.getElementById("low-shelf-frequency-side");
let lowShelfGainControlSide = document.getElementById("low-shelf-gain-side");
let midBandFrequencyControlSide = document.getElementById("mid-band-frequency-side");
let midBandGainControlSide = document.getElementById("mid-band-gain-side");
let highShelfFrequencyControlSide = document.getElementById("high-shelf-frequency-side");
let highShelfGainControlSide = document.getElementById("high-shelf-gain-side");

// Apply EQ for both Mid (Center) and Side (Stereo) Channels
function applyEQ() {
    // Mid (Center) Channel EQ
    lowShelfFilterMid.frequency.value = lowShelfFrequencyControlMid.value;
    lowShelfFilterMid.gain.value = lowShelfGainControlMid.value;
    midBandFilterMid.frequency.value = midBandFrequencyControlMid.value;
    midBandFilterMid.gain.value = midBandGainControlMid.value;
    highShelfFilterMid.frequency.value = highShelfFrequencyControlMid.value;
    highShelfFilterMid.gain.value = highShelfGainControlMid.value;

    // Side (Stereo) Channel EQ
    lowShelfFilterSide.frequency.value = lowShelfFrequencyControlSide.value;
    lowShelfFilterSide.gain.value = lowShelfGainControlSide.value;
    midBandFilterSide.frequency.value = midBandFrequencyControlSide.value;
    midBandFilterSide.gain.value = midBandGainControlSide.value;
    highShelfFilterSide.frequency.value = highShelfFrequencyControlSide.value;
    highShelfFilterSide.gain.value = highShelfGainControlSide.value;
}

// Update the frequency and gain labels dynamically
function updateLabels() {
    document.getElementById("low-shelf-frequency-value-mid").innerText = `${lowShelfFrequencyControlMid.value} Hz`;
    document.getElementById("mid-band-frequency-value-mid").innerText = `${midBandFrequencyControlMid.value} Hz`;
    document.getElementById("high-shelf-frequency-value-mid").innerText = `${highShelfFrequencyControlMid.value} Hz`;

    document.getElementById("low-shelf-frequency-value-side").innerText = `${lowShelfFrequencyControlSide.value} Hz`;
    document.getElementById("mid-band-frequency-value-side").innerText = `${midBandFrequencyControlSide.value} Hz`;
    document.getElementById("high-shelf-frequency-value-side").innerText = `${highShelfFrequencyControlSide.value} Hz`;
}

// Load the audio file and start processing
audioFileInput.addEventListener('change', function(event) {
    let file = event.target.files[0];
    if (file) {
        let reader = new FileReader();
        reader.onload = function(e) {
            audioContext.decodeAudioData(e.target.result, function(buffer) {
                if (sourceNode) {
                    sourceNode.disconnect();
                }
                sourceNode = audioContext.createBufferSource();
                sourceNode.buffer = buffer;

                // Connect to gain node and destination
                sourceNode.connect(gainNode);
                gainNode.connect(audioContext.destination); // Send to speakers

                // Start playback
                sourceNode.start();
            });
        };
        reader.readAsArrayBuffer(file);
    }
});

// Event listeners for EQ control changes
lowShelfFrequencyControlMid.addEventListener("input", function() {
    applyEQ();
    updateLabels();
});
midBandFrequencyControlMid.addEventListener("input", function() {
    applyEQ();
    updateLabels();
});
highShelfFrequencyControlMid.addEventListener("input", function() {
    applyEQ();
    updateLabels();
});
lowShelfGainControlMid.addEventListener("input", function() {
    applyEQ();
});
midBandGainControlMid.addEventListener("input", function() {
    applyEQ();
});
highShelfGainControlMid.addEventListener("input", function() {
    applyEQ();
});

lowShelfFrequencyControlSide.addEventListener("input", function() {
    applyEQ();
    updateLabels();
});
midBandFrequencyControlSide.addEventListener("input", function() {
    applyEQ();
    updateLabels();
});
highShelfFrequencyControlSide.addEventListener("input", function() {
    applyEQ();
    updateLabels();
});
lowShelfGainControlSide.addEventListener("input", function() {
    applyEQ();
});
midBandGainControlSide.addEventListener("input", function() {
    applyEQ();
});
highShelfGainControlSide.addEventListener("input", function() {
    applyEQ();
});

applyEQ();
updateLabels();
