function makeTtsAPICall() {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest()
    xhr.addEventListener('readystatechange', function () {
      if (this.readyState === this.DONE) {
        const response = JSON.parse(this.response)
        if (response.status == 'Failure') {
          if (this.status == 403) {
            // If returned message contains unauthorized user, remove the session storage api key
            state.userApiKey = ''
            window.sessionStorage.removeItem('sentientApiKey')
          }
          reject('Error: ' + this.status + ' ' + response.message)
        } else {
          resolve(response)
        }
      }
    })

    xhr.open('POST', op.mapEndpointByLanguage())
    // console.log(op.mapEndpointByLanguage())
    // console.log(state.userApiKey)
    if (state.userApiKey !== null && state.userApiKey) {
      xhr.setRequestHeader('x-api-key', state.userApiKey)
    } else {
      xhr.setRequestHeader('x-api-key', apikey)
    }
    xhr.setRequestHeader('content-type', 'application/json')

    xhr.send(JSON.stringify(op.generateBodyByLanguage()))
    console.log(op.generateBodyByLanguage())
  })
}

op.mapEndpointByLanguage = function () {
  const map = {
    english:
      'https://apis.sentient.io/microservices/voice/ttseng/v1/getpredictions',
    japanese:
      'https://apis.sentient.io/microservices/voice/ttsjp/v0/getpredictions',
    mandarin:
      'https://apis.sentient.io/microservices/voice/ttssch/v0.1/getpredictions',
  }
  return map[state.language]
}

op.generateBodyByLanguage = function () {
  const body = {}

  if (state.language === 'english' && state.model === 'female_singaporean') {
    body.text = modelFix.force_full_stop_for_female_singaporean_model(
      domId['inputText'].value
    )
    body.model = state.model
    body['pitch_scale'] = state.pitch
    body['tempo_scale'] = state.tempo

    /** Result Description will be display on the result component with audio player */
    state.resultDescription = `| Model: ${state.model} | Pitch: ${state.pitch} | Tempo: ${state.tempo}`
  } else if (state.language === 'english') {
    body.text = domId['inputText'].value
    body.model = state.model
    state.resultDescription = `| Model: ${state.model}`
  } else if (state.language === 'japanese') {
    body.text = domId['inputText'].value
    body['pitch_scale'] = state.pitch * 1.0001 //can think of a better way to change whole num to float
    body['tempo_scale'] = state.tempo * 1.0001 //can think of a better way to change whole num to float
    console.log(body['tempo_scale'])

    /** Result Description will be display on the result component with audio player */
    state.resultDescription = ` | Pitch: ${state.pitch} | Tempo: ${state.tempo}`
  } else {
    body.text = domId['inputText'].value
  }
  state.resultDescription = `Language: ${this.string_to_title(
    state.language
  )} ${state.resultDescription}`

  return body
}

op.popupAlertError = function (errCode, errMsg) {
  alert(`Error ${errCode}: ${errMsg}`)
}

op.string_to_title = function (_str) {
  const str = _str[0].toUpperCase() + _str.substr(1).toLowerCase()
  return str
}

const modelFix = {
  force_full_stop_for_female_singaporean_model(text) {
    /** For female singaporean model, the input text have to end with a full stop '.' */
    if ([',', '.', '?', '!'].includes(text[text.length - 1])) {
      return text
    } else {
      return text + '.'
    }
  },
}
