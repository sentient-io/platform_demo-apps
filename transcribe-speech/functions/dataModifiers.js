/** List of HTML element been selected by ID for easy access later */
const domElem = {
	/**
	 * Each id in html page should be registered here
	 * Access the html element by domElem.(html id text) or domElem[html id text]
	 * */
	languageSelector: document.getElementById('languageSelector'),
	langSelectorSection: document.getElementById('langSelectorSection'),
	startRecordingSection: document.getElementById('startRecordingSection'),
	modelSelector: document.getElementById('modelSelector'),
	modelSelectorSection: document.getElementById('modelSelectorSection'),
	voiceRecorderSection: document.getElementById('voiceRecorderSection'),
	modelDescription: document.getElementById('modelDescription'),
	transResultSection: document.getElementById('transResultSection'),
	/** Loaders for the transcription result */
	loaders /** :Array */: document.getElementsByClassName('loader'),

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

/** Global object to store state and data */
let state = {
	userApiKey: apikey,
	language: 'english',
	model: 'generic',
	modelDesc: {
		generic:
			'Large nnet3-chain factorized TDNN model, trained on ~1200 hours of audio. Generic English, 16KHz',
		prepared_speech:
			'Better suited for transcribing Singapore-accented prepared / formal speech (e.g. news or parliamentary speeches). 16 kHz, mono channel, .wav format',
		telephony:
			'Better suited for Singapore-accented conversational speech or telephony use cases. 8 kHz, mono channel, .wav format.',
	},
	transCount: 1 /** transcription result count */,
}

const userSelection = {
	language: function () {
		/** Select checked input from languange selector form */
		const language = domElem.languageSelector.querySelector(
			'input[name="language"]:checked'
		).value
		state.language = language
		console.log('Languange selected: ', language)

		language === 'english'
			? domElem.flexById('modelSelectorSection')
			: domElem.hideById('modelSelectorSection')
	},
	model: function () {
		const model = domElem.modelSelector.value
		state.model = model

		/** If user selected telephony, set the sample rate to 8000 */
		model === 'telephony'
			? (recorderConfig.sampleRate = 8000)
			: (recorderConfig.sampleRate = 16000)

		domElem.modelDescription.innerText = state.modelDesc[model]
		console.log('Model selected: ', model)
	},
}
/** Listen to radio button selection event */
domElem.languageSelector.addEventListener('input', userSelection.language)
/** Listen to dropdown list selection event */
domElem.modelSelector.addEventListener('input', userSelection.model)

const userAction = {
	startTranscribe: function () {
		Recorder.get(function (rec) {
			recorder = rec
		}).then(() => {
			/** Hide start recording button section */
			console.log('Start transcribing')
			domElem.hideById(
				'startRecordingSection, modelSelectorSection, langSelectorSection'
			)
			domElem.flexById('transResultSection, voiceRecorderSection')
		})
	},
	recordAudio: function () {
		recorder.start()
		console.log('startRecording')
	},
	transAudio: function () {
		/** recorder.getBlob() will also stop the audio recorder */
		const blob = recorder.getBlob()

		utility
			.parseBase64(blob)
			.then((base64 /** :String */) => {
				utility.initLoader()

				/** pass blob to asr and await result */
				return asr.post(state.language, state.model, base64)
			})
			.then((response /** :String */) => {
				const res = JSON.parse(response)

				return utility.parseResponse(res)
				/**
				 * TODO: Call another function to render trans results
				 * Show an alert if there is error (and handle the failed event)
				 * Display result as dom element if successful
				 * */
			})
			.then((transResults /** :Array | String */) => {
				console.log(transResults)
				console.log(typeof transResults)

				if (!transResults[0] || typeof transResults === 'string') {
					/** Mandrain ASR result is in type of string */
					utility.renderTransResults(transResults)
				} else {
					/** English art result is array or object */
					transResults.forEach((transResult) => {
						utility.renderTransResults(transResult)
					})
				}
			})

		console.log('Transcribing audio')
	},
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
	console.log('test-localhost')
  fetchApiKeyFromSessionStorage()
}


const utility = {
	parseBase64: function (blob) {
		/**
		 * Didn't write the reject function here
		 * because the blob will be valid element from recorder
		 * */
		return new Promise((resolve) => {
			const reader = new window.FileReader()
			reader.readAsDataURL(blob)
			reader.onloadend = function () {
				/** Sentient.io's ASR takes the part after base64, as string input, don't need the before part */
				const base64 = reader.result.split('base64,')[1]
				console.log('Base64 string rendered.')
				console.log(base64)
				resolve(base64)
			}
		})
	},
	initLoader: function () {
		/**
		 * Add below html tag to display loading icon
		 * <div class="loader"></div>
		 * */
		const div = document.createElement('DIV')
		div.classList = 'loader'

		domElem.transResultSection.prepend(div)
	},
	rmvLastLoader: function () {
		const loaders /** :Array */ = document.getElementsByClassName('loader')
		loaders[0].parentNode.removeChild(loaders[0])
	},
	parseResponse: function (response) {
		return new Promise((resolve) => {
			console.log(response.message)
			if (response.status === 'Success') {
				resolve(response.results.output)
			} else if (
				response.message.includes('Missing Authentication Token') ||
				response.message.includes('Access Denied Unauthorized User')
			) {
				this.rmvLastLoader()
				state.userApiKey = prompt(
					'Unauthorized user, to continue test out, please provide a valid API key and try again.',
					state.cliApiKey
				)
			} else {
				this.rmvLastLoader()
				alert('Error: ' + response.message)
			}
		})
	},
	renderTransResults: function (result /** :Object | String */) {
		/**
		 * Render html element in the format below
		 * <div>
		 * <span>1.</span>
		 * <p>some transcription resuts</p>
		 * </div>
		 * */
		const div = document.createElement('DIV')
		const numTag = document.createElement('SPAN')
		const text = document.createElement('P')

		result.text /** Transcription result */
			? (text.innerText = result.text) /** For English ASR */
			: (text.innerText = result) /** For Mandarin ASR */
		numTag.innerHTML = state.transCount + '.'
		div.append(numTag)
		div.append(text)

		const loader = domElem.loaders[domElem.loaders.length - 1]
		if (loader) {
			/**
			 * If there is still procesing loader,
			 * insert the transcription text before the top loader
			 * */
			domElem.transResultSection.insertBefore(div, loader)
			/** After insert transResult, remove the loader */
			loader.parentNode.removeChild(loader)
		} else {
			domElem.transResultSection.append(div)
		}

		console.log(result)

		state.transCount++
	},
}
