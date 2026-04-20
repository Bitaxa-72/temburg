<?php
require_once(__DIR__ . "/wp-load.php");
global $wpdb;

$types = array('news','services','gallery_foto','gallery_video','otzav','timetable','certificates','price_list','pareniya','vacancy','about_kompany');

echo "=== OLD vs NEW CONTENT ===\n";
foreach ($types as $type) {
    $old = $wpdb->get_var($wpdb->prepare(
        "SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type = %s AND post_status = 'publish' AND post_date < '2026-04-02'",
        $type
    ));
    $new = $wpdb->get_var($wpdb->prepare(
        "SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type = %s AND post_status = 'publish' AND post_date >= '2026-04-02'",
        $type
    ));
    echo "  {$type}: OLD={$old}, NEW={$new}\n";
}

echo "\n=== WHICH OLD POSTS ARE NEEDED? ===\n";
echo "  news: Old posts show in news feed on site (WP API)\n";
echo "  services: Old promo banners show on promotions page\n";
echo "  gallery_foto: Old photos show in gallery\n";
echo "  gallery_video: Old videos (if used)\n";
echo "  otzav: 8 total - all created by us today\n";
echo "  timetable: Schedule data from old site\n";
echo "  certificates: Certificate denominations\n";
echo "  price_list: Price data from old site\n";
echo "  pareniya: Steam session types\n";
echo "  vacancy: Job postings\n";
echo "  about_kompany: About page text\n";

echo "\n=== QUESTION: Delete ALL old posts and keep only what we created? ===\n";
echo "This would remove:\n";
$total = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_status = 'publish' AND post_date < '2026-04-02' AND post_type IN ('news','services','gallery_foto','gallery_video','timetable','certificates','price_list','pareniya','vacancy','about_kompany')");
echo "  {$total} old published posts\n";
echo "  BUT: news feed, gallery, promotions would be empty until new content is added\n";
