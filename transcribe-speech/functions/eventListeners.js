// ************************************************************************ //
// *                                                                      * //
// *                     Latest update : 2021-Jan-27                      * //
// *     Example:                                                         * //
// *                                                                      * //
// *     // Global element for recorder.js                                * //
// *     let recorder;                                                    * //
// *     // Get user permission                                           * //
// *     Recorder.get(function (rec) {                                    * //
// *     recorder = rec;                                                  * //
// *     });                                                              * //
// *     // Start recording                                               * //
// *     recorder.start();                                                * //
// *     // Stop recording                                                * //
// *     recorder.stop();                                                 * //
// *	 // Stopm and get the audio blob (.wav)                           * //
// *     recorder.getBlob();                                              * //
// *	                                                                  * //
// ************************************************************************ //

// Global element for recorder.js
let recorder
// Select HTML empty audio element for recorded audio
const audio = document.getElementById('audio-player')

const recorderConfig = {
	sampleRate: 16000,
}

;(function (window) {
	// User media avalibality
	window.URL = window.URL || window.webkitURL
	navigator.getUserMedia =
		navigator.getUserMedia ||
		navigator.webkitGetUserMedia ||
		navigator.mozGetUserMedia ||
		navigator.msGetUserMedia

	var Recorder = function (stream, config) {
		config = config || {}
		config.sampleBits = config.sampleBits || 16 // 8, 16
		config.sampleRate = config.sampleRate || recorderConfig.sampleRate // 8000, 16000, 48000

		var context = new (window.webkitAudioContext || window.AudioContext)()
		var audioInput = context.createMediaStreamSource(stream)
		var createScript =
			context.createScriptProcessor || context.createJavaScriptNode
		var recorder = createScript.apply(context, [4096, 1, 1])

		var audioData = {
			size: 0, // Size of recorded file
			buffer: [], // Audio buffer
			// Input sample rate, defined by device
			inputSampleRate: context.sampleRate,
			inputSampleBits: 16, // 8, 16
			outputSampleRate: recorderConfig.sampleRate, // Output sample rate
			oututSampleBits: 16, // 8, 16

			input: function (data) {
				this.buffer.push(new Float32Array(data))
				this.size += data.length
			},

			compress: function () {
				// Combine
				var data = new Float32Array(this.size)
				var offset = 0
				for (var i = 0; i < this.buffer.length; i++) {
					data.set(this.buffer[i], offset)
					offset += this.buffer[i].length
				}
				// Compress
				var compression = parseInt(this.inputSampleRate / this.outputSampleRate)
				var length = data.length / compression
				var result = new Float32Array(length)
				var index = 0,
					j = 0
				while (index < length) {
					result[index] = data[j]
					j += compression
					index++
				}
				// Return Float32Array
				return result
			},

			encodeWAV: function () {
				var sampleRate = Math.min(this.inputSampleRate, this.outputSampleRate)
				var sampleBits = Math.min(this.inputSampleBits, this.oututSampleBits)
				// Get compressed Float32Array audio
				var bytes = this.compress()
				var dataLength = bytes.length * (sampleBits / 8)
				var buffer = new ArrayBuffer(44 + dataLength)
				var data = new DataView(buffer)

				var channelCount = 1 // Mono channel
				var offset = 0

				var writeString = function (str) {
					for (var i = 0; i < str.length; i++) {
						data.setUint8(offset + i, str.charCodeAt(i))
					}
				}

				// RIFF identifier
				writeString('RIFF')
				offset += 4
				// File length
				data.setUint32(offset, 36 + dataLength, true)
				offset += 4
				// RIFF type - WAVE
				writeString('WAVE')
				offset += 4
				// Format chunk identifier
				writeString('fmt ')
				offset += 4
				// Format chunk length
				data.setUint32(offset, 16, true)
				offset += 4
				// sample format (raw)
				data.setUint16(offset, 1, true)
				offset += 2
				// Channel count
				data.setUint16(offset, channelCount, true)
				offset += 2
				// Sample rate
				data.setUint32(offset, sampleRate, true)
				offset += 4
				// Byte rate (sample rate * block align)
				data.setUint32(
					offset,
					channelCount * sampleRate * (sampleBits / 8),
					true
				)
				offset += 4
				// Block align (Channel count * byte per sample)
				data.setUint16(offset, channelCount * (sampleBits / 8), true)
				offset += 2
				// Bits per sample
				data.setUint16(offset, sampleBits, true)
				offset += 2
				// Data chunk identifier
				writeString('data')
				offset += 4
				// Data chunk length
				data.setUint32(offset, dataLength, true)
				offset += 4
				// Write in sample bites
				if (sampleBits === 8) {
					for (var i = 0; i < bytes.length; i++, offset++) {
						var s = Math.max(-1, Math.min(1, bytes[i]))
						var val = s < 0 ? s * 0x8000 : s * 0x7fff
						val = parseInt(255 / (65535 / (val + 32768)))
						data.setInt8(offset, val, true)
					}
				} else {
					for (var i = 0; i < bytes.length; i++, offset += 2) {
						var s = Math.max(-1, Math.min(1, bytes[i]))
						data.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true)
					}
				}

				let audio_blob = new Blob([data], { type: 'audio/wav' })

				return audio_blob
			},
		}

		// Start recording
		this.start = function () {
			audioInput.connect(recorder)
			recorder.connect(context.destination)

			// Initialize audioData before next recording start
			audioData.buffer = []
			audioData.size = 0
		}

		// Stop recording
		this.stop = function () {
			recorder.disconnect()
		}

		// Get Audio Blob
		this.getBlob = function () {
			// Stop audio recording
			this.stop()
			const bolb = audioData.encodeWAV()
			// Reset audio data buffer after audio blob been encoded
			return bolb
		}

		// Processing audio
		recorder.onaudioprocess = function (e) {
			audioData.input(e.inputBuffer.getChannelData(0))
		}
	}

	// Throw Error
	Recorder.throwError = function (message) {
		alert(message)
		throw new (function () {
			/** Cause error with this.toString */
			console.log(this)
			this.toString = function () {
				return message
			}
		})()
	}
	// Check if support recorder
	Recorder.canRecording = navigator.getUserMedia != null
	// Get recorder
	Recorder.get = function (callback, config) {
		return new Promise((resolve, reject) => {
			if (callback) {
				navigator.mediaDevices
					.getUserMedia({ audio: true })
					.then(function (stream) {
						var rec = new Recorder(stream, config)
						callback(rec)
						resolve()
					})
					.catch(function (error) {
						if (navigator.getUserMedia) {
							navigator.getUserMedia(
								{ audio: true }, // Get audio media only
								function (stream) {
									var rec = new Recorder(stream, config)
									callback(rec)
									resolve()
								},
								function (error) {
									switch (error.code || error.name) {
										case 'PERMISSION_DENIED':
										case 'PermissionDeniedError':
											Recorder.throwError('Permission Denied.')
											break
										case 'NOT_SUPPORTED_ERROR':
										case 'NotSupportedError':
											Recorder.throwError('Media not supported.')
											break
										case 'MANDATORY_UNSATISFIED_ERROR':
										case 'MandatoryUnsatisfiedError':
											Recorder.throwError('Media device not found.')
											break
										default:
											Recorder.throwError('Error:' + (error.code || error.name))
											break
									}
									reject()
								}
							)
						} else {
							Recorder.throwErr('Current browser not support audio recording.')
							// return;
							reject()
						}
					})
			}
		})
	}

	window.Recorder = Recorder
})(window)
