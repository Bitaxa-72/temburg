<?php
require_once(__DIR__ . "/wp-load.php");
global $wpdb;

// 1. Delete empty categories
$empty_cats = array('adminsitrator', 'bez-rubriki');
foreach ($empty_cats as $slug) {
    $term = get_term_by('slug', $slug, 'category');
    if ($term) {
        wp_delete_term($term->term_id, 'category');
        echo "Deleted category: {$slug}\n";
    }
}

// 2. Delete YooKassa empty taxonomy terms
$yoo_taxes = array('pa_yookassa_payment_mode', 'pa_yookassa_payment_subject');
foreach ($yoo_taxes as $tax) {
    $terms = get_terms(array('taxonomy' => $tax, 'hide_empty' => false));
    if (is_array($terms)) {
        foreach ($terms as $t) {
            wp_delete_term($t->term_id, $tax);
        }
        echo "Deleted " . count($terms) . " terms from {$tax}\n";
    }
}

// 3. Delete empty product_type terms
foreach (array('external', 'grouped') as $slug) {
    $term = get_term_by('slug', $slug, 'product_type');
    if ($term && $term->count == 0) {
        wp_delete_term($term->term_id, 'product_type');
        echo "Deleted product_type: {$slug}\n";
    }
}

// 4. Delete empty product_visibility terms
foreach (array('featured', 'outofstock', 'rated-1', 'rated-2', 'rated-3', 'rated-4', 'rated-5') as $slug) {
    $term = get_term_by('slug', $slug, 'product_visibility');
    if ($term && $term->count == 0) {
        wp_delete_term($term->term_id, 'product_visibility');
        echo "Deleted product_visibility: {$slug}\n";
    }
}

// 5. Delete Uncategorized product_cat
$unc = get_term_by('slug', 'uncategorized', 'product_cat');
if ($unc && $unc->count == 0) {
    wp_delete_term($unc->term_id, 'product_cat');
    echo "Deleted product_cat: uncategorized\n";
}

// 6. Delete nav_menu items and menus (not used by React)
$nav_items = $wpdb->query("DELETE pm FROM {$wpdb->postmeta} pm INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id WHERE p.post_type = 'nav_menu_item'");
$nav_posts = $wpdb->query("DELETE FROM {$wpdb->posts} WHERE post_type = 'nav_menu_item'");
echo "Deleted {$nav_posts} nav_menu_item posts\n";

$nav_terms = get_terms(array('taxonomy' => 'nav_menu', 'hide_empty' => false));
if (is_array($nav_terms)) {
    foreach ($nav_terms as $t) {
        wp_delete_term($t->term_id, 'nav_menu');
    }
    echo "Deleted " . count($nav_terms) . " nav_menu terms\n";
}

// 7. Clean orphan term_relationships
$orphans = $wpdb->query("DELETE tr FROM {$wpdb->term_relationships} tr LEFT JOIN {$wpdb->posts} p ON p.ID = tr.object_id WHERE p.ID IS NULL");
echo "Deleted {$orphans} orphan term_relationships\n";

// 8. Clean orphan termmeta
$wpdb->query("DELETE tm FROM {$wpdb->termmeta} tm LEFT JOIN {$wpdb->terms} t ON t.term_id = tm.term_id WHERE t.term_id IS NULL");
echo "Orphan termmeta cleaned\n";

// 9. Recount terms
$taxes = get_taxonomies();
foreach ($taxes as $tax) {
    $terms = get_terms(array('taxonomy' => $tax, 'hide_empty' => false, 'fields' => 'ids'));
    if (is_array($terms) && !empty($terms)) {
        wp_update_term_count_now($terms, $tax);
    }
}
echo "Term counts recalculated\n";

// Optimize
$tables = $wpdb->get_col("SHOW TABLES");
foreach ($tables as $t) $wpdb->query("OPTIMIZE TABLE `$t`");

// Final summary
echo "\n=== REMAINING TAXONOMIES ===\n";
$taxonomies = get_taxonomies(array(), 'objects');
foreach ($taxonomies as $tax) {
    $terms = get_terms(array('taxonomy' => $tax->name, 'hide_empty' => false));
    $count = is_array($terms) ? count($terms) : 0;
    if ($count > 0) {
        echo "  {$tax->name}: {$count} terms\n";
    }
}

$size = $wpdb->get_var("SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) FROM information_schema.tables WHERE table_schema = DATABASE()");
echo "\nDB size: {$size} MB\n";
