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

/* +----------------------+ */
/* | Display result       | */
/* +----------------------+ */
function loadIntoTable(data) {
	$('#table-body').empty()
	// Create 2 columns
	let td1 = document.createElement('td')
	let td2 = document.createElement('td')

	for (let i = 0; i < Object.keys(data).length; i++) {
		let key = Object.keys(data)[i]
		if (
			typeof data[key] === 'object' &&
			data[key] != null &&
			!Array.isArray(data[key]) &&
			data[key].hasOwnProperty('uiname') &&
			data[key]['matches'][0]['match'] != null &&
			data[key]['matches'][0]['match'] != ''
		) {
			$(td1).append($(document.createElement('tr')).html(data[key]['uiname']))
			$(td2).append(
				$(document.createElement('tr')).html(data[key]['matches'][0]['match'])
			)
		}
	}
	$('#table-body').append(td1)
	$('#table-body').append(td2)
	$('#result-table').show()
}
