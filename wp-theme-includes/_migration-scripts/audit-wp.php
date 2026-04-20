<?php
require_once(__DIR__ . "/wp-load.php");
global $wpdb;

echo "=== DRAFTS, TRASH, AUTO-DRAFTS ===\n";
$drafts = $wpdb->get_results("SELECT post_type, post_status, COUNT(*) as cnt FROM {$wpdb->posts} WHERE post_status NOT IN ('publish','inherit') GROUP BY post_type, post_status ORDER BY cnt DESC");
foreach ($drafts as $d) {
    echo "  {$d->post_type} [{$d->post_status}]: {$d->cnt}\n";
}

echo "\n=== OLD CONTENT (before 2026) ===\n";
$old = $wpdb->get_results("SELECT post_type, COUNT(*) as cnt FROM {$wpdb->posts} WHERE post_status = 'publish' AND post_date < '2026-01-01' AND post_type NOT IN ('product','product_variation','shop_order','shop_coupon','shop_order_refund','attachment','acf-field','acf-field-group','acf-post-type','acf-taxonomy','acf-ui-options-page') GROUP BY post_type ORDER BY cnt DESC");
foreach ($old as $o) {
    echo "  {$o->post_type}: {$o->cnt} posts before 2026\n";
}

echo "\n=== ALL PUBLISHED BY TYPE ===\n";
$all = $wpdb->get_results("SELECT post_type, COUNT(*) as cnt FROM {$wpdb->posts} WHERE post_status = 'publish' GROUP BY post_type ORDER BY cnt DESC");
foreach ($all as $a) {
    echo "  {$a->post_type}: {$a->cnt}\n";
}

echo "\n=== WHAT FRONTEND STILL READS FROM LOCAL FILES ===\n";
echo "  - Hero section title/subtitle (hardcoded in HeroSection.tsx)\n";
echo "  - About page full text (hardcoded in AboutPage.tsx)\n";
echo "  - Rules page text (hardcoded in RulesPage.tsx)\n";
echo "  - Privacy page text (hardcoded in PrivacyPage.tsx)\n";
echo "  - Offer page text (hardcoded in OfferPage.tsx)\n";
echo "  - Corporate page text (hardcoded in CorporatePage.tsx)\n";
echo "  - Family page text (hardcoded in FamilyPage.tsx)\n";
echo "  - Steam School page text (hardcoded in SteamSchoolPage.tsx)\n";
echo "  - Swimming School page text (hardcoded in SwimmingSchoolPage.tsx)\n";
echo "  - Thermal zones data (hardcoded in thermalZones.ts, zoneCategories.ts)\n";
echo "  - Services list (hardcoded in services.ts)\n";
echo "  - Employees data (hardcoded in employees.ts)\n";
echo "  - Search data (hardcoded in searchData.ts)\n";
echo "  - Map coordinates (hardcoded in IsometricMap.tsx)\n";
echo "  NOTE: These rarely change - text pages are static content.\n";
echo "  Moving them to WP would add complexity without much benefit.\n";

echo "\n=== UNUSED WP OPTIONS (old plugins) ===\n";
$old_opts = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->options} WHERE option_name LIKE 'widget_%' OR option_name LIKE 'theme_mods_%' OR option_name LIKE 'customize_%' OR option_name LIKE 'nav_menu%'");
echo "  {$old_opts} old widget/theme/menu options\n";
