let state = {
  maxWords: 512,
  userApiKey: '',
}

const domElem = {
  // List of HTML element been selected by ID for easy access later
  textInput: document.getElementById('textInput'),
  textCount: document.getElementById('textCount'),
  textSumResult: document.getElementById('textSumResult'),
  sumResTitle: document.getElementById('sumResTitle'),
  sumResTxt: document.getElementById('sumResTxt'),
  scoreRes: document.getElementById('scoreRes'),
  summaryTextBtn: document.getElementById('summaryTextBtn'),
  restartBtn: document.getElementById('restartBtn'),
  loader: document.getElementById('loader'),
  tryOutBtn: document.getElementById('tryOutBtn'),
  /** Index for text input example, :number 0 - 3 */
  idx: 0,
  emptyInput: function () /** :void */ {
    this.textInput.value = ''
    countWords()
  },
  useInputExample: function () {
    this.tryOutBtn.innerText = 'Try with different text'
    this.idx < 3 ? this.idx++ : (this.idx = 0)
    this.textInput.value = inputExample[this.idx]
    countWords()
  },
  hideById: function (elems) {
    elems
      .replace(/\s/g, '')
      .split(',')
      .forEach((elem) => {
        this[elem].style.display = 'none'
      })
  },
  flexById: function (elems) {
    /** Set the display value of dom id as flex */
    elems
      .replace(/\s/g, '')
      .split(',')
      .forEach((elem) => {
        this[elem].style.display = 'flex'
      })
  },
  showById: function (elems) {
    /** Set the display value of dom id as flex */
    elems
      .replace(/\s/g, '')
      .split(',')
      .forEach((elem) => {
        this[elem].style.display = 'block'
      })
  },
}

const utility = {
  wordCount: function (str) /** :number */ {
    /**
     * Remove extra space and split word by word as an array
     * Later will count the array length for the word count
     * */
    const arr = str.replace(/\s+/g, ' ').split(' ')
    /**
     * When input text is empty, above regEx returns an array with 1 emenet ['']
     * If that happens, don't count it as 1 word.
     * */
    if (arr.length === 1 && arr[0] === '') {
      return 0
    } else {
      return arr.length
    }
  },
}

const loader = {
  start: function () {
    domElem.flexById('loader')
  },
  stop: function () {
    domElem.hideById('loader')
  },
}

countWords = function countWords() {
  domElem.textCount.innerHTML =
    utility.wordCount(domElem.textInput.value) + ` / ${state.maxWords} words`
}

domElem.textInput.addEventListener('input', countWords)

const inputExample = [
  `More than 2,000 Build-To-Order (BTO) Housing Board flats in Singapore's newest large estate, Bidadari, have been completed, with families progressively moving into their new homes.These flats are spread across three projects - Alkaff Vista, Alkaff LakeView and Alkaff CourtView - which were launched for sale by the HDB in 2015.More than 70 per cent of residents have moved into their new homes in Alkaff Vista and Alkaff LakeView, said the HDB in an update yesterday.About 50 per cent of residents have done the same at Alkaff CourtView, where works on community spaces are still in progress. All 12 public housing developments in Bidadari have been rolled out, with the final three projects - Bartley GreenRise, ParkEdge @ Bidadari and Alkaff Breeze - launched in this month's BTO sales exercise.Bartley GreenRise will be the last BTO site to be ready, and is estimated to be completed in the second quarter of 2025. The BTO flats in the 93ha Bidadari estate have been highly sought after by home seekers. The five-room flats typically drew more applicants than there were available units.This is despite Bidadari's past as a grave site, with some drawing similarities between the estate and the mature town of Bishan, which was also once a cemetery.Most of the units in Alkaff LakeView and Alkaff CourtView have been designed with structural columns tucked to the edges to allow residents greater flexibility in configuring their home layouts.
    `,
  `Whether you’re just doing some light touch-ups or going all out despite the reduced number of visitors you can receive, decluttering is always a good idea. When you regularly make the effort to reorganise your stuff, it makes the task at hand much easier each time. Sprucing up your home also means getting rid of the old things that you may not need anymore. But wait! Before you junk an item that just looks old but still has a lot of life left in it, consider donating it instead. This way, you can achieve your decluttering goals, waste less, and do good at the same time this Hari Raya Season. Here are nine places you can donate your clothes and furniture in Singapore:
    `,
  `"It's not every day you can go to look at a volcano so close," one visitor said
Iceland's Fagradalshraun volcano lies quiet for a spell before suddenly spewing red molten lava geysers high into the air, visible from the capital Reykjavik in an awe-inspiring display. The volcano, which sprang into life in mid-March in the Geldingadalir valley near Mount Fagradalsfjall, has drawn visitors from around the world, many venturing as close as possible to the safety perimeter set up to protect against sprays of red-hot rock. "It’s incredible to see," said Henrike Wappler, a German woman who lives in Iceland, standing with her daughter at the edge of the volcano. Marvelling at "the power of the earth," she told AFP Saturday on her fourth visit to the site: "I feel small so near to this power -- but I’m not scared." Up until a week ago, the volcanic activity was continuous and low key, but now it is alternating between quiet spells and furious outbursts.
    `,
  `SINGAPORE – The validity period of the Singapore passport will be extended to 10 years, up from the current five, from 1 October. However, the validity period of passports issued to those below16 years old will remain at five years. The new validity will apply to Singapore citizens aged 16 and above who submit a passport application on or after 1 October. In a press release on Friday (7 May), the Immigration & Checkpoints Authority (ICA), said that the validity increase is due to the current widespread use of biometrics screening technology worldwide and better durability of the biometrics chip. In April 2005, the validity period of the Singapore passport was reduced from 10 years to five years, in conjunction with the introduction of the biometric passport, ICA said. The passport incorporated a microchip that held the passport holder’s biometric information – facial and fingerprint identifiers. 
    `,
]

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
