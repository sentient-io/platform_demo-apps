/** State to hold and update user inputs or selections */
// Global object stores all information
let data = {}
let state = {
	userApiKey: apikey,
	landmark: '',
	confidence: '',
	hasImage: false,
	wikiSummary: '',
	wikiUrl: '',
	popoverShown: false,
	location: 'location-sg',
	'location-sg':
		'https://apis.sentient.io/microservices/cv/landmarksg/v1/getpredictions',
	'location-jp':
		'https://apis.sentient.io/microservices/cv/landmarkjp/v1/getpredictions',
}
/* +----------------+ */
/* |  Img Uploader  | */
/* +----------------+ */
// 1MB is 1048576
let fileSizeLimit = 1048576 * 5
// Limit upload image resolution
let imgDimensionLimit = 416

let dropArea = document.getElementById('s-img-uploader')
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
	uploadImg(files)
}

// Handle picture preview
uploadImg = (files) => {
	checkImage(files[0].type, files[0].size)
		.then(() => {
			// Preview uploaded file
			let reader = new FileReader()
			reader.readAsDataURL(files[0])
			// Push uploaded image details to state
			state.file = { name: files[0].name, type: files[0].type }
			reader.onloadend = () => {
				// Draw and resize uploaded image to canvas
				createSourceImg(reader.result)
				// Push original base64 string to state
				state.file.base64 = reader.result
			}
		})
		.catch((error) => {
			toggleAlert('ERROR', error.message)
		})
}

checkImage = (fType, fSize) => {
	// File type, size and smallest resolution
	return new Promise((resolve, reject) => {
		if (!fType.includes('image')) {
			// Check image type
			reject('Wrong file type, please upload an valid image file.')
		} else if (fSize >= fileSizeLimit) {
			//Check image size
			reject('File size too big, please upload image size below 5MB.')
		} else {
			resolve()
		}
	})
}

createSourceImg = (src) => {
	// When send data to API, use base64 string from sourcePic
	// Hidden original size image to retain original pixel
	data.file = { base64: src, name: 'uploaded_img', type: 'image/jpeg' }
	let img = document.createElement('img')
	img.onload = () => {
		// Update data
		data.file.sWidth = img.width
		data.file.sHeight = img.height

		let resize = resizeImg(img.width, img.height)
		img.setAttribute(
			'style',
			`max-width:${resize.width}px; max-height:${resize.height}px`
		)
		img.setAttribute('id', 'sourceImg')
		$('#s-img-preview').empty().append(img)
		window.scrollBy(0, 100)
	}
	img.src = src
	$('#s-img-uploader').hide()
	$('#btn-main-function, #btn-upload-another').show()
}

resizeImg = (sWidth, sHeight) => {
	// Calculate image resize
	let dWidth = sWidth
	let dHeight = sHeight

	if (dWidth > 700 && sWidth >= sHeight) {
		// Landscape picture
		dWidth = 700
		dHeight = (dWidth * sHeight) / sWidth
	} else if (dHeight > 600 && sWidth < sHeight) {
		// Square or portrait image
		dHeight = 600
		dWidth = (dHeight * sWidth) / sHeight
	}
	data.resizeRatio = dWidth / sWidth
	let result = { width: dWidth, height: dHeight }

	return result
}

selectImage = (e) => {
	let base64 = e.src
	let id = e.id
	data.file = { base64: base64, name: id, type: 'image/jpeg' }
	createSourceImg(base64)
}

/* +--------------------+ */
/* | Identify Landmark  | */
/* +--------------------+ */
handleIdentifyLandmark = () => {
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
	// Return base64 string as data
	loadingStart()
	identifyLandmarkAPICall(data.file.base64.split('base64,')[1])
		.then((result) => {
			// Display detect objets button and display restart button
			$(
				'#btn-main-function, #sample-images-container, #btn-upload-another, #countrySelector'
			).hide()
			$('#btn-restart').show()
			if (result.results.landmark === 'No landmark detected') {
				$('#resultContainer').html(`
					<i class="mr-3 material-icons text-danger">error_outline</i>
					<p class="text-danger"> No landmark detected. Please input another picture. </p>`)
				$('#resultContainer').show()
			} else {
				state.landmark = result.results.landmark
				$('#resultContainer').html(`
					<i class="mr-3 material-icons">check_circle</i>
					<a href="#" onclick="showPop(this);" data-trigger="manual" >${result.results.landmark}</a>
					<span> has been detected with ${result.results.confidence} confidence </span>`)
				$('#resultContainer').show()
			}
			loadingEnd()
		})
		.catch((err) => {
			// Toggle popup window
			toggleAlert('Error', err)
			loadingEnd()
		})
}
function hasApiKey() {
	if (
		(state.userApiKey === null || state.userApiKey == '') && (
		apikey == undefined)
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
  fetchApiKeyFromSessionStorage()
}

function showPop(element) {
	loadingStart()
	wikipediaRetrievalAPICall(state.landmark)
		.then((response) => {
			if (
				response.results != undefined &&
				response.results.summary != undefined
			) {
				$('#wikiDescription').html(`
					<h4 style="font-weight:bold"> Description </h4> 
					<p> ${response.results.summary} </p> <br/> 
					<a href="${response.results.url}" target="_blank"> Click here to go to wikipedia 
				`)
				$('#wikiDescription').show()
				loadingEnd()
			} else if (response.status == 'failure') {
				$('#wikiDescription').html(`
					<p style="text-align: center; color: red"> Cannot retrieve information from wikipedia </p> <br/> 
				`)
				$('#wikiDescription').show()
				loadingEnd()
			}
		})
		.catch((err) => {
			// Toggle popup window
			toggleAlert('Error', err)
			loadingEnd()
		})
}

handleRestart = () => {
	$('#s-img-preview, #resultContainer, #wikiDescription').empty()
	$(
		'#btn-restart, #resultContainer, #wikiDescription, #btn-upload-another, #btn-main-function'
	).hide()
	$('#s-img-input').val('')
	$(
		'#s-img-uploader, #countrySelector, #sample-images-container, #sample-images'
	).show()
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

// Toggle popup alert window
toggleAlert = (alertTitle, alertMsg) => {
	$('#alertContent').html(alertMsg)
	$('#alertTitle').html(alertTitle)
	$('#alert').modal('toggle')
}

/* +---------------+ */
/* |  Radio Button | */
/* +---------------+ */
sRadioSelection = (param) => {
	if (param.id != state.location) {
		$('.s-radio-base').empty()
		$(`#${param.id} .s-radio-base`).html('<div class="s-radio-selected"></div>')
		state.location = param.id
	}
	renderSampleImages()
}
