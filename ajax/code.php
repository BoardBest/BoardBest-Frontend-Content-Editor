<?php 
/* TODO https://wordpress.stackexchange.com/questions/60776/is-there-an-easy-way-to-ajax-ify-saving-of-post */
/* get ajax data */
include '../../../../wp-load.php';
$data = json_decode(base64_decode ( key($_POST)), true);
echo do_shortcode($data['shordcode']);
//echo json_encode($data);





