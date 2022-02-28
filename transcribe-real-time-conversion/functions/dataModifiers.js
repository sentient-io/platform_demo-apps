function updateTranscribeResult(result) {
  let transResNodes = domId.transcribeResults.querySelectorAll('p')
  let lastTransResultNode = transResNodes[transResNodes.length - 1] || null
  if (result.status === 'listening') {
    newTranscribeSentence()
  } else if (lastTransResultNode === null) {
    newTranscribeSentence()
  }

  if (result.partial) {
    lastTransResultNode.innerText = result.partial
  } else if (result.text) {
    lastTransResultNode.innerText = capitalizeFirstLetter(result.text) + '.'
    newTranscribeSentence()
  }
}

function newTranscribeSentence() {
  const p = document.createElement('p')
  const br = document.createElement('br')

  /** Add ellipsis for newly created speech bubble with no content */
  p.classList.add('speech-bubble-with-ellipsis')

  domId.transcribeResults.append(p)
  domId.transcribeResults.append(br)

  scrollToEnd('transcribeResults')
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

function hideById(...ids) {
  ;[...ids].forEach((theId) => {
    domId[theId].setAttribute('style', 'display:none')
  })
}

function showById(...ids) {
  ;[...ids].forEach((theId) => {
    domId[theId].setAttribute('style', 'display:block')
  })
}

function flexById(...ids) {
  ;[...ids].forEach((theId) => {
    domId[theId].setAttribute('style', 'display:flex')
  })
}

function clearnContentById(...ids) {
  ;[...ids].forEach((theId) => {
    domId[theId].innerHTML = ''
  })
}

function forceArray(stringOrArray) {
  let theArray = stringOrArray
  typeof stringOrArray === 'string' ? (theArray = [stringOrArray]) : null
  return theArray
}

function capitalizeSentence(sentence) {
  // Extract the first letter of a sentence (by default capital)
  // And turn all the rest of characters to lowercase
  let formattedSentence = sentence[0] + sentence.substring(1).toLowerCase()
  return formattedSentence
}

function scrollToEnd(elementID) {
  const element = document.getElementById(elementID)
  element.scrollTop = element.scrollHeight
}

function hasAPIKey() {
  if (
    !state.userApiKey &&
    (typeof apikey == 'undefined' || apikey == '')
  ) {
    return false
  } else {
    return true
  }
}

function requestApiKeyFromPrompt() {
  state.userApiKey = prompt(state.promptMessage, state.cliApiKey)
  // Store apiKey in session storage. This will be cleared when browser tab closed
  window.sessionStorage.setItem('sentientApiKey', state.userApiKey)
}

function fetchApiKeyFromSessionStorage() {
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
  fetchApiKeyFromSessionStorage()
}
