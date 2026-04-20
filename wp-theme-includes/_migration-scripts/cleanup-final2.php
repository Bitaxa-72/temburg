<?php
require_once(__DIR__ . "/wp-load.php");
global $wpdb;

// 1. Clean action scheduler logs
$wpdb->query("TRUNCATE TABLE {$wpdb->prefix}actionscheduler_actions");
$wpdb->query("TRUNCATE TABLE {$wpdb->prefix}actionscheduler_logs");
$wpdb->query("TRUNCATE TABLE {$wpdb->prefix}actionscheduler_claims");
echo "Action scheduler cleaned\n";

// 2. Clean WP Mail SMTP logs
$wpdb->query("TRUNCATE TABLE {$wpdb->prefix}wpmailsmtp_emails_log");
echo "Mail SMTP logs cleaned\n";

// 3. Clean MailPoet tables
$mp_tables = $wpdb->get_col("SHOW TABLES LIKE '{$wpdb->prefix}mailpoet_%'");
foreach ($mp_tables as $table) {
    $wpdb->query("TRUNCATE TABLE `$table`");
}
echo "MailPoet tables cleaned: " . count($mp_tables) . "\n";

// 4. Clean Wordfence hits
$wpdb->query("TRUNCATE TABLE {$wpdb->prefix}wfhits");
echo "Wordfence hits cleaned\n";

// 5. Delete auto-draft posts
$wpdb->query("DELETE FROM {$wpdb->posts} WHERE post_status = 'auto-draft'");
echo "Auto-drafts deleted\n";

// 6. Delete old pending orders (more than 7 days old)
$old_pending = $wpdb->query("DELETE FROM {$wpdb->posts} WHERE post_type = 'shop_order' AND post_status = 'wc-pending' AND post_date < DATE_SUB(NOW(), INTERVAL 7 DAY)");
echo "Old pending orders deleted: {$old_pending}\n";

// 7. Delete cancelled orders
$wpdb->query("DELETE pm FROM {$wpdb->postmeta} pm INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id WHERE p.post_type = 'shop_order' AND p.post_status = 'wc-cancelled'");
$cancelled = $wpdb->query("DELETE FROM {$wpdb->posts} WHERE post_type = 'shop_order' AND post_status = 'wc-cancelled'");
echo "Cancelled orders deleted: {$cancelled}\n";

// 8. Clean transients
$wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '%_transient_%'");
echo "Transients cleaned\n";

// 9. Clean orphan postmeta
$orphans = $wpdb->query("DELETE pm FROM {$wpdb->postmeta} pm LEFT JOIN {$wpdb->posts} p ON p.ID = pm.post_id WHERE p.ID IS NULL");
echo "Orphan postmeta: {$orphans}\n";

// 10. Clean orphan usermeta for deleted users
$orphan_um = $wpdb->query("DELETE um FROM {$wpdb->usermeta} um LEFT JOIN {$wpdb->users} u ON u.ID = um.user_id WHERE u.ID IS NULL");
echo "Orphan usermeta: {$orphan_um}\n";

// 11. Optimize all tables
$tables = $wpdb->get_col("SHOW TABLES");
foreach ($tables as $t) $wpdb->query("OPTIMIZE TABLE `$t`");
echo "Tables optimized: " . count($tables) . "\n";

// Summary
echo "\n=== FINAL ===\n";
$types = $wpdb->get_results("SELECT post_type, post_status, COUNT(*) as cnt FROM {$wpdb->posts} GROUP BY post_type, post_status ORDER BY post_type");
foreach ($types as $t) echo "  {$t->post_type} [{$t->post_status}]: {$t->cnt}\n";

$size = $wpdb->get_var("SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) FROM information_schema.tables WHERE table_schema = DATABASE()");
echo "\nDB size: {$size} MB\n";

// Biggest tables
echo "\nBiggest tables:\n";
$tables = $wpdb->get_results("SELECT table_name, ROUND((data_length + index_length) / 1024 / 1024, 2) as mb FROM information_schema.tables WHERE table_schema = DATABASE() ORDER BY (data_length + index_length) DESC LIMIT 10");
foreach ($tables as $t) echo "  {$t->table_name}: {$t->mb} MB\n";
