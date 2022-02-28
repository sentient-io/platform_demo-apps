/* +------------------------------------+ */
/* | display result when identity found | */
/* +------------------------------------+ */
faceDetected = (results) =>{
    for (index in results){
        canvasDrawBox(results[index].location, 'uploadedImg');
        // Draw face thumbnails
		let recognizedFace = drawRecognizedFace(results[index].location);
        let name = document.createElement('h5');
		name.innerHTML = results[index].identity;

        // Create result card container
		let resultCard = document.createElement('div');
		resultCard.setAttribute( 'class','mt-4 d-flex align-items-center result-card'
		);
		resultCard.setAttribute( 'style','max-width: 1200px; margin: auto;'
		);

        //Create WIKI text container
		let resultTextContainer = document.createElement('div');
		resultTextContainer.setAttribute('class', 'col-9 result-text-container');

        //Get Wiki Results
		let wikiResult = document.createElement('a');
		wikiResult.setAttribute('class', 'wiki-result');
		// Calling Wiki API
		wikiResult.setAttribute(
			'onclick',
			`wikiRetrieval('${results[index].identity}')`
        );
        Object.assign(wikiResult, {
			id: String(results[index].identity).replace(/ /g, ''),
		});
		wikiResult.innerHTML = 'More Info';

        let headerContainer = document.createElement('div');
		headerContainer.setAttribute(
			'class',
			'd-flex flex-row justify-content-between'
		);

        // Display all rendered result
		$('#resultContainer').append(resultCard);
		$(resultCard).append(recognizedFace);
		$(resultCard).append(resultTextContainer);
		$(headerContainer).append(name);
		$(resultTextContainer).append(headerContainer);
		$(resultTextContainer).append(wikiResult);

        // Render confidence icon
		let confidence = renderConfidence(results[index].conf);
		$(headerContainer).append(confidence);
    }
    $('#resultContainer, #btn-restart').show();

}

// Render confidence icon and tool tip
renderConfidence = (confidence) => {
	// Container of icon
	let container = document.createElement('div');
	container.setAttribute('class', 'conf-container');

	// Toogle :hover hide with css
	let icon = document.createElement('span');
	icon.innerHTML = 'info';
	icon.setAttribute('class', 'material-icons conf-icon');

	// Toggle :hover show with css
	let message = document.createElement('p');
	message.setAttribute('class', 'conf-message');
	let confidenceVal = confidence.toFixed(2);
	message.innerHTML = `Confidence:<br><p class="conf-message-num">${
		confidenceVal * 100
	}%</p>`;

	$(container).append(icon);
	$(container).append(message);

	return container;
};

/* +-------------------------------------+ */
/* | retrieve and display wikipedia info | */
/* +-------------------------------------+ */
wikiRetrieval = (keyword) => {
    if (keyword === 'UNKNOWN') { document.getElementById(keyword.replace(/ /g, '')).innerHTML = 'No Record'
    } else {
        let id = document.getElementById(keyword.replace(/ /g, ''))
        // Prevent multiple Wikipedia API calling
        id.removeAttribute('onclick')
        // Show loader
        id.innerHTML = '<img src="assets/images/loading.gif" width="24px" height="24px"> <span style="text-decoration:none">Processing ...</span>'
        wikipediaRetrievalAPICall(keyword)
        .then((response) => {
            let wikiResult = document.getElementById(
                keyword.replace(/ /g, '')
            )
			if (response.status == 'failure') {
				// If result is undefined
                wikiResult.innerHTML = 'No related wikipedia result'
			} else {
                // Render summary text and create the link
                wikiResult.innerHTML = response.results.summary
                wikiResult.setAttribute('href', `${response.results.url}`)
                wikiResult.setAttribute('target', '_blank')
                wikiResult.setAttribute(
                    'style',
                    'text-decoration:underline'
                )
                wikiResult.classList.add('wiki-link')
			}
			})
			.catch((err) => {
				// Toggle popup window
				toggleAlert("Error", err)
			});

    }
}


/* +----------------------+ */
/* | Draw image to canvas | */
/* +----------------------+ */
canvasDrawImage = (base64string, sWidth, sHeight, resize = 100) => {
	// Takes base64string, source Width and Height
	// Resize will be the size of rendered canvas
	let dWidth;
	let dHeight;
	if (sWidth >= sHeight) {
		// When image is landscape
		dWidth = resize;
		dHeight = (sHeight * dWidth) / sWidth;
	} else {
		// When image is portrait
		dHeight = resize;
		dWidth = (sWidth * dHeight) / sHeight;
	}

	let canvas = document.createElement('canvas');
	canvas.setAttribute('width', dWidth);
	canvas.setAttribute('height', dHeight);

	let ctx = canvas.getContext('2d');

	var image = new Image();
	image.onload = () => {
		ctx.drawImage(image, 0, 0, sWidth, sHeight, 0, 0, dWidth, dHeight);
	};
	image.src = base64string;

	return canvas;
};



/* +------------------------------------------+ */
/* | Draw box to canvas based on bounding box | */
/* +------------------------------------------+ */
canvasDrawBox = (location, canvasID) => {
	return new Promise((resolve, reject) => {
		let x, y, width, height;
		// Resize ratio will not be 1 if the preview image been resized
		x = location[3] * canvasResizeRatio;
		y = location[0] * canvasResizeRatio;
        width = location[1] * canvasResizeRatio - x;
		height = location[2] * canvasResizeRatio - y;

		// Prevent API from return negative value
		if (y < 0) {
			y = 0;
		} else if (x < 0) {
			x = 0;
		}
    
		let canvas = document.getElementById(canvasID);
		let ctx = canvas.getContext('2d');
		// Draw boxes
		ctx.beginPath();
		ctx.lineWidth = '1';
		ctx.strokeStyle = '#00deff';
		ctx.rect(x, y, width, height);
		ctx.stroke();
    	});
};

//Draw detected face to canvas
drawRecognizedFace = (location) => {
	let top = location[0];
	let right = location[1];
	let bottom = location[2];
	let left = location[3];
	// expand face detection area to show the whole head
	let expandAreaVal = (bottom - top) * 0.3;

	//draw image
	let imgCanvasContainer = document.createElement('div');
	imgCanvasContainer.setAttribute('class', 'detected-picture shadow');
	let canvas = document.createElement('canvas');
	let canvasCtx = canvas.getContext('2d');
	canvasCtx.drawImage(
		state.image,
		left - expandAreaVal,
		top - expandAreaVal,
		bottom - top + 2 * expandAreaVal,
		right - left + 2 * expandAreaVal,
		0,
		0,
		80,
		80
	);
	imgCanvasContainer.appendChild(canvas);
	return imgCanvasContainer;
};