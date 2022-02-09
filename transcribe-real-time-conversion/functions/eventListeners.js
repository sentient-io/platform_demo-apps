let state = {
  model: 'generic_en_vosk',
  sampleRate: 16000,
  seqNum: 1,
  partial: '',
  pause: false,
  micActive: false,
  userApiKey: apikey,
  promptMessage:
    'Please provide valid Sentient.io API key to continue. You can get you API key from  https://platform.sentient.io/myaccount ',
  processFrequency: 1000 /** 1000ms */,
  attempts: 0,
}

const domId = {}

function registDomIds(ids /** Array of strings */) {
  ids.forEach((id) => {
    domId[id] = document.getElementById(id)
  })
}

function allDomIds() {
  /** Returns an array of all DOM element IDs */
  return Array.from(document.querySelectorAll('*[id]')).map((elem) => elem.id)
}
registDomIds(allDomIds())

const modelDescription = {
  'en-SG':
    'Better suited for transcribing prepared / formal speech (e.g. news or parliamentary speeches) with the Singaporean accent.',
  'en-SG-conversation':
    'Better suited for transcribing casual speech with the Singaporean accent. Tuned to also recognise names of local food and places.',
  'en-SG-telephony':
    'Better suited for transcribing conversations in lower sampling rate (e.g. 8khz for telephony).',
  generic_en_vosk:
    'Better suited for generic / broad usage across different accents.',
}
// Instatiate getUserMedia to get mic
const getUserMedia = (
  navigator.mediaDevices.getUserMedia ||
  navigator.mediaDevices.webkitGetUserMedia ||
  navigator.mediaDevices.mozGetUserMedia ||
  navigator.mediaDevices.msGetUserMedia
).bind(navigator.mediaDevices)

let mediaStream
let mediaRecorder

// Start Recording
function record() {
  if (getUserMedia) {
    // Connect to Mic
    getUserMedia({ audio: true })
      .then((inputSource) => {
        state.micActive = true

        mediaRecorder = RecordRTC(inputSource, {
          type: 'audio',
          mimeType: 'audio/wav',
          recorderType: StereoAudioRecorder,
          frameRate: state.sampleRate,
          desiredSampRate: state.sampleRate,
          numberOfAudioChannels: 1,
          bufferSize: 16384,
          timeSlice: state.processFrequency,
          ondataavailable: async function (blob) {
            // pcm blob is not yet wav
            if (!state.pause) {
              webSocket.send(blob)
            }
          },
        })
      })
      .then(() => {
        mediaRecorder.startRecording()
      })
      .catch((e) => {
        console.log(e)
        window.alert('Error connecting to Microphone, please try again')
        reloadPage()
      })
  }
}

// Stop Recording
function stopRecording() {
  mediaRecorder.stopRecording(() => {
    let blob = mediaRecorder.getBlob()
    webSocket.send(blob)
    webSocket.send('')
  })
  const audioTracks = mediaStream.getAudioTracks()
  audioTracks.forEach((track) => {
    track.stop()
  })
  state.micActive = false
}

function pauseRecording() {
  // Pause recording, but maintain websocket connection

  // Stop interval for sending audio blob to websocket
  // clearInterval(send_interval);
  mediaRecorder.pauseRecording()
  state.pause = true
  hideById('pauseButton')
  flexById('resumeButton')
}

function startRecording() {
  if (!hasAPIKey()) {
    requestApiKeyFromPrompt()
    if (!hasAPIKey()) {
      return
    }
  }

  if (state.pause) {
    mediaRecorder.resumeRecording()
    hideById('resumeButton')
    flexById('pauseButton')
  }
  state.pause = false
  console.log(state.micActive)
  if (!state.micActive) {
    startNewWebsocket()
      .then(() => {
        state.attempts = 0
        record()
      })
      .catch((err) => {
        hideById('loader')
        if (
          JSON.parse(err).message === 'Access Denied Unauthorized User' ||
          'Missing Authentication Token'
        ) {
          state.userApiKey = ''
          state.promptMessage =
            'Unauthorized user, please make sure you have subscribed [Online Automatic Speech Recognition ENG] microservice fron platform.sentient.io, and input the currect API key.'
          if (state.attempts < 2) {
            startRecording()
            state.attempts += 1
          }
        }
      })
  }
}

function selectModel() {
  let model = domId.modelSelector.value
  state.model = model
  domId.modelDescription.innerText = modelDescription[model]
}

function selectProcessFrequency() {
  let processFrequency = domId.processFrequencySelector.value
  state.processFrequency = processFrequency * 1000
}

function selectSampleRate() {
  domId.sampleRate.querySelectorAll('input').forEach((input) => {
    if (input.checked) {
      state.sampleRate = parseInt(input.value, 10)
    }
  })
}

function startTranscribing() {
  console.log(state)
  startRecording()
}

function reloadPage() {
  window.location.href = window.location.href
}