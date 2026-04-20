<?php
require_once(__DIR__ . "/wp-load.php");
global $wpdb;

// Get gallery attachment IDs
$attachments = $wpdb->get_results("SELECT ID, post_title FROM {$wpdb->posts} WHERE post_type = 'attachment' AND post_title LIKE 'Галерея:%'");
$gallery = array();
foreach ($attachments as $a) {
    $title = str_replace('Галерея: ', '', $a->post_title);
    // Determine category
    $cat = 'общее';
    if (stripos($title, 'бассейн') !== false || stripos($title, 'pool') !== false) $cat = 'бассейны';
    if (stripos($title, 'парн') !== false || stripos($title, 'хаммам') !== false || stripos($title, 'сауна') !== false || stripos($title, 'бочк') !== false) $cat = 'парные';

    $gallery[] = array(
        'image' => $a->ID,
        'caption' => $title,
        'category' => $cat,
    );
}

echo "Gallery items found: " . count($gallery) . "\n";

// Get ACF field name for gallery
$groups = acf_get_fields('group_tb_gallery');
foreach ($groups as $f) {
    echo "Field: {$f['name']} | key: {$f['key']} | type: {$f['type']}\n";
    if ($f['type'] === 'repeater' && isset($f['sub_fields'])) {
        foreach ($f['sub_fields'] as $sf) {
            echo "  Sub: {$sf['name']} | key: {$sf['key']}\n";
        }
    }
}

// Write gallery using correct field name
if (count($gallery) > 0) {
    $field_name = $groups[0]['name']; // tb_gallery or whatever
    $result = update_field($field_name, $gallery, 'option');
    echo "\nupdate_field('{$field_name}'): " . ($result ? "OK" : "FAIL") . "\n";

    // Verify
    $check = get_field($field_name, 'option');
    echo "Gallery check: " . (is_array($check) ? count($check) : 0) . " items\n";
}
