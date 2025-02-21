// script.js

let audioContext = new (window.AudioContext || window.webkitAudioContext)();
let audioPlayer = document.getElementById("audioPlayer");
audioPlayer.controls = false;  // Disable the native audio controls

let sourceNode;
let gainNode = audioContext.createGain();

// Create the EQ filter nodes
let lowShelfFilterMid = audioContext.createBiquadFilter();
lowShelfFilterMid.type = "lowshelf";  // Low Shelf for Mid (0Hz to 800Hz)
let midBandFilterMid = audioContext.createBiquadFilter();
midBandFilterMid.type = "peaking";  // Peak Band for Mid (800Hz to 5000Hz)
let highShelfFilterMid = audioContext.createBiquadFilter();
highShelfFilterMid.type = "highshelf";  // High Shelf for Mid (5000Hz to 20000Hz)

let lowShelfFilterSide = audioContext.createBiquadFilter();
lowShelfFilterSide.type = "lowshelf";  // Low Shelf for Side (0Hz to 800Hz)
let midBandFilterSide = audioContext.createBiquadFilter();
midBandFilterSide.type = "peaking";  // Peak Band for Side (800Hz to 5000Hz)
let highShelfFilterSide = audioContext.createBiquadFilter();
highShelfFilterSide.type = "highshelf";  // High Shelf for Side (5000Hz to 20000Hz)

// Set default values for filters (we'll update these dynamically based on user input)
lowShelfFilterMid.frequency.value = 100;  
midBandFilterMid.frequency.value = 2500;  
highShelfFilterMid.frequency.value = 10000;  

lowShelfFilterSide.frequency.value = 100;  
midBandFilterSide.frequency.value = 2500;  
highShelfFilterSide.frequency.value = 10000;  

// Set up EQ controls for mid (center) and side (stereo) channels
let lowShelfFrequencyControlMid = document.getElementById("low-shelf-frequency-mid");
let lowShelfGainControlMid = document.getElementById("low-shelf-gain-mid");
let midBandFrequencyControlMid = document.getElementById("mid-band-frequency-mid");
let midBandGainControlMid = document.getElementById("mid-band-gain-mid");
let midBandQControlMid = document.getElementById("mid-band-q-mid");
let highShelfFrequencyControlMid = document.getElementById("high-shelf-frequency-mid");
let highShelfGainControlMid = document.getElementById("high-shelf-gain-mid");

let lowShelfFrequencyControlSide = document.getElementById("low-shelf-frequency-side");
let lowShelfGainControlSide = document.getElementById("low-shelf-gain-side");
let midBandFrequencyControlSide = document.getElementById("mid-band-frequency-side");
let midBandGainControlSide = document.getElementById("mid-band-gain-side");
let midBandQControlSide = document.getElementById("mid-band-q-side");
let highShelfFrequencyControlSide = document.getElementById("high-shelf-frequency-side");
let highShelfGainControlSide = document.getElementById("high-shelf-gain-side");

function applyEQ() {
    // Apply frequency and gain dynamically for both mid and side filters
    lowShelfFilterMid.frequency.value = lowShelfFrequencyControlMid.value;
    lowShelfFilterMid.gain.value = lowShelfGainControlMid.value;

    midBandFilterMid.frequency.value = midBandFrequencyControlMid.value;
    midBandFilterMid.gain.value = midBandGainControlMid.value;
    midBandFilterMid.Q.value = parseFloat(midBandQControlMid.value);

    highShelfFilterMid.frequency.value = highShelfFrequencyControlMid.value;
    highShelfFilterMid.gain.value = highShelfGainControlMid.value;

    lowShelfFilterSide.frequency.value = lowShelfFrequencyControlSide.value;
    lowShelfFilterSide.gain.value = lowShelfGainControlSide.value;

    midBandFilterSide.frequency.value = midBandFrequencyControlSide.value;
    midBandFilterSide.gain.value = midBandGainControlSide.value;
    midBandFilterSide.Q.value = parseFloat(midBandQControlSide.value);

    highShelfFilterSide.frequency.value = highShelfFrequencyControlSide.value;
    highShelfFilterSide.gain.value = highShelfGainControlSide.value;

    // Update the displayed frequency values for both mid and side bands
    document.getElementById("low-shelf-frequency-value-mid").textContent = `${lowShelfFrequencyControlMid.value} Hz`;
    document.getElementById("mid-band-frequency-value-mid").textContent = `${midBandFrequencyControlMid.value} Hz`;
    document.getElementById("high-shelf-frequency-value-mid").textContent = `${highShelfFrequencyControlMid.value} Hz`;

    document.getElementById("low-shelf-frequency-value-side").textContent = `${lowShelfFrequencyControlSide.value} Hz`;
    document.getElementById("mid-band-frequency-value-side").textContent = `${midBandFrequencyControlSide.value} Hz`;
    document.getElementById("high-shelf-frequency-value-side").textContent = `${highShelfFrequencyControlSide.value} Hz`;
}

// Load the audio file
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

                // Create the Mid-Side encoding (stereo pan for mid/side)
                let midSideSplitter = audioContext.createChannelSplitter(2);  // Split stereo into 2 channels

                sourceNode.connect(midSideSplitter);
                
                // Mid: sum of left and right channels (mono)
                let midChannel = audioContext.createGain();
                midChannel.gain.value = 0.5;  // Set gain to average the left and right channels
                midSideSplitter.connect(midChannel, 0, 0);  // Connect left channel to mid

                // Side: difference between left and right channels (stereo)
                let sideChannel = audioContext.createGain();
                sideChannel.gain.value = 0.5;  // Set gain to average the left and right channels
                midSideSplitter.connect(sideChannel, 1, 0);  // Connect right channel to side

                // Apply EQ filters to both mid and side channels
                midChannel.connect(lowShelfFilterMid);
                lowShelfFilterMid.connect(midBandFilterMid);
                midBandFilterMid.connect(highShelfFilterMid);
                highShelfFilterMid.connect(gainNode);

                sideChannel.connect(lowShelfFilterSide);
                lowShelfFilterSide.connect(midBandFilterSide);
                midBandFilterSide.connect(highShelfFilterSide);
                highShelfFilterSide.connect(gainNode);

                // Recombine the processed mid and side back into stereo
                gainNode.connect(audioContext.destination);

                // Play the audio manually through Web Audio API
                sourceNode.start();
            });
        };
        reader.readAsArrayBuffer(file);
    }
});

// Event listeners for EQ control changes
document.querySelectorAll('.slider').forEach(slider => {
    slider.addEventListener("input", applyEQ);
});

applyEQ();
