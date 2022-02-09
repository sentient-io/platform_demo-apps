function objectDetectionAPICall(image) {
	return new Promise((resolve, reject) => {
		//request body check from API Documentation ˛˛˛˛˛
		let data = JSON.stringify({
			image_base64: image,
		})
		let xhr = new XMLHttpRequest()
		xhr.addEventListener('readystatechange', function () {
			if (this.readyState === this.DONE) {
				const response = JSON.parse(this.responseText)
				if (response.status == 'Failure') {
					if (this.status == 403) {
						// If returned message contains unauthorized user, remove the session storage api key
						state.userApiKey = ''
						window.sessionStorage.removeItem('sentientApiKey')
					}
					reject('Error: ' + this.status + ' ' + response.message)
				} else {
					resolve(response.results.objects)
				}
			}
		})
		xhr.open(
			'POST',
			'https://apis.sentient.io/microservices/cv/objectdetection/v1/getpredictions'
		)
		xhr.setRequestHeader('content-type', 'application/json')
		xhr.setRequestHeader('x-api-key', state.userApiKey)
		xhr.send(data)
	})
}

function textToSpeechAPICall(sentence) {
	return new Promise((resolve, reject) => {
		//request body check from API Documentation
		let data = JSON.stringify({
			text: sentence,
			model: 'female_singaporean',
			pitch_scale: 1,
			tempo_scale: 1,
		})
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
		xhr.open(
			'POST',
			'https://apis.sentient.io/microservices/voice/ttseng/v1/getpredictions'
		)
		xhr.setRequestHeader('content-type', 'application/json')
		xhr.setRequestHeader('x-api-key', state.userApiKey)
		xhr.send(data)
	})
}
