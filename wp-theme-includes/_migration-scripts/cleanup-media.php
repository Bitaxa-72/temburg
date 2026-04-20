<?php
require_once(__DIR__ . "/wp-load.php");
global $wpdb;

$upload_dir = wp_upload_dir();
$base_dir = $upload_dir['basedir'];

// Files to KEEP (promo banners used on the site)
$keep_files = array(
    "2024/09/560h400_2.jpg",
    "2025/01/termburg_banner_den_rozhdeniya_560h400.jpg",
    "2025/04/termburg_banner_studenty_skidka_560h400.jpg",
    "2025/05/joga_560h400.jpg",
    "2025/08/termburg_banner_kofe_560h400.jpg",
    "2025/08/termburg_banner_plavanie_560h400-1.jpg",
);

// Also keep resized versions of promo banners
$keep_basenames = array();
foreach ($keep_files as $f) {
    $info = pathinfo($f);
    $keep_basenames[] = $info['dirname'] . '/' . $info['filename'];
}

echo "Keeping " . count($keep_files) . " promo banners + resizes\n\n";

// Delete everything in year folders except kept files
$deleted_count = 0;
$deleted_size = 0;
$kept_count = 0;

$years = array('2023', '2024', '2025', '2026');
foreach ($years as $year) {
    $year_dir = $base_dir . '/' . $year;
    if (!is_dir($year_dir)) continue;

    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($year_dir, RecursiveDirectoryIterator::SKIP_DOTS),
        RecursiveIteratorIterator::CHILD_FIRST
    );

    foreach ($iterator as $item) {
        if ($item->isFile()) {
            $rel = str_replace($base_dir . '/', '', $item->getPathname());
            $info = pathinfo($rel);
            $clean = preg_replace('/-\d+x\d+$/', '', $info['filename']);
            $match = $info['dirname'] . '/' . $clean;

            $keep = false;
            foreach ($keep_basenames as $kb) {
                if ($match === $kb) {
                    $keep = true;
                    break;
                }
            }
            if (in_array($rel, $keep_files)) $keep = true;

            if (!$keep) {
                $deleted_size += $item->getSize();
                unlink($item->getPathname());
                $deleted_count++;
            } else {
                $kept_count++;
                echo "  KEPT: $rel\n";
            }
        }
    }

    // Remove empty directories
    $dirs = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($year_dir, RecursiveDirectoryIterator::SKIP_DOTS),
        RecursiveIteratorIterator::CHILD_FIRST
    );
    foreach ($dirs as $d) {
        if ($d->isDir()) {
            $contents = scandir($d->getPathname());
            if (count($contents) <= 2) rmdir($d->getPathname());
        }
    }
    if (is_dir($year_dir)) {
        $contents = scandir($year_dir);
        if (count($contents) <= 2) rmdir($year_dir);
    }
}

echo "\nDeleted: {$deleted_count} files (" . round($deleted_size / 1024 / 1024) . " MB)\n";
echo "Kept: {$kept_count} files\n";

// Clean DB: delete all attachment posts except promo banners
$keep_like = array();
foreach ($keep_files as $f) {
    $keep_like[] = "'%" . $wpdb->esc_like($f) . "%'";
}
$keep_clause = implode(" OR guid LIKE ", $keep_like);

$deleted_db = $wpdb->query("
    DELETE FROM {$wpdb->postmeta}
    WHERE post_id IN (
        SELECT ID FROM {$wpdb->posts}
        WHERE post_type = 'attachment'
        AND NOT (guid LIKE {$keep_clause})
    )
");

$deleted_posts = $wpdb->query("
    DELETE FROM {$wpdb->posts}
    WHERE post_type = 'attachment'
    AND NOT (guid LIKE {$keep_clause})
");

echo "DB cleaned: {$deleted_posts} attachment posts removed\n";

echo "\nFinal uploads size: ";
system("du -sh " . escapeshellarg($base_dir));
