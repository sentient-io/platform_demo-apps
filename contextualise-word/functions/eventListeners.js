var app = angular.module('wsdApp', ['ngSanitize']);
app.controller('wsdCtrl', ['$scope', '$sce', function($scope, $sce, $filter) {

	// Variable declaration
	$scope.loadeer = false;
	$scope.apiendpointurl = 'https://apis.sentient.io/microservices/nlp/wordsensedisambiguation/v0.1/getpredictions';

	$scope.targetWord = 'society';
	$scope.paraString = '';
	$scope.userApiKey = '';


	$scope.wsdResArr = [];
	$scope.totalLen = 0;
	$scope.htmlText = '';
	$scope.cololStyles = {};
	
	$scope.keywordBox = 'Noun';
	$scope.keywordError = '';	
	$scope.keywordErrormsg = '';
	$scope.errorTrue = false;
	$scope.totalLenShow = false;

	$scope.showAnalysBtn = false;
	$scope.aftRes = false;
	$scope.keywrdBx = false;

	$scope.colorCodes = [];
	$scope.colorCodesFull = ['#D81B60', '#E53935', '#F4511E', '#FB8C00', '#FFB300', '#FDD835', '#C0CA33', '#7CB342', '#43A047', '#00897B'];
	$scope.colorCodes2res = ['#D81B60', '#FFB300'];
	$scope.colorCodes3res = ['#D81B60', '#FFB300', '#00897B'];
	$scope.colorCodes4res = ['#D81B60', '#F4511E', '#FDD835', '#43A047'];
	$scope.realInput = '';

	// Process
	$scope.analyzeString = function() {
		$scope.totalLenShow = false;
		$scope.loadeer = true;
		$scope.errorTrue = false;
		document.getElementById("targetId").style.color = "black";
		document.getElementById("targetId").style.border = "1px solid #757575";

		$scope.keywordErrormsg = '';	
		$scope.paraString = document.getElementById('textinput').value;
		$scope.realInput = $scope.paraString;
		$scope.targetWord = document.getElementById('targetId').value;

		$scope.targetWord = ($scope.targetWord).trim();
  		$scope.wsdResArr = [];
		$scope.totalLen = 0;
		// Calling API

		if ($scope.userApiKey == '' || $scope.userApiKey == null) {
			// Toggle popup window
			$scope.userApiKey = prompt(
				'Unauthorized user, to continue test out, please provide a valid API key and try again.',
				$scope.userApiKey
			);
		};
		if (($scope.paraString).toLowerCase().indexOf(($scope.targetWord).toLowerCase()) != -1){
			$.ajax({
			method: 'POST',
		    headers:{'x-api-key': $scope.userApiKey},
		   	contentType: "application/json",
		    url: $scope.apiendpointurl,
		    data: JSON.stringify({"text": $scope.paraString,"target_word": $scope.targetWord, "repeat": "True"}),
			
			success: function (response) {
				// response
				console.log(response)
				$scope.loadeer = false;
				$scope.aftRes = true;
				$scope.resultObj = {};
				$scope.resultObj = response.sentence_index;
				$scope.resultObjTkn = response.tokens;
				$scope.totalLen = (Object.keys($scope.resultObj).length)

				if ($scope.totalLen <= 2){
					$scope.colorCodes = $scope.colorCodes2res;
				}else if ($scope.totalLen == 3){
					$scope.colorCodes = $scope.colorCodes3res;
				}else if ($scope.totalLen == 4){
					$scope.colorCodes = $scope.colorCodes4res;
				}else{
					$scope.colorCodes = $scope.colorCodesFull;
				}

				var inputPara = '';
				$scope.tokenObjs = {};
				var tokenKeys = Object.keys($scope.resultObjTkn)
				var keys = [Object.keys($scope.resultObjTkn)]
				for (var i=0; i<tokenKeys.length; i++) {
					$scope.tokenObjs[tokenKeys[i]] = $scope.resultObjTkn[tokenKeys[i]];
				}

				$scope.colorcodeIndex = 0;
				for (var i=0; i<tokenKeys.length; i++) {

					var loopObj = {};
					$scope.cololStyles = {};
					var parClass = 'panel-box';
					var boxVal = i+1;
					$scope.cololStyles = {
						'bg': '#ffffff',
					    'pad': '1.5rem',
					    'borlft': '3px solid '+$scope.colorCodes[$scope.colorcodeIndex],
					    'txtBgclr': $scope.colorCodes[$scope.colorcodeIndex],
					    'txtpad': '0.75rem',
					    'txtborrads': '10px',
					    'txtcolor': '#fff'
					};
					loopObj.paragraph = response.sentence_index[tokenKeys[i]];
					var societyArr = response.tokens[tokenKeys[i]][$scope.targetWord.trim()];
					var societyArrNames = [];
					
					for (var j=0; j<societyArr.length; j++){
						var socNames = {};
						socNames.societyName = j+1+". "+societyArr[j].synset_definition;
						socNames.hypernymsList = societyArr[j].hypernyms;
						societyArrNames.push(socNames);
					}

					loopObj.societyNames = societyArrNames;
					loopObj.panelBox = $scope.cololStyles;
					$scope.wsdResArr.push(loopObj)
					$scope.colorcodeIndex += 1;
					if ($scope.colorcodeIndex >= $scope.colorCodes.length){
						$scope.colorcodeIndex = 0;
					}
				}

				var paraArr = [];
				var sentance = [];

				$scope.index = 0;


				$scope.paraString = $scope.paraString.replace(/\n/ig, '__');
				sentance = ($scope.paraString).split( /[\.!\?]+/ );
				for (var j=0; j<sentance.length; j++){
					var wordsList = [];
					var flagArr = [];
					wordsList = (sentance[j]).split(' ');
					for (var k=0; k<wordsList.length; k++){
						flagArr.push( ((wordsList[k].toLowerCase()).trim()).replace(/[,!?'"]/g,'') );
						if ( ((wordsList[k].toLowerCase()).trim()).replace(/[,!?'"]/g,'') == ($scope.targetWord.toLowerCase()).trim()){
							inputPara += "<span style='background-color:"+$scope.colorCodes[$scope.index]+";padding: 0 .75rem;border-radius: 10px;color: #fff; '>"+wordsList[k]+"</span>";
						}else{
							inputPara += wordsList[k].toString();
						}
						inputPara += " ";
					}
					inputPara += '.'
					inputPara = inputPara.replace(' . .', '.');
					inputPara = inputPara.replace(' . ', '. ');
					inputPara = inputPara.replace(' .__', '.__');
					if (flagArr.includes(($scope.targetWord.toLowerCase()).trim())){
						$scope.index += 1;
						if ($scope.index == $scope.colorCodes.length){
							$scope.index = 0;
						}
					}
				};
				

				if ($scope.totalLen>0){
					inputPara = inputPara.replace(/__/ig, '<br />');
					$scope.htmlText = $sce.trustAsHtml(inputPara);
					document.getElementById('textinput').style.display = 'none';
					document.getElementById('textinputDiv').style.display = 'block'; 
				}
				else{
					document.getElementById('textinput').style.display = 'none';
					document.getElementById('textinputDiv').style.display = 'block';
					$scope.paraString = $scope.paraString.replace(/__/ig, '<br />');
					$scope.htmlText = $scope.paraString; 
				}
				$scope.totalLenShow = true;
				$scope.$apply();
				document.getElementById('btn-restart').style.display = 'block'; 

			},
			error: function (err) {
				document.getElementById("loader").style.display = 'none';
				document.getElementById('text-error').style.display = 'none';
				$("#confirmation-modal").modal();
				if ((err.responseText).includes('message')){
					var obj = JSON.parse(err.responseText);
				}
				var errorMsg = "";
				if (obj){
					errorMsg = obj.message;
				}
				else{
					errorMsg = err.responseText
				}
				document.getElementById("errorTxt").innerHTML = errorMsg;
			}
		});
		}else{
			$scope.loadeer = false;
			document.getElementById('textinput').style.display = 'none';
			$scope.htmlText = $scope.paraString;
			$scope.keywordError = 'Invalid keyword';
			$scope.keywordErrormsg = 'Invalid keyword or keyword not found in your article';
			$scope.errorTrue = true;
			document.getElementById("targetId").style.color = "red";	
			document.getElementById("targetId").style.border = "1px solid red";
		}
	};

	// Process text to lowercase
	$scope.convertPtoHtml = function(txt, tar, clr){
		var paraArr = [];
  		paraArr = txt.split(' ');
  		var inputPara = '';
		angular.forEach(paraArr, function (word) {
			if ((word.toLowerCase()).trim() == (tar.toLowerCase()).trim()){
				inputPara += "<span style='background-color:"+clr+";padding: 0 .75rem;border-radius: 10px;color: #fff; '>"+word+"</span>";
			}else{
				inputPara += word;	
			}
			inputPara += " ";
		});
		inputPara = inputPara.replace(' . .', '.');
		inputPara = inputPara.replace(' . . ', '. ');
		inputPara = inputPara.replace(' . ', '. ');
		inputPara = inputPara.replace(' .__', '.__');
		inputPara = inputPara.replace(/__/ig, '<br />');
		return $sce.trustAsHtml(inputPara);
	}

	$scope.customiseString = function (str) {
		if(str){
			var val = str.replace(/_/g,' ').split('.')[0];
			return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
		}else{
			return ''
		}
	}

	// Clear text method
	$scope.textClear = function(){
		$scope.wsdResArr = []
		$scope.showAnalysBtn = false;
		var txtInput = document.getElementById('textinput');
		var tarid = document.getElementById('targetId');
		$scope.totalLenShow = false;
		$scope.errorTrue = false;
		$scope.htmlText = '';
		$scope.keywordError = '';
		$scope.keywordErrormsg = '';
		$scope.errorTrue = false;
		txtInput.value = '';
		txtInput.style.display = 'block';
		tarid.value = '';
		tarid.style.border = "1px solid gray";
		tarid.style.color = "gray";
		$scope.contentCount();
	}

	// Characters Count method
	$scope.contentCount = function(){
        $scope.keywrdBx = false;
        var textinput = document.getElementById('textinput').value;
        var textinputBx2 = document.getElementById('targetId').value;
        document.getElementById('count').innerHTML = "Characters : " + (textinput.length + " / 5000");
        if (textinput.length >= 5001) {
        	$scope.showAnalysBtn = false;
            $("#confirmation-modal").modal();
            document.getElementById("errorTxt").innerHTML = "Content allow upto 5000 Characters. Please Try Again...";
            return false;
        }
        else if ((textinput.length >0 && textinput.length <=5000) && textinputBx2){
        	$scope.showAnalysBtn = true;
        	$scope.keywrdBx = true;
        }
        else if (textinput.length <1 ){
        	$scope.showAnalysBtn = false;
        }
    }
	
	// Input content edit
    $scope.editInput = function(){
    	$scope.aftRes = false;
    	document.getElementById('textinput').value = $scope.realInput; 
    	document.getElementById('textinputDiv').style.display = 'none'; 
    	document.getElementById('textinput').style.display = 'block'; 
    }

}]);

function handleRestart() {
    window.location.href = window.location.href;
}