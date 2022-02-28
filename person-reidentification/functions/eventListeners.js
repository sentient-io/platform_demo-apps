/** State to hold and update user inputs or selections */
let state = {
  userApiKey: apikey,
  hasImage: false,
  detectionDescription: '',
  file: [],
  confidence: '',
}
let data = {}
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

function previewImages() {
  state.file.length = 0
  $('#s-img-preview').empty()
  let preview = document.querySelector('#s-img-preview')

  if (this.files.length != 2) {
    toggleAlert('Error', 'Please input exactly 2 images')
  } else {
    for (i = 0; i < 2; i++) {
      //check format
      checkImgFormat(this.files[i].type.split('/')[1])
      // Preview uploaded file
      let reader = new FileReader()
      reader.readAsDataURL(this.files[i])
      reader.onload = function (e) {
        // Draw and resize uploaded image to canvas
        var image = new Image()
        image.height = 300
        image.src = e.target.result
        state.file.push(e.target.result)
        image.setAttribute('style', 'margin: 0 0')
        preview.appendChild(image)
      }
    }
    $('#s-img-uploader').hide()
    $('#btn-main-function, #btn-upload-another').show()
  }
}

document.querySelector('#s-img-input').addEventListener('change', previewImages)

checkImgFormat = (inputFormat) => {
  console.log(inputFormat)
  let acceptedFormat = [
    'blp',
    'bmp',
    'bufr',
    'cur',
    'dcx',
    'dds',
    'dib',
    'eps',
    'ps',
    'fit',
    'fits',
    'flc',
    'fli',
    'fpx',
    'ftc',
    'ftu',
    'gbr',
    'gif',
    'grib',
    'h5',
    'hd5',
    'icns',
    'ico',
    'im',
    'iim',
    'jpeg',
    'jpg',
    'jp2',
    'mic',
    'mpeg',
    'msp',
    'pcd',
    'pcx',
    'pxr',
    'png',
    'ppm',
    'psd',
    'sgi',
    'ras',
    'tga',
    'tiff',
    'wmf',
    'xbm',
    'xpm',
  ]
  return new Promise((resolve, reject) => {
    if (acceptedFormat.includes(inputFormat)) {
      resolve()
    } else {
      let errTitle = 'Unsupported File Format'
      let errMsg = `Uploader file format: ${inputFormat}. <br><br>Supported formats: blp, bmp, bufr, cur, dcx, dds, dib, eps, ps, fit, fits, flc, fli, fpx, ftc, ftu, gbr, gif, grib, h5, hd5, icns, ico, im, iim, jpeg, jpg, jp2, mic, mpeg, msp, pcd, pcx, pxr, png, ppm, psd, sgi, ras, tga, tiff, wmf, xbm, xpm`
      toggleAlert(errTitle, errMsg)
      // Clear record of uploaded file
      $('#s-img-input').val('')
      reject('Error, unsupported file format.')
    }
  })
}

selectImage = (e) => {
  let preview = document.querySelector('#s-img-preview')
  state.file.length = 0
  $('#s-img-preview').empty()
  for (i = 0; i < 2; i++) {
    // Draw and resize uploaded image to canvas
    var image = new Image()
    image.height = 300
    image.src = e[i].base64
    state.file.push(e[i].base64)
    image.setAttribute('style', 'margin: 0 0')
    preview.appendChild(image)
  }
  $('#s-img-uploader').hide()
  $('#btn-main-function, #btn-upload-another').show()
}

/* +-----------------+ */
/* |  Narrate Image  | */
/* +-----------------+ */
handleImageProcessing = () => {
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
  let data1 = state.file[0].split('base64,')[1]
  let data2 = state.file[1].split('base64,')[1]
  personReidentificationAPICall(data1, data2)
    .then((response) => {
      console.log(response)
      state.confidence = response.results.confidence.toFixed(2) * 100 + '%'
      $('#resultContainer').show()
      document.getElementById('percentage').style.width = state.confidence
      $('#percentage').html(state.confidence)
      $(
        '#btn-main-function, #sample-images-container, #btn-upload-another'
      ).hide()
      $('#btn-restart').show()
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
  state.file.length = 0
  $('#s-img-preview').empty()
  $(
    '#btn-restart, #btn-upload-another, #btn-main-function, #resultContainer'
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

handleToggleCanvasBox = () => {
  $('#s-img-preview-container, #s-img-preview-base').toggle()
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
