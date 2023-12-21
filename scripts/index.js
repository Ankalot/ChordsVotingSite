import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'


var audioCtx = new (AudioContext || webkitAudioContext)();
var currSources = []

const gainNode = audioCtx.createGain();
const volumeInput = document.getElementById("volumeInput");
volumeInput.value = document.cookie;
gainNode.gain.value = volumeInput.value;
document.getElementById("volumeInput").addEventListener("input",
    (ev) => {
        document.cookie = ev.currentTarget.value;
        gainNode.gain.value = ev.currentTarget.value;
    }, false
);

const supabase = createClient("https://bdyvbrbsjpueshknxyjk.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkeXZicmJzanB1ZXNoa254eWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDMwNjUwMTUsImV4cCI6MjAxODY0MTAxNX0.YQpF30vC98GeAzll0Sz6YXg5gTSaB9tHJn23OR-2PG8");
// Don't hack my db pls :C

var c3v10_sample = await fetch("assets/piano/C3v10.mp3").then((response) => response.arrayBuffer()).then((buffer) => audioCtx.decodeAudioData(buffer))
var d_3v10_sample = await fetch("assets/piano/D_3v10.mp3").then((response) => response.arrayBuffer()).then((buffer) => audioCtx.decodeAudioData(buffer))
var f_3v10_sample = await fetch("assets/piano/F_3v10.mp3").then((response) => response.arrayBuffer()).then((buffer) => audioCtx.decodeAudioData(buffer))
var a3v10_sample = await fetch("assets/piano/A3v10.mp3").then((response) => response.arrayBuffer()).then((buffer) => audioCtx.decodeAudioData(buffer))
var c4v10_sample = await fetch("assets/piano/C4v10.mp3").then((response) => response.arrayBuffer()).then((buffer) => audioCtx.decodeAudioData(buffer))
var notesSamples = [c3v10_sample, d_3v10_sample, f_3v10_sample, a3v10_sample, c4v10_sample] // 300 cents difference


function playChord(notes) {
    audioCtx.resume().then(()=>{});

    for (const note of notes) {
        const intervalRatio = note/notes[0];
        const intervalCents = 1200*Math.log2(intervalRatio);

        var dCents = intervalCents%300;
        var nearestNote = Math.floor(intervalCents/300);
        if (dCents > 150) {
            dCents = dCents-300;
            nearestNote += 1;
        }

        const source = audioCtx.createBufferSource();
        source.buffer = notesSamples[nearestNote];
        source.detune.value =  dCents;
        source.connect(gainNode).connect(audioCtx.destination);
        currSources.push(source);
    }

    for (const source of currSources) {
        source.start(0);
    }
};


function stopPlayChord() {
    for (const source of currSources) {
        source.stop(0);
        source.disconnect();
    }
    currSources = [];
}


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const arrayRange = (start, stop, step) =>
    Array.from(
        { length: (stop - start) / step + 1 },
        (value, index) => start + index * step
    );

Array.prototype.sample = function() {
    return this[Math.floor(Math.random()*this.length)];
};

var gcd = function(a, b) {
    if (!b) {
      return a;
    }
  
    return gcd(b, a % b);
}

function genRandomChord(maxInt, N) {
    const chord = [];

    var x1 = getRandomInt(2, maxInt);
    chord.push(x1);
    var maxRange = Math.min(x1*2-1, maxInt);

    for (let i = 0; i < N-1; i++) {
        var possibleNums = arrayRange(chord[chord.length-1], maxRange, 1);
        const realPossibleNums = []
        possibleNums.forEach(possibleNum => {
            var isRealPossibleNum = true;
            chord.every(xiPrev => {
                if (gcd(xiPrev, possibleNum) != 1) {
                    isRealPossibleNum = false;
                    return false;
                }
                return true;
            });
            if (isRealPossibleNum) {
                realPossibleNums.push(possibleNum);
            }
        });
        if (realPossibleNums.length == 0) {
            return genRandomChord(maxInt, N);
        }
        chord.push(realPossibleNums.sample());
    }

    return chord
}

(function initChords() {
    var N1 = getRandomInt(2, 5);
    var N2 = getRandomInt(Math.max(N1-1, 2), Math.min(N1+1, 5));
    var chord1=genRandomChord(1000,N1);
    var chord2=genRandomChord(1000,N2);

    const playButton1 = document.getElementById("playButton1");
    playButton1.ondragstart = function() {return false};
    playButton1.onmousedown = () => playChord(chord1);
    playButton1.onmouseup = () => stopPlayChord();
    const playButton2 = document.getElementById("playButton2");
    playButton2.ondragstart = function() {return false};
    playButton2.onmousedown = () => playChord(chord2);
    playButton2.onmouseup = () => stopPlayChord();

    const voteButton = document.getElementById("voteButton");
    voteButton.onclick = async () => {
        voteButton.disabled = true;

        var afterVoteInfo = document.getElementById("chordsInfo");
        afterVoteInfo.textContent = `(${chord1.join(":")}) VS (${chord2.join(":")})`;
        afterVoteInfo.style.visibility = "visible";

        var result = document.getElementById("voteRange").value
        if ((chord1.length > chord2.length) || ((chord1.length == chord2.length) && (chord1 > chord2))) {
            [chord1, chord2] = [chord2, chord1]
            result = -result
        }
        const {error} = await supabase.from('ChordsComparison').insert({"chord1": chord1, "chord2": chord2, "result": result});
        if (error) {
            alert(JSON.stringify(error));
        }
    };
})();


document.getElementById("dataButton").onclick = async () => {
    const {data, error} = await supabase.from('ChordsComparison').select(); 
    if (error) {
        alert(error);
        return;
    }
    localStorage.setItem("data", JSON.stringify(data))
    window.location.href = 'data.html';
}