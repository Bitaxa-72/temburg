<?php
require_once(__DIR__ . "/wp-load.php");
global $wpdb;

echo "=== ALL TAXONOMIES ===\n";
$taxonomies = get_taxonomies(array(), 'objects');
foreach ($taxonomies as $tax) {
    $terms = get_terms(array('taxonomy' => $tax->name, 'hide_empty' => false));
    $count = is_array($terms) ? count($terms) : 0;
    $used = 0;
    if (is_array($terms)) {
        foreach ($terms as $t) {
            if ($t->count > 0) $used++;
        }
    }
    if ($count > 0) {
        echo "\n  {$tax->name} ({$tax->label}): {$count} terms, {$used} with posts\n";
        if (is_array($terms)) {
            foreach ($terms as $t) {
                $status = $t->count > 0 ? "USED ({$t->count} posts)" : "EMPTY";
                echo "    - {$t->name} (slug: {$t->slug}): {$status}\n";
            }
        }
    }
}

echo "\n\n=== SUMMARY: EMPTY TAXONOMIES (candidates for deletion) ===\n";
foreach ($taxonomies as $tax) {
    $terms = get_terms(array('taxonomy' => $tax->name, 'hide_empty' => false));
    if (!is_array($terms)) continue;
    $all_empty = true;
    foreach ($terms as $t) {
        if ($t->count > 0) { $all_empty = false; break; }
    }
    $count = count($terms);
    if ($count > 0 && $all_empty) {
        echo "  {$tax->name}: {$count} terms, ALL EMPTY\n";
    }
}

echo "\n=== ORPHAN TERM RELATIONSHIPS ===\n";
$orphans = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->term_relationships} tr LEFT JOIN {$wpdb->posts} p ON p.ID = tr.object_id WHERE p.ID IS NULL");
echo "  {$orphans} orphan relationships\n";
