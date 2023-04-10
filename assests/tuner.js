let tunerButton = document.getElementById("tuner-indication");
let tunerIsRunning = false;

let pitchBtns = document.querySelectorAll(".note-pitches-btn");

let notes = [
  {
    mode: "GUITAR",
    note: "E",
    freq: 82.41,
  },
  {
    mode: "GUITAR",
    note: "A",
    freq: 110,
  },
  {
    mode: "GUITAR",
    note: "D",
    freq: 146.83,
  },
  {
    mode: "GUITAR",
    note: "G",
    freq: 196,
  },
  {
    mode: "GUITAR",
    note: "B",
    freq: 246.94,
  },
  {
    mode: "GUITAR",
    note: "e",
    freq: 329.63,
  },
];

// ml5 code from https://learn.ml5js.org/#/reference/pitch-detection
let model_url =
  "https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe";

document
  .getElementById("tuner-indication")
  .addEventListener("click", async () => {
    await Tone.start();
    document.querySelector("h4").innerText = "Permission Granted";
    console.log("audio is ready");
  });

tunerButton.onclick = function () {
  if (!tunerIsRunning) {
    startTuner();
  } else {
    stopTuner();
  }
};

function startTuner() {
  console.log("tuner started");
  tunerButton.innerText = "O";
  tunerIsRunning = true;
  tunerButton.style.backgroundColor = "grey";
  tunerButton.style.color = "#333";

  setup();
}

function stopTuner() {
  console.log("tuner stopped, mic closed");
  tunerButton.innerText = "I";
  tunerIsRunning = false;
  audioContext.close();
  tunerButton.style.backgroundColor = "darkred";
  document.querySelector("#note-flat").style.color = "grey";
  document.querySelector("#note-sharp").style.color = "grey";
}

async function setup() {
  audioContext = new AudioContext();
  stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false,
  });
  startPitch(stream, audioContext);
}

function startPitch(stream, audioContext) {
  pitch = ml5.pitchDetection(model_url, audioContext, stream, modelLoaded);
}

function modelLoaded() {
  getPitch();
}

function getPitch() {
  pitch.getPitch(function (err, frequency) {
    if (frequency) {
      frequency = frequency.toFixed(2);
      noteValueOfFrequency(frequency);
      comparePitchToNote(frequency);

      // display pitch and closest note
      document.querySelector("#result").textContent = frequency;
    } else if (err) {
      err = "No pitch detected";
      document.querySelector("#result").textContent = err;
      console.log("ml5:", err);
    }
    getPitch();
  });
}

function noteValueOfFrequency(frequencyValue) {
  frequencyValue = Tone.Frequency(frequencyValue, "hz").toNote();
  document.querySelector("#value").textContent = frequencyValue;
  return frequencyValue;
}

// todo compare pitch to closest note in scale and display note
function comparePitchToNote(frequency) {
  let closestNote = -1;
  let recordDifference = Infinity;

  for (let i = 0; i < notes.length; i++) {
    let diff = frequency - notes[i].freq;
    if (Math.abs(diff) < Math.abs(recordDifference)) {
      closestNote = notes[i];
      recordDifference = diff;
    }

    checkIfNoteIsInKey(frequency, closestNote.note, closestNote.freq);
    tunerButton.textContent = closestNote.note;
  }
}

// todo check if note is in key and display note name in green if it is, red if it isn't
function checkIfNoteIsInKey(inputFrequency, noteName, noteFreq) {
  console.log(
    "input frequency is:",
    inputFrequency,
    "Hz",
    "\t",
    "equals the note value:",
    noteValueOfFrequency(inputFrequency),
    "\t",
    "closest note is:",
    noteName,
    "\t",
    "with frequency:",
    noteFreq
  );
  switch (true) {
    case inputFrequency < noteFreq - 1:
      tunerButton.style.backgroundColor = "gold";
      document.querySelector("#note-flat").style.color = "gold";
      document.querySelector("#note-sharp").style.color = "grey";
      break;
    case inputFrequency > noteFreq + 1:
      tunerButton.style.backgroundColor = "gold";
      document.querySelector("#note-sharp").style.color = "gold";
      document.querySelector("#note-flat").style.color = "grey";
      break;
    default:
      tunerSuccess();
  }
}

function tunerSuccess() {
  document.querySelector("#note-flat").style.color = "#00ff9f";
  document.querySelector("#note-sharp").style.color = "#00ff9f";
  tunerButton.style.backgroundColor = "#00ff9f";
}

pitchBtns.forEach((btn) => {
  for (let i = 0; i < notes.length; i++) {
    if (btn.id === `note-pitches-btn-${i + 1}`) {
      btn.textContent = notes[i].note;
    }
  }

  btn.addEventListener("click", () => {
    // console.log(btn);
    console.log(
      "Note:",
      notes[btn.id.slice(-1) - 1].note,
      "\t",
      "Frequency:",
      notes[btn.id.slice(-1) - 1].freq,
      "Hz"
    );
    // Tone.js code from https://tonejs.github.io/docs/14.7.77/Synth
    const synth = new Tone.Synth().toDestination();
    synth.triggerAttackRelease(notes[btn.id.slice(-1) - 1].freq, "2n");
  });
});
