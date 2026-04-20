<?php
require_once(__DIR__ . "/wp-load.php");
global $wpdb;

$deleted = 0;

// 1. Delete all drafts (news, services, gallery, otzav, vacancy, certificates, price_list, timetable)
$draft_types = array('news','services','gallery_foto','gallery_video','otzav','vacancy','certificates','price_list','timetable','post');
foreach ($draft_types as $type) {
    // Delete postmeta
    $wpdb->query($wpdb->prepare(
        "DELETE pm FROM {$wpdb->postmeta} pm INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id WHERE p.post_type = %s AND p.post_status IN ('draft','auto-draft','trash','pending')",
        $type
    ));
    // Delete posts
    $count = $wpdb->query($wpdb->prepare(
        "DELETE FROM {$wpdb->posts} WHERE post_type = %s AND post_status IN ('draft','auto-draft','trash','pending')",
        $type
    ));
    if ($count > 0) {
        echo "Deleted {$count} drafts of {$type}\n";
        $deleted += $count;
    }
}

// 2. Delete mailpoet_page (not used)
$wpdb->query("DELETE pm FROM {$wpdb->postmeta} pm INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id WHERE p.post_type = 'mailpoet_page'");
$count = $wpdb->query("DELETE FROM {$wpdb->posts} WHERE post_type = 'mailpoet_page'");
echo "Deleted {$count} mailpoet pages\n";
$deleted += $count;

// 3. Clean old widget/theme/menu options
$wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE 'widget_%'");
$wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE 'theme_mods_%'");
$wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE 'customize_%'");
$wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE 'nav_menu%'");
echo "Old widget/theme/menu options cleaned\n";

// 4. Clean orphan postmeta
$orphans = $wpdb->query("DELETE pm FROM {$wpdb->postmeta} pm LEFT JOIN {$wpdb->posts} p ON p.ID = pm.post_id WHERE p.ID IS NULL");
echo "Orphan postmeta cleaned: {$orphans}\n";

// 5. Clean transients
$wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '%_transient_%'");
echo "Transients cleaned\n";

// 6. Optimize
$tables = $wpdb->get_col("SHOW TABLES");
foreach ($tables as $t) $wpdb->query("OPTIMIZE TABLE `$t`");
echo "Tables optimized\n";

echo "\nTotal deleted: {$deleted}\n";

// Final summary
echo "\n=== FINAL STATE ===\n";
$all = $wpdb->get_results("SELECT post_type, post_status, COUNT(*) as cnt FROM {$wpdb->posts} GROUP BY post_type, post_status ORDER BY post_type, cnt DESC");
$current_type = '';
foreach ($all as $a) {
    if ($a->post_type !== $current_type) {
        $current_type = $a->post_type;
        echo "\n  {$a->post_type}:\n";
    }
    echo "    [{$a->post_status}] {$a->cnt}\n";
}

$size = $wpdb->get_var("SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) FROM information_schema.tables WHERE table_schema = DATABASE()");
echo "\nDB size: {$size} MB\n";
