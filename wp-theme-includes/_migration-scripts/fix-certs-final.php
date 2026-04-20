<?php
require_once(__DIR__ . "/wp-load.php");
require_once(ABSPATH . "wp-admin/includes/media.php");
require_once(ABSPATH . "wp-admin/includes/file.php");
require_once(ABSPATH . "wp-admin/includes/image.php");
global $wpdb;

// Delete old certificate attachments
$wpdb->query("DELETE pm FROM {$wpdb->postmeta} pm INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id WHERE p.post_type = 'attachment' AND p.post_title LIKE 'Сертификат%'");
$wpdb->query("DELETE FROM {$wpdb->posts} WHERE post_type = 'attachment' AND post_title LIKE 'Сертификат%'");
echo "Old cert attachments deleted\n";

// Import each certificate image with UNIQUE name
$certs = array(
    array("День рождения", "images/certificates/termliny/birthday/group.jpg", "cert-birthday"),
    array("8 марта", "images/certificates/termliny/womensday/group.jpg", "cert-womensday"),
    array("23 февраля", "images/certificates/termliny/mensday/group.jpg", "cert-mensday"),
    array("Новый год", "images/certificates/termliny/newyear/group.png", "cert-newyear"),
    array("День матери", "images/certificates/termliny/motherday/group.png", "cert-motherday"),
    array("День защиты детей", "images/certificates/termliny/childday/group.png", "cert-childday"),
    array("День Победы", "images/certificates/termliny/victoryday/group.jpg", "cert-victoryday"),
    array("День семьи", "images/certificates/termliny/familyday/group.png", "cert-familyday"),
    array("SPA", "images/certificates/termliny/spa/group.jpg", "cert-spa"),
);

$rows = array();
foreach ($certs as $c) {
    $path = ABSPATH . $c[1];
    $title = "Серт: " . $c[0];
    $unique_name = $c[2];

    if (!file_exists($path)) {
        echo "NOT FOUND: {$c[1]}\n";
        $rows[] = array('name' => $c[0], 'image' => '', 'description' => '');
        continue;
    }

    // Use unique filename
    $ext = pathinfo($c[1], PATHINFO_EXTENSION);
    $upload = wp_upload_bits("{$unique_name}.{$ext}", null, file_get_contents($path));
    if ($upload['error']) {
        echo "ERROR: {$upload['error']}\n";
        $rows[] = array('name' => $c[0], 'image' => '', 'description' => '');
        continue;
    }

    $filetype = wp_check_filetype("{$unique_name}.{$ext}");
    $attach_id = wp_insert_attachment(array(
        'post_mime_type' => $filetype['type'],
        'post_title' => $title,
        'post_status' => 'inherit',
    ), $upload['file']);

    $metadata = wp_generate_attachment_metadata($attach_id, $upload['file']);
    wp_update_attachment_metadata($attach_id, $metadata);

    $rows[] = array(
        'name' => $c[0],
        'image' => $attach_id,
        'description' => "Подарочный сертификат — {$c[0]}",
    );
    echo "OK: {$c[0]} -> ID:{$attach_id}\n";
}

// Save via update_field
update_field('tb_certificate_categories', $rows, 'option');

// Verify
$check = get_field('tb_certificate_categories', 'option');
echo "\nSaved: " . count($check) . " certificates\n";
foreach ($check as $i => $c) {
    $img = is_array($c['image']) ? $c['image']['url'] : (is_numeric($c['image']) ? wp_get_attachment_url($c['image']) : $c['image']);
    echo "  [{$i}] {$c['name']} -> {$img}\n";
}
