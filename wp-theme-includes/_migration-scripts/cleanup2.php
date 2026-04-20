<?php
require_once(__DIR__ . "/wp-load.php");
global $wpdb;

// Delete flamingo logs (CF7 form submissions archive)
$wpdb->query("DELETE FROM {$wpdb->postmeta} WHERE post_id IN (SELECT ID FROM {$wpdb->posts} WHERE post_type IN ('flamingo_inbound','flamingo_contact'))");
$wpdb->query("DELETE FROM {$wpdb->posts} WHERE post_type IN ('flamingo_inbound','flamingo_contact')");
echo "Flamingo cleaned\n";

// Delete unused post types
$wpdb->query("DELETE pm FROM {$wpdb->postmeta} pm INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id WHERE p.post_type IN ('elementor_snippet','elementor_font','ngg_gallery','maxgallery','afisha_gallery','display_type','wpdesk-coupons','custom_css')");
$wpdb->query("DELETE FROM {$wpdb->posts} WHERE post_type IN ('elementor_snippet','elementor_font','ngg_gallery','maxgallery','afisha_gallery','display_type','wpdesk-coupons','custom_css')");
echo "Unused post types cleaned\n";

// Delete unused shop_coupons (old coupons)
// Keep them actually - WooCommerce might need them

// Clean old options from deactivated plugins
$patterns = array(
    'elementor%', 'jet_popup%', 'popup_maker%', 'pum_%',
    'rocket_%', 'wp_rocket%', 'wpseo_sitemap%',
    'seraphinite%', 'duplicator%', 'aiowpm_%',
    'maxgalleria%', 'nextgen%', 'ngg_%',
    'simple_lightbox%', 'lightbox_photoswipe%',
    'disable_comments%', 'members_%', 'user_role%',
);
foreach ($patterns as $p) {
    $wpdb->query($wpdb->prepare("DELETE FROM {$wpdb->options} WHERE option_name LIKE %s", $p));
}
echo "Old plugin options cleaned\n";

// Optimize
$tables = $wpdb->get_col("SHOW TABLES");
foreach ($tables as $table) {
    $wpdb->query("OPTIMIZE TABLE `$table`");
}

// Summary
echo "\nPosts by type (after cleanup):\n";
$types = $wpdb->get_results("SELECT post_type, COUNT(*) as cnt FROM {$wpdb->posts} GROUP BY post_type ORDER BY cnt DESC");
foreach ($types as $t) {
    echo "  {$t->post_type}: {$t->cnt}\n";
}

$size = $wpdb->get_var("SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) FROM information_schema.tables WHERE table_schema = DATABASE()");
echo "\nDB size: {$size} MB\n";
