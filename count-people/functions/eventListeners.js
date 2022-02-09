let data = {}
let state = {
	userApiKey: apikey,
	selectedVideo: 'video-1',
	'video-1': 'businesspeopleentermeetingroom',
	'video-2': 'groupofpeoplerunning',
	uploadedVideo: 'uploadedVideo',
}

/* +------------------+ */
/* |  Video Uploader  | */
/* +------------------+ */

// 1MB is 1048576
let fileSizeLimit = 1048576 * 10

let dropArea = document.getElementById('s-video-uploader')
// Prevent default behaviors
;['dragenter', 'dragover', 'dragleave', 'drop'].forEach((eventName) => {
	dropArea.addEventListener(eventName, preventDefaults, false)
})
function preventDefaults(e) {
	e.preventDefault()
	e.stopPropagation()
}

// Highlight effect when drag files over
;['dragenter', 'dragover'].forEach((eventName) => {
	dropArea.addEventListener(eventName, highlight, false)
})
;['dragleave', 'drop'].forEach((eventName) => {
	dropArea.addEventListener(eventName, unhighlight, false)
})
function highlight(e) {
	dropArea.classList.add('highlight')
}
function unhighlight(e) {
	dropArea.classList.remove('highlight')
}

//Get the data for the files that were dropped
dropArea.addEventListener('drop', handleDrop, false)
function handleDrop(e) {
	let dt = e.dataTransfer
	let files = dt.files
	uploadVideo(files)
}

// Handle picture preview
uploadVideo = (files) => {
	if (files[0].size >= fileSizeLimit) {
		// File size too large
		let errTitle = 'File Size Too Big'
		let errMsg = `For demp purpose, we are limiting file size to ${
			fileSizeLimit / 1048576
		}MB. <br>Please compress your file or try another video.`
		toggleAlert(errTitle, errMsg)
		// Clear record of uploaded file
		$('#s-video-uploader-input').val('')
	} else if (!files[0].type.includes('video')) {
		// Wrong file format
		let errTitle = 'Wrong File Format'
		let errMsg = `Only video files are accepted.`
		toggleAlert(errTitle, errMsg)
		// Clear record of uploaded file
		$('#s-video-uploader-input').val('')
	} else {
		// Preview uploaded file
		let reader = new FileReader()
		reader.readAsDataURL(files[0])
		reader.onloadend = () => {
			state.selectedVideo = 'uploadedVideo'
			data.uploadedVideo = { base64: reader.result }
			// Remove selection on preview videos
			$('#video-1, #video-2').removeClass('selected')

			previewVideo({ base64: reader.result, controls: true })
		}
		$('#btn-countPeople').show()

		// Clear record of uploaded file
		$('#s-video-uploader-input').val('')
	}
}

previewVideo = (e) => {
	let base64 = e.base64
	let id = e.id ? e.id : '#s-video-preview'
	let controls = e.controls ? true : false
	// Clean existing previewing video
	$(id).empty()
	let video = document.createElement('video')
	let source = document.createElement('source')
	controls ? $(video).attr('controls', true) : ''
	$(video).attr('muted', true)
	$(video).attr('playsinline', true)
	$(video).attr('preload', 'metadata')

	source.src = base64

	$(video).append(source)
	$(id).append(video)

	// Display [Analyse Video] Button
	$('#mainFunction').show()
	$('#to-start-test').hide()

	// Scroll window to video preview area
	$('html, body').animate(
		{
			scrollTop: $('#s-video-uploader').offset().top - 150,
		},
		500
	)
}

/* +----------------------+ */
/* | Select Preview Video | */
/* +----------------------+ */
selectPreviewVideo = (e) => {
	let id = e
	$(`#${state.selectedVideo}`).removeClass('selected')
	$(`#${id}`).addClass('selected')
	state.selectedVideo = id
	let video = state[id]
	previewVideo({ base64: data[video].base64, controls: true })

	// Remove uploaded video from data
	if (data.uploadedVideo) {
		delete data.uploadedVideo
	}
}

/* +-------------------------------------------+ */
/* | App Main Function - Count people in video | */
/* +-------------------------------------------+ */
useAnalyseVideo = () => {
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
	loadingStart()
	// Get full name of selected video
	let selectedVideoName = state[state.selectedVideo]
	let base64 = data[selectedVideoName].base64
	peopleCountAPICall(base64.split('base64,')[1])
		.then((result) => {
			loadingEnd()
			displayCountingResult(result.results)
			$('#mainFunction, #sample-text, #video-selection-container').hide()
			$('#btn-restart').show()
		})
		.catch((err) => {
			loadingEnd()
			toggleAlert('Error', err)
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

handleRestart = () => {
	$('#resultContainer, #btn-restart, #mainFunction').hide()
	$('#video-selection-container, #sample-text, #to-start-test').show()
	// On preview, display 1 column
	$('#s-video-preview').removeClass('col-lg-6')

	$('#s-video-preview').empty()
	$('#video-2, #video-1').removeClass('selected')

	selectPreviewVideo('video-1')
}

let loadingMsg = [
	'Just a moment more, processing your file...',
	'You can buy and sell data securely on Sentient.io’s blockchain network.',
	'Use utility microservices to save time during your app development.',
	'Have a microservice you\'re looking for but can\'t find? Write in to us <a style="text-decoration:underline"  href = "mailto: enquiry@sentient.io">enquiry@sentient.io</a>',
	"Need help with implementing the APIs? Click the 'Help' button at the bottom of the screen to reach out to our support team.",
	'The APIs on our platform are curated carefully to ensure reliability for deployment',
	'Usage discounts are automatically applied as the number of API calls made reaches the next tier',
	'Just a moment more, processing your file...',
]

let loading

loadingStart = () => {
	$('#loader').toggle()

	let msgIndex = 0
	loading = window.setInterval(() => {
		$('#loader-text').html(loadingMsg[msgIndex])
		if (msgIndex < loadingMsg.length) {
			msgIndex += 1
		} else {
			msgIndex = 1
		}
	}, 4000)
}

loadingEnd = () => {
	$('#loader').toggle()
	window.clearInterval(loading)
}

// +-----------------+ //
// |  Inline Loader  | //
// +-----------------+ //
inlineLoader = (param) => {
	let id = param.id
	let msg = param.message
	return new Promise((resolve, reject) => {
		let inlineLoaderContainer = document.createElement('div')
		$(inlineLoaderContainer).addClass('m-auto pt-5 text-center')
		$(inlineLoaderContainer).attr('id', `${id}`)

		let loaderIcon = document.createElement('img')
		$(loaderIcon).addClass('mr-3')
		Object.assign(loaderIcon, {
			src: 'assets/images/loading.gif',
			width: '24',
		})
		$(inlineLoaderContainer).append(loaderIcon)

		let loaderMsg = document.createElement('span')
		$(loaderMsg).html(`${msg}`)
		$(inlineLoaderContainer).append(loaderMsg)

		resolve(inlineLoaderContainer)
	})
}

// Toggle popup alert window
toggleAlert = (alertTitle, alertMsg) => {
	$('#alertContent').html(alertMsg)
	$('#alertTitle').html(alertTitle)
	$('#alert').modal('toggle')
}
