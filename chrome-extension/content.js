var fixfixed_content_class = function( chrome ) {
	var self = this;
	var uuid_class = "chrome-fixfixed";
	
	var oldScrollY, timer, filterTag, disableRefresh, cover, coverTimer, 
		coverIsVisible, firstRun;

	self.add_style = function(config_ext_min_width, config_ext_min_height) {
		document.body.classList.add( uuid_class );
		var paras = document.getElementsByTagName('p');
		var paras_length = paras.length;
	
		var counter = 0; 
		var nr_i = 0;
		for (nr in paras) {
			nr_i++;
			if (nr_i > paras_length) break;

			var height = paras[nr].clientHeight;
			var width = paras[nr].clientWidth;
			var has_media = false;

			//console.log(height, config_ext_min_height);
			//console.log( nr, paras[nr] );
			var media = paras[nr].querySelectorAll('img','object','iframe');
			if (media.length > 0) {
				has_media = true;
			}
			
			if (has_media == false && 
			    height > config_ext_min_height && 
			    height < config_ext_max_height && width > config_ext_min_width) {
					paras[nr].classList.add( "columns" );
					counter++; 
					//chrome.runtime.sendMessage({ type: 'badge', text: "set counter", number: counter });
			}
		}
		chrome.runtime.sendMessage({ type: 'badge', text: "set counter", number: counter });
		//alert('set badge');	
	}

	self.add_style_toggle = function() {
		self.add_style();
		document.body.classList.toggle( uuid_class );
	}
		
	self.add_style_on = function() {
		self.add_style();
		document.body.classList.add( uuid_class );
	}
	
	
	self.init = function(window) {
		self.oldScrollY = 0;
		self.disableRefresh = 0;
		self.filterTag = "*";
		self.firstRun = 1;
		self.cover = document.createElement('fixfixedscrollcover'); /* prevent problems of "body>div" styles */
		self.cover.setAttribute('class', 'fixfixedscrollcover');
		self.coverIsVisible = false;
		self.addClasses(window);
		document.onscroll = function() {
			self.tryScrollCover(window)
		}
		//self.add_style_on();
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

	self.tryScrollCover = function(window) {
		if ( self.disableRefresh > 0 ) {
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
				} catch (e) {
					// already removed
				}
				
				self.coverIsVisible = false;
				self.refresh(window)
			}, 166); /* config ms ? */
		}
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
		var styles = document.defaultView.getComputedStyle(item, type)
		if (typeof styles.position != "undefined" && styles.position == "fixed") {
			self.tryAddClass(item, "fixfixed")
		}
		if (typeof styles.backgroundAttachment != "undefined" && styles.backgroundAttachment == "fixed") {
			self.tryAddClass(item, "fixfixedbackground")
		}
	}

	self.addClasses = function(window) {
		chrome.runtime.sendMessage({ type: 'badge', text: "set counter", number: "-" });
	
		
		//console.log( "try refresh" );
		var items = document.getElementsByTagName(self.filterTag);
		if (self.filterTag == "*" && items.length > 2500) {
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
		var itemsFixed = document.getElementsByClassName("fixfixed");
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
		
		// let it run once, but not more
		if (self.filterTag == "div" && items.length > 2500) {
			// give up page too big
			self.disableRefresh = 1;
			console.log('too many dom elements, i give up, bye.');
			chrome.runtime.sendMessage({ type: 'badge', text: "set counter", number: ':-(' });
	
			return false
		}
		
			var fixed_elements = document.body.querySelectorAll( ".fixfixed",".fixfixedbackground" );
			var counter = fixed_elements.length;
		
			chrome.runtime.sendMessage({ type: 'badge', text: "set counter", number: counter });
	
	}
	
	
	self.refresh = function(window) {
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
	
	self.get_config = function( name , default_value ) {
		if ( typeof localStorage[ name ] != "undefined" )  {
			return localStorage[ name ];
		} 
		
		if ( typeof default_value != "undefined" )  {
			return default_value;
		}
		
		return "";
	}
}
ext_fixfixed = new fixfixed_content_class(chrome);
console.log('fixfixed content.js loaded');

//ext_fixfixed.init(window);

