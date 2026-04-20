<?php
require_once(__DIR__ . "/wp-load.php");
global $wpdb;

$upload_dir = wp_upload_dir();
$base_dir = $upload_dir['basedir'];

// Get ALL attachment URLs from DB that are linked to published posts
$used_files = $wpdb->get_col("
    SELECT DISTINCT meta_value
    FROM {$wpdb->postmeta}
    WHERE meta_key = '_wp_attached_file'
    AND post_id IN (
        SELECT ID FROM {$wpdb->posts} WHERE post_type = 'attachment'
    )
");

// Also get files referenced in promotions (hardcoded in JS)
$promo_files = array(
    "2024/09/560h400_2.jpg",
    "2025/01/termburg_banner_den_rozhdeniya_560h400.jpg",
    "2025/04/termburg_banner_studenty_skidka_560h400.jpg",
    "2025/05/joga_560h400.jpg",
    "2025/08/termburg_banner_kofe_560h400.jpg",
    "2025/08/termburg_banner_plavanie_560h400-1.jpg",
);

$all_keep = array_merge($used_files, $promo_files);

// Also keep resized versions of used files
$keep_patterns = array();
foreach ($all_keep as $file) {
    $info = pathinfo($file);
    // Keep original and all resized versions (-NNNxNNN)
    $pattern = $info['dirname'] . '/' . $info['filename'];
    $keep_patterns[] = $pattern;
}

echo "Files to keep: " . count($all_keep) . "\n";
echo "Patterns: " . count($keep_patterns) . "\n\n";

// Scan all files in uploads
$deleted_count = 0;
$deleted_size = 0;
$kept_count = 0;

$years = array('2023', '2024', '2025', '2026');
foreach ($years as $year) {
    $year_dir = $base_dir . '/' . $year;
    if (!is_dir($year_dir)) continue;

    $months = scandir($year_dir);
    foreach ($months as $month) {
        if ($month === '.' || $month === '..') continue;
        $month_dir = $year_dir . '/' . $month;
        if (!is_dir($month_dir)) continue;

        $files = scandir($month_dir);
        foreach ($files as $file) {
            if ($file === '.' || $file === '..') continue;
            $full_path = $month_dir . '/' . $file;
            if (!is_file($full_path)) continue;

            $rel_path = $year . '/' . $month . '/' . $file;
            $file_base = pathinfo($file, PATHINFO_FILENAME);
            // Remove size suffix for matching (-NNNxNNN)
            $clean_base = preg_replace('/-\d+x\d+$/', '', $file_base);
            $match_pattern = $year . '/' . $month . '/' . $clean_base;

            $keep = false;
            foreach ($keep_patterns as $pattern) {
                if (strpos($pattern, $match_pattern) !== false || $match_pattern === $pattern) {
                    $keep = true;
                    break;
                }
            }

            // Also check exact match
            if (in_array($rel_path, $all_keep)) {
                $keep = true;
            }

            if ($keep) {
                $kept_count++;
            } else {
                $size = filesize($full_path);
                unlink($full_path);
                $deleted_count++;
                $deleted_size += $size;
            }
        }

        // Remove empty month dirs
        if (count(scandir($month_dir)) == 2) {
            rmdir($month_dir);
        }
    }

    // Remove empty year dirs
    if (is_dir($year_dir) && count(scandir($year_dir)) == 2) {
        rmdir($year_dir);
    }
}

echo "Deleted: {$deleted_count} files (" . round($deleted_size / 1024 / 1024) . " MB)\n";
echo "Kept: {$kept_count} files\n";

// Also clean orphan attachments from DB
$wpdb->query("
    DELETE FROM {$wpdb->posts}
    WHERE post_type = 'attachment'
    AND post_parent NOT IN (
        SELECT ID FROM (
            SELECT ID FROM {$wpdb->posts} WHERE post_status = 'publish'
        ) as published
    )
    AND post_parent != 0
");
echo "Orphan DB attachments cleaned\n";

// Final size
echo "\n";
system("du -sh " . escapeshellarg($base_dir));
