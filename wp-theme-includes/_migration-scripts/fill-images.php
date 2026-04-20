<?php
require_once(__DIR__ . "/wp-load.php");

function set_opt($key, $val, $field_key = null) {
    update_option("options_" . $key, $val);
    if ($field_key) update_option("_options_" . $key, $field_key);
}

// === ZONES IMAGES ===
// Zone category images
$zone_images = array(
    0 => "/images/saunas/attributes/zones-steam-attr.png",   // Парные
    1 => "/images/saunas/attributes/zones-pools-attr.png",   // Бассейны
    2 => "/images/saunas/attributes/zones-jacuzzi-attr.png", // Купели
);
foreach ($zone_images as $i => $img) {
    set_opt("tb_zones_{$i}_image", $img);
}

// Zone item images (парные)
$steam_images = array(
    "russian-attr.jpg", "siberian-attr.jpg", "herbal-attr.jpg",
    "hammam-attr.jpg", "shaman-attr.jpg", "village-attr.jpg",
    "barrel-attr.jpg", "sand-attr.jpg", "salt-attr.jpg",
    "linden-attr.jpg", "multi-stone-attr.jpg",
    "private-attr.jpg", "private-attr.jpg",
);
for ($i = 0; $i < count($steam_images); $i++) {
    set_opt("tb_zones_0_items_{$i}_image", "/images/saunas/attributes/" . $steam_images[$i]);
}

// Pool images
$pool_images = array(
    "main-pool-attr.png", "kids-pool-attr.png",
);
for ($i = 0; $i < count($pool_images); $i++) {
    set_opt("tb_zones_1_items_{$i}_image", "/images/saunas/attributes/" . $pool_images[$i]);
}

// Jacuzzi images
$jacuzzi_images = array(
    "outdoor-pool-attr.png", "hot-tub-attr.png",
    "small-pool-attr.png", "cold-plunge-attr.png",
);
for ($i = 0; $i < count($jacuzzi_images); $i++) {
    set_opt("tb_zones_2_items_{$i}_image", "/images/saunas/attributes/" . $jacuzzi_images[$i]);
}
echo "Zone images set\n";

// === SERVICES IMAGES ===
$steam_svc_images = array(
    "/images/services/generated/steam-spine.jpg",
    "/images/services/generated/steam-back.jpg",
    "/images/services/generated/steam-russian.jpg",
    "/images/services/generated/steam-juniper.jpg",
    "/images/services/generated/steam-siberian.jpg",
    "/images/services/generated/steam-altai.jpg",
    "/images/services/generated/steam-phoenix.jpg",
    "/images/services/generated/steam-village.jpg",
    "/images/services/generated/steam-author.jpg",
    "/images/services/generated/steam-duo.jpg",
    "/images/services/generated/steam-massage-1.jpg",
    "/images/services/generated/steam-massage-2.jpg",
    "/images/services/generated/steam-collective-1.jpg",
    "/images/services/generated/steam-collective-2.jpg",
);
$count = intval(get_option("options_tb_steam_services"));
for ($i = 0; $i < min($count, count($steam_svc_images)); $i++) {
    set_opt("tb_steam_services_{$i}_image", $steam_svc_images[$i]);
}

$spa_images = array(
    "/images/services/generated/spa-peeling.jpg",
    "/images/services/generated/spa-kids.jpg",
    "/images/services/generated/spa-neck.jpg",
    "/images/services/generated/spa-back-massage.jpg",
    "/images/services/generated/spa-legs.jpg",
    "/images/services/generated/spa-head.jpg",
    "/images/services/generated/spa-sultan.jpg",
    "/images/services/generated/spa-tropical.jpg",
    "/images/services/generated/spa-chocolate.jpg",
    "/images/services/generated/spa-sea.jpg",
    "/images/services/generated/spa-aroma-oil-1.jpg",
    "/images/services/generated/spa-aroma-oil-2.jpg",
    "/images/services/generated/spa-fish-1.jpg",
    "/images/services/generated/spa-fish-2.jpg",
);
$count = intval(get_option("options_tb_spa_services"));
for ($i = 0; $i < min($count, count($spa_images)); $i++) {
    set_opt("tb_spa_services_{$i}_image", $spa_images[$i]);
}
echo "Service images set\n";

// === CERTIFICATE IMAGES ===
$cert_images = array(
    "/images/certificates/termliny/birthday/group.jpg",
    "/images/certificates/termliny/womensday/group.jpg",
    "/images/certificates/termliny/mensday/group.jpg",
    "/images/certificates/termliny/newyear/group.png",
    "/images/certificates/termliny/motherday/group.png",
    "/images/certificates/termliny/childday/group.png",
    "/images/certificates/termliny/victoryday/group.jpg",
    "/images/certificates/termliny/familyday/group.png",
    "/images/certificates/termliny/spa/group.jpg",
);
$count = intval(get_option("options_tb_certificates"));
for ($i = 0; $i < min($count, count($cert_images)); $i++) {
    set_opt("tb_certificates_{$i}_image", $cert_images[$i]);
}
echo "Certificate images set\n";

// === TERMLIN IMAGES ===
$termlin_images = array(
    "/images/termliny/yaromir.webp",
    "/images/termliny/valkiriya.webp",
    "/images/termliny/pereslav.webp",
    "/images/termliny/kazimir.webp",
    "/images/termliny/vedagor.webp",
    "/images/termliny/milovan.webp",
    "/images/termliny/lelya.webp",
);
$count = intval(get_option("options_tb_termliny"));
for ($i = 0; $i < min($count, count($termlin_images)); $i++) {
    set_opt("tb_termliny_{$i}_image", $termlin_images[$i]);
    set_opt("tb_termliny_{$i}_image_path", $termlin_images[$i]);
}
echo "Termlin images set\n";

// === PROMOTION IMAGES ===
$promo_images = array(
    "/wp-content/uploads/2025/08/termburg_banner_kofe_560h400.jpg",
    "/wp-content/uploads/2025/04/termburg_banner_studenty_skidka_560h400.jpg",
    "/wp-content/uploads/2025/01/termburg_banner_den_rozhdeniya_560h400.jpg",
    "/wp-content/uploads/2024/09/560h400_2.jpg",
    "/wp-content/uploads/2025/05/joga_560h400.jpg",
    "/wp-content/uploads/2025/08/termburg_banner_plavanie_560h400-1.jpg",
    "/wp-content/uploads/2025/01/termburg_banner_den_rozhdeniya_560h400.jpg",
    "/wp-content/uploads/2025/08/termburg_banner_plavanie_560h400-1.jpg",
);
$count = intval(get_option("options_tb_promotions"));
for ($i = 0; $i < min($count, count($promo_images)); $i++) {
    set_opt("tb_promotions_{$i}_banner_url", $promo_images[$i]);
    set_opt("tb_promotions_{$i}_image", $promo_images[$i]);
}
echo "Promotion images set\n";

echo "\nAll images set in WP!\n";

// Verify
echo "\n=== VERIFY ===\n";
echo "Zone 0 image: " . get_option("options_tb_zones_0_image") . "\n";
echo "Steam svc 0 image: " . get_option("options_tb_steam_services_0_image") . "\n";
echo "Cert 0 image: " . get_option("options_tb_certificates_0_image") . "\n";
echo "Termlin 0 image: " . get_option("options_tb_termliny_0_image") . "\n";
echo "Promo 0 image: " . get_option("options_tb_promotions_0_image") . "\n";
