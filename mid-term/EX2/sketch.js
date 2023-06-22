var track

// playback
var btnPlayStop
var playTrack

// visualisation
var analyzer
var rmsReported
var spectralCentroidReported
var amplitudeSpecReport
var histogram
var spectralCrestReported
var loudnessReported

// scalers
var rmsMax
var spectralCentroidMax
var spectrumAmpMax
var spectralSpreadBoxes
var spectralCrestMax
var loudnessMax

var fft;

function preload() {
    soundFormats("mp3", "wav")
    track = loadSound("assets/Kalte_Ohren_(_Remix_).mp3")
}

function setup() {
    createCanvas(1000, 600)
    background(0)
    setupMeyda()
    setupPlayback()

    fft = new p5.FFT();
    fft.setInput(track);
}

function setupMeyda() {
    spectrumAmpMax = 15
    spectralSpreadBoxes = 9
    histogram = new Array(spectralSpreadBoxes).fill(100)

    analyzer = new Meyda.createMeydaAnalyzer({
        audioContext: getAudioContext(),
        source: track,
        bufferSize: 512,
        featureExtractors: ["rms", "spectralCentroid", "amplitudeSpectrum", "spectralSpread", "spectralCrest", "loudness"],
        callback: handleMeydaCallback,
    })
}

function setupPlayback() {
    // playback
    playTrack = false
    var textColour = (playing) => (!playing ? "#FF0000" : "white")
    var bgColour = (playing) => (!playing ? "black" : "#FF0000")
    btnPlayStop = setupButton({
        text: !playTrack ? "play" : "stop",
        c: textColour(playTrack),
        bg: bgColour(playTrack),
        pos: {
            x: width - 60,
            y: 10
        },
    })
    btnPlayStop.mousePressed(() => {
        if (playTrack) {
            analyzer.stop()
            track.stop()
            playTrack = false
        } else {
            track.loop()
            analyzer.start()
            playTrack = true
        }
        btnPlayStop.html(!playTrack ? "play" : "stop")
        btnPlayStop.style("color", textColour(playTrack))
        btnPlayStop.style("background-color", bgColour(playTrack))
    })
}

function setupButton({
    text,
    c,
    bg,
    pos: {
        x,
        y
    }
}) {
    btn = createButton(text)
    btn.style("background-color", bg)
    btn.style("border", `solid 1px ${c}`)
    btn.style("border-radius", "5px")
    btn.style("color", c)
    btn.style("padding", "5px 10px")
    btn.style("cursor", "pointer")
    btn.position(x, y)
    return btn
}

function draw() {
    // put drawing code here
    background(255)

    drawTitle(`
        "Kalte Ohren ( Remix ) by Dysfunction_AL"`)

    if (spectralCentroidReported) {
        drawSpectralCentroidBg(spectralCentroidReported)
    }

    if (rmsReported) {
        drawBASS(rmsReported, spectralCrestReported)
    }

    if (amplitudeSpecReport) {
        drawSpectrum(amplitudeSpecReport)
        amplitudeSpecReport = null
    }

    if (histogram) {
        drawhistogram(histogram, loudnessReported)
    }

}

function drawTitle(title) {
    try {
        push()
        translate(width / 2, height / 2)
        noStroke()
        fill(255, 0, 0)
        textSize(20)
        textAlign(CENTER)
        text(title, 0, -height / 2.5)
    } finally {
        pop()
    }
}

function drawBASS(rms, spectralCrest) {
    var w = width * 2
    var h = map(rms, 0, rmsMax, 100, height / 3)
    try {
        push()
        translate(width / 2, height)
        var spectralCrestCutOff = spectralCrestMax / 2
        var r = map(spectralCrest <= spectralCrestCutOff ? spectralCrest : 0, 0, spectralCrestCutOff, 0, 300)
        var g = map(spectralCrestCutOff < spectralCrest <= spectralCrestCutOff ? spectralCrest : 0, spectralCrestCutOff, spectralCrestMax, 0, 163)
        stroke(255, 165, 0, 192)
        strokeWeight(5)
        fill(r, g, 166, 192)
        ellipseMode(CENTER)
        ellipse(0, 0, w, h)
    } finally {
        pop()
    }
}

function drawSpectralCentroidBg(spectralCentroid) {
    var z = map(spectralCentroid, 0, spectralCentroidMax, 64, 128)
    noStroke
    fill(0, 0, 0)
    rect(0, 0, width, height / 2)
}

function drawhistogram(histogram, loudnessScaler) {
    var n = spectralSpreadBoxes
    var wfull = min(width, height) * map(loudnessScaler, 0, loudnessMax, 1.75, 1.75)
    var w = wfull / n
    var calculatePos = (i) => parseInt((i + 1) / 2.5) * (i % 2 !== 0 ? -1 : 1)
    var piall = [...Array(n).keys()].map(calculatePos).sort((a, b) => a - b)
    push()
    try {
        translate(width / 2, height / 2)
        var m = max(histogram)
        var x0 = -w / 2
        for (let i = 0; i < n; i++) {
            var iprime = piall[i]
            var c = histogram[i]
            if (c > 0 && c === m) histogram[i]--
            if (m > 0) {
                var h = 300 * (c / m)
                if (!isNaN(h) && h > 0) {
                    var x = x0 + w * iprime
                    var y = -h / 2
                    stroke(255, 255, 0, 192)
                    strokeWeight(1)
                    fill(255, 0, 0, 128)
                    rect(x, y, w, h)
                }
            }
        }
    } finally {
        pop()
    }
}

function drawSpectrum(amplitudeSpectrum) {
    let spectrum = fft.analyze();
    push();
    noStroke();
    fill(150, 25, 155);
    for (let i = 0; i < spectrum.length; i++) {
        let x = map(i, 0, spectrum.length, 0, width);
        let y = -height*2 + map(spectrum[i], 0, 255, height*2, 0);
        rect(x, height, width / spectrum.length, y / 2);
    }
    pop();

    fft.waveform();
}

function handleMeydaCallback(features) {
    // rms
    var rms = features.rms
    if (rms) {
        rmsReported = rms
        if (!rmsMax || rmsMax < rms) rmsMax = rms
    }

    // spectralCentroid
    var spectralCentroid = features.spectralCentroid
    if (spectralCentroid) {
        spectralCentroidReported = spectralCentroid
        if (!spectralCentroidMax || spectralCentroidMax < spectralCentroid) spectralCentroidMax = spectralCentroid
    }

    // amplitudeSpectrum
    var amplitudeSpectrum = features.amplitudeSpectrum
    if (amplitudeSpectrum && !amplitudeSpecReport) {
        amplitudeSpecReport = amplitudeSpectrum
    }

    // spectralSpread
    var spectralSpread = features.spectralSpread
    if (spectralSpread) {
        const spectralSpreadBox = parseInt(spectralSpread / 10)
        const spectralSpreadBoxBounded = max(0, min(spectralSpreadBoxes - 1, spectralSpreadBox))
        histogram[spectralSpreadBoxBounded]++
    }

    // spectralCrest
    var spectralCrest = features.spectralCrest
    if (spectralCrest) {
        spectralCrestReported = spectralCrest
        if (!spectralCrestMax || spectralCrestMax < spectralCrest) spectralCrestMax = spectralCrest
    }

    // loudness
    var loudness = features.loudness
    if (loudness && loudness) {
        loudnessReported = loudness.total
        if (!loudnessMax || loudnessMax < loudness.total) loudnessMax = loudness.total
    }
}
