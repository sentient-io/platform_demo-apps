/**
 * Declare required dom elements
 */
const PopupAlert = () => document.getElementById('PopupAlert')
const AlertTitle = () => document.getElementById('AlertTitle')
const AlertContent = () => document.getElementById('AlertContent')
const userInputText = () => document.getElementById('userInputText')
const userInputNoun = () => document.getElementById('userInputNoun')
const CharCount = () => document.getElementById('CharCount')
const AnalyseBtton = () => document.getElementById('AnalyseBtton')
const AnalyseBtnCtn = () => document.getElementById('AnalyseBtnCtn')
const InputErrorMessage = () => document.getElementById('InputErrorMessage')
const Loader = () => document.getElementById('Loader')
const ResultDisplay = () => document.getElementById('ResultDisplay')
const InputTextWithTag = () => document.getElementById('InputTextWithTag')
const clearUserInputBtn = () => document.getElementById('clearUserInputBtn')
const RestartButton = () => document.getElementById('RestartButton')
const SampleContent = () => document.getElementById('SampleContent')
const SampleContentCtn = () => document.getElementById('SampleContentCtn')

function show(elem) {
  // Display a dom element by remove the hidden attribute
  elem.removeAttribute('hidden')
}

function hide(elem) {
  // Hidden a dom element by add the hidden attribute
  elem.setAttribute('hidden', true)
}

function disable(elem) {
  elem.setAttribute('disabled', true)
}

function enable(elem) {
  elem.removeAttribute('disabled')
}

function hasApiKey() {
  if (
    (state.userApiKey === null || state.userApiKey == '') &&
    apikey == undefined
  ) {
    return false
  } else {
    return true
  }
}

function toggleUIHideShow(id) {
  const elem = document.getElementById(id)
  const icon = document.getElementById(id + 'icon')
  if (elem.classList.contains('hide')) {
    elem.classList.remove('hide')
    elem.classList.add('show')
    icon.innerText = 'expand_less'
  } else {
    elem.classList.add('hide')
    elem.classList.remove('show')
    icon.innerText = 'expand_more'
  }
}

function fetchApiKeyFromSessionStorage() {
  // Fetch user api key from the session storage
  const k = window.sessionStorage.getItem('sentientApiKey')
  state.userApiKey = k
}
/**
 * Detect if the demo app is running locally, if so, use session storage store
 * api key for developing convence.
 * */
if (
  location.hostname === 'localhost' ||
  location.hostname === '127.0.0.1' ||
  location.hostname === ''
) {
  // console.log('test-localhost')
  fetchApiKeyFromSessionStorage()
}

function clearUserInputText() {
  // Set the user input text to empty string
  userInputText().value = ''
  updateUserInputText()
  userInputNoun().value = ''
  updateUserInputNoun()
  hide(InputErrorMessage())
  resetSampleContent()
}

function updateUserInputText() {
  // Count the length of user input text
  const text = userInputText().value
  state.userInputText = text
  countUserInputText(text.length)
  toggleAnalyseBtton()
}

function updateUserInputNoun() {
  const noun = userInputNoun().value
  state.userInputNoun = noun
  toggleAnalyseBtton()
}

function countUserInputText(textLength) {
  CharCount().innerText = textLength
}

function toggleAnalyseBtton() {
  AnalyseBtton().setAttribute('disabled', true)
  const valid = state.userInputText && state.userInputNoun
  if (valid) {
    AnalyseBtton().removeAttribute('disabled')
  }
}

function validateUserInputNoun() {
  // Check is noun is part of provided text
  hide(InputErrorMessage())
  const valid =
    state.userInputText
      .toLocaleLowerCase()
      .includes(state.userInputNoun.toLocaleLowerCase()) &&
    !state.userInputNoun.includes(' ')
  if (!valid) {
    show(InputErrorMessage())
  }
  return valid
}

function requestUserApiKey() {
  state.userApiKey = prompt(
    'Unauthorized user, to continue test out, please provide a valid API key and try again.',
    state.userApiKey
  )
  window.sessionStorage.setItem('sentientApiKey', state.userApiKey)
}

function triggerAnalyseText() {
  // Core function that makes the api call

  // Validation for input and apikey
  if (!validateUserInputNoun()) return

  if (!hasApiKey()) {
    requestUserApiKey()
    if (!hasApiKey()) {
      return
    }
  }

  show(Loader())
  WSDAPICall()
    .then((result) => {
      // Validate result
      if (!validResult(result)) {
        show(InputErrorMessage())
        hide(Loader())
        return
      }
      displayResult(result)
      hide(Loader())
    })
    .catch((err) => {
      console.log(err)
      AlertTitle().innerText = err.errTitle
      AlertContent().innerText = err.errMsg
      show(PopupAlert())
      hide(Loader())
    })
}

function displayResult(result) {
  // This function will only be triggered if the result is valid
  hide(clearUserInputBtn())
  hide(AnalyseBtnCtn())
  hide(userInputText())
  disable(userInputNoun())
  hide(SampleContentCtn())
  show(ResultDisplay())
  show(InputTextWithTag())
  show(RestartButton())

  const resultUI = renderResultUI(result)

  // The userInputText will be marked with the color tags
  // Refer to function addTagToUserInputText()
  InputTextWithTag().innerHTML = state.markedUserInput
  ResultDisplay().append(resultUI)
}

function reloadPage() {
  window.location.href = window.location.href
}

function validResult(result) {
  // Validate result by check if the sentence_index is an empty object
  try {
    return Object.values(result['sentence_index']).length > 0
  } catch {
    return false
  }
}

function resetSampleContent() {
  state.sampleContent = 0
  SampleContent().innerHTML = ''
}

function loadSampleContent(n) {
  const sampleContent = Object.values(samples)[n]
  userInputText().value = sampleContent

  const sampleKey = Object.keys(samples)[n]
  userInputNoun().value = sampleKey

  updateUserInputText()
  updateUserInputNoun()
  const totalSample = Object.values(samples).length
  SampleContent().innerHTML = `(${n + 1}/${totalSample})`
  if (n === totalSample - 1) {
    state.sampleContent = 0
  } else {
    state.sampleContent++
  }
  hide(InputErrorMessage())
}

function ClosePopupAlert() {
  AlertContent().innerText = ''
  AlertTitle().innerText = ''
  hide(PopupAlert())
}
