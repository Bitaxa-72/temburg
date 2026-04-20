<?php
require_once(__DIR__ . "/wp-load.php");
global $wpdb;

// Delete all coupons + their meta
$wpdb->query("DELETE pm FROM {$wpdb->postmeta} pm INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id WHERE p.post_type = 'shop_coupon'");
$count = $wpdb->query("DELETE FROM {$wpdb->posts} WHERE post_type = 'shop_coupon'");
echo "Deleted {$count} coupons\n";

// Optimize
$tables = $wpdb->get_col("SHOW TABLES");
foreach ($tables as $t) $wpdb->query("OPTIMIZE TABLE `$t`");

// Final
$total = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->posts}");
$size = $wpdb->get_var("SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) FROM information_schema.tables WHERE table_schema = DATABASE()");
echo "Total posts: {$total}\nDB size: {$size} MB\n";
