/* +-----------------------+ */
/* | Group Detected Object | */
/* +-----------------------+ */
/* Convert returned value to organised group */
groupDetectedObjects = (sParam) => {
  return new Promise((resolve, reject) => {
    let param
    if (sParam.constructor == String) {
      param = JSON.parse(sParam)
    } else {
      param = sParam
    }
    let result = {}
    param.results.objects.forEach((obj) => {
      let object = obj.class
      let confidence = obj.confidence
      let sBoundingBox = obj['bounding box']
      let location = {
        left: sBoundingBox.left,
        top: sBoundingBox.top,
        right: sBoundingBox.right,
        bottom: sBoundingBox.bottom,
      }
      let size = {
        width: sBoundingBox.right - sBoundingBox.left,
        height: sBoundingBox.bottom - sBoundingBox.top,
      }
      let detail = {
        object: object,
        confidence: confidence,
        location: location,
        size: size,
      }
      if (!result[`${object}`]) {
        detail.id = 1
        result[`${object}`] = {}
        result[`${object}`][`${object}-1`] = detail
      } else {
        let id = Object.keys(result[`${object}`]).length + 1
        detail.id = id
        result[`${object}`][`${object}-${id}`] = detail
      }
    })

    for (key in param.results.objects) {
    }
    data.detectedObjects = result
    resolve(result)
  })
}

/* +--------------------+ */
/* | Filter By Category | */
/* +--------------------+ */
/* Filter all detectd object by category */
filterByCategory = (category, source) => {
  let result = {}

  category.forEach((index) => {
    if (source[index]) {
      result[`${index}`] = source[index]
    }
  })

  return result
}

/* +---------------------------------------+ */
/* | Group Detected Object into a sentence | */
/* +---------------------------------------+ */
narrateDetectedObjects = (sParam) => {
  return new Promise((resolve, reject) => {
    let sentence = ''
    let be = Object.keys(sParam).length == 1 ? 'is' : 'are'
    let categoryArry = Object.keys(sParam).sort()

    if (categoryArry[0] === undefined) {
      // Case : no detected object
      sentence = 'Sorry, no object detected, please try another picture.'
      state.noDetection = true
    } else if (categoryArry.length === 1) {
      // Case : 1 type of object detected
      let objectCount = Object.values(sParam[categoryArry[0]]).length
      objectCount > 1 ? (be = 'are') : be
      let categoryName =
        objectCount > 1 ? singularToPlural(categoryArry[0]) : categoryArry[0]
      sentence =
        'There' + ' ' + be + ' ' + objectCount + ' ' + categoryName + '.'
    } else {
      // Case : multiple types of object detected
      categoryArry.forEach((category) => {
        let objectCount = Object.values(sParam[category]).length
        objectCount > 1 ? (be = 'are') : be
        let categoryName =
          objectCount > 1 ? singularToPlural(category) : category
        let comma = ', '
        let and = ''
        // For second last item, remove comma
        category == categoryArry[categoryArry.length - 2]
          ? (comma = ' ')
          : comma
        // For last item, chagne comma to fullstop, add "and"
        category == categoryArry[categoryArry.length - 1]
          ? ((comma = '.'), (and = 'and '))
          : comma
        sentence += and + objectCount + ' ' + categoryName + comma
      })
      sentence = 'There' + ' ' + be + ' ' + sentence
    }
    data.description = sentence
    resolve(sentence)
  })
}

/* +-------------------------------+ */
/* | Convert object name to plural | */
/* +-------------------------------+ */
singularToPlural = (word) => {
  let esPlural = ['bus', 'bench', 'wine glass', 'sandwich']
  let noPlural = ['scissors', 'sheep']
  let vesPlural = ['knife']

  word = $.trim(word)

  if (word === 'person') {
    return 'people'
  } else if (word === 'mouse') {
    return 'mice'
  } else if (esPlural.includes(word)) {
    return word + 'es'
  } else if (vesPlural.includes(word)) {
    return word.replace('fe', 'ves')
  } else if (noPlural.includes(word)) {
    return word
  } else {
    return word + 's'
  }
}

/* +----------------------+ */
/* | Draw image to canvas | */
/* +----------------------+ */
canvasDrawImage = (base64string, sWidth, sHeight, resize = 100) => {
  // Takes base64string, source Width and Height
  // Resize will be the size of rendered canvas
  let dWidth
  let dHeight
  if (sWidth >= sHeight) {
    // When image is landscape
    dWidth = resize
    dHeight = (sHeight * dWidth) / sWidth
  } else {
    // When image is portrait
    dHeight = resize
    dWidth = (sWidth * dHeight) / sHeight
  }

  let canvas = document.createElement('canvas')
  canvas.setAttribute('width', dWidth)
  canvas.setAttribute('height', dHeight)

  let ctx = canvas.getContext('2d')

  var image = new Image()
  image.onload = () => {
    ctx.drawImage(image, 0, 0, sWidth, sHeight, 0, 0, dWidth, dHeight)
  }
  image.src = base64string

  return canvas
}

/* +------------------------------------------+ */
/* | Draw box to canvas based on bounding box | */
/* +------------------------------------------+ */
canvasDrawBox = (e) => {
  return new Promise((resolve, reject) => {
    let canvasID, x, y, width, height, object, resizeRatio
    e.canvasID ? (canvasID = e.canvasID) : reject()
    // Resize ratio will not be 1 if the preview image been resized
    state.file.resizeRatio
      ? (resizeRatio = state.file.resizeRatio)
      : (resizeRatio = 1)

    x = e.left * resizeRatio
    y = e.top * resizeRatio

    // Prevent API from return negative value
    if (y < 0) {
      y = 0
    } else if (x < 0) {
      x = 0
    }

    width = e.right * resizeRatio - x
    height = e.bottom * resizeRatio - y

    width > 100 ? width : (width = 100)

    e.object ? (object = e.object) : (object = '??')

    let canvas = document.getElementById(canvasID)
    height > canvas.offsetHeight - 80
      ? (height = canvas.offsetHeight - 80)
      : height

    let ctx = canvas.getContext('2d')
    // Draw boxes
    ctx.beginPath()
    ctx.lineWidth = '1'
    ctx.strokeStyle = '#00deff'
    ctx.rect(x, y, width, height)
    ctx.stroke()
    // Draw text background
    ctx.fillStyle = 'rgba(0,222,255,0.7)'
    // x -1 and width + 2 to align with the stroke of bounding box
    ctx.fillRect(x - 1, y, width + 2, 24)
    // Draw text to canvas
    ctx.fillStyle = '#052a30'
    ctx.font = '14px sans-serif'
    ctx.fillText(`${object} `, x - 1 + 5, y + 15)
  })
}

/* +-------------------------------------+ */
/* | Render description sentence to HTML | */
/* +-------------------------------------+ */
displayDescription = (sParam) => {
  let description = document.createElement('div')
  $(description).html(`<p>${sParam}</p>`)
  $(description).addClass('s-img-narration-description')
  $(description).attr(
    'style',
    `max-width:${data.file.sWidth * data.file.resizeRatio + 20}px`
  )
  $('#s-img-preview').append(description)
}
