var FixFixed = function() {
		var oldScrollY, timer, filterTag, disableRefresh, cover, coverTimer, coverIsVisible, firstRun;

		function init(window) {
			this.oldScrollY = 0;
			this.disableRefresh = 0;
			this.filterTag = "*";
			this.firstRun = 1;
			this.cover = document.createElement('fixfixedscrollcover'); /* prevent problems of "body>div" styles */
			this.cover.setAttribute('class', 'fixfixedscrollcover');
			this.coverIsVisible = false;
			this.addClasses(window);
			document.onscroll = function() {
				FixFixed.tryScrollCover(window)
			}
		}

		function tryScrollCover(window) {
			//console.log( 'try scrollx');
			//console.log(this)
			if (typeof this.coverTimer != 'undefined') {
				clearTimeout(this.coverTimer);
			}
			if (!this.coverIsVisible) {
				document.body.appendChild(this.cover);
				this.coverIsVisible = true;
				//FixFixed.refresh(window)
			}
			this.coverTimer = setTimeout(function() {
				// we are now in global scope !
				document.body.removeChild(FixFixed.cover);
				FixFixed.coverIsVisible = false;
				FixFixed.refresh(window)
			}, 166);
		}

		function tryAddClass(item, className) {
			//console.log( "adding fix to item") 
			//console.log( item.getAttribute("data-"+className) == null )
			//console.log( item )
			if (item.getAttribute("data-" + className) == null) {
				item.classList.add(className);
				item.setAttribute("data-" + className, 1)
			}
		}
		
		function findFixed(item,type){
			var styles = document.defaultView.getComputedStyle(item, type)
			if (typeof styles.position != "undefined" && styles.position == "fixed") {
				this.tryAddClass(item, "fixfixed")
			}
			if (typeof styles.backgroundAttachment != "undefined" && styles.backgroundAttachment == "fixed") {
				this.tryAddClass(item, "fixfixedbackground")
			}
		}

		function addClasses(window) {
			//console.log( "try refresh" );
			var items = document.getElementsByTagName(this.filterTag);
			if (this.filterTag == "*" && items.length > 1500) {
				// to heavy on dom, only check div
				this.filterTag = "div";
				console.log('too many dom elements with * , next round only div');
				//this.addClasses(window)
			}
			var nr = 0
			while (item = items[nr++]) {
				// lazy optimization, if we find fixfixed* on item skip it , probably no more hits here
				if ((typeof item.dataset.fixfixed == "undefined") && (typeof item.dataset.fixfixedbackground == "undefined")) {
					
					// normal
					this.findFixed(item,null)
					
					// only check before/after on first scan (finding backgrounds)
					if ( this.firstRun == 1) {
						// before
						this.findFixed(item,":before")
						
						// after
						this.findFixed(item,":after")
						
						this.firstRun = 0;
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
			if (this.filterTag == "div" && items.length > 1500) {
				// give up page too big
				this.disableRefresh = 1;
				console.log('too many dom elements, i give up, bye.');
				return false
			}
			
		}
		
		
		function refresh(window) {
			if (this.disableRefresh == 0) {
				if (typeof window.scrollY != "undefined" && window.scrollY > 0) {
					if (window.scrollY > this.oldScrollY || window.scrollY < this.oldScrollY - 200 /* scrollback */ ) {
						//	console.log("recheck")
						this.addClasses(window);
						this.oldScrollY = (window.scrollY) + 0;
					} else {
						//console.log("check idle, no scroll " + (window.scrollY) + " : " + (this.oldScrollY ) )
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