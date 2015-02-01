var fixfixed_background_class = function( chrome ) {
	var self = this; //alias
	
	var uuid_class = "chrome-fixfixed";
	
	var min = 1;
	var max = 2;
	var current = 1; // gets toggle on init()
	//console.log('loading...');
	
	self.tabId = 0; 
	self.lastActivatedTab = 0;
	self.counters = []; 

	self.init = function() {
		self.initFix();
		//self.toggleFix();
		
	}

	self.setIcon = function() {
		chrome.browserAction.setIcon({
			path: "icon-" + current + ".png"
		});
		
		chrome.browserAction.setBadgeBackgroundColor({
			color: [64, 64, 64, 128]
		});
	}
	
	self.setBadge = function(  number ) {
		
		var fixfixed_show_badge = self.get_config( 'fixfixed_show_badge', 1);
			
		if ( typeof fixfixed_show_badge == "undefined" || fixfixed_show_badge == 1) {	
			// use current: 
			chrome.browserAction.setBadgeText({
	          tabId: self.tabId,
	          text: number.toString()
	        });
        }
        self.counters[ self.tabId ] = number; 
    
    }

	self.setBadgeActivate = function(   ) {
	
	   number = self.counters[ self.tabId ] ; 
    	
	   if ( typeof number != "undefined" ) {
			self.setBadge( number );
        }
     
    }

	
	// add stylesheet 
	self.activateTab = function( tab , callback ) {
		//console.log( "activate"  );
		//console.log( tab );
		self.tabId = tab.tabId; 
		
		if ( typeof(  self.counters[ self.tabId ] ) == "undefined" ) {
			self.lastActivatedTab = self.tabId; 
			
			self.setFix(self.tabId , {});
			self.setBadgeActivate( self.tabId );
		}
		
	}

	self.updateTab = function( tabId , callback ) {
		//console.log( "updateTab, tabid" , tabId);
		
		chrome.tabs.get(tabId, function(tab) {
			console.log( tab )
			if( 1 ||    tab.status != "loading") {
				//console.log( "update"  );
				//console.log( tab );
				self.tabId = tabId; 
				
				if ( self.lastActivatedTab != tabId ) {
					self.setFix(self.tabId , {});
					console.log( "real")
					//self.lastActivatedTab = 0;
				}
				self.lastActivatedTab = 0;
				//setTimeout( function(){ self.lastActivatedTab = 0 } , 1000);‚
				//self.setBadgeActivate( self.tabId );
		
			}
		});
	}

	self.initFix = function(){
		current++;
		
		if (current > max) {
			current = min;
		}
		
		self.setIcon();
		
		//self.setFix(tab.id, {});
		
	}

	self.toggleFix = function(data) {
		//console.log("toggle");
		//console.log( data );
		
		
		current++;
		
		if (current > max) {
			current = min;
		}
		
		self.setIcon();
		
		self.setFix(self.tabId, {});	
			
	}
	
	self.get_config = function( name , default_value ) {
		if ( typeof localStorage[ name ] != "undefined" )  {
			return localStorage[ name ];
		} 
		
		if ( typeof default_value != "undefined" )  {
			return default_value;
		}
		
		return "";
	}

	self.setFix = function(tabId, statusObj) {
		chrome.tabs.get(tabId, function(tab) {
			//console.log( "tab : " + tabId + " status: " + tab.status ); 
			//console.log( tab ); 
			self.tabId = tabId; 
			
			if (!tab.url.match(/^http/)) {
				//console.log( 'not http' );
				return;
			}
			
			if (current == 2 /* active */ ) {
				
				// we load the background script always *cheap* but dont run it, parse only
				// if extension is disabled, it will not load, if its toggled "off" in icon
				// it will still partially load but not execute, similar to css which is
				// shielded
				/*
					chrome.tabs.executeScript(tabId, {
						file: "content.js",
					});
				*/
				
				//ext_fixfixed.init(window);

				chrome.tabs.executeScript(tabId, {
					code: "setTimeout( function(){ ext_fixfixed.init(window) } , 0); "
				});
				
				self.enable_feature( tabId, 'highlight',   1 ); 
				self.enable_feature( tabId, 'scrollcover', 1 ); 
				self.enable_feature( tabId, 'animation',   1 ); 
				self.enable_feature( tabId, 'background',   1 ); 
				self.enable_feature( tabId, 'transition',   1 ); 
				
				if ( self.get_config( 'fixfixed_scrollcover' , 1) == 1 ) {
					chrome.tabs.executeScript(tabId, {
						code: "document.body.classList.add( '"+ uuid_class +"-scrollcover' ); "
					});
				} else {
					chrome.tabs.executeScript(tabId, {
						code: "document.body.classList.remove( '"+ uuid_class +"-scrollcover' ); "
					});
				}
				chrome.tabs.executeScript(tabId, {
					code: "document.body.classList.add( '"+ uuid_class +"' ); "
				});
				chrome.tabs.executeScript(tabId, {
					code: "document.body.classList.remove( '"+ uuid_class +"-off' );"
				});
			} else {
				chrome.tabs.executeScript(tabId, {
					code: "document.body.classList.remove( '"+ uuid_class +"' ); "
				});
				chrome.tabs.executeScript(tabId, {
					code: "document.body.classList.add(    '"+ uuid_class +"-off' ); "
				});
				chrome.tabs.executeScript(tabId, {
					code: "setTimeout( function(){ ext_fixfixed.refreshDisabled = 1; } , 0); "
				});
				
				self.setBadge( "off" );
			}
		});
	}

	self.enable_feature = function( tabId, name ,  default_value ) {
		if ( self.get_config( 'fixfixed_' + name , 0) == 1 ) {
			chrome.tabs.executeScript(tabId, {
				code: "document.body.classList.add( '"+ uuid_class +"-"+ name + "' ); "
			});
		} else {
			chrome.tabs.executeScript(tabId, {
				code: "document.body.classList.remove( '"+ uuid_class +"-"+ name + "' ); "
			});
		}
	}

}

var ext_fixfixed = new fixfixed_background_class( chrome ); 

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  //  console.log("message received:" , message );
    if ( message.type == 'badge' ) {
	        ext_fixfixed.setBadge(  message.number  )
    }
});

chrome.browserAction.onClicked.addListener(ext_fixfixed.toggleFix);
chrome.tabs.onUpdated.addListener(ext_fixfixed.updateTab);
chrome.tabs.onActivated.addListener(ext_fixfixed.activateTab);
//chrome.tabs.onDeleted.addListener(ext_columns.removeTab);

ext_fixfixed.init();
