function summaryText() {
	const text = domElem.textInput.value

	if (text === '') {
		alert(
			'Please provide some text to summary. Or use our provided demo text by click "Try out with provided text" button.'
		)
		return
	}
	// Handle if no API key
	if (!hasApiKey()) {
		state.userApiKey = prompt(
			'Unauthorized user, to continue test out, please provide a valid API key and try again.',
			state.user
		)
		window.sessionStorage.setItem('sentientApiKey', state.userApiKey)

		if (!hasApiKey()) {
			return
		}
	}
	loader.start()
	textSum(text)
		.then((res) => {
			domElem.flexById('textSumResult, restartBtn')
			const str = res.results?.text || res
			const score = res.results?.score || 2
			domElem.sumResTitle.innerText = `Text Summary Result (${utility.wordCount(
				str
			)} words)`
			domElem.sumResTxt.innerText = str
			domElem.scoreRes.innerText = `Confidence score (0.0 lowest - 2.0 highest): ${score.toFixed(
				1
			)}`
			domElem.hideById('summaryTextBtn, tryOutBtn')
		})
		.catch((err) => {
			alert(err)
		})
		.finally(() => {
			domElem.textInput.setAttribute('disabled', true)
			loader.stop()
		})
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
fetchApiKeyFromSessionStorage()

const restart = function () {
	location.reload()
}
