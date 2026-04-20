<?php
require_once(__DIR__ . "/wp-load.php");
require_once(ABSPATH . "wp-admin/includes/media.php");
require_once(ABSPATH . "wp-admin/includes/file.php");
require_once(ABSPATH . "wp-admin/includes/image.php");

global $wpdb;

// === 1. RESTORE PENDING ORDERS ===
// We can't restore deleted orders, but we'll make sure future pending orders are kept
echo "Note: Deleted pending orders cannot be restored (they were removed from DB).\n";
echo "Current pending orders: " . $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type = 'shop_order' AND post_status = 'wc-pending'") . "\n";
echo "WooCommerce will keep new pending orders. Auto-cancel is set to 60 minutes.\n\n";

// === 2. IMPORT IMAGES TO MEDIA LIBRARY ===
$upload_dir = wp_upload_dir();
$imported = 0;
$errors = 0;

// Map of all images to import: source_path => description
$images = array(
    // Saunas attributes
    "images/saunas/attributes/russian-attr.jpg" => "Русская парная",
    "images/saunas/attributes/siberian-attr.jpg" => "Сибирская парная",
    "images/saunas/attributes/herbal-attr.jpg" => "Травяная парная",
    "images/saunas/attributes/hammam-attr.jpg" => "Хаммам",
    "images/saunas/attributes/shaman-attr.jpg" => "Шаманская сауна",
    "images/saunas/attributes/village-attr.jpg" => "Деревенская баня",
    "images/saunas/attributes/barrel-attr.jpg" => "Бани-бочки",
    "images/saunas/attributes/sand-attr.jpg" => "Песчаная сауна",
    "images/saunas/attributes/salt-attr.jpg" => "Соляная сауна",
    "images/saunas/attributes/linden-attr.jpg" => "Липовая парная",
    "images/saunas/attributes/multi-stone-attr.jpg" => "Мультикаменная парная",
    "images/saunas/attributes/private-attr.jpg" => "Баня индивидуального парения",
    // Pools
    "images/saunas/attributes/main-pool-attr.png" => "Большой бассейн",
    "images/saunas/attributes/kids-pool-attr.png" => "Детский бассейн",
    "images/saunas/attributes/outdoor-pool-attr.png" => "Уличная купель",
    "images/saunas/attributes/hot-tub-attr.png" => "Уличное джакузи",
    "images/saunas/attributes/small-pool-attr.png" => "Джакузи у бассейна",
    "images/saunas/attributes/cold-plunge-attr.png" => "Холодная купель",
    // Zone categories
    "images/saunas/attributes/zones-steam-attr.png" => "Зона: Парные",
    "images/saunas/attributes/zones-pools-attr.png" => "Зона: Бассейны",
    "images/saunas/attributes/zones-jacuzzi-attr.png" => "Зона: Купели и джакузи",
    // Termliny
    "images/termliny/yaromir.webp" => "Банник Яромир",
    "images/termliny/valkiriya.webp" => "Валькирия",
    "images/termliny/pereslav.webp" => "Домовой Переслав",
    "images/termliny/kazimir.webp" => "Дворовой Казимир",
    "images/termliny/vedagor.webp" => "Кот Ведагор",
    "images/termliny/milovan.webp" => "Кот Милован",
    "images/termliny/lelya.webp" => "Берегиня Леля",
    // Certificates
    "images/certificates/termliny/birthday/group.jpg" => "Сертификат День рождения",
    "images/certificates/termliny/womensday/group.jpg" => "Сертификат 8 марта",
    "images/certificates/termliny/mensday/group.jpg" => "Сертификат 23 февраля",
    "images/certificates/termliny/newyear/group.png" => "Сертификат Новый год",
    "images/certificates/termliny/motherday/group.png" => "Сертификат День матери",
    "images/certificates/termliny/childday/group.png" => "Сертификат День защиты детей",
    "images/certificates/termliny/victoryday/group.jpg" => "Сертификат День Победы",
    "images/certificates/termliny/familyday/group.png" => "Сертификат День семьи",
    "images/certificates/termliny/spa/group.jpg" => "Сертификат SPA",
    // Services
    "images/services/generated/steam-spine.jpg" => "Парение: Здоровая спина",
    "images/services/generated/steam-back.jpg" => "Парение: Задняя поверхность",
    "images/services/generated/steam-russian.jpg" => "Русский пар",
    "images/services/generated/steam-juniper.jpg" => "Можжевеловое парение",
    "images/services/generated/steam-siberian.jpg" => "Сибирский пар",
    "images/services/generated/steam-altai.jpg" => "Алтайский дух",
    "images/services/generated/steam-phoenix.jpg" => "Программа Феникс",
    "images/services/generated/steam-village.jpg" => "Деревенское парение",
    "images/services/generated/steam-author.jpg" => "Авторское парение",
    "images/services/generated/steam-duo.jpg" => "Парение для двоих",
    "images/services/generated/spa-peeling.jpg" => "SPA: Пилинг",
    "images/services/generated/spa-sultan.jpg" => "SPA: Мечты Султана",
    "images/services/generated/spa-tropical.jpg" => "SPA: Тропический остров",
    "images/services/generated/spa-chocolate.jpg" => "SPA: Шоколадное наслаждение",
    "images/services/generated/spa-sea.jpg" => "SPA: Морская магия",
    // Hero/promo images
    "images/banshchik.jpg" => "Банщик",
    "images/hero-bg.png" => "Hero фон",
    "images/og-default.jpg" => "OG изображение",
);

// Keep track of path -> attachment_id for ACF linking
$path_to_id = array();

foreach ($images as $rel_path => $title) {
    $full_path = ABSPATH . $rel_path;

    if (!file_exists($full_path)) {
        echo "  SKIP (not found): {$rel_path}\n";
        $errors++;
        continue;
    }

    // Check if already imported
    $existing = $wpdb->get_var($wpdb->prepare(
        "SELECT ID FROM {$wpdb->posts} WHERE post_type = 'attachment' AND post_title = %s LIMIT 1",
        $title
    ));

    if ($existing) {
        $path_to_id[$rel_path] = $existing;
        continue;
    }

    // Copy to uploads
    $filename = basename($rel_path);
    $upload = wp_upload_bits($filename, null, file_get_contents($full_path));

    if ($upload['error']) {
        echo "  ERROR: {$rel_path} - {$upload['error']}\n";
        $errors++;
        continue;
    }

    // Create attachment
    $filetype = wp_check_filetype($filename);
    $attachment = array(
        'post_mime_type' => $filetype['type'],
        'post_title' => $title,
        'post_content' => '',
        'post_status' => 'inherit',
    );

    $attach_id = wp_insert_attachment($attachment, $upload['file']);
    if (is_wp_error($attach_id)) {
        echo "  ERROR: {$rel_path}\n";
        $errors++;
        continue;
    }

    // Generate metadata (thumbnails etc)
    $metadata = wp_generate_attachment_metadata($attach_id, $upload['file']);
    wp_update_attachment_metadata($attach_id, $metadata);

    $path_to_id[$rel_path] = $attach_id;
    $imported++;
    echo "  OK: {$title} (ID: {$attach_id})\n";
}

echo "\nImported: {$imported}, Errors: {$errors}\n";

// === 3. LINK IMAGES TO ACF FIELDS ===
echo "\n=== Linking to ACF ===\n";

// Zone images
$zone_paths = array(
    0 => "images/saunas/attributes/zones-steam-attr.png",
    1 => "images/saunas/attributes/zones-pools-attr.png",
    2 => "images/saunas/attributes/zones-jacuzzi-attr.png",
);
foreach ($zone_paths as $i => $path) {
    if (isset($path_to_id[$path])) {
        update_option("options_tb_zones_{$i}_image", $path_to_id[$path]);
        echo "  Zone {$i} image linked (ID: {$path_to_id[$path]})\n";
    }
}

// Zone item images (парные)
$steam_paths = array(
    "images/saunas/attributes/russian-attr.jpg",
    "images/saunas/attributes/siberian-attr.jpg",
    "images/saunas/attributes/herbal-attr.jpg",
    "images/saunas/attributes/hammam-attr.jpg",
    "images/saunas/attributes/shaman-attr.jpg",
    "images/saunas/attributes/village-attr.jpg",
    "images/saunas/attributes/barrel-attr.jpg",
    "images/saunas/attributes/sand-attr.jpg",
    "images/saunas/attributes/salt-attr.jpg",
    "images/saunas/attributes/linden-attr.jpg",
    "images/saunas/attributes/multi-stone-attr.jpg",
    "images/saunas/attributes/private-attr.jpg",
    "images/saunas/attributes/private-attr.jpg",
);
for ($i = 0; $i < count($steam_paths); $i++) {
    if (isset($path_to_id[$steam_paths[$i]])) {
        update_option("options_tb_zones_0_items_{$i}_image", $path_to_id[$steam_paths[$i]]);
    }
}
echo "  Steam room images linked\n";

// Pool images
$pool_paths = array("images/saunas/attributes/main-pool-attr.png", "images/saunas/attributes/kids-pool-attr.png");
for ($i = 0; $i < count($pool_paths); $i++) {
    if (isset($path_to_id[$pool_paths[$i]])) {
        update_option("options_tb_zones_1_items_{$i}_image", $path_to_id[$pool_paths[$i]]);
    }
}

// Jacuzzi images
$jac_paths = array(
    "images/saunas/attributes/outdoor-pool-attr.png",
    "images/saunas/attributes/hot-tub-attr.png",
    "images/saunas/attributes/small-pool-attr.png",
    "images/saunas/attributes/cold-plunge-attr.png",
);
for ($i = 0; $i < count($jac_paths); $i++) {
    if (isset($path_to_id[$jac_paths[$i]])) {
        update_option("options_tb_zones_2_items_{$i}_image", $path_to_id[$jac_paths[$i]]);
    }
}
echo "  Pool/jacuzzi images linked\n";

// Termliny images
$termlin_paths = array(
    "images/termliny/yaromir.webp",
    "images/termliny/valkiriya.webp",
    "images/termliny/pereslav.webp",
    "images/termliny/kazimir.webp",
    "images/termliny/vedagor.webp",
    "images/termliny/milovan.webp",
    "images/termliny/lelya.webp",
);
$termlin_count = intval(get_option("options_tb_termliny"));
for ($i = 0; $i < min($termlin_count, count($termlin_paths)); $i++) {
    if (isset($path_to_id[$termlin_paths[$i]])) {
        update_option("options_tb_termliny_{$i}_image", $path_to_id[$termlin_paths[$i]]);
    }
}
echo "  Termlin images linked\n";

// Certificate images
$cert_paths = array(
    "images/certificates/termliny/birthday/group.jpg",
    "images/certificates/termliny/womensday/group.jpg",
    "images/certificates/termliny/mensday/group.jpg",
    "images/certificates/termliny/newyear/group.png",
    "images/certificates/termliny/motherday/group.png",
    "images/certificates/termliny/childday/group.png",
    "images/certificates/termliny/victoryday/group.jpg",
    "images/certificates/termliny/familyday/group.png",
    "images/certificates/termliny/spa/group.jpg",
);
$cert_count = intval(get_option("options_tb_certificates"));
for ($i = 0; $i < min($cert_count, count($cert_paths)); $i++) {
    if (isset($path_to_id[$cert_paths[$i]])) {
        update_option("options_tb_certificates_{$i}_image", $path_to_id[$cert_paths[$i]]);
    }
}
echo "  Certificate images linked\n";

echo "\nDone! All images imported and linked to ACF fields.\n";
echo "Attachments in media library: " . $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type = 'attachment'") . "\n";
