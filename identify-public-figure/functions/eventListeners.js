/** State to hold and update user inputs or selections */
let state = {
	userApiKey: apikey,
	hasImage: false,
	location: 'singapore',
}
let data = {};


/* +----------------+ */
/* |  Img Uploader  | */
/* +----------------+ */
// 1MB is 1048576
let fileSizeLimit = 1048576 * 5;
// Limit upload image resolution
let imgDimensionLimit = 416;

let dropArea = document.getElementById('s-img-uploader');
// Prevent default behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach((eventName) => {
	dropArea.addEventListener(eventName, preventDefaults, false);
});
function preventDefaults(e) {
	e.preventDefault();
	e.stopPropagation();
}
// Highlight effect when drag files over
['dragenter', 'dragover'].forEach((eventName) => {
	dropArea.addEventListener(eventName, highlight, false);
});
['dragleave', 'drop'].forEach((eventName) => {
	dropArea.addEventListener(eventName, unhighlight, false);
});
function highlight(e) {
	dropArea.classList.add('highlight');
}
function unhighlight(e) {
	dropArea.classList.remove('highlight');
}

//Get the data for the files that were dropped
dropArea.addEventListener('drop', handleDrop, false);
function handleDrop(e) {
	let dt = e.dataTransfer;
	let files = dt.files;
	uploadImg(files);
}

// Handle picture preview
uploadImg = (files) => {
	if (files[0].size >= fileSizeLimit) {
		// Toggle popup window
		toggleAlert("Error", "File size it too big! Please uploade image size within 5MB. ")
		// Clear record of uploaded file
		$('#s-img-input').val('');
	} else {
		// Preview uploaded file
		let reader = new FileReader();
		reader.readAsDataURL(files[0]);
		reader.onloadend = () => {

			// Draw and resize uploaded image to canvas
			createSourceImg(reader.result);
		};
	}
};

createSourceImg = (src) => {
	if (data.file == undefined){
		data.file = { base64: src, name: 'sourcePic', type: 'image/jpeg' };
	}

	let img = document.createElement('img');
	img.setAttribute('id', 'sourcePic');
	img.src = src;
	state.image = img

	// Hide original image
	$(img).hide();
	
	let image = new Image();
	image.src = src;
	image.onload = () => {
		let canvas = canvasDrawImage(
			src,
			image.width,
			image.height,
			500
		);
		canvas.setAttribute('id', 'uploadedImg');
		$('#s-img-preview').empty().append(canvas);
		if(image.width >= image.height){
			canvasResizeRatio = 500 / image.width
		}else{
			canvasResizeRatio = 500 / image.height
		}
	};
	$('#s-img-preview').append(img);
	$('#btn-main-function, #btn-upload-another').show();
	$('#s-img-uploader').hide();
};

selectImage = (e) => {
	let base64 = e.src;
	data.file = { base64: base64, name: "sourcePic", type: 'image/jpeg' };
	createSourceImg(base64);
};

/* +-----------------+ */
/* |  identify face  | */
/* +-----------------+ */
handleFaceRecognition = () => {
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
		loadingStart();
		faceRecognitionAPICall(data.file.base64.split('base64,')[1])
		.then((response) => {
			// Display detect objets button and display restart button
			$('#btn-main-function, #sample-images-container, #btn-upload-another, #countrySelector').hide();
			$('#btn-restart').show();
			loadingEnd()
			if (!Boolean(response.results.output[0])) {
				// Handle no face detected
				$('#noFaceDetected, #btn-restart').show();
			} else {
				faceDetected(response.results.output);
			}
			})
			.catch((err) => {
				// Toggle popup window
				toggleAlert("Error", err)
				loadingEnd();
			});
	
};
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

handleRestart = () => {
	$('#s-img-input').val('');
	$('#s-img-preview, #resultContainer').empty();
	$('#btn-restart, #btn-upload-another, #noFaceDetected').hide();
	$('#s-img-uploader, #countrySelector, #sample-images-container, #sample-images').show();
	data.file = undefined;
};

// Toggle popup alert window
toggleAlert = (alertTitle, alertMsg) => {
	$('#alertContent').html(alertMsg);
	$('#alertTitle').html(alertTitle);
	$('#alert').modal('toggle');
};

// Loading gif
let loadingMsg = [
	'Just a moment more, processing your file...',
	'You can buy and sell data securely on Sentient.io’s blockchain network.',
	'Use utility microservices to save time during your app development.',
	'Have a microservice you\'re looking for but can\'t find? Write in to us <a style="text-decoration:underline"  href = "mailto: enquiry@sentient.io">enquiry@sentient.io</a>',
	"Need help with implementing the APIs? Click the 'Help' button at the bottom of the screen to reach out to our support team.",
	'The APIs on our platform are curated carefully to ensure reliability for deployment',
	'Usage discounts are automatically applied as the number of API calls made reaches the next tier',
	'Just a moment more, processing your file...',
];

let loading
loadingStart = () => {
	$('#loader').toggle();

	let msgIndex = 0;
	loading = window.setInterval(() => {
		$('#loader-text').html(loadingMsg[msgIndex]);
		if (msgIndex < loadingMsg.length) {
			msgIndex += 1;
		} else {
            msgIndex = 1
        }
	}, 4000);
};

loadingEnd = () => {
    $('#loader').toggle();
    window.clearInterval(loading)
};

/* +---------------+ */
/* |  Radio Button | */
/* +---------------+ */
sRadioSelection = (param) => {
    if (param.id != state.location) {
        $('.s-radio-base').empty();
        $(`#${param.id} .s-radio-base`).html(
            '<div class="s-radio-selected"></div>'
        );
        state.location = param.id;
    }
    renderSampleImages();
};