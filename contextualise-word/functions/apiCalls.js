var updateInHubspot = false
var infoDataObj = {}
window.addEventListener(
  'message',
  function (e) {
    var infoData = JSON.parse(e.data)
    if (typeof infoData === 'object' && 'data' in infoData) {
      if (
        typeof infoData['data'] === 'object' &&
        'userEmail' in infoData['data'] &&
        infoData['data']['userEmail']
      ) {
        updateInHubspot = true
        infoDataObj = infoData
        var _hsq = (window._hsq = window._hsq || [])
        _hsq.push([
          'identify',
          {
            email: infoData.data.userEmail,
            last_demo_app_called: infoData.data.name,
          },
        ])
        _hsq.push(['trackPageView'])
      }
    }
  },
  false
)

const apiEndPoint =
  'https://apis.sentient.io/microservices/nlp/wordsensedisambiguation/v1/getpredictions'

async function WSDAPICall() {
  /**
   * Calling Word Sense Disabiguation API
   * https://docs.sentient.io/#/nlp/word_sense_disambiguation_eng
   */
  return await new Promise((resolve, reject) => {
    /**
     * This resolve is for testing purpose, once uncomment, the api call will
     * not go through but return the dummy result instead.
     * */
    // resolve(
    // dummyResult
    // )
    //Check required request body from API Documentation
    let data = JSON.stringify({
      text: state.userInputText,
      target_word: state.userInputNoun,
      repeat: 'True',
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
          reject({
            errTitle: 'Error: ' + this.status,
            errMsg: response.message,
          })
        }
        if (response.status == 'Success') {
          // update property value in to the hubspot
          if (updateInHubspot) {
            dataLayer.push({
              event: 'hubspot_demoapps',
              user_name: infoDataObj.data.userEmail,
              user_id: 'dev',
            })
          }
          resolve(response.results)
        }
        // Catch the failed api result
        reject('Error: ' + this.status + ' ' + response.message)
      }
    })

    xhr.open('POST', apiEndPoint)
    xhr.setRequestHeader('content-type', 'application/json')
    if (apikey) {
      xhr.setRequestHeader('x-api-key', apikey)
    } else {
      xhr.setRequestHeader('x-api-key', state.userApiKey)
    }
    xhr.send(data)
  })
}

// Dummy result, for testing purpose
var dummyResult = {}
