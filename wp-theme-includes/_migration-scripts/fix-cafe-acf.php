<?php
require_once(__DIR__ . "/wp-load.php");
require_once(ABSPATH . "wp-admin/includes/media.php");
require_once(ABSPATH . "wp-admin/includes/file.php");
require_once(ABSPATH . "wp-admin/includes/image.php");
global $wpdb;

// 1. Delete old cafe repeater data
delete_field('tb_cafe_categories', 'option');
echo "Old cafe data deleted\n";

// 2. Import the 2 menu images to media library
$images = array(
    array('images/menu/menu-0.jpg', 'Меню кафе'),
    array('images/menu/kids-0.jpg', 'Детское меню'),
);

$img_ids = array();
foreach ($images as $item) {
    $path = ABSPATH . $item[0];
    $title = $item[1];

    // Check if already imported
    $existing = $wpdb->get_var($wpdb->prepare(
        "SELECT ID FROM {$wpdb->posts} WHERE post_type = 'attachment' AND post_title = %s LIMIT 1",
        $title
    ));

    if ($existing) {
        $img_ids[] = $existing;
        echo "Already imported: {$title} (ID: {$existing})\n";
        continue;
    }

    if (!file_exists($path)) {
        echo "NOT FOUND: {$item[0]}\n";
        $img_ids[] = '';
        continue;
    }

    $filename = basename($item[0]);
    $upload = wp_upload_bits($filename, null, file_get_contents($path));
    if ($upload['error']) {
        echo "ERROR: {$upload['error']}\n";
        $img_ids[] = '';
        continue;
    }

    $filetype = wp_check_filetype($filename);
    $attach_id = wp_insert_attachment(array(
        'post_mime_type' => $filetype['type'],
        'post_title' => $title,
        'post_status' => 'inherit',
    ), $upload['file']);

    $metadata = wp_generate_attachment_metadata($attach_id, $upload['file']);
    wp_update_attachment_metadata($attach_id, $metadata);
    $img_ids[] = $attach_id;
    echo "Imported: {$title} (ID: {$attach_id})\n";
}

// 3. Save as simple image fields (not repeater)
update_field('tb_cafe_menu_image', $img_ids[0], 'option');
update_field('tb_cafe_kids_image', $img_ids[1], 'option');
echo "\nCafe images linked\n";

// Verify
echo "Menu image: " . get_field('tb_cafe_menu_image', 'option') . "\n";
echo "Kids image: " . get_field('tb_cafe_kids_image', 'option') . "\n";
