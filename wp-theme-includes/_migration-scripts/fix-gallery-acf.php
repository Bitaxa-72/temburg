<?php
require_once(__DIR__ . "/wp-load.php");
global $wpdb;

// === 1. DELETE OLD ACF FIELD GROUPS (from old WP site) ===
$old_groups = array(
    'group_64919152f0cd8', // comments
    'group_648c5e1680bef', // price_abonement_allday
    'group_648f623c6766b', // price_abonement_not_allday
    'group_648f430c4bbea', // price_list
    'group_6488dae00ec82', // services
    'group_658ea272228b3', // Афиша мероприятий
    'group_648d8c11df28e', // выгодные предложения
    'group_6494d65a2bde7', // галерея видео
    'group_66c990a115e30', // Галерея фото
    'group_656edbb2f2b0a', // Изображение товара
    'group_660a935232535', // Коллективные парения
    'group_649003b031687', // комментарии
    'group_6738392b23c21', // Меню ресторана
    'group_6708c48a5289e', // Мероприятия
    'group_67ad6d3715629', // Мероприятия с фильтрацией
    'group_66f69dec158f7', // Настройки сайта (old carbon fields)
    'group_69bd19405d504', // Новости тип
    'group_648f27dd4642d', // новости фото
    'group_64901ae0294d3', // о компании
    'group_677675065999e', // Подарочные боксы
    'group_68ca4d015bca3', // Поля для вакансии
    'group_648c2939d37a2', // расписание
    'group_648f2a8ace28d', // сертификаты
    'group_6732ed8373c4f', // Слайдер сертификатов
    'group_67025cc245265', // Слайды для попапа
);

$deleted = 0;
foreach ($old_groups as $group_name) {
    // Delete field group and its fields
    $group_id = $wpdb->get_var($wpdb->prepare(
        "SELECT ID FROM {$wpdb->posts} WHERE post_type = 'acf-field-group' AND post_name = %s",
        $group_name
    ));
    if ($group_id) {
        // Delete child fields
        $wpdb->query($wpdb->prepare(
            "DELETE FROM {$wpdb->postmeta} WHERE post_id IN (SELECT ID FROM {$wpdb->posts} WHERE post_parent = %d AND post_type = 'acf-field')",
            $group_id
        ));
        $wpdb->query($wpdb->prepare(
            "DELETE FROM {$wpdb->posts} WHERE post_parent = %d AND post_type = 'acf-field'",
            $group_id
        ));
        // Delete group itself
        $wpdb->query($wpdb->prepare("DELETE FROM {$wpdb->postmeta} WHERE post_id = %d", $group_id));
        $wpdb->query($wpdb->prepare("DELETE FROM {$wpdb->posts} WHERE ID = %d", $group_id));
        $deleted++;
    }
}
echo "Deleted {$deleted} old ACF field groups\n";

// Clean orphans
$wpdb->query("DELETE pm FROM {$wpdb->postmeta} pm LEFT JOIN {$wpdb->posts} p ON p.ID = pm.post_id WHERE p.ID IS NULL");

// === 2. VERIFY GALLERY DATA ===
echo "\n=== Gallery options check ===\n";
$count = get_option("options_tb_gallery");
echo "Count: {$count}\n";
for ($i = 0; $i < min(intval($count), 3); $i++) {
    $img = get_option("options_tb_gallery_{$i}_image");
    $cap = get_option("options_tb_gallery_{$i}_caption");
    $cat = get_option("options_tb_gallery_{$i}_category");
    echo "  [{$i}] image={$img}, caption={$cap}, category={$cat}\n";
}

// === 3. CHECK GALLERY API ENDPOINT ===
// The gallery endpoint reads via termburg_read_repeater - check field names match
echo "\n=== Gallery API endpoint field names ===\n";
echo "Looking for function termburg_api_gallery in extra file...\n";
$extra = file_get_contents(ABSPATH . "wp-content/themes/termoistochnik/includes/termburg-admin-api-extra.php");
if (preg_match('/function termburg_api_gallery.*?^}/ms', $extra, $m)) {
    echo substr($m[0], 0, 500) . "\n";
} else {
    echo "NOT FOUND - need to check endpoint\n";
}

// Count remaining ACF
echo "\n=== Remaining ACF field groups ===\n";
$remaining = $wpdb->get_results("SELECT post_title, post_name FROM {$wpdb->posts} WHERE post_type = 'acf-field-group' ORDER BY post_title");
foreach ($remaining as $r) echo "  {$r->post_title}\n";

$size = $wpdb->get_var("SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) FROM information_schema.tables WHERE table_schema = DATABASE()");
echo "\nDB: {$size} MB\n";
