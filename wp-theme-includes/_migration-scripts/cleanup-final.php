<?php
require_once(__DIR__ . "/wp-load.php");
global $wpdb;

$deleted = 0;

// Types to fully remove (posts + postmeta)
$remove_types = array(
    'flamingo_inbound',
    'flamingo_contact',
    'nav_menu_item',
    'page',
    'comment_other',
    'price_allday',
    'price_notallday',
    'elementor_snippet',
    'elementor_font',
    'ngg_gallery',
    'maxgallery',
    'afisha_gallery',
    'display_type',
    'wpdesk-coupons',
    'days',
    'deals',
    'wpcf7_contact_form',
    'custom_css',
    'comments',
);

foreach ($remove_types as $type) {
    // Delete postmeta first
    $wpdb->query($wpdb->prepare(
        "DELETE pm FROM {$wpdb->postmeta} pm INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id WHERE p.post_type = %s",
        $type
    ));
    // Delete posts
    $count = $wpdb->query($wpdb->prepare(
        "DELETE FROM {$wpdb->posts} WHERE post_type = %s",
        $type
    ));
    if ($count > 0) {
        echo "  Deleted {$type}: {$count}\n";
        $deleted += $count;
    }
}

// Delete old shop_coupons (keep active ones)
$coup = $wpdb->query("DELETE pm FROM {$wpdb->postmeta} pm INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id WHERE p.post_type = 'shop_coupon' AND p.post_status != 'publish'");
$coup2 = $wpdb->query("DELETE FROM {$wpdb->posts} WHERE post_type = 'shop_coupon' AND post_status != 'publish'");
echo "  Deleted inactive coupons: {$coup2}\n";
$deleted += $coup2;

// Clean orphan postmeta
$wpdb->query("DELETE pm FROM {$wpdb->postmeta} pm LEFT JOIN {$wpdb->posts} p ON p.ID = pm.post_id WHERE p.ID IS NULL");
echo "  Orphan postmeta cleaned\n";

// Clean old plugin options
$patterns = array(
    'elementor%', 'jet_popup%', 'popup_maker%', 'pum_%',
    'rocket_%', 'wp_rocket%', 'seraphinite%',
    'duplicator%', 'aiowpm_%', 'maxgalleria%',
    'nextgen%', 'ngg_%', 'simple_lightbox%',
    'lightbox_photoswipe%', 'disable_comments%',
    'members_%', 'user_role_editor%', 'flamingo%',
    'wps_hide_login%', 'privacy_consent%',
    'flexible_coupons%', 'wpdesk%', 'acf_theme_code%',
);
$opts_deleted = 0;
foreach ($patterns as $p) {
    $opts_deleted += $wpdb->query($wpdb->prepare(
        "DELETE FROM {$wpdb->options} WHERE option_name LIKE %s",
        $p
    ));
}
echo "  Old plugin options deleted: {$opts_deleted}\n";

// Clean transients
$wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '%_transient_%'");
echo "  Transients cleaned\n";

// Optimize all tables
$tables = $wpdb->get_col("SHOW TABLES");
foreach ($tables as $table) {
    $wpdb->query("OPTIMIZE TABLE `$table`");
}
echo "  Optimized " . count($tables) . " tables\n";

// Summary
echo "\n=== RESULT ===\n";
echo "Total posts deleted: {$deleted}\n\n";

echo "Remaining posts:\n";
$types = $wpdb->get_results("SELECT post_type, COUNT(*) as cnt FROM {$wpdb->posts} GROUP BY post_type ORDER BY cnt DESC");
foreach ($types as $t) {
    echo "  {$t->post_type}: {$t->cnt}\n";
}

$size = $wpdb->get_var("SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) FROM information_schema.tables WHERE table_schema = DATABASE()");
echo "\nDB size: {$size} MB (was 256 MB)\n";
