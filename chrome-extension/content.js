
var FixFixed = function() {
	
	var oldScrollY, 
		timer,
		filterTag, 
		disableRefresh;
	
	function init(window) {
	
	  this.oldScrollY = 0; 
	  this.disableRefresh = 0;
	  this.filterTag ="*";
	  
	  this.addClasses(window);
	}
	
	function tryAddClass(item,className) {
		//console.log( "adding fix to item") 
		//console.log( item.getAttribute("data-"+className) == null )
		//console.log( item )
		
		if ( item.getAttribute("data-"+className) == null ) {
			item.classList.add( className );
			item.setAttribute("data-"+className , 1)
		}
	}
	
	function addClasses(window) {
	
	  //console.log( "try refresh" );
	  
	  var items = document.getElementsByTagName( this.filterTag );
	  
	  if ( this.filterTag == "*" &&  items.length > 1000 ) {
		// to heavy on dom, only check div
		this.filterTag = "div";
		console.log( 'too many dom elements with * , i try again with div');
		
		this.addClasses(window)
	  }
	  var nr = 0
	  while ( item = items[nr++]){
		
		// lazy optimization, if we find fixfixed* on item skip it , probably no more hits here
		
		if ( ( typeof item.dataset.fixfixed == "undefined" ) && ( typeof item.dataset.fixfixedbackground == "undefined" ) ) {
		
			var styles = document.defaultView.getComputedStyle(item,null)
			
			if ( typeof styles.position != "undefined" && styles.position == "fixed")
		    {
				this.tryAddClass(item,"fixfixed" )	
			}
			if ( typeof styles.backgroundAttachment != "undefined" && styles.backgroundAttachment == "fixed")
		    {
				this.tryAddClass(item,"fixfixedbackground" )	
			}
			
			var styles = document.defaultView.getComputedStyle(item,":before")
			
			if ( typeof styles.position != "undefined" && styles.position == "fixed")
		    {
				this.tryAddClass(item,"fixfixed" )	
			}
			if ( typeof styles.backgroundAttachment != "undefined" && styles.backgroundAttachment == "fixed")
		    {
				this.tryAddClass(item,"fixfixedbackground" )	
			}
			
			var styles = document.defaultView.getComputedStyle(item,":after")
			
			if ( typeof styles.position != "undefined" && styles.position == "fixed")
		    {
				this.tryAddClass(item,"fixfixed" )	
			}
			if ( typeof styles.backgroundAttachment != "undefined" && styles.backgroundAttachment == "fixed")
		    {
				this.tryAddClass(item,"fixfixedbackground" )	
			}
		}
		if ( ( typeof item.dataset.fixfixed != "undefined" && item.dataset.fixfixed == 1 ) ) {
			// check if we need to remove it
			var styles = document.defaultView.getComputedStyle(item,null)
			if ( typeof styles.position != "undefined" && styles.position != "fixed")
		    {
				// remove class /* needed for navi in ebay.de */
				item.dataset.fixfixed = 0;
				item.classList.remove('fixfixed');	
			}
		}
		 
	  };
	 
	  	// let it run once, but not more
		 if ( this.filterTag == "div" &&  items.length > 1000 ) {
		  	// give up page too big
			this.disableRefresh = 1;
			console.log( 'too many dom elements, i give up, bye.');
			return false	  	
		  }
	}
	
	function refresh(window) {
		
		if ( this.disableRefresh == 0) { 
		 
			if ( typeof window.scrollY != "undefined" && window.scrollY > 0 ) {
				if ( window.scrollY > this.oldScrollY || window.scrollY < this.oldScrollY - 200 /* scrollback */ ) {
					//	console.log("recheck")
					this.addClasses(window);
					this.oldScrollY = (window.scrollY) + 0;
				} else {
					//console.log("check idle, no scroll " + (window.scrollY) + " : " + (this.oldScrollY ) )
				}
			}
			
		}
		
	}
	
	return {init: init, refresh: refresh, addClasses: addClasses, tryAddClass: tryAddClass }
}()



console.log('fixfixed loaded');
FixFixed.init(window);

if ( 1 ) {
	var fixfixed_body = document.body,
	    fixfixed_cover = document.createElement('fixfixedscrollcover'), /* prevent problems of "body>div" styles */
	    fixfixed_cover_timer, 
	    fixfixed_cover_visible;
	  
	fixfixed_cover.setAttribute('class','fixfixedscrollcover');
	fixfixed_cover_visible = false; 
	
	var fixfixed_try_scroll_cover = function() {
	   //console.log( 'try scrollx');
	   
	  if ( typeof fixfixed_cover_timer !='undefined' ) {
	  	clearTimeout(fixfixed_cover_timer);
	  }
	  
	  if ( !fixfixed_cover_visible ) {
		fixfixed_body.appendChild(fixfixed_cover);
		fixfixed_cover_visible = true; 
		//FixFixed.refresh(window)
	  }
	  
	  fixfixed_cover_timer = setTimeout(function(){
	    fixfixed_body.removeChild(fixfixed_cover);
	    fixfixed_cover_visible = false; 
		FixFixed.refresh(window)
		
	  },166);
	}
		
	document.onscroll = fixfixed_try_scroll_cover;
};
