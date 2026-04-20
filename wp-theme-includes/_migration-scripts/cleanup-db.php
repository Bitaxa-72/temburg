<?php
require_once(__DIR__ . "/wp-load.php");
global $wpdb;

// Delete Elementor/popup data
$wpdb->query("DELETE FROM {$wpdb->postmeta} WHERE meta_key LIKE '%elementor%'");
$wpdb->query("DELETE FROM {$wpdb->posts} WHERE post_type IN ('elementor_library','jet-popup','popup','popup_theme','pum_cta','e-floating-buttons')");
echo "Elementor/popup cleaned\n";

// Delete revisions
$wpdb->query("DELETE FROM {$wpdb->posts} WHERE post_type = 'revision'");
echo "Revisions cleaned\n";

// Delete transients
$wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '%_transient_%'");
echo "Transients cleaned\n";

// Delete orphan postmeta
$wpdb->query("DELETE pm FROM {$wpdb->postmeta} pm LEFT JOIN {$wpdb->posts} p ON p.ID = pm.post_id WHERE p.ID IS NULL");
echo "Orphan meta cleaned\n";

// Delete spam comments
$wpdb->query("DELETE FROM {$wpdb->comments} WHERE comment_approved IN ('spam','trash')");
echo "Spam cleaned\n";

// Delete old WP pages (not needed for new site)
$wpdb->query("DELETE FROM {$wpdb->posts} WHERE post_type = 'page' AND post_status != 'publish'");
echo "Draft pages cleaned\n";

// Optimize
$tables = $wpdb->get_col("SHOW TABLES");
foreach ($tables as $table) {
    $wpdb->query("OPTIMIZE TABLE `$table`");
}
echo "Optimized " . count($tables) . " tables\n";

// Summary
echo "\nPosts by type:\n";
$types = $wpdb->get_results("SELECT post_type, COUNT(*) as cnt FROM {$wpdb->posts} GROUP BY post_type ORDER BY cnt DESC");
foreach ($types as $t) {
    echo "  {$t->post_type}: {$t->cnt}\n";
}

echo "\nDB size: ";
$size = $wpdb->get_var("SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) FROM information_schema.tables WHERE table_schema = DATABASE()");
echo "{$size} MB\n";
