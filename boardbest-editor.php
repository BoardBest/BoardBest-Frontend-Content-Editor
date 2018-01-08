<?php
/*
Plugin Name: BoardBest editor
Description: Boardbest frontend editor
Version:     0.0.1
Author:      dadmor@gmail.com

Copyright © 2017-2017 FutureNet.club

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

*/

$preview = $_GET['preview'];

/* Init JAVASCRIPT */
function run_editor_scripts() {
	if(etitor_permission()){
		global $post;
		wp_register_script( 'bb_edit_ajax-script', plugin_dir_url(__FILE__) . 'js/mce-frontend-editor-events.js', array (), false, true );
		$wp_vars = array(
			'ajax_url' => admin_url( 'admin-ajax.php' ) ,
			'home_url' => get_home_url(),
			'post_id' => $post->ID ,
			'post_slug' => $post->post_name,
			'contentpart' => null,
			'content' => null,
			'area_index' => null
		);
		wp_localize_script( 'bb_edit_ajax-script', 'wp_vars', $wp_vars );
		wp_enqueue_script( 'bb_edit_ajax-script' );
	}
}
add_action( 'wp_footer', 'run_editor_scripts' );

/* extra button */
function enqueue_plugin_scripts($plugin_array)
{
    //enqueue TinyMCE plugin script with its ID.
    $plugin_array["green_button_plugin"] = plugin_dir_url(__FILE__) . "js/extra-button.js";
    return $plugin_array;
}
add_filter("mce_external_plugins", "enqueue_plugin_scripts");

function register_buttons_editor($buttons)
{
    //register buttons with their id.
    array_push($buttons, "green");
    return $buttons;
}
add_filter("mce_buttons", "register_buttons_editor");


/* Init main TINNY */
function create_MCE_editor_DOM_elements() {

	if(etitor_permission()){

		$dir_js = __DIR__.'/js/';
		$dir_css = __DIR__.'/css/';

		global $post;

		$content = '';
		$editor_id = 'FN_frontend_editor';
		$inner_editor_id = 'FN_inner_editor';
		$settings =  array(
			'media_buttons' => false,
			'quicktags' => false,
			'wpautop' => true,
			'relative_urls' => false,
			'tinymce' => array(
				'toolbar1' => 'bold, italic, ,strikethrough,|,bullist,numlist,blockquote,|,justifyleft,justifycenter,justifyright,|,link,unlink,|,layouts,|,components,|,wp_media,|',
				'toolbar2' => '',
			'content_css' => get_stylesheet_directory_uri() . '/inc/tiny-admin-css/tiny-css.css'

			),
		);

		$edit = '';
		$edit .= '<div id="FN-editor-wrapper">';
			ob_start();	
			wp_editor( $content, $editor_id, $settings ); 
		$edit .= ob_get_clean();
		$edit .= '</div>';

		$edit .= '<div id="FN_frontend_editor"></div>';
		$edit .= '<div id="FN_frontend_editor_append_icon"></div>';
		$edit .= '<code id="FN_content_before_filtering" style="/*display: block; transform: scale(0.6); transform-origin: 50% 10%;*/">';
		$edit .= wpautop( $post->post_content );
		$edit .= '</code> ';

		$edit .= '<div id="editor-preloader"><img src="'.plugin_dir_url(__FILE__).'/preloader.gif"/></div>';
		
		echo $edit;
		echo "";

		echo "<style>\n";
		echo "/* active editor style */";
		echo file_get_contents($dir_css.'editor-style.css');
		echo "\n</style>";
	}

}
add_action( 'wp_footer', 'create_MCE_editor_DOM_elements');



function add_tinymce_save_post_button($context){
	return $context.='<button id="save_content_button" class="save-button">Save</button><button id="close_content_button">exit</button>';
}
add_action('media_buttons_context','add_tinymce_save_post_button');

function add_media_upload_scripts() {

    if(etitor_permission()){
	    if ( is_admin() ) {
	         return;
	       }
	    wp_enqueue_media();
    	wp_register_script( 'media-lib-uploader-js', plugins_url( 'media-lib-uploader.js' , __FILE__ ), array('jquery') );
    	wp_enqueue_script( 'media-lib-uploader-js' );
	}
}
add_action('wp_enqueue_scripts', 'add_media_upload_scripts');

/* WP AJAX get template */
add_action( 'wp_ajax_BBsaveEditor', 'BBsaveEditor' );
//add_action( 'wp_ajax_nopriv_BBsaveEditor', 'BBsaveEditor' );
function BBsaveEditor(){

	$data = (json_decode(stripslashes(urldecode($_POST['data'])), true));

	/* check permisions */
	if( current_user_can('edit_others_pages') ) {

		$post = get_post($data['post_id']);
		if($post->post_name == $data['post_slug']){

			if(($post->post_type=='post')||($post->post_type=='page')){

				$my_post = array(
					'ID' => $post->ID,
					//'post_title'   => $post->ID,
					'post_content' => $data['content'],
				);
				wp_update_post( $my_post );

				$data['content'] = $data['content'];
				if($data['contentpart']){
					$data['contentpart'] = $data['contentpart'];
				}				
				$data['content'] = apply_filters('the_content', $data['content']);
				if($data['contentpart']){
					$data['contentpart'] = apply_filters('the_content', $data['contentpart']);
				}
			}
		}
	}
	wp_send_json( $data );
}

/* WARNING!!!!
	tiny_mce_before_init in my opinion could call ones
	NOW THIS HOK REALIZED 3 PLUGINS:	
	
	1. boardbest-editor.php
	frontend_editor_completed();

	2. vue-core
	editor_completed

	3. boardbest-shortcode-renderer
	_BBSR.tinnyClickGraber(e);
*/

function _tinymce_init_callback( $setings ) {
	if(etitor_permission()){
		$code = "function(ed) {
			ed.onInit.add(
				function(ed) {
					frontend_editor_completed();
					/* old vue condition */
					/*editor_completed();*/
				}
			);
			ed.onClick.add(
				function(ed, e) {
					_BBSR.tinnyClickGraber(e);
				}
			);
		}";
		$setings['setup'] = str_replace(array("\n","\r"),'',$code);
		return $setings;
	}
	
}
add_filter( 'tiny_mce_before_init', '_tinymce_init_callback' );

/* header image transform to section background */
//var_dump(get_uploaded_header_images());

function etitor_permission(){
    return is_user_logged_in();
}


include __DIR__.'/inc/background-build-css.php';