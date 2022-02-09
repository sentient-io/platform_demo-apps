displayCountingResult = (e) => {
	// Reset result table container
	$('#result-table-body').empty()

	// On large screen, display 2 columns
	$('#s-video-preview').addClass('col-lg-6')
	let peopleCount = e['counter']
	let overEstim = e['likelihood of overestimation']
	let underEstim = e['likelihood of underestimation']

	$('#people-count').html(peopleCount + ' people')
	$('#overEstim').html(overEstim)
	$('#underEstim').html(underEstim)

	if (e['counter'] != '0') {
		$('#result-table').show()

		if (state.isMob) {
			// Hide first appeared frame on mobile device, it is not displaying well
			$('#first-appeared-frame').hide()
		}

		let people = e['people']
		for (index in people) {
			// Clean Up returned value
			let personIdVal = Object.values(people[index])[5]
			let firstApperanceVal = Object.values(people[index])[4]
			let durationAppearedVal = Object.values(people[index])[3]
			// Create all required DOM elements
			let tr = document.createElement('tr')
			let personId = document.createElement('td')
			let firstApperance = document.createElement('td')
			//let detectionConf = document.createElement('div');
			let firstAppearedFrame = document.createElement('td')
			let video = document.createElement('video')
			let videoClip = document.createElement('source')
			let durationAppeared = document.createElement('td')
			//let assigningConf = document.createElement('div');

			// Render values to DOM elements
			$(personId).html(personIdVal)
			$(firstApperance).html(firstApperanceVal.toFixed(3))
			$(durationAppeared).html(durationAppearedVal.toFixed(3))
			Object.assign(videoClip, {
				src: $('#s-video-preview video source').attr('src'),
			})

			$(video).append(videoClip)
			$(firstAppearedFrame).append(video)
			video.currentTime = Number(firstApperanceVal)
			// Render value for Confidence icon
			let iconContainer = document.createElement('div')
			iconContainer.setAttribute('class', 'hover-tool-tip')
			let icon = document.createElement('span')
			icon.innerHTML = 'info'
			icon.setAttribute('class', 'ml-1 material-icons hover-tool-tip-ico')
			icon.setAttribute('style', 'color: #757575; font-size:16px')

			// Append DOM elements
			$(tr).append(personId)
			$(tr).append(firstApperance)
			if (!state.isMob) {
				// Hide first appeared frame on mobile device, it is not displaying well
				$(tr).append(firstAppearedFrame)
			}
			$(tr).append(durationAppeared)
			$('#result-table-body').append(tr)
		}
	} else {
		$('#result-table').hide()
	}

	$('#resultContainer').show()
}
