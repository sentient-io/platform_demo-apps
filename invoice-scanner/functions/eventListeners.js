/** State to hold and update user inputs or selections */
let state = {
	userApiKey: apikey,
	hasImage: false,
	handwritten: false,
	pdf: null,
}
let data = {}
/* +----------------+ */
/* |  Img Uploader  | */
/* +----------------+ */
// 1MB is 1048576
let fileSizeLimit = 1048576 * 10
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
	state.hasImage = false
	checkImgFormat({ inputFormat: files[0].type.split('/')[1] })
		.then(() => {
			// Preview uploaded file
			let reader = new FileReader()
			reader.readAsDataURL(files[0])
			// Push uploaded image details to state
			state.file = { name: files[0].name, type: files[0].type }
			reader.onloadend = () => {
				// Draw and resize uploaded image to canvas
				previewImg(reader.result, 600)
				state.file.input = document.querySelector('input[type="file"]').files[0]
				// Push original base64 string to state
				state.file.base64 = reader.result
			}
		})
		.catch((error) => {
			toggleAlert('Error', error)
		})
}

previewImg = (src, previewPicSize = 600, files) => {
	//pdf file
	if (state.file.type == 'application/pdf') {
		let file = document.querySelector('input[type="file"]').files[0]
		let fileReader = new FileReader()
		fileReader.onload = function () {
			let typedarray = new Uint8Array(this.result)
			PDFJS.getDocument(typedarray).promise.then(function (pdf) {
				pdf.getPage(pdf.numPages).then(function (page) {
					// you can now use *page* here
					var viewport = page.getViewport(2.0)
					$('#uploadedImg').remove()
					var canvas = document.querySelector('canvas')
					canvas.height = viewport.height
					canvas.width = viewport.width

					page.render({
						canvasContext: canvas.getContext('2d'),
						viewport: viewport,
					})
				})
			})
		}
		fileReader.readAsArrayBuffer(file)
		$('#s-img-uploader').hide()
		$(
			'#pdf-preview, #s-img-preview-container, #btn-main-function, #btn-upload-another'
		).show()

		//images
	} else {
		let image = new Image()
		image.src = src
		image.onload = () => {
			state.file.sWidth = image.width
			state.file.sHeight = image.height
			// Update canvasResizeRatio for resizing returned boxes
			if (image.size >= fileSizeLimit) {
				let errTitle = 'File Size Too Big'
				let errMsg =
					'For demp purpose, we are limiting file size to 5MB. Please try another image.'
				toggleAlert(errTitle, errMsg)
			} else if (
				image.width < imgDimensionLimit ||
				image.height < imgDimensionLimit
			) {
				let errTitle = 'Low Image Resolution'
				let errMsg = `Upload image dimension: ${image.width} x ${image.height}px. <br> Please use image with at least ${imgDimensionLimit} x ${imgDimensionLimit}px.`
				toggleAlert(errTitle, errMsg)
			} else if (image.width >= image.height) {
				// Prevent upscaling small images
				if (image.width < previewPicSize) {
					previewPicSize = image.width
				}
				state.file.resizeRatio = previewPicSize / image.width
				state.hasImage = true
			} else {
				if (image.height < previewPicSize) {
					previewPicSize = image.height
				}
				state.file.resizeRatio = previewPicSize / image.height
				state.hasImage = true
			}
			if (state.hasImage) {
				$('#s-img-uploader, #pdf-preview').hide()
				// Remove existing preview canvas
				$('#uploadedImg').remove()
				// Toggle cancel and function button
				$('#btn-main-function, #btn-upload-another').show()
				// Src is uploaded file src to create image element
				// previewPicSize : Number, determine the size of displayed iamge
				let canvas = canvasDrawImage(
					src,
					image.width,
					image.height,
					previewPicSize
				)

				canvas.setAttribute('id', 'uploadedImg')
				$('#s-img-preview').append(canvas)
				$('#s-img-preview-container').show()
				// Scroll to button area after image uploaded
				window.scroll({
					top: $('#s-img-preview').offset().top - 100,
					left: 0,
					behavior: 'smooth',
				})
			}
		}
	}

	document.getElementById('file-name').innerHTML = state.file.name
}

checkImgFormat = (param) => {
	let inputFormat = param.inputFormat
	let acceptedFromat = ['jpeg', 'png', 'tiff', 'jfif', 'pdf', 'docx']
	return new Promise((resolve, reject) => {
		if (acceptedFromat.includes(inputFormat)) {
			resolve()
		} else {
			let errTitle = 'Unsupported File Format'
			let errMsg = `Uploader file foramt: ${inputFormat}. <br><br>Supported formats: bmp, dib, exr, hdr, jpeg, jpg, jpe, jp2, png, pic, pbm, pgm, ppm, pxm, pnm, ras, sr, tiff, tif, webp.`
			toggleAlert(errTitle, errMsg)
			// Clear record of uploaded file
			$('#s-img-input').val('')
			reject('Error, unsupported file format.')
		}
	})
}

selectImage = (e) => {
	let base64 = e.src
	let id = e.id
	// let arr = base64.split(','),
	//     mime = arr[0].match(/:(.*?);/)[1],
	//     bstr = atob(arr[1]),
	//     n = bstr.length,
	//     u8arr = new Uint8Array(n);

	// while(n--){
	//     u8arr[n] = bstr.charCodeAt(n);
	// }

	// let input = new File([u8arr], id, {type:mime});

	fetch(base64)
		.then((res) => res.blob())
		.then((blob) => {
			let input = new File([blob], id, { type: 'image/png' })
			state.file = { base64: base64, name: id, type: 'image/png', input: input }
		})

	previewImg(e.src)
}

/* +-----------------+ */
/* |  Handle Invoice | */
/* +-----------------+ */
handleAnalyseInvoice = () => {
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
	invoiceScannerAPICall(state.file.input)
		.then((result) => {
			console.log(result)
			// Display detect objets button and display restart button
			$(
				'#btn-main-function, #sample-images-container, #btn-upload-another'
			).hide()
			loadIntoTable(result.results.scandocuments.data)
			$('#btn-restart').show()

			loadingEnd()
		})
		.catch((err) => {
			console.log(err)
			// Toggle popup window
			toggleAlert('Error', err)
			loadingEnd()
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
	$('#s-img-preview, #pdf-preview').empty()
	$(
		'#btn-restart, #s-img-preview-container, #btn-upload-another, #btn-main-function, #result-table'
	).hide()
	$('#s-img-input').val('')
	$('#s-img-uploader, #sample-images-container').show()
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
