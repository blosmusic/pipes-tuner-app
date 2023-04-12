let tunerButton = document.getElementById("tuner-indication");
let tunerIsRunning = false;
let equalTemperamentCheckbox = document.getElementById(
  "equal-temperament-check"
);

let pitchBtns = document.querySelectorAll(".note-pitches-btn");
let filteredNotes = [];

let allNoteValues = [
  // JUST_INTONATION Notes
  {
    mode: "JUST_INTONATION",
    note: "D",
    freq: 293.33,
  },
  {
    mode: "JUST_INTONATION",
    note: "E",
    freq: 330,
  },
  {
    mode: "JUST_INTONATION",
    note: "F",
    freq: 352,
  },
  {
    mode: "JUST_INTONATION",
    note: "F#",
    freq: 366.66,
  },
  {
    mode: "JUST_INTONATION",
    note: "G",
    freq: 391.11,
  },
  {
    mode: "JUST_INTONATION",
    note: "A",
    freq: 440,
  },
  {
    mode: "JUST_INTONATION",
    note: "B",
    freq: 488.88,
  },
  {
    mode: "JUST_INTONATION",
    note: "C",
    freq: 521.48,
  },
  {
    mode: "JUST_INTONATION",
    note: "C#",
    freq: 549.99,
  },
  {
    mode: "JUST_INTONATION",
    note: "D",
    freq: 586.66,
  },
  // EQUAL_TEMPERAMENT Notes
  {
    mode: "EQUAL_TEMPERAMENT",
    note: "D",
    freq: 293.33,
  },
  {
    mode: "EQUAL_TEMPERAMENT",
    note: "E",
    freq: 329.26,
  },
  {
    mode: "EQUAL_TEMPERAMENT",
    note: "F",
    freq: 348.83,
  },
  {
    mode: "EQUAL_TEMPERAMENT",
    note: "F#",
    freq: 369.57,
  },
  {
    mode: "EQUAL_TEMPERAMENT",
    note: "G",
    freq: 391.54,
  },
  {
    mode: "EQUAL_TEMPERAMENT",
    note: "A",
    freq: 439.5,
  },
  {
    mode: "EQUAL_TEMPERAMENT",
    note: "B",
    freq: 493.32,
  },
  {
    mode: "EQUAL_TEMPERAMENT",
    note: "C",
    freq: 522.66,
  },
  {
    mode: "EQUAL_TEMPERAMENT",
    note: "C#",
    freq: 553.72,
  },
  {
    mode: "EQUAL_TEMPERAMENT",
    note: "D",
    freq: 586.66,
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

equalTemperamentCheckbox.addEventListener("change", () => {
  console.log(equalTemperamentCheckbox.checked);
  checkScaleValues();
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


  
  for (let i = 0; i < filteredNotes.length; i++) {
    let diff = frequency - filteredNotes[i].freq;
    if (Math.abs(diff) < Math.abs(recordDifference)) {
      closestNote = filteredNotes[i];
      recordDifference = diff;
    }
  // for (let i = 0; i < notes.length; i++) {
  //   let diff = frequency - notes[i].freq;
  //   if (Math.abs(diff) < Math.abs(recordDifference)) {
  //     closestNote = notes[i];
  //     recordDifference = diff;
  //   }

    checkIfNoteIsInKey(
      closestNote.mode,
      frequency,
      closestNote.note,
      closestNote.freq
    );
    tunerButton.textContent = closestNote.note;
  }
}

// todo check if note is in key and display note name in green if it is, red if it isn't
function checkIfNoteIsInKey(noteMode, inputFrequency, noteName, noteFreq) {
  console.log(
    "mode is:",
    noteMode,
    "\t",
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
  for (let i = 0; i < filteredNotes.length; i++) {
    if (btn.id === `note-pitches-btn-${i + 1}`) {
      btn.textContent = filteredNotes[i].note;
    }
  }

  btn.addEventListener("click", () => {
    // console.log(btn);
    console.log(
      "Mode:",
      filteredNotes[btn.id.slice(-1) - 1].mode,
      "\t",
      "Note:",
      filteredNotes[btn.id.slice(-1) - 1].note,
      "\t",
      "Frequency:",
      filteredNotes[btn.id.slice(-1) - 1].freq,
      "Hz"
    );
    // Tone.js code from https://tonejs.github.io/docs/14.7.77/Synth
    const synth = new Tone.Synth().toDestination();
    synth.triggerAttackRelease(filteredNotes[btn.id.slice(-1) - 1].freq, "2n");
  });
});

function checkScaleValues() {
  if (equalTemperamentCheckbox.checked === true) {
    console.log("equal temperament");
     filteredNotes = allNoteValues.filter(
       (note) => note.mode === "EQUAL_TEMPERAMENT"
     );
    console.log(filteredNotes);
  } else {
    console.log("just intonation");
     filteredNotes = allNoteValues.filter(
       (note) => note.mode === "JUST_INTONATION"
     );
    console.log(filteredNotes);
  }
}
