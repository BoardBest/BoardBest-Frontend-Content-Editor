console.log('run mce-frontend-editor-events.js');

var BB_Editor = {

	wp_vars: null,
	this_DIR: null,

	/* element with this class activate MCE layer to edit it */
	edit_class: '.FN_edit',
	main_container: '.entry-content',
	
	/* FN_edit selected element index */
	area_index: null,
	section_index:null,

	editable_content_list: null,
	section_list: null,
	pure_sections_list: null,

	/* active section element */
	active_section_element:null,

	/* DOM hidden fields representations */
	/* to learn more check 'create_MCE_editor_DOM_elements' function in main plugin file */
	tinny_toplayer: null,
	tinny_wrapper: null,
	tinny_iframe: null,
	/* hiden element with pure post content (without shortcodes filtering) */
	pure_content: null,
	
	init: function(data){

		this.wp_vars = data;
		this.this_DIR = this.wp_vars.home_url+"/wp-content/plugins/boardbest-editor";
		this.tinny_toplayer = document.getElementById('FN-editor-wrapper'); 
		this.tinny_wrapper = document.getElementById('wp-FN_frontend_editor-wrap');
		this.tinny_iframe = document.getElementById('FN_frontend_editor_ifr');
		this.page_wrapper =  document.querySelector('.site');
		this.pure_content = document.getElementById('FN_content_before_filtering');

		this.editable_content_list = document.querySelectorAll( this.main_container+" "+this.edit_class ),
		this.section_list = document.querySelectorAll( this.main_container+" section" ),
		this.pure_section_list = document.querySelectorAll( "FN_content_before_filtering section" ),

		this.doc = document.documentElement;
		

		this.create_listeners();
		this.create_sections_options();
		
		/* hide editor popup */
		this.tinny_toplayer.style.visibility = 'hidden';
		this.tinny_wrapper.style.opacity = 0;

		/* remove preloader */
		var preloader = document.getElementById("editor-preloader");
		if(preloader){
			preloader.parentNode.removeChild(preloader)
		}

		/* indexed sections */
		for (var i = 0; i < this.section_list.length; i++) {
			this.section_list[i].setAttribute('data-section-index',i);
		}

		/* indexed sections in pure content bucket (with clean shortcodes representations)  */
		for (var i = 0; i < this.pure_section_list.length; i++) {
			this.pure_section_list[i].setAttribute('data-section-index',i);
		}
	},

	create_listeners: function(){
		
		/* crate listeners with FN-edit elements */
		/* and add indexes with data-index attribute */

		
		if( this.editable_content_list.length > 0 ){
			for (var i = 0; i < this.editable_content_list.length; i++) {
				this.editable_content_list[i].setAttribute('data-index',i);
				//editable_elements[i].addEventListener('click', this.editable_area_selected, false);
				this.editable_content_list[i].setAttribute('onclick','BB_Editor.editable_area_selected(this);');
			}
		}
		/* add event to click on outher active editor mask */
		this.tinny_toplayer.setAttribute('onclick','BB_Editor.close_and_save()');
		this.tinny_wrapper.setAttribute('onclick','BB_Editor.cancel_editor_bubbles(event)');

		/* sections options listeners */
		for (var i = 0; i < this.section_list.length; i++) {
			this.section_list[i].setAttribute('onmouseenter','BB_Editor.focused_section_on(event);');
			this.section_list[i].setAttribute('onmouseleave','BB_Editor.focused_section_off(event);');
		}
	
	},

	/* FN EDITOR METDODS */

	editable_area_selected: function(_t){
		
		var _Be = BB_Editor;

		/* show and positioning MCE layer */
		var coords = _t.getBoundingClientRect();
		if((coords.y < 60)||(coords.y > 200)){
			this.doc.scrollTop = this.doc.scrollTop + (coords.y-120);
			coords.y = 120;
		}else{
			coords.y = coords.y+30;
		}		
		_Be.tinny_wrapper.style.width = coords.width + 'px';
		_Be.tinny_iframe.style.height = coords.height + 'px';
		_Be.tinny_wrapper.style.left = coords.x + 'px';
		_Be.tinny_wrapper.style.top = coords.y + 'px';

		/* show editor popup */
		_Be.tinny_toplayer.style.visibility = 'visible';
		_Be.tinny_wrapper.style.opacity = 1;

		/* get edited element */
		_Be.area_index = _t.getAttribute('data-index');
		var out = _Be.pure_content.querySelectorAll(_Be.edit_class)[_Be.area_index].innerHTML;
		tinymce.get('FN_frontend_editor').setContent(out);

		this.page_wrapper.style.filter = 'grayscale(80%)';
		this.doc.style.overflow = 'hidden';
	},

	/* save content part with new shortcode conditions after close editor */
	close_and_save: function(){

		var _Be = BB_Editor;

		_Be.tinny_toplayer.style.visibility= 'hidden';
		_Be.tinny_wrapper.style.opacity = 0;

		this.page_wrapper.style.filter = 'initial';
		this.doc.style.overflow = 'initial';

		/* update hidden pure technical container */
		if(_Be.area_index){
			var content = tinymce.get('FN_frontend_editor').getContent();
			document.querySelectorAll(_Be.main_container+' '+_Be.edit_class)[_Be.area_index].innerHTML = content;
			this.pure_content.querySelectorAll(this.edit_class)[this.area_index].innerHTML = content;
		}

		/* update content ocject data */
		_Be.wp_vars.contentpart = content;
		_Be.wp_vars.content = _Be.pure_content.innerHTML;

		/* update wp post */
		var xhr_data = {
			contentpart : _Be.wp_vars.contentpart,
			content: _Be.wp_vars.content,
			area_index: _Be.area_index,
			post_id: _Be.wp_vars.post_id,
			post_slug: _Be.wp_vars.post_slug
		}
		wp_editor_xhr('BBsaveEditor',xhr_data,function(res) {
			var out = JSON.parse(res);
			//console.log(out);
			document.querySelector(_Be.main_container).innerHTML = out.content;
			_Be.init(_Be.wp_vars);
		});
	},

	cancel_editor_bubbles: function(_e){
		_e.cancelBubble = true;
	},

	/* SECTIONS METHODS */

	create_sections_options:function(){
		var sestionsElements = document.querySelectorAll(this.main_container+" section");
		for (var i = 0; i < sestionsElements.length; i++) {
				var _h = sestionsElements[i].offsetHeight;
				var node = document.createElement("div");  
				node.className = "section-options";               // Create a <li> node
				var textnode = document.createTextNode("bla bla");         // Create a text node
				node.appendChild(textnode);  
				node.innerHTML = `
					<div class="section-option" data-action="delete" onclick="BB_Editor.delete_section(event)">
						<img src="`+this.this_DIR+`/ico4.png" >
					</div>
					<div class="section-option" data-action="add_new" onclick="BB_Editor.add_new_section(event)">
						<img src="`+this.this_DIR+`/ico5.png" >
					</div>
					<div class="section-option" data-action="change_background" onclick="BB_Editor.change_section_background(event)">
						<img src="`+this.this_DIR+`/ico6.png" >
					</div>
					<div class="section-option" data-action="change_background" onclick="BB_Editor.switch_down(event)">
						<img src="`+this.this_DIR+`/ico7.png" >
					</div>
					<div class="section-option" data-action="change_background" onclick="BB_Editor.switch_up(event)">
						<img src="`+this.this_DIR+`/ico8.png" >
					</div>
				`;
				sestionsElements[i].appendChild(node); 
		}
	},

	delete_section:function(e){
		e.cancelBubble = true;
		this.active_section_element.closest("section").remove();
	},

	add_new_section:function(e){
		e.cancelBubble = true;
		var section_element = e.target.closest("section");
		/* get index of element */
		
		/* TODO - rebuild indexes !!!!!!!!!!!!!!!!! */
		console.log("TODO !!!!! important");
		var _i = section_element.getAttribute('data-section-index');
		BB_Editor.section_index = _i;
		
		//sGETinit_sections_templates
		//window.location.href = '/#/templates/list/type=section&callback=SECTION&index='+_i;
		window.location.href = '#showmodal/a=sGETinit_sections_templates/active=templates/tpl=mainFormCards';
	},
	render_new_section(content){
		var element = document.querySelector('section[data-section-index="'+BB_Editor.section_index+'"]');
		const y = document.createElement("section");
 		y.innerHTML = decodeURIComponent(content);
 		/* docs to insertAdjacentElement http://xahlee.info/js/js_insert_after.html */
		element.insertAdjacentElement("afterend", y);
	},

	change_section_background:function(e){
		e.cancelBubble = true;
		//var section_element = e.target.closest("section");
		//BB_Editor.active_section_element = section_element;
		window.location.href = '#showmodal/a=sGETinit_section_options_bg/active=backgrounds/tpl=mainFormCards';
	},

	switch_down:function(e){
		e.cancelBubble = true;
		var first_element = e.target.closest("section");
		var second_element = e.target.closest("section");
		document.getElementById("item1").nextSibling.innerHTML; 
	},

	add_class_to_active_section:function($class_name){
		/* clear old backgrounds */
		console.log('add class');
		var class_list = BB_Editor.active_section_element.classList;
		for (var i = 0; i < class_list.length; i++) {
			var class_to_remove = class_list[i];
			if(class_to_remove.slice(0, -1) == 'background' ){
				class_list.remove(class_to_remove);
			}
		}
		BB_Editor.active_section_element.classList.add($class_name);

		/* copy classes to pure content */		
		this.pure_content.querySelectorAll('section')[this.section_index].classList = class_list;

		this.close_and_save();

	},

	focused_section_on: function(e){
		this.active_section_element = e.target;
		for (var i = 0; i < this.section_list.length; i++) {
			this.section_list[i].classList.remove('section-hover');
		}
		this.active_section_element.classList.add('section-hover');
		/* get index */
		this.section_index = this.active_section_element.getAttribute('data-section-index');
	},

	focused_section_off: function(e){
		e.target.classList.remove('section-hover');
	},
	save_DOM(){
		/* update wp post */
		//console.log(this.pure_content.innerHTML);
		var _Be = BB_Editor;
		var xhr_data = {
			//contentpart : _Be.wp_vars.contentpart,
			content: _Be.wp_vars.content,
			area_index: _Be.area_index,
			post_id: _Be.wp_vars.post_id,
			post_slug: _Be.wp_vars.post_slug
		}
		wp_editor_xhr('BBsaveEditor',xhr_data,function(res) {
			var out = JSON.parse(res);
			//console.log(out);
			document.querySelector(_Be.main_container).innerHTML = out.content;
			_Be.init(_Be.wp_vars);
		});
	}
}

var wp_editor_xhr = function(action, data, callback){
	var _c = callback;
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
	  if( xhr.readyState === 4 && xhr.status === 200 ) {
		_c(xhr.responseText);
	  }
	}
	var ajax_url = wp_vars.ajax_url;
	xhr.open( 'POST', ajax_url, true );
	xhr.setRequestHeader( 'Content-type', 'application/x-www-form-urlencoded' );

	var stringData = encodeURIComponent(JSON.stringify(data));
	var params = 'action='+action+'&data=' + stringData; 
	
	console.log("-editor xhr Data ----------------" );
	//console.log( stringData );
	//console.log( "-editor send xhr ----------------" );
	//console.log( params );
	xhr.send( params );
}


/* RUN BB_editor */
/* ------------------------- */
var frontend_editor_completed = function(){
	console.log('main_editor_completed wp_vars', wp_vars);
	BB_Editor.init(wp_vars);
}

/* Global callback functions */
/*window.insertTemplateToTiny = function(content){
	tinyMCE.execCommand('mceInsertContent', false, content);
}*/

/*window.insertTemplateAsSection = function(content){
	var element = document.querySelector('section[data-section-index="'+BB_Editor.section_index+'"]');
	const y = document.createElement("section");
 	y.innerHTML = content;
 	// docs to insertAdjacentElement http://xahlee.info/js/js_insert_after.html 
	element.insertAdjacentElement("afterend", y);
}*/





// XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

// XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

// XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX



var editableClass = 'FN_edit';
var content_main_container_selector = '.entry-content';
var area_index = null;

/* create active areas */
var classname = document.getElementsByClassName(editableClass);
if(classname.length != 0){
	for (var i = 0; i < classname.length; i++) {
		//classname[i].addEventListener('click', selectEditableArea, false);
		//classname[i].setAttribute('data-index',i);
	}
}else{
	//document.querySelector('.entry-content').addEventListener('click', selectEditableArea, false);
	//document.querySelector('.entry-content').setAttribute('data-index',0);
	/* to do add div inside entry content with fn-edit class */
	//document.querySelector('.entry-content').classList.add(editableClass);
}



/*var _D_editor = document.getElementById('wp-FN_frontend_editor-wrap');
var _D_save = document.getElementById('save_content_button');
_D_save.addEventListener('click', save_content, false);
var _D_close = document.getElementById('close_content_button');
_D_close.addEventListener('click', close_content, false);
var _D_body = document.getElementsByTagName('body')[0];*/




function selectEditableArea(e){
	//console.log('select',e);
	var el_position = this.getBoundingClientRect();
	var el_position_top = el_position.top + window.scrollY;
	
	if(el_position_top < 120){el_position_top = 120;}
	
	var _D_mask = document.getElementById('FN-editor-wrapper');
	var _D_editor = document.getElementById('wp-FN_frontend_editor-wrap');
	
	var _D_content = document.getElementById('FN_content_before_filtering');
	var _D_frame = document.getElementById('FN_frontend_editor_ifr');

	area_index = this.getAttribute('data-index');

	_D_mask.classList.remove('hide');
	_D_mask.style.height = _D_body.offsetHeight+50;

	var out = _D_content.getElementsByClassName(editableClass)[area_index].innerHTML;
	tinymce.get('FN_frontend_editor').setContent(out);
	_D_editor.style.width = el_position.width + 'px';	
	_D_editor.style.left = el_position.left + 'px';
	_D_editor.style.top = ( el_position_top ) + 'px';
	_D_frame.style.height = (el_position.height) + 'px';
	window.scrollTo(0, el_position_top-100);

}

function save_content(e){
	
	var _D_mask = document.getElementById('FN-editor-wrapper');
	_D_mask.classList.add('hide');
	window.scrollTo(0,window.pageYOffset+10);
	update_content_technical_container(tinymce.get('FN_frontend_editor').getContent());

}

function close_content(e){
	window.scrollTo(0,window.pageYOffset+10);
	var _D_mask = document.getElementById('FN-editor-wrapper');
	_D_mask.classList.add('hide');
}

//var _URL = window.FN_editor_data.url;
function update_content_technical_container(content){
	var _D_content = document.getElementById('FN_content_before_filtering');
	_D_content.getElementsByClassName(editableClass)[area_index].innerHTML = content;
	document.querySelector(content_main_container_selector).getElementsByClassName(editableClass)[area_index].innerHTML = content;
	//window.FN_editor_data.contentpart = content;
	//window.FN_editor_data.content = _D_content.innerHTML;
	//window.FN_editor_data.area_index = area_index;

	/*wp_editor_xhr('BBsaveEditor',window.FN_editor_data,function(res) {
		var out = JSON.parse(res);
		//console.log(out);
	});*/
}



/* Edit sections */
var add_sections_options = function(){
	var sestionsElements = document.querySelectorAll('.entry-content section');
	for (var i = 0; i < sestionsElements.length; i++) {
		var _index = sestionsElements[i].getAttribute("data-index");
		var _h = sestionsElements[i].offsetHeight;
		sestionsElements[i].style.position = 'relative';


		sestionsElements[i].innerHTML += `
			<div class="section-options" style="position:relative; margin-top:-`+_h+`px">
				<button class="section-option" data-action="delete" data-index="`+_index+`" onclick="delete_section(event)">Delete</button>
				<button class="section-option" data-action="add_new" data-index="`+_index+`" onclick="add_new_section(event)">Add new section</button>
				<button class="section-option" data-action="change_background" data-index="`+_index+`" onclick="change_section_background(event)">Change background</button>
			</div>`;
	}
}
var delete_section = function(e){
	//console.log(e);
	e.target.closest("section").remove();
/*	var index = e.originalTarget.dataset.index;
	var sectionsElement = document.querySelectorAll('section[data-index="'+e.originalTarget.dataset.index+'"]');
	sectionsElement[0].remove();
	e.cancelBubble = true;*/
}
var add_new_section = function(e){
	//console.log(e);
	e.cancelBubble = true;
	window.location.href = '/#/addtemplate/elements';
}
var change_section_background = function(e){
	//console.log(e);
	e.cancelBubble = true;
}
//add_sections_options();



function getPosition(el) {
	var x = 0, y = 0, w = 0, h = 0;
	while (el != null && (el.tagName || '').toLowerCase() != 'html') {
		x += el.offsetLeft || 0; 
		y += el.offsetTop || 0;
		w += el.offsetWidth || 0;
		h += el.offsetHeight || 0;
		el = el.parentElement;
	}
	return { x: parseInt(x, 10), y: parseInt(y, 10), w: w, h: h };
}


