var fixfixed_content_class = function( chrome ) {
	var self = this;
	
	self.uuid_class = "chrome-fixfixed";
	self.options = {
		'on_off':		1,
		'show_badge': 	1, 
		'animation': 	0, 
		'transition': 	0, 
		'highlight': 	0, 
		'background':	1,
		'scrollcover': 	1
	}
	
	self.init = function(window) {
		self.storage = chrome.storage.local; 
			self.counter = 0; 
	
		self.oldScrollY = 0;
		self.disableRefresh = 0;
		self.filterTag = "*";
		self.firstRun = 1;
		self.cover = document.createElement('fixfixedscrollcover'); /* prevent problems of "body>div" styles */
		self.cover.setAttribute('class', 'fixfixedscrollcover');
		self.coverIsVisible = false;
	
		self.default_options = self.options;
	
		self.storage.get( self.options , function(data) {
			self.options = data ; 
		
			chrome.runtime.sendMessage({ type: 'badge', text: "set counter", number: '' });
	
		});
	}
	
	// called on document-end when dom is ready
	// we need working dom so we can change body.classes
	self.ready = function(window) {
		console.log( 'ready called ');
		
		if ( self.options.on_off == 1) {
		
			self.enable_features();
			self.addClasses(window);
			
			// wait for start to do this
			//self.addClasses(window); // mark possible divs a .fixfixed
			document.onscroll = function() {
				self.tryScrollCover(window)
			}
		
		} else {
			chrome.runtime.sendMessage({ type: 'badge', text: "set counter", number: 'off' });
		
		}
		
	}
	
	self.enable_features = function() {
		for ( key in self.options) {
			self.on_off_feature( key )	 
        }
	}


	self.on_off_feature = function( name ) {
		if ( self.options[name] == 1 ){
			document.body.classList.add( self.uuid_class +"-"+ name );
		} else {
			document.body.classList.remove( self.uuid_class +"-"+ name );
		}	
	}

	self.storageChange = function(changes, namespace) {
		for (key in changes) {
			self.options[key] = changes[key].newValue;
		}
		
		if( self.options.on_off == 0) {
				chrome.runtime.sendMessage({ type: 'badge', text: "set counter", number: 'off' });
		}
		
		
	}
	
	self.onMessage = function(message, sender, sendResponse) {
	    //console.log ( "got message");
	    
	    if ( message.type == 'refresh_badge' ) {
		    self.sendMessageBadge();
	    }
	    
	    // workaround trigger refresh
	    if ( message.type == 'toggle_on_off' ) {
		    self.enable_features();
		    //console.log( "message toggle")
	    }
	}


	self.tryScrollCover = function(window) {
		//console.log( self.disableRefresh ); 
		 
		 
		if ( self.disableRefresh == 0 ) {
			//console.log( 'try scrollx');
			//console.log(this)
			if (typeof self.coverTimer != 'undefined') {
				clearTimeout(self.coverTimer);
			}
			if (!self.coverIsVisible) {
				document.body.appendChild(self.cover);
				self.coverIsVisible = true;
				//self.refresh(window)
			}
			self.coverTimer = setTimeout(function() {
				// we are now in global scope !
				//console.log( self.cover );
				
				try {
					document.body.removeChild(self.cover);
					self.coverIsVisible = false;
				} catch (e) {
					// already removed
				}
				
				//self.refresh(window)
			}, 166); /* config ms ? */
		}
	}

	self.sendMessageBadge = function() {
		var badge = self.counter; 
		
		if ( self.options.on_off == 0 ) {
			badge = "off";
		}
		
		if ( self.options.show_badge == 0 ) {
			badge = ""; // remove badge
		}
		
		// should send this only for foreground tabs and not popups
		chrome.runtime.sendMessage({ 
				type: 'badge', 
				text: "set counter", 
				number: badge 
		});
	}


	self.tryAddClass = function(item, className) {
		//console.log( "adding fix to item") 
		//console.log( item.getAttribute("data-"+className) == null )
		//console.log( item )
		
		if (item.classList.contains('fixfixedscrollcover' ) ) {
			// skip special scrollcover
			return ; 
		}
		
		if (item.getAttribute("data-" + className) == null) {
			item.classList.add(className);
			item.setAttribute("data-" + className, 1)
		}
		
		
	}
	
	self.findFixed = function(item,type){
		self.styles = document.defaultView.getComputedStyle(item, type)
		if (typeof self.styles.position != "undefined" && self.styles.position == "fixed" && self.styles.transform == "none") {
			//console.log( self.styles.transform );
			self.tryAddClass(item, "fixfixed");
		}
		if (typeof self.styles.backgroundAttachment != "undefined" && self.styles.backgroundAttachment == "fixed") {
			self.tryAddClass(item, "fixfixedbackground")
		}
	}

	self.load_stylesheet = function( href, callback ) {
		
		// we could try to cache these stylesheets
		// and even cache the cssfixed for these stylesheets
		// actually only store the fixes with the href as key
		// need to expire sometimes as css could have changed !
		
		// read default_user_style via xhr from file
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange=function() {
		  if (xhr.readyState==4 && xhr.status==200) {
		    callback( xhr.responseText );
		  }
		};
		xhr.open('GET', href , true);
		xhr.send();
			
	}
	
	self.debug_rules = function( rules ) {
		for ( key in rules ) {
		   //console.log( rules[ key ] );
    	   //console.log( rules[x].selectorText );
    	}
	}
	
	self.appendCSS = function( extraCSS ) {
		if ( extraCSS != '' ) {
				var extraCSSStyle = document.createElement('style'); /* prevent problems of "body>div" styles */
				
				extraCSSStyle.setAttribute('type', 'text/css');
				extraCSSStyle.innerHTML = extraCSS;
				document.body.appendChild( extraCSSStyle );
				
				// we are async, so we update each time, its fast.
				self.counter++; 
				chrome.runtime.sendMessage({ type: 'badge', text: "set counter", number: self.counter });
		}
	}
	
	// one line 
	self.createExtraCSS = function ( rule_text ) {
		var extraCSS = ''; 
		
		if( rule_text.search(/transform|scrolling/) > -1 ) {
			//	console.log('nope: has transform ', rule_text );
		} else {
			//console.log( "yes:" , rule_text );
			
			// check if rule has position: we get them all from direct css
			var has_fixed = rule_text.search( /[a-zA-Z0-9\"\-\[\+\>[\]\=\,\.\_\#\: ]+\{[^}]*position\:\s*fixed[^}]*\}/g )
			
			var selectors = rule_text.match(/[a-zA-Z0-9\"\-\+\>\[\]\=\,\.\_\#\: ]+\{/g);
					
			if ( has_fixed > -1 ) {
				
				// usualy only 1 match
				for ( sel_key in selectors ) {
					
					// hack for html5test.com
					if( "body > div#index" == selectors[sel_key] ) { continue; }
					
					var css_highlight = ( self.options['highlight'] == 1) ? " border:3px dotted orange ": ""; 
					extraCSS +=  selectors[sel_key] + " transform: translateZ(0); "+ css_highlight + " }";
					
					// "."+ self.uuid_class +"-on_off "+
					//console.log( "has fixed: ", selectors[sel_key] );
				}
				
				
			} else {
				for ( sel_key in selectors ) {
					//console.log(" no fixed", selectors[sel_key] );
				}
			}
		}
		return extraCSS;
	}
	
			
	self.addClasses = function(window) {
		
		chrome.runtime.sendMessage({ type: 'badge', text: "set counter", number: self.counter });
	    
	    
		// read stylesheets
		// scan for position:fixed
		
		var stylesheets = document.styleSheets; 
		var stylesheets_count = stylesheets.length; 
		
		console.log( 'stylesheets');
		
		self.extraCSSs = ''; 
		
		for ( key_s in stylesheets ) {
			var stylesheet = document.styleSheets[key_s]; 
			var rules = stylesheet.cssRules ;
		
			console.log( "--------");
			//console.log( "stylesheet:" , stylesheet );
			//console.log( "rules:" 	   , stylesheet.cssRules );
			console.log( "href:" 	   , stylesheet.href );
		
			if ( typeof stylesheet.checked == 'undefined' ) {
			
			if (  rules == null &&
				 typeof stylesheet.href  != 'undefined'
				  ){
				
				console.log( "fetch" );
				
				stylesheet.checked = 1 ; // prevent fetching again.
				
				// fetch rules via xhr
				self.load_stylesheet( stylesheet.href , function( css ){
					extraCSS1 = ''; 
					//stylesheet.cssText = css; 
					//console.log( css )
				
					// parse css-string for position: fixed
					// grab the selector also
					// scan also for stopwords like, transform so we dont break css
					// append fixed css to document, simply by append innerhtml
					
					//console.log( css );
					
					
					//var css2 = css.replace(/\r\n/g,'') ;
					
					
					//console.log( css2 );
					
					var matches = css.match( /[a-zA-Z0-9\"\+\>\-\[\]\=\,\.\_\#\: ]+\{[^}]*position\:\s*fixed[^}]*\}/g )
				
					var rule_text = '';
					for ( key in matches ) {
						var rule_text = matches[key];
						// collect rules
						extraCSS1 += self.createExtraCSS( rule_text );
					}
					
					//console.log( "found direkt: ( " , extraCSS1, " )");
					
					// add <style>. try only one insert
					self.appendCSS( extraCSS1 );
				});
				
				//self.debug_rules( rules );
			} else {
				// load direct
				
				stylesheet.checked = 1 ; // prevent fetching again.
				extraCSS = ''; 
				if ( rules != null ) {
					//console.log( 'new: ', rules );
					
					for ( key in rules ) {
						var rule = rules[key];
						
						
						//console.log( typeof rule.media );
						
						if ( typeof rule.media == "object" ) {
							
							//console.log( rule.cssRules );
							
							if ( typeof rule.cssRules != "undefined") {
							
								for( key2 in rule.cssRules ) {
									var rule2 = rule.cssRules[key2];
									
									//console.log("rule2: ",  rule2 );
									
									if ( typeof rule2.cssText == "undefined" ) { continue; } 
									var rule_text = rule2.cssText;
									
									//console.log( rule_text );
									
									extraCSS += self.createExtraCSS( rule_text );
									
								}	
							}
						} else {
							var rule_text = rule.cssText;
							if ( typeof rule_text != "undefined" ) {
								extraCSS += self.createExtraCSS( rule_text );
							} else {
								// ignore exotic rules
								//console.log("bad: ", rule );
							}
						}
						
					}
					// we append one <style> per stylesheet
					
					self.appendCSS( extraCSS ); 
			
					//self.debug_rules( rules );
					console.log( "has rules first run");
				} else {
					console.log( "no rules ", stylesheet );
				}
			}
			
			} else {
				console.log( "already checked");
			}
			
			
		}
		
		//return; 
		
		console.log('parsing');
		
		// append user-styles to these selectors
		
		// make a quick scan over elements with (<* style='*'>) and try to find bad divs there
		
	
	
		//var number = 42;	
		//chrome.runtime.sendMessage({ type: 'badge', text: "set counter", number: number });
	
		return; 
		
	
		
		//console.log( "try refresh" );
		var items = document.body.querySelectorAll('*[style]');
		
		if (self.filterTag == "*" && items.length > 32500) {
			// to heavy on dom, only check div
			self.filterTag = "div";
			console.log('too many dom elements with * , next round only div');
			chrome.runtime.sendMessage({ type: 'badge', text: "set counter", number: ':-|' });
	
			//self.addClasses(window)
		}
		var nr = 0
		while (item = items[nr++]) {
			// lazy optimization, if we find fixfixed* on item skip it , probably no more hits here
			if ((typeof item.dataset.fixfixed == "undefined") && (typeof item.dataset.fixfixedbackground == "undefined")) {
				
				// normal
				self.findFixed(item,null)
				
				// only check before/after on first scan (finding backgrounds)
				if ( self.firstRun == 1) {
					// before
					self.findFixed(item,":before")
					
					// after
					self.findFixed(item,":after")
					
					self.firstRun = 0;
				}
			}
		} // while
		
		
		// undo fixfixed if not used any more (overflow bugs with ebay.de)
		var itemsFixed = document.body.querySelectorAll(".fixfixed");
		var nr = 0
		while (item = itemsFixed[nr++]) {
			// check if we need to remove it
			var styles = document.defaultView.getComputedStyle(item, null)
			if (typeof styles.position != "undefined" && styles.position != "fixed") {
				// remove class 
				item.dataset.fixfixed = 0;
				item.classList.remove('fixfixed');
			}
		}
		
				
			var fixed_elements = document.body.querySelectorAll( ".fixfixed",".fixfixedbackground" );
			var counter = fixed_elements.length;
		
			//chrome.runtime.sendMessage({ type: 'badge', text: "set counter", number: counter });
	
	}
	
	// scan the dom after a while to detect changes
	// only scan if number of document.stylesheets has changed
	// -- full reparse of styles
	// only scan elements which have style-attribute in html
	
	self.refresh = function(window) {
		return ; 
		
		if (self.disableRefresh == 0) {
			if (typeof window.scrollY != "undefined" && window.scrollY > 0) {
				if (window.scrollY > self.oldScrollY || window.scrollY < self.oldScrollY - 200 /* scrollback */ ) {
					//	console.log("recheck")
					self.addClasses(window);
					self.oldScrollY = (window.scrollY) + 0;
				} else {
					//console.log("check idle, no scroll " + (window.scrollY) + " : " + (self.oldScrollY ) )
				}
			}
		}
	}
	
	// auto-init
	self.init();
}

ext_fixfixed = new fixfixed_content_class(chrome);
//console.log('fixfixed content.js loaded');

chrome.storage.onChanged.addListener(ext_fixfixed.storageChange);
chrome.runtime.onMessage.addListener(ext_fixfixed.onMessage);

//window.ext_fixfixed = ext_fixfixed;
