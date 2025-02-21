let audioContext = new (window.AudioContext || window.webkitAudioContext)();
let audioPlayer = document.getElementById("audioPlayer");
audioPlayer.controls = false;  // Disable native audio controls

let sourceNode;
let gainNode = audioContext.createGain();
let analyserLeft = audioContext.createAnalyser();
let analyserRight = audioContext.createAnalyser();
let analyserCenter = audioContext.createAnalyser();

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

// Set up canvas for real-time waveform visualization
let canvasLeft = document.getElementById("leftWaveform");
let ctxLeft = canvasLeft.getContext("2d");

let canvasRight = document.getElementById("rightWaveform");
let ctxRight = canvasRight.getContext("2d");

let canvasCenter = document.getElementById("centerWaveform");
let ctxCenter = canvasCenter.getContext("2d");

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

    // Update the frequency values displayed next to sliders
    document.getElementById("low-shelf-frequency-value-mid").textContent = `${lowShelfFrequencyControlMid.value} Hz`;
    document.getElementById("mid-band-frequency-value-mid").textContent = `${midBandFrequencyControlMid.value} Hz`;
    document.getElementById("high-shelf-frequency-value-mid").textContent = `${highShelfFrequencyControlMid.value} Hz`;

    document.getElementById("low-shelf-frequency-value-side").textContent = `${lowShelfFrequencyControlSide.value} Hz`;
    document.getElementById("mid-band-frequency-value-side").textContent = `${midBandFrequencyControlSide.value} Hz`;
    document.getElementById("high-shelf-frequency-value-side").textContent = `${highShelfFrequencyControlSide.value} Hz`;

    document.getElementById("low-shelf-gain-value-mid").textContent = `${lowShelfGainControlMid.value} dB`;
    document.getElementById("mid-band-gain-value-mid").textContent = `${midBandGainControlMid.value} dB`;
    document.getElementById("high-shelf-gain-value-mid").textContent = `${highShelfGainControlMid.value} dB`;

    document.getElementById("low-shelf-gain-value-side").textContent = `${lowShelfGainControlSide.value} dB`;
    document.getElementById("mid-band-gain-value-side").textContent = `${midBandGainControlSide.value} dB`;
    document.getElementById("high-shelf-gain-value-side").textContent = `${highShelfGainControlSide.value} dB`;
}

// Visualize the left, right, and center waveforms in real-time
function drawWaveform(analyser, ctx, canvas) {
    let bufferLength = analyser.fftSize;
    let dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    // Clear the previous frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();

    let sliceWidth = canvas.width * 1.0 / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        let v = dataArray[i] / 128.0; // Normalize to [0, 1]
        let y = v * canvas.height / 2;
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
        x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
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

                // Create the Mid-Side encoding (stereo pan for mid/side)
                let midSideSplitter = audioContext.createChannelSplitter(2); // Split stereo into 2 channels
                sourceNode.connect(midSideSplitter);

                // Connect the left and right channels to analyzers for waveform visualization
                midSideSplitter.connect(analyserLeft, 0);  // Left channel
                midSideSplitter.connect(analyserRight, 1); // Right channel

                // Process the mid (center) channel
                let midChannel = audioContext.createGain();
                midChannel.gain.value = 0.5;  // Mid channel (mix of left and right)
                midSideSplitter.connect(midChannel, 0, 0);  // Left to mid
                midChannel.connect(lowShelfFilterMid);
                lowShelfFilterMid.connect(midBandFilterMid);
                midBandFilterMid.connect(highShelfFilterMid);
                highShelfFilterMid.connect(gainNode);

                // Process the side (stereo) channel
                let sideChannel = audioContext.createGain();
                sideChannel.gain.value = 0.5;  // Side channel (stereo separation)
                midSideSplitter.connect(sideChannel, 1, 0); // Right to side
                sideChannel.connect(gainNode);

                gainNode.connect(audioContext.destination); // Send to speakers

                // Play the audio manually through Web Audio API
                sourceNode.start();
            });
        };
        reader.readAsArrayBuffer(file);
    }
});

// Update the waveform visualizations in real-time
function updateVisualizations() {
    drawWaveform(analyserLeft, ctxLeft, canvasLeft);
    drawWaveform(analyserRight, ctxRight, canvasRight);
    drawWaveform(analyserCenter, ctxCenter, canvasCenter);
}

// Start visualizing and updating the EQ
setInterval(updateVisualizations, 100); // Update every 100 ms

// Event listeners for EQ control changes
lowShelfFrequencyControlMid.addEventListener("input", applyEQ);
midBandFrequencyControlMid.addEventListener("input", applyEQ);
highShelfFrequencyControlMid.addEventListener("input", applyEQ);
lowShelfGainControlMid.addEventListener("input", applyEQ);
midBandGainControlMid.addEventListener("input", applyEQ);
highShelfGainControlMid.addEventListener("input", applyEQ);

lowShelfFrequencyControlSide.addEventListener("input", applyEQ);
midBandFrequencyControlSide.addEventListener("input", applyEQ);
highShelfFrequencyControlSide.addEventListener("input", applyEQ);
lowShelfGainControlSide.addEventListener("input", applyEQ);
midBandGainControlSide.addEventListener("input", applyEQ);
highShelfGainControlSide.addEventListener("input", applyEQ);

applyEQ();
