/**
 * List of ids from HTMl tag here, will be
 * registered via registDomIds() function
 */
const ids = [
  'useProvidedText',
  'modelSelector',
  'modelSelectorForm',
  'pitchAndTempoSliders',
  'pitch',
  'pitchVal',
  'tempo',
  'tempoVal',
  'wordCount',
  'inputText',
  'pitchAndTempoSliders',
  'userInputFunctions',
  'convertToSpeechBtn',
  'audioResult',
  'playAudioButton',
  'loader',
  'app-inputs',
  'app-controls',
  'app-options',
  'app-result',
  'appResultDescription',
]
const domId = {}
/**
 * Register list of ids to domId element. HTML elements then
 * can be accessed via domId['htmlId'] or domId.htmlId.
 */
function registDomIds() {
  ids.forEach((id) => {
    domId[id] = document.getElementById(id)
  })
}
registDomIds()

function selectLang() {
  op.storeExistingUserInputByLanguage()

  const languagesRadioBtnNodes = document.querySelectorAll(
    'input[name="language"]'
  )
  state.language = op.getCheckedRadioBtnValue(languagesRadioBtnNodes)

  // if (state.language === 'english' && state.model === 'female_singaporean') {
  //     /** Only show modelSelectorFrom for english languange */
  //     op.flexDomElement(domId['modelSelectorForm']);
  // } else if (state.language === 'english') {
  //     op.hideDomElement(domId['modelSelectorForm']);
  // } else {
  //     op.hideDomElement(domId['modelSelectorForm']);
  // }

  state.wordLimit = op.getWordLimit_and_updateInputPlaceholderText_ByLanguage(
    state.language
  )
  op.getExistingUserInputByLanguage()
  op.updateUserInputCount()
  op.updateUserInputPlaceholderText()
  op.enableConvertToSpeechBtnIfHasUserInputText()
  op.toggle_model_pitch_tempo_controls()
  op.toggle_user_provided_text()
}

function toggleUseProvidedTextState() {
  state.useProvidedText = domId['useProvidedText'].checked
  op.toggle_user_provided_text()
  op.enableConvertToSpeechBtnIfHasUserInputText()
}

function selectModel() {
  state.model = domId['modelSelector'].value
  // op.toggle_pitchAndTempoSliders();
  op.toggle_model_pitch_tempo_controls()
}

function updatePitchAndTempo(field) {
  domId[field + 'Val'].innerText = state[field] = domId[field].value
  console.log(state[field])
  // ['pitch', 'tempo'].forEach((key) => {
  //   /** Assign slider input value to both state and HTML element */
  //   console.log(domId[key].value)
  //   domId[key + 'Val'].innerText = state[key] = domId[key].value
  //   console.log(domId[key + 'Val'].innerText, state[key])
  // })
}

function inputText(val) {
  state.text = val /** Update state */
  op.updateUserInputCount()
  op.enableConvertToSpeechBtnIfHasUserInputText()
}

function clearInputText() {
  state.useProvidedText = domId['useProvidedText'].checked = false
  /** Uncheck use provided text box and update state */
  state.userInput = domId['inputText'].value = ''
  op.updateUserInputCount()
  op.enableConvertToSpeechBtnIfHasUserInputText()
}

function convertTextToSpeech() {
  if (!op.hasApiKey()) {
    op.requestApiKeyFromPrompt()

    if (!op.hasApiKey()) {
      // Fall back - if user didn't input anuthing in to the popup prompt
      return false
    }
  }

  op.flexDomElement(domId['loader'])

  makeTtsAPICall()
    .then((res) => {
      res.results && res.results['wav_base64']
        ? op.convertBase64ToAudioDomElem(res.results['wav_base64'])
        : op.convertBase64ToAudioDomElem(res.audioContent)
      op.disableDomElement(domId['inputText'])

      domId['appResultDescription'].innerText = state.resultDescription
      op.flexDomElement(domId['app-result'])
      ;['userInputFunctions', 'app-options'].forEach((id) => {
        op.hideDomElement(domId[id])
      })
      op.hideDomElement(domId['app-controls'])
    })
    .catch((err) => {
      alert(JSON.stringify(err))
    })
    .finally(() => {
      op.hideDomElement(domId['loader'])
    })
}

function playPauseAudio() {
  console.log(domId['audioResult'])
  if (state.audioPlaying) {
    state.audioPlaying = false
    domId['audioResult'].pause()
  } else {
    domId['audioResult'].play()
    state.audioPlaying = true
  }
}

function reloadPage() {
  window.location.href = window.location.href
}

const op = {
  getCheckedRadioBtnValue(radioArr /** Dom radio node array */) {
    /** Loop through the radio node array, find the checked value */
    let res
    radioArr.forEach((radioBtn) => {
      if (radioBtn.checked) {
        res = radioBtn.value
      }
    })
    return res
  },

  flexDomElement(domElem) {
    domElem.setAttribute('style', 'display:flex')
  },

  block_flex(domElem) {
    domElem.setAttribute('style', 'display:flex')
  },

  showDomElement(domElem) {
    domElem.setAttribute('style', 'display:block')
  },

  hideDomElement(domElem) {
    domElem.setAttribute('style', 'display:none')
  },

  block_hide(domElem) {
    domElem.setAttribute('style', 'display:none')
  },

  visual_hide(domElem) {
    domElem.setAttribute('style', 'visibility:hidden')
  },

  visual_show(domElem) {
    domElem.setAttribute('style', 'visibility:visible')
  },

  updateUserInputCount() {
    const userInput = domId['inputText'].value
    domId['wordCount'].innerText = `${userInput.length} / ${state.wordLimit}`
    if (userInput.length > state.wordLimit) {
      this.trimInputTextByLimit()
    }
    /**
     * If user almost reached the wordLimit,
     * change word count text to red
     */
    if (userInput.length > state.wordLimit - 100) {
      domId['wordCount'].setAttribute('style', 'color:red')
    } else {
      domId['wordCount'].setAttribute('style', 'color:black')
    }

    state.userInputCount = userInput.length
  },

  trimInputTextByLimit() {
    domId['inputText'].value = domId['inputText'].value.slice(
      0,
      state.wordLimit
    )
    this.updateUserInputCount()
  },

  getWordLimit_and_updateInputPlaceholderText_ByLanguage(language) {
    let limit
    switch (language) {
      case 'english':
        limit = 2000
        state.inputPlaceholderText = 'Put some text here to convert to speech'
        break
      case 'japanese':
        limit = 800
        state.inputPlaceholderText = 'ここにテキストを入力して音声に変換します'
        break
      case 'mandrain':
      default:
        limit = 750
        state.inputPlaceholderText = '请在此处输入一些文字以转换为语音'
        break
    }
    return limit
  },

  updateUserInputPlaceholderText() {
    domId['inputText'].setAttribute('placeholder', state.inputPlaceholderText)
  },

  hasApiKey() {
    // console.log(isNull(state.userApiKey))
    // console.log(apikey == undefined)
    if (
      (state.userApiKey === null || state.userApiKey == '') &&
      apikey == undefined
    ) {
      return false
    } else {
      return true
    }
  },

  requestApiKeyFromPrompt() {
    state.userApiKey = prompt(
      'Unauthorized user, to continue test out, please provide a valid API key and try again.',
      state.userApiKey
    )
    window.sessionStorage.setItem('sentientApiKey', state.userApiKey)
  },

  convertBase64ToAudioDomElem(_base64) {
    const base64 = 'data:audio/wav;base64,' + _base64
    domId['audioResult'].setAttribute('src', base64)
  },

  storeExistingUserInputByLanguage() {
    state.userInput[state.language] = domId['inputText'].value
  },

  getExistingUserInputByLanguage() {
    domId['inputText'].value = state.userInput[state.language]
  },

  hasUserInput() {
    if (state.userInput[state.language] || domId['inputText'].value) {
      return true
    } else {
      return false
    }
  },

  enableConvertToSpeechBtnIfHasUserInputText() {
    if (this.hasUserInput()) {
      this.enableDomElement(domId['convertToSpeechBtn'])
    } else {
      this.disableDomElement(domId['convertToSpeechBtn'])
    }
  },

  disableDomElement(domElem) {
    domElem.setAttribute('disabled', true)
  },

  enableDomElement(domElem) {
    domElem.removeAttribute('disabled')
  },
  toggle_pitchAndTempoSliders() {
    state.model === 'female_singaporean' && state.language === 'english'
      ? this.flexDomElement(domId['pitchAndTempoSliders'])
      : this.hideDomElement(domId['pitchAndTempoSliders'])
  },
  toggle_user_provided_text() {
    if (state.useProvidedText) {
      state.userInput = domId['inputText'].value =
        state.providedText[state.language]
    } else {
      domId['inputText'].value = ''
    }
    this.updateUserInputCount()
  },
  browser_is(browser) {
    return navigator.userAgent.indexOf(browser) != -1
  },

  toggle_model_pitch_tempo_controls() {
    this.visual_hide(domId['pitchAndTempoSliders'])
    this.block_hide(domId['modelSelectorForm'])

    if (state.language === 'japanese') {
      this.visual_show(domId['pitchAndTempoSliders'])
    } else if (
      state.language === 'english' &&
      state.model === 'female_singaporean'
    ) {
      this.block_flex(domId['modelSelectorForm'])
      this.visual_show(domId['pitchAndTempoSliders'])
    } else if (state.language === 'english') {
      this.block_flex(domId['modelSelectorForm'])
    } else {
      null
    }
  },
}

;(function mounted() {
  op.toggle_user_provided_text()

  if (
    op.browser_is('Firefox') &&
    performance.navigation.type == performance.navigation.TYPE_RELOAD
  ) {
    /** Firefox browser caches the input value ... always load page from fresh URL when user hit the browser refresh button */
    reloadPage()
  }

  if (op.browser_is('Firefox')) {
    op.flexDomElement(domId['playAudioButton'])
    op.hideDomElement(domId['audioResult'])
  }
})()
