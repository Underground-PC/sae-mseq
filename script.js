let audioContext = new (window.AudioContext || window.webkitAudioContext)();
let audioPlayer = document.getElementById("audioPlayer");
audioPlayer.controls = false;  // Disable the native audio controls

let analyserLeft = audioContext.createAnalyser();
let analyserRight = audioContext.createAnalyser();
let analyserCenter = audioContext.createAnalyser();

let sourceNode;
let gainNode = audioContext.createGain();

// Create the EQ filter nodes for Mid (Center) channel
let lowShelfFilterMid = audioContext.createBiquadFilter();
lowShelfFilterMid.type = "lowshelf";  
let midBandFilterMid = audioContext.createBiquadFilter();
midBandFilterMid.type = "peaking";  
let highShelfFilterMid = audioContext.createBiquadFilter();
highShelfFilterMid.type = "highshelf";  

// Set default values for Mid EQ filters
lowShelfFilterMid.frequency.value = 100;
midBandFilterMid.frequency.value = 2500;
highShelfFilterMid.frequency.value = 10000;

// EQ Control Elements
let lowShelfFrequencyControlMid = document.getElementById("low-shelf-frequency-mid");
let midBandFrequencyControlMid = document.getElementById("mid-band-frequency-mid");
let highShelfFrequencyControlMid = document.getElementById("high-shelf-frequency-mid");

// Canvas setup for real-time waveform display
let canvasLeft = document.getElementById("leftWaveform");
let ctxLeft = canvasLeft.getContext("2d");

let canvasRight = document.getElementById("rightWaveform");
let ctxRight = canvasRight.getContext("2d");

let canvasCenter = document.getElementById("centerWaveform");
let ctxCenter = canvasCenter.getContext("2d");

// Update the frequency and gain of filters in real-time
function applyEQ() {
    lowShelfFilterMid.frequency.value = lowShelfFrequencyControlMid.value;
    midBandFilterMid.frequency.value = midBandFrequencyControlMid.value;
    highShelfFilterMid.frequency.value = highShelfFrequencyControlMid.value;
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
        let v = dataArray[i] / 128.0; // normalize to [0,1]
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
                midSideSplitter.connect(analyserLeft, 0);
                midSideSplitter.connect(analyserRight, 1);

                // Process the mid (center) channel
                let midChannel = audioContext.createGain();
                midChannel.gain.value = 0.5;  // Mid channel
                midSideSplitter.connect(midChannel, 0, 0);  // Left to mid
                midChannel.connect(lowShelfFilterMid);
                lowShelfFilterMid.connect(midBandFilterMid);
                midBandFilterMid.connect(highShelfFilterMid);
                highShelfFilterMid.connect(gainNode);

                // Process the side (stereo) channel
                let sideChannel = audioContext.createGain();
                sideChannel.gain.value = 0.5;  // Side channel
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

applyEQ();
