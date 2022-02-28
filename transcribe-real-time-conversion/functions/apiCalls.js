let webSocket

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

function startNewWebsocket() {
  return new Promise((resolve, reject) => {
    flexById('loader')
    const online_asr_connection_data = {
      'x-api-key': '',
      action: 'start',
      model: state.model,
      'sampling-rate': state.sampleRate,
    }

    if (apikey) {
      online_asr_connection_data['x-api-key'] = apikey
    } else {
      online_asr_connection_data['x-api-key'] = state.userApiKey
    }

    // Create new webSocket
    webSocket = new WebSocket('wss://onlineasr.sentient.io')

    webSocket.onopen = function () {
      // Connection data must be send as String instead of Object
      webSocket.send(JSON.stringify(online_asr_connection_data))
    }

    webSocket.onmessage = function (evt) {
      // evt.data will be returned as a string, convert it to JSON object
      let data = JSON.parse(evt.data)
      console.log(data)

      // If websocket connect established
      if (data.status === 'listening') {
        // Hide loader
        resolve()
        hideById('appOptions', 'loader')
        showById('transcribeResultsContainer', 'restartBtn')
      }

      if (data.error) {
        reject(data.error)
      } else {
        // update property value in to the hubspot
        if (updateInHubspot) {
          dataLayer.push({
            event: 'hubspot_demoapps',
            user_name: infoDataObj.data.userEmail,
            user_id: 'dev',
          })
        }
        updateTranscribeResult(data)
      }
    }
  })
}
