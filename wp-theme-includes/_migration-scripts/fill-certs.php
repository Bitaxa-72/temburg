<?php
require_once(__DIR__ . "/wp-load.php");
global $wpdb;

// Certificate categories with correct ACF field names
$certs = array(
    array("День рождения", "Подарок имениннику — сертификат на посещение Термбурга"),
    array("8 марта", "Подарок для любимых женщин — расслабление и уход"),
    array("23 февраля", "Мужской подарок — парение и контрастные процедуры"),
    array("Новый год", "Новогодний подарок — тепло и уют Термбурга"),
    array("День матери", "Лучший подарок маме — день отдыха и SPA"),
    array("День защиты детей", "Семейный отдых с детьми в Термбурге"),
    array("День Победы", "Подарок ветеранам и их семьям"),
    array("День семьи", "Семейный сертификат для совместного отдыха"),
    array("SPA", "SPA-программы и процедуры в подарок"),
);

// Image attachment IDs
$cert_images = $wpdb->get_results("SELECT ID, post_title FROM {$wpdb->posts} WHERE post_type = 'attachment' AND post_title LIKE 'Сертификат%'");
$img_map = array();
foreach ($cert_images as $ci) {
    $img_map[$ci->post_title] = $ci->ID;
}

$img_titles = array(
    "Сертификат День рождения",
    "Сертификат 8 марта",
    "Сертификат 23 февраля",
    "Сертификат Новый год",
    "Сертификат День матери",
    "Сертификат День защиты детей",
    "Сертификат День Победы",
    "Сертификат День семьи",
    "Сертификат SPA",
);

// Write using update_field (ACF native)
$rows = array();
foreach ($certs as $i => $c) {
    $img_id = isset($img_map[$img_titles[$i]]) ? $img_map[$img_titles[$i]] : '';
    $rows[] = array(
        'name' => $c[0],
        'image' => $img_id,
        'description' => $c[1],
    );
}

$result = update_field('tb_certificate_categories', $rows, 'option');
echo "update_field result: " . ($result ? "OK" : "FAIL") . "\n";

// Verify
$check = get_field('tb_certificate_categories', 'option');
echo "Certificates count: " . (is_array($check) ? count($check) : 0) . "\n";
if (is_array($check) && count($check) > 0) {
    echo "First: " . $check[0]['name'] . " | image: " . $check[0]['image'] . "\n";
}

// Also check services are visible
$steam = get_field('tb_steam_services', 'option');
echo "\nSteam services: " . (is_array($steam) ? count($steam) : 0) . "\n";

$zones = get_field('tb_zones', 'option');
echo "Zones: " . (is_array($zones) ? count($zones) : 0) . "\n";

$termliny = get_field('tb_termliny', 'option');
echo "Termliny: " . (is_array($termliny) ? count($termliny) : 0) . "\n";

$gallery = get_field('tb_gallery', 'option');
echo "Gallery: " . (is_array($gallery) ? count($gallery) : 0) . "\n";

$rules = get_field('tb_rules_categories', 'option');
echo "Rules: " . (is_array($rules) ? count($rules) : 0) . "\n";

$promos = get_field('tb_promotions', 'option');
echo "Promotions: " . (is_array($promos) ? count($promos) : 0) . "\n";
