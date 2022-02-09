/** State to hold and update user inputs or selections */
let state = {
  userApiKey: '',
  hasImage: false,
  detectionDescription: '',
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
  console.log(e)
  let dt = e.dataTransfer
  let files = dt.files
  uploadImg(files)
}

// Handle picture preview
uploadImg = (files) => {
  console.log(files)
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
        // Push original base64 string to state
        state.file.base64 = reader.result
      }
    })
    .catch((error) => {})
}

previewImg = (src, previewPicSize = 600, files) => {
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
      $('#s-img-uploader').hide()
      // Remove existing preview canvas
      $('#uploadedImg, #uploadedImgBase').remove()
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

      let baseCanvas = canvasDrawImage(
        src,
        image.width,
        image.height,
        previewPicSize
      )

      canvas.setAttribute('id', 'uploadedImg')
      baseCanvas.setAttribute('id', 'uploadedImgBase')
      $('#s-img-preview').append(canvas)
      $('#s-img-preview-base').append(baseCanvas)
      // Scroll to button area after image uploaded
      window.scroll({
        top: $('#s-img-preview').offset().top - 100,
        left: 0,
        behavior: 'smooth',
      })
    }
  }
}

checkImgFormat = (param) => {
  let inputFormat = param.inputFormat
  let acceptedFromat = [
    'bmp',
    'dib',
    'exr',
    'hdr',
    'jpeg',
    'jpg',
    'jpe',
    'jp2',
    'png',
    'pic',
    'pbm',
    'pgm',
    'ppm',
    'pxm',
    'pnm',
    'ras',
    'sr',
    'tiff',
    'tif',
    'webp',
  ]
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
  state.file = { base64: base64, name: id, type: 'image/jpeg' }

  previewImg(e.src)
}

/* +-----------------+ */
/* |  Narrate Image  | */
/* +-----------------+ */
handleImageProcessing = () => {
  // Handel if no API key
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
  let data = state.file.base64.split('base64,')[1]
  loadingStart()
  objectDetectionAPICall(data)
    .then((result) => {
      // Display detect objets button and display restart button
      $(
        '#btn-main-function, #sample-images-container, #btn-upload-another'
      ).hide()
      $('#btn-restart').show()

      // Draw result to canvas
      result.results.objects.forEach((e) => {
        let bbox = e['bounding box']
        let detail = {
          canvasID: 'uploadedImg',
          top: bbox.top,
          bottom: bbox.bottom,
          left: bbox.left,
          right: bbox.right,
          object: e.class,
          // object: e[0].split(' : ')[0],
        }
        canvasDrawBox(detail)
      })
      return groupDetectedObjects(result)
    })
    //make into a sentence
    .then((result) => {
      return narrateDetectedObjects(result)
    })
    //show and narrate the sentence
    .then((result) => {
      $('#detectionDescription').html(result)
      $('#detectionDescription').show()
      $('#loader').hide()
      $('#toggleBoxes').show()
    })
    .catch((err) => {
      // Toggle popup window
      toggleAlert('Error', err)
      loadingEnd()
    })
}

handleRestart = () => {
  $('#s-img-preview, #s-img-preview-base').empty()
  $(
    '#btn-restart, #toggleBoxes, #btn-upload-another, #btn-main-function, #audio, #detectionDescription'
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
fetchApiKeyFromSessionStorage()
