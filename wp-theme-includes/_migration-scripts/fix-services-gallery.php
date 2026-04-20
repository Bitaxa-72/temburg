<?php
require_once(__DIR__ . "/wp-load.php");
global $wpdb;

// === 1. FIX SERVICES IMAGES - replace paths with attachment IDs ===

// Build path -> ID map from imported attachments
$attachments = $wpdb->get_results("SELECT ID, post_title FROM {$wpdb->posts} WHERE post_type = 'attachment' AND post_status = 'inherit'");
$title_to_id = array();
foreach ($attachments as $a) {
    $title_to_id[$a->post_title] = $a->ID;
}

// Steam services image mapping
$steam_titles = array(
    0 => "Парение: Здоровая спина",
    1 => "Парение: Задняя поверхность",
    2 => "Русский пар",
    3 => "Можжевеловое парение",
    4 => "Сибирский пар",
    5 => "Алтайский дух",
    6 => "Программа Феникс",
    7 => "Деревенское парение",
    8 => "Авторское парение",
    9 => "Парение для двоих",
);

$steam_count = intval(get_option("options_tb_steam_services"));
foreach ($steam_titles as $i => $title) {
    if ($i >= $steam_count) break;
    if (isset($title_to_id[$title])) {
        update_option("options_tb_steam_services_{$i}_image", $title_to_id[$title]);
        echo "Steam [{$i}] -> ID: {$title_to_id[$title]}\n";
    }
}

// SPA services
$spa_titles = array(
    0 => "SPA: Пилинг",
    6 => "SPA: Мечты Султана",
    7 => "SPA: Тропический остров",
    8 => "SPA: Шоколадное наслаждение",
    9 => "SPA: Морская магия",
);
$spa_count = intval(get_option("options_tb_spa_services"));
foreach ($spa_titles as $i => $title) {
    if ($i >= $spa_count) break;
    if (isset($title_to_id[$title])) {
        update_option("options_tb_spa_services_{$i}_image", $title_to_id[$title]);
        echo "SPA [{$i}] -> ID: {$title_to_id[$title]}\n";
    }
}

echo "Services images linked to attachment IDs\n\n";

// === 2. FILL GALLERY ===
// Import gallery images from complex/ folder
$gallery_images = array(
    array("images/complex/gallery1.webp", "Комплекс Термбург", "общее"),
    array("images/complex/gallery2.webp", "Интерьер Термбург", "общее"),
    array("images/complex/gallery3.webp", "Зона отдыха", "общее"),
    array("images/complex/gallery4.webp", "Парная", "парные"),
    array("images/complex/gallery5.webp", "Комплекс", "общее"),
    array("images/complex/gallery6.webp", "Бассейн", "бассейны"),
    array("images/complex/gallery7.webp", "Интерьер", "общее"),
    array("images/complex/gallery8.webp", "Зона отдыха", "общее"),
    array("images/complex/gallery9.webp", "Парная зона", "парные"),
    array("images/complex/gallery10.webp", "Вход", "общее"),
    array("images/complex/gallery11.webp", "Кафе", "общее"),
    array("images/complex/gallery12.webp", "Лаунж", "общее"),
    array("images/complex/gallery13.webp", "Бассейн вечером", "бассейны"),
    array("images/complex/gallery14.webp", "Хаммам", "парные"),
    array("images/complex/pool.webp", "Большой бассейн", "бассейны"),
    array("images/complex/sauna.webp", "Русская парная", "парные"),
    array("images/complex/herbal.webp", "Травяная парная", "парные"),
    array("images/complex/barrels.webp", "Бани-бочки", "парные"),
);

require_once(ABSPATH . "wp-admin/includes/media.php");
require_once(ABSPATH . "wp-admin/includes/file.php");
require_once(ABSPATH . "wp-admin/includes/image.php");

$gallery_ids = array();

foreach ($gallery_images as $idx => $item) {
    $path = ABSPATH . $item[0];
    $title = $item[1];
    $category = $item[2];

    if (!file_exists($path)) {
        echo "SKIP: {$item[0]}\n";
        continue;
    }

    // Check if already imported
    $existing = $wpdb->get_var($wpdb->prepare(
        "SELECT ID FROM {$wpdb->posts} WHERE post_type = 'attachment' AND post_title = %s LIMIT 1",
        "Галерея: " . $title
    ));

    if ($existing) {
        $gallery_ids[] = array('id' => $existing, 'caption' => $title, 'category' => $category);
        continue;
    }

    // Import
    $filename = basename($item[0]);
    $upload = wp_upload_bits($filename, null, file_get_contents($path));
    if ($upload['error']) continue;

    $filetype = wp_check_filetype($filename);
    $attach_id = wp_insert_attachment(array(
        'post_mime_type' => $filetype['type'],
        'post_title' => "Галерея: " . $title,
        'post_content' => '',
        'post_status' => 'inherit',
    ), $upload['file']);

    if (!is_wp_error($attach_id)) {
        $metadata = wp_generate_attachment_metadata($attach_id, $upload['file']);
        wp_update_attachment_metadata($attach_id, $metadata);
        $gallery_ids[] = array('id' => $attach_id, 'caption' => $title, 'category' => $category);
        echo "Gallery: {$title} (ID: {$attach_id})\n";
    }
}

// Write gallery ACF data
$count = count($gallery_ids);
update_option("options_tb_gallery", $count);
update_option("_options_tb_gallery", "field_tb_gallery");

foreach ($gallery_ids as $i => $item) {
    update_option("options_tb_gallery_{$i}_image", $item['id']);
    update_option("_options_tb_gallery_{$i}_image", "field_gi_image");
    update_option("options_tb_gallery_{$i}_caption", $item['caption']);
    update_option("_options_tb_gallery_{$i}_caption", "field_gi_caption");
    update_option("options_tb_gallery_{$i}_category", $item['category']);
    update_option("_options_tb_gallery_{$i}_category", "field_gi_category");
}

echo "\nGallery: {$count} images added\n";

echo "\n=== VERIFY ===\n";
echo "Steam svc 0 image: " . get_option("options_tb_steam_services_0_image") . " (should be numeric ID)\n";
echo "Gallery count: " . get_option("options_tb_gallery") . "\n";
echo "Gallery 0 image: " . get_option("options_tb_gallery_0_image") . "\n";
