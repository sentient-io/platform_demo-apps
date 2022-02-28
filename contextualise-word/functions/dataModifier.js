// Store general state
let state = {
  userApiKey: '', // User input api key for local host testing
  userInputText: '',
  markedUserInput: '', // User input text with all token marked as ${token}$
  userInputNoun: '',
  wsdResult: '',
  sampleContent: 0,
}

function markTextWithToken(text, token) {
  // Select satart, or space, or any special character before token
  // Select end, or any space, or any special character after token
  const tokenRegx = RegExp(
    `(^|[\\s]|[^0-9a-zA-Z])(${token})($|[\\s]|[^0-9a-zA-Z])`,
    'g'
  )
  const markedText = text.replace(tokenRegx, `\$\{${token}\}\$`)
  return markedText
}

function renderResultUI(result) {
  const tokenLength = Object.keys(result.tokens).length
  state.markedUserInput = state.userInputText

  const container = document.createElement('div')
  // Index of sentence index, returned result is object of {number: strong}
  const sentenceIdxArr = Object.keys(result.sentence_index)

  const subContainer = document.createElement('div')

  sentenceIdxArr.forEach((sentenceIdx /*number*/, idx) => {
    const tkn = result.tokens[sentenceIdx]
    const token = Object.keys(result.tokens[sentenceIdx])[0]
    const sentence = result.sentence_index[sentenceIdx]

    // Generate colors for each result card
    const hslColor = `hsl(${34 * idx + 1}deg, 80%, 40%)`

    const resultCard = renderResultCardUI(sentence, tkn[token], token, hslColor)
    subContainer.append(resultCard)
  })

  container.innerHTML = `
  <div>
    <p>
      We found the noun '<b>${state.userInputNoun}</b>' in <b>${tokenLength}</b> place(s)
    </p>

    <div style="
      max-height: 400px;
      overflow: scroll;
      background-color: white;
      border-radius: 0.5rem;
      padding: 0.5rem;
    ">  
       ${subContainer.innerHTML}
    </div>
    
  </div>
  `

  return container
}

function renderSentenceTagHTML(sentence, token, color) {
  /**
   * Add tag class to the token and return the html sentence
   */
  const tokenRegx = new RegExp(
    `(^|[\\s]|[^0-9a-zA-Z])(${token})($|[\\s]|[^0-9a-zA-Z])`,
    'ig'
  )

  const tag = `<span class="resTag" style="background-color:${color}">${token}</span>`

  const sentenceWithTag = sentence.replaceAll(tokenRegx, `$1${tag}$3`)

  addTagToUserInputText(sentence, sentenceWithTag)
  return sentenceWithTag
}

function addTagToMarkedUserText(token, tag) {
  const markedToken = `\$\{${token}\}\$`
  state.markedUserInput = state.markedUserInput.replace(markedToken, tag)
}

function addTagToUserInputText(originalStc, stcWithTag) {
  /**
   * Search through the entire user input text, and replace the sentence
   * contains token word with the sentence with tag.
   */
  const inputTextSrc = state.markedUserInput

  // New Regx from the original sentence but ignore all spaces and special characters
  const sentenceRegxSrc = originalStc
    .replace(/\s/g, '')
    .replace(/[^0-9a-zA-Z]/g, '.')
    .split('')
    .join('\\s*')
  const sentenceRegx = new RegExp(sentenceRegxSrc, 'i')

  state.markedUserInput = inputTextSrc.replace(sentenceRegx, stcWithTag)

  // Keep this block of code below for debugging, incase there is
  // future error with regx
  // if (inputTextSrc.match(sentenceRegx)) {
  //   state.markedUserInput = inputTextSrc.replace(sentenceRegx, stcWithTag)
  // } else {
  //   console.log('__________')
  //   console.log(inputTextSrc)
  //   console.log('**********')
  //   console.log(originalStc)
  //   console.log('**********')
  //   console.log(sentenceRegx)
  //   console.log('__________')
  // }
}

function renderResultCardUI(sentence, tokens, token, hslColor) {
  // Create html dom element of the result display card
  const resultCard = document.createElement('div')

  resultCard.innerHTML = `
  <div 
    style='
      background-color: white;
      border-radius: 0.25rem;
      border-left: 4px ${hslColor} solid;
    '
    class='my-md shadow'
  > 
    <div class="pa-xs">
      <p>${renderSentenceTagHTML(sentence, token, hslColor)}</p>
      <b style='color:${hslColor}'>Possible meanings:</b>
    </div>
	  <div>
	    	${renderPossibleMeaningsUI(tokens, hslColor).innerHTML}
    </div>
	  
  </div>
	`

  return resultCard
}

function renderPossibleMeaningsUI(tokens, color) {
  const container = document.createElement('div')

  tokens.forEach((token, idx) => {
    const possibleMeaningCtn = document.createElement('div')
    const id = 'possibleMeanings_' + String(Math.round(Math.random() * 100000))
    // hypernyms are the parend defination
    possibleMeaningCtn.innerHTML = `
    <div
      onclick="toggleUIHideShow('${id}')" 
      class="cursor-pointer pa-sm flex row no-wrap between"
      style='
        background-color:#f9f9f9;
        border-bottom: 1px solid;
        border-color:#e5e5e5;
      '
    >
      <b>${idx + 1}. ${token['synset_definition']}</b>
      <span 
        id="${id}icon"     
        class="material-icon" 
        style='font-size:1.5rem; color:#b3b3b3'
      >
        expand_more
      </span> 
    </div>
    
    <div 
      class="hide-show hide" 
      id="${id}"      
    >      
      <div 
        class='pa-sm'
        style="
          background-color:#ededed;
        "
        >
        <p>Possible Parent Class Difinitions:</p>
        <div class='pa-xs'>
          ${renderParentClassDefinationUI(token.hypernyms, color).innerHTML}
        </div>
      </div>
    </div>
    `
    container.append(possibleMeaningCtn)
  })

  return container
}

function renderParentClassDefinationUI(hypernyms, color) {
  const container = document.createElement('div')
  hypernyms.forEach((hypernym, idx) => {
    const subContainer = document.createElement('div')
    const innerHTML = `
		<b style='color:${color}'>
      ${idx + 1}. ${formatHypernymName(hypernym['hypernym_name'])}
    </b>
		<p>${hypernym['hypernym_definition']}</p>
		`
    subContainer.innerHTML = innerHTML
    container.append(subContainer)
  })

  return container
}

function formatHypernymName(name) {
  let formattedName = name.replace(/\_/g, ' ').replace(/\.n\..*$/g, '')
  formattedName = formattedName[0].toUpperCase() + formattedName.slice(1)
  return formattedName
}
