

chrome.browserAction.onClicked.addListener( ( tab ) => {
	
	console.log( 'Active tab is ' + tab.url );

	chrome.tabs.sendMessage( tab.id, 'toggle', function(response) {} );

});