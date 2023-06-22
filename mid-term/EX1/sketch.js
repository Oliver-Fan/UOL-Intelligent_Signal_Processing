// Exercise 1 template
// Feel freee to modify it or create your own template

// playback controls
var playButton
var stopButton
var pauseButton
var skipStartButton
var skipEndButton
var loopButton
var recordButton

// low-pass filter
var lp_cutOffSlider
var lp_resonanceSlider
var lp_dryWetSlider
var lp_outputSlider

// dynamic compressor
var dc_attackSlider
var dc_kneeSlider
var dc_releaseSlider
var dc_ratioSlider
var dc_thresholdSlider
var dc_dryWetSlider
var dc_outputSlider

// master volume
var mv_volumeSlider

// reverb
var rv_durationSlider
var rv_decaySlider
var rv_dryWetSlider
var rv_outputSlider
var rv_reverseButton

// waveshaper distortion
var wd_amountSlider
var wd_oversampleSlider
var wd_dryWetSlider
var wd_outputSlider

// coordination
var effect
var player

// recording
var recorder
var recording
var outFile

// ffts
var fftIn
var fftOut

// filters
var dynamicCompressor
var reverbFilter
var lowpassFilter
var waveshaperDistortion
var reverbIsReversed

// enums
var distortionOversampling = {
    0: "none",
    1: "2x",
    2: "4x",
}

function preload() {
    soundFormats("wav", "mp3")
    player = loadSound("assets/poem")
    outFile = new p5.SoundFile()
}

function setup() {
    createCanvas(800, 600)
    background(180)
    GUIconfigurations()
    setupChain()
    setupRecorder()
    refreshEffects()
}

function GUIconfigurations() {
// Playback controls
    pauseButton = createButton("pause");
    pauseButton.position(10, 20);
    pauseButton.mousePressed(() => player.pause());

    playButton = createButton("play");
    playButton.position(70, 20);
    playButton.mousePressed(() => player.play());

    stopButton = createButton("stop");
    stopButton.position(120, 20);
    stopButton.mousePressed(() => player.stop());

    skipStartButton = createButton("skip to start");
    skipStartButton.position(170, 20);
    skipStartButton.mousePressed(() => player.jump(0));

    skipEndButton = createButton("skip to end");
    skipEndButton.position(263, 20);
    skipEndButton.mousePressed(() => player.jump(player.duration()));

    loopButton = createButton("loop");
    loopButton.position(352, 20);
    loopButton.mousePressed(() => player.loop());

    recordButton = createButton("record");
    recordButton.position(402, 20);
    recordButton.mousePressed(() => {
        if (!recording) {
            recording = true;
            recorder.record(outFile);
        } else {
            recording = false;
            recorder.stop();
            save(outFile, "output.wav");
        }
        recordButton.style("background-color", recording ? "red" : "");
        recordButton.style("color", recording ? "white" : "");
        recordButton.html(recording ? "stop recording" : "record");
    });

  // Important: you may have to change the slider parameters (min, max, value and step)
  // Dynamic Compressor
  textSize(14);
  text('Dynamic Compressor', 70,80);
  textSize(10);
  dc_attackSlider = createSlider(0, 1, 0, 0.01);
  dc_attackSlider.position(10,110);
  text('attack', 10,105);
  dc_kneeSlider = createSlider(0, 1, 0.5, 0.01);
  dc_kneeSlider.position(10,155);
  text('knee', 10,150);
  dc_releaseSlider = createSlider(0, 1, 0.5, 0.01);
  dc_releaseSlider.position(10,200);
  text('release', 10,195);
  dc_ratioSlider = createSlider(0, 1, 1, 0.01);
  dc_ratioSlider.position(10,245);
  text('ratio', 10,240);
  dc_thresholdSlider = createSlider(0, 1, 0.5, 0.01);
  dc_thresholdSlider.position(150,110);
  text('threshold', 150,105);
  dc_dryWetSlider = createSlider(0, 1, 0.5, 0.01);
  dc_dryWetSlider.position(150,155);
  text('dry/wet', 150,150);
  dc_outputSlider = createSlider(0, 1,1, 0.01);
  dc_outputSlider.position(150,200);
  text('output level', 150,195);  
    
  // reverb
  textSize(14);
  text('Reverb', 380,80);
  textSize(10);
  rv_durationSlider = createSlider(0, 1, 0.5, 0.01);
  rv_durationSlider.position(330,110);
  text('duration', 330,105);
  rv_decaySlider = createSlider(0, 1, 0.5, 0.01);
  rv_decaySlider.position(330,155);
  text('decay', 330,150);
  rv_dryWetSlider = createSlider(0, 1, 0.5, 0.01);
  rv_dryWetSlider.position(330,200);
  text('dry/wet', 330, 198);
  rv_outputSlider = createSlider(0, 1,1, 0.01);
  rv_outputSlider.position(330,245);
  text('output level', 330,243);
   reverbIsReversed = false;
    rv_reverseButton = createButton(`reverb reverse ${!reverbIsReversed ? "off" : "on"}`);
    rv_reverseButton.position(505, 20);
    rv_reverseButton.mousePressed(() => {
        reverbIsReversed = !reverbIsReversed;
        rv_reverseButton.style("background-color", reverbIsReversed ? "red" : "");
        rv_reverseButton.html(`reverb reverse ${!reverbIsReversed ? "off" : "on"}`);
    });
    
  // low-pass filter
  textSize(14);
  text('Low-pass Filter', 560,80);
  textSize(10);
  lp_cutOffSlider = createSlider(0, 1, 0.5, 0.01);
  lp_cutOffSlider.position(560,110);
  text('cutoff frequency', 560,105);
  lp_resonanceSlider = createSlider(0, 1, 0.5, 0.01);
  lp_resonanceSlider.position(560,155);
  text('resonance', 560,150);
  lp_dryWetSlider = createSlider(0, 1, 0.5, 0.01);
  lp_dryWetSlider.position(560,200);
  text('dry/wet', 560,195);
  lp_outputSlider = createSlider(0, 1,1, 0.01);
  lp_outputSlider.position(560,245);
  text('output level', 560,240);
  
// Waveshaper Distortion
  textSize(14);
  text('Waveshaper Distortion', 10,305);
  textSize(10);
  
  // Distortion amount slider
  wd_amountSlider = createSlider(0, 1, 0.5, 0.01);
  wd_amountSlider.position(10,335);
  text('distortion amount', 10,330);
  
  // Oversample slider
  wd_oversampleSlider = createSlider(0, 1, 0.5, 0.01);
  wd_oversampleSlider.position(10,380);
  text('oversample', 10,375);
  
  // Dry/wet slider
  wd_dryWetSlider = createSlider(0, 1, 0.5, 0.01);
  wd_dryWetSlider.position(10,425);
  text('dry/wet', 10,420);
  
  // Output level slider
  wd_outputSlider = createSlider(0, 1,1, 0.01);
  wd_outputSlider.position(10,470);
  text('output level', 10,465);
    
  // Master Volume
  textSize(14)
  text("Master Volume", 280, 305)
  textSize(10)
  
  // Volume level
  mv_volumeSlider = createSlider(0, 1,1, 0.01);
  mv_volumeSlider.position(280, 335);
  text("level", 280, 330);


  // spectrums
  textSize(14);
  text('Spectrum in', 600,305);
  text('Spectrum out', 600,450);

}


function setupChain() {
    // filters
    dynamicCompressor = new p5.Compressor();
    reverbFilter = new p5.Reverb();
    lowpassFilter = new p5.LowPass();
    waveshaperDistortion = new p5.Distortion();
    masterVolume = new p5.Gain();

    // spectrums
    fftIn = new p5.FFT();
    fftOut = new p5.FFT();

    // chain
    player.disconnect();
    fftIn.setInput(player);
    lowpassFilter.disconnect();
    lowpassFilter.process(player);
    waveshaperDistortion.disconnect();
    waveshaperDistortion.process(lowpassFilter);
    dynamicCompressor.disconnect();
    dynamicCompressor.process(waveshaperDistortion);
    reverbFilter.disconnect();
    reverbFilter.process(dynamicCompressor);
    masterVolume.disconnect();
    masterVolume.setInput(reverbFilter);
    fftOut.setInput(masterVolume);
    masterVolume.connect();
}

function setupRecorder() {
    recorder = new p5.SoundRecorder()
    recorder.setInput(masterVolume)
    recording = false
}

function draw() {
    refreshEffects();
    refreshSpectrums();
}

function refreshSpectrums() {
    // spectrums
    const ffts = [fftIn, fftOut]
    for (let fftIndex = 0; fftIndex < ffts.length; fftIndex++) {
        const fft = ffts[fftIndex]
        // Analyze the frequency spectrum
        const spectrum = fft.analyze()
        // Save current transformation matrix and position
        push()
        translate(550, 310 + 145 * fftIndex)
        scale(0.25, 0.2)
        noStroke()
        fill(10)
        rect(0, 0, width, height)
        fill(0, 153, 0)
        // Draw a rectangle for each frequency band
        for (let i = 0; i < spectrum.length; i++) {
            const x = map(i, 0, spectrum.length, 0, width)
            const h = -height + map(spectrum[i], 0, 255, height, 0)
            rect(x, height, width / spectrum.length, h)
        }
        // Restore the last saved transformation matrix and position
        pop()
    }
}

function refreshEffects() {
    // Set dynamic compressor values
    dynamicCompressor.set(dc_attackSlider.value(), dc_kneeSlider.value(), dc_ratioSlider.value(), dc_thresholdSlider.value(), dc_releaseSlider.value())
    // Set dynamic compressor dry/wet value
    dynamicCompressor.drywet(dc_dryWetSlider.value())
    // Set dynamic compressor output value
    dynamicCompressor.amp(dc_outputSlider.value())

    // Set reverb filter values
    reverbFilter.set(rv_durationSlider.value(), rv_decaySlider.value(), reverbIsReversed)
    // Set reverb filter dry/wet value
    reverbFilter.drywet(rv_dryWetSlider.value())
    // Set reverb filter output value
    reverbFilter.amp(rv_outputSlider.value())
    
    // Set lowpass filter cutoff and resonance values
    lowpassFilter.set(lp_cutOffSlider.value(), lp_resonanceSlider.value())
    // Set lowpass filter dry/wet value
    lowpassFilter.drywet(lp_dryWetSlider.value())
    // Set lowpass filter output value
    lowpassFilter.amp(lp_outputSlider.value())

    // Set waveshaper distortion values
    waveshaperDistortion.set(wd_amountSlider.value(), distortionOversampling[wd_oversampleSlider.value()])
    // Set waveshaper distortion dry/wet value
    waveshaperDistortion.drywet(wd_dryWetSlider.value())
    // Set waveshaper distortion output value
    waveshaperDistortion.amp(wd_outputSlider.value())

    // Set master volume value
    masterVolume.amp(mv_volumeSlider.value())
}
//