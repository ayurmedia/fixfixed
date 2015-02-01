var $$ = function(id) {
	return document.getElementById(id); 
}

var options_config = {
	fields: [
		{
			name: 'fixfixed_show_badge', 
			default: 1
		}	
		,
		{
			name: 'fixfixed_animation', 
			default: 0
		}
		,
		{
			name: 'fixfixed_background', 
			default: 1
		}
		,
		{
			name: 'fixfixed_transition', 
			default: 0
		}
		,
		{
			name: 'fixfixed_highlight', 
			default: 0
		},
		{
			name: 'fixfixed_scrollcover', 
			default: 1
		}
	]
}

// Saves options to localStorage.
var save_options =function() {
  	//console.log(options_config.fields);
	options_config.fields.forEach(function(field){
	  //console.log(field.name)

		localStorage[ field.name ] = $$( field.name ).value; 	
	} ); 

 
  // Update status to let user know options were saved.
  var $status = $$("status");
  $status.innerHTML = "Options Saved.";
  setTimeout(function() {
    $status.innerHTML = "";
  }, 2000);
}

// Restores select box state to saved value from localStorage.
var restore_options = function() {
	options_config.fields.forEach(function(field){ 
  		$$( field.name ).value 		=  ( localStorage[field.name] ) ? localStorage[field.name] : field.default  ;
	} ); 
}

// init
document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);
