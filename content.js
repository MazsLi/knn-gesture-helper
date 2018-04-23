
chrome.runtime.onMessage.addListener( ( message, sender, sendResponse ) => {

    switch( message ) {
        case 'toggle':

            let knnHelper = $('#knn-gesture-helper')[0]
        
            if( knnHelper ) document.body.removeChild( knnHelper );
            else initial();

            break;
    }
    
})

let video = null;
let knn = null;
let predictInterval = null;

function initial() {

    console.log('Begin initial...');

    createComponent();

    console.log('Get user media...');
    
	navigator.getUserMedia = navigator.getUserMedia;
	
	if (navigator.getUserMedia) {
		navigator.getUserMedia({ audio: false, video: true },
			function(stream) {

				video.srcObject = stream;
				video.onloadedmetadata = function(e) {
                    
                    video.play();
                    
                    initComponentEvent();
                }
                
			},
			function(err) {
				console.log("The following error occurred: " + err.name);
			}
		)
	} else {
		console.log("getUserMedia not supported");
    }
    
}

function createComponent() {
    
    let container = document.createElement( 'div' );
    container.setAttribute( 'id', 'knn-gesture-helper' );
    container.style.width = '150px';
    container.style.zIndex = '9999';
    container.style.borderRadius = '5px';
    container.style.position = 'fixed';
    container.style.padding = '10px';
    container.style.top = '10px';
    container.style.right = '10px';
    
    let btnContainerStill = document.createElement( 'div' );
    btnContainerStill.setAttribute( 'class', 'mini ui buttons' );
    btnContainerStill.style.position = 'relative';
    btnContainerStill.innerHTML += '<button id="train_still" style="width:85px" class="ui teal button">Train still</button>';
    btnContainerStill.innerHTML += '<button id="reset_still" class="ui button">Reset</button>';
    btnContainerStill.innerHTML += '<div id="train_num_still" style="padding:5px" class="mini floating ui red label">0</div>';
    container.appendChild( btnContainerStill );

    let btnContainerUp = document.createElement( 'div' );
    btnContainerUp.setAttribute( 'class', 'mini ui buttons' );
    btnContainerUp.style.position = 'relative';
    btnContainerUp.style.marginTop = '5px';
    btnContainerUp.innerHTML += '<button id="train_up" style="width:85px" class="ui teal button">Train up</button>';
    btnContainerUp.innerHTML += '<button id="reset_up" class="ui button">Reset</button>';
    btnContainerUp.innerHTML += '<div id="train_num_up" style="padding:5px" class="mini floating ui red label">0</div>';
    container.appendChild( btnContainerUp );

    let btnContainerDown = document.createElement( 'div' );
    btnContainerDown.setAttribute( 'class', 'mini ui buttons' );
    btnContainerDown.style.position = 'relative';
    btnContainerDown.style.marginTop = '5px';
    btnContainerDown.innerHTML += '<button id="train_down" style="width:85px" class="ui teal button">Train down</button>';
    btnContainerDown.innerHTML += '<button id="reset_down" class="ui button">Reset</button>';
    btnContainerDown.innerHTML += '<div id="train_num_down" style="padding:5px" class="mini floating ui red label">0</div>';
    container.appendChild( btnContainerDown );

    let btnPredict = document.createElement( 'div' );
    btnPredict.setAttribute( 'id', 'predict' );
    btnPredict.setAttribute( 'class', 'mini fluid ui button' );
    btnPredict.style.marginTop = '5px';
    btnPredict.style.background = '#0F7173';
    btnPredict.style.color = 'white';
    btnPredict.innerText = 'Start Predict';
    container.appendChild( btnPredict );

    let divider = document.createElement( 'div' );
    divider.setAttribute( 'class', 'ui horizontal divider' );
    divider.innerText = 'I think ...';
    container.appendChild( divider );

    let result = document.createElement( 'div' );
    result.setAttribute( 'id', 'result' );
    result.setAttribute( 'class', 'mini ui label' );
    result.innerText = 'No result';
    container.appendChild( result );

    video = document.createElement( 'video' );
    video.style.display = 'none';
    video.style.width = '100%';
    video.setAttribute( 'crossorigin', 'anonymous' );
    video.setAttribute( 'id', 'video' );
    container.appendChild( video );

    document.body.appendChild( container );

}

function initComponentEvent() {
    
    knn = new ml5.KNNImageClassifier( 2, 1, () => console.log( 'KNN Image Classifier Model Loaded' ), video);

    let btnTrainStill = document.getElementById( 'train_still' );
    let trainCountStill = document.getElementById( 'train_num_still' );
    let btnResetStill = document.getElementById( 'reset_still' );

    let btnTrainUp = document.getElementById( 'train_up' );
    let trainCountUp = document.getElementById( 'train_num_up' );
    let btnResetUp = document.getElementById( 'reset_up' );

    let btnTrainDown = document.getElementById( 'train_down' );
    let trainCountDown = document.getElementById( 'train_num_down' );
    let btnResetDown = document.getElementById( 'reset_down' );

    let btnPredict = document.getElementById( 'predict' );
    let result = document.getElementById( 'result' );

    btnTrainStill.onclick = () => {
        trainClass( 1 );
        trainCountStill.innerText = parseInt( trainCountStill.innerText ) + 1; 
    }

    btnTrainUp.onclick = () => {
        trainClass( 2 );
        trainCountUp.innerText = parseInt( trainCountUp.innerText ) + 1; 
    }

    btnTrainDown.onclick = () => {
        trainClass( 3 );
        trainCountDown.innerText = parseInt( trainCountDown.innerText ) + 1; 
    }
        
    btnResetStill.onclick = () => {
        clearClass( 1 );
        trainCountStill.innerText = '0';
    }

    btnResetUp.onclick = () => {
        clearClass( 2 );
        trainCountUp.innerText = '0';
    }

    btnResetDown.onclick = () => {
        clearClass( 3 );
        trainCountDown.innerText = '0';
    }

    btnPredict.onclick = () => {

        predictToggle( ( classIndex ) => {
            
            if( classIndex ) {
    
                let className = null;
    
                switch( classIndex ) {
                    case 1:
                        className = 'Still';
                        break;
                    case 2:
                        className = 'Up';
                        window.scrollBy({ top: -200, left: 0, behavior: "smooth" });
                        break;
                    case 3:
                        className = 'Down';
                        window.scrollBy({ top: 200, left: 0, behavior: "smooth" });
                        break;
                }
    
                btnPredict.innerText = 'Stop Predict';
                btnPredict.style.background = '#F05D5E';
                result.innerText = className||'No result';
    
            }else {
    
                btnPredict.innerText = 'Start Predict';
                btnPredict.style.background = '#0F7173';
                result.innerText = 'No action';
    
            }
    
        })

    }

}

function predictToggle( callback ) {

    if( !predictInterval ) {
        
        predictInterval = setInterval( () => {
            knn.predictFromVideo( ( data ) => callback( data.classIndex ) );
        }, 1500);

    }else {

        clearInterval( predictInterval );
        predictInterval = null;

        callback( false );
    }

}

function trainClass( classIndex ) {
    knn.addImageFromVideo( classIndex );
}

function clearClass( classIndex ) {
    knn.clearClass( classIndex );
}
