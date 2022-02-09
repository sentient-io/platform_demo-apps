let webSocket

function startNewWebsocket() {
  return new Promise((resolve, reject) => {
    flexById('loader')
    const online_asr_connection_data = {
      'x-api-key': state.userApiKey || apikey,
      action: 'start',
      model: state.model,
      'sampling-rate': state.sampleRate,
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
        updateTranscribeResult(data)
      }
    }
  })
}
