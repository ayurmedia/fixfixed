var FixFixed = function() {
		var self = this; 
		
		var oldScrollY, timer, filterTag, disableRefresh, cover, coverTimer, 
			coverIsVisible, firstRun;

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
				FixFixed.tryScrollCover(window)
			}
		}

		self.tryScrollCover = function(window) {
			//console.log( 'try scrollx');
			//console.log(this)
			if (typeof self.coverTimer != 'undefined') {
				clearTimeout(self.coverTimer);
			}
			if (!self.coverIsVisible) {
				document.body.appendChild(self.cover);
				self.coverIsVisible = true;
				//FixFixed.refresh(window)
			}
			self.coverTimer = setTimeout(function() {
				// we are now in global scope !
				document.body.removeChild(FixFixed.cover);
				FixFixed.coverIsVisible = false;
				FixFixed.refresh(window)
			}, 166);
		}

		self.tryAddClass = function(item, className) {
			//console.log( "adding fix to item") 
			//console.log( item.getAttribute("data-"+className) == null )
			//console.log( item )
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
			//console.log( "try refresh" );
			var items = document.getElementsByTagName(self.filterTag);
			if (self.filterTag == "*" && items.length > 1500) {
				// to heavy on dom, only check div
				self.filterTag = "div";
				console.log('too many dom elements with * , next round only div');
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
			if (self.filterTag == "div" && items.length > 1500) {
				// give up page too big
				self.disableRefresh = 1;
				console.log('too many dom elements, i give up, bye.');
				return false
			}
			
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
		// make methods public
		return {
			init: init,
			refresh: refresh,
			addClasses: addClasses,
			tryAddClass: tryAddClass,
			tryScrollCover: tryScrollCover, 
			findFixed: findFixed 
		}
	}()
	FixFixed.init(window);
console.log('fixfixed loaded');