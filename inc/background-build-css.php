<?php


function print_backgrounds_css() {
    $counter = 0;
    $out = '<style>';
	foreach (get_uploaded_header_images() as $key => $value) {
		$counter++;
		$out .= '.background_'.$counter.'{';
		$out .= 'background-image:url(\''.$value['url'].'\');';
	 	$out .= ' } ';
	 	
	}
	$out .= '</style>';
	echo $out;
}
add_action( 'wp_footer', 'print_backgrounds_css' );