const asr = {
  endpoint: {
    english:
      'https://apis.sentient.io/microservices/voice/asr/v1/getpredictions',
    mandarin:
      'https://apis.sentient.io/microservices/voice/asrsch/v1/getpredictions',
  },
  post: function (language, model, base64) {
    return new Promise((resolve) => {
      /** Create new XMLHttpRequest to make the API call */
      const xhr = new XMLHttpRequest()

      /** Assign base64 string to data object */
      const dataObj = { wav_base64: base64 }
      /** For english, it took an model*/
      language === 'english' ? (dataObj.model = model) : ''

      /** Init endpoint as english ast */
      let endpoint = this.endpoint.english
      /** If user selected mandarin, change endpoint */
      language === 'mandarin' ? (endpoint = this.endpoint.mandarin) : ''

      /**
       * Sentient.io's ASR takes all input as an string,
       * convert data object in to string before make API call
       * */
      const data = JSON.stringify(dataObj)

      xhr.addEventListener('readystatechange', function () {
        if (this.readyState === this.DONE) {
          /** Use promise to pass the value to the next function */
          resolve(this.response)
        }
        if (this.readyState === this.DONE) {
          if (this.response.status == 'Failure') {
            if (this.status == 403) {
              // If returned message contains unauthorized user, remove the session storage api key
              state.userApiKey = ''
              window.sessionStorage.removeItem('sentientApiKey')
            }
            reject('Error: ' + this.status + ' ' + response.message)
          } else {
            resolve(this.response)
          }
        }
      })

      xhr.open('POST', endpoint)
      xhr.setRequestHeader('content-type', 'application/json')
      // xhr.setRequestHeader('x-api-key', state.userApiKey)
      if (apikey) {
        xhr.setRequestHeader('x-api-key', apikey)
      } else {
        xhr.setRequestHeader('x-api-key', state.userApiKey)
      }
      xhr.send(data)
    })
  },
}
