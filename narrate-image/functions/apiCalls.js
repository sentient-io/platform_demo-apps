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
          // update property value in to the hubspot
          if (updateInHubspot) {
            dataLayer.push({
              event: 'hubspot_demoapps',
              user_name: infoDataObj.data.userEmail,
              user_id: 'dev',
            })
          }
          resolve(response.results.objects)
        }
      }
    })
    xhr.open(
      'POST',
      'https://apis.sentient.io/microservices/cv/objectdetection/v1/getpredictions'
    )
    xhr.setRequestHeader('content-type', 'application/json')
    // xhr.setRequestHeader('x-api-key', state.userApiKey)
    if (apikey) {
      xhr.setRequestHeader('x-api-key', apikey)
    } else {
      xhr.setRequestHeader('x-api-key', state.userApiKey)
    }
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
          // update property value in to the hubspot
          if (updateInHubspot) {
            dataLayer.push({
              event: 'hubspot_demoapps',
              user_name: infoDataObj.data.userEmail,
              user_id: 'dev',
            })
          }
          resolve(response)
        }
      }
    })
    xhr.open(
      'POST',
      'https://apis.sentient.io/microservices/voice/ttseng/v1/getpredictions'
    )
    xhr.setRequestHeader('content-type', 'application/json')
    // xhr.setRequestHeader('x-api-key', state.userApiKey)
    if (apikey) {
      xhr.setRequestHeader('x-api-key', apikey)
    } else {
      xhr.setRequestHeader('x-api-key', state.userApiKey)
    }
    xhr.send(data)
  })
}
