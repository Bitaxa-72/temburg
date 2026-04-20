<?php
require_once(__DIR__ . "/wp-load.php");

echo "=== FULL ACF FIELD AUDIT ===\n\n";

$groups = acf_get_field_groups();
foreach ($groups as $group) {
    $fields = acf_get_fields($group['key']);
    if (empty($fields)) continue;

    $location = '';
    if (isset($group['location'][0][0]['value'])) {
        $location = $group['location'][0][0]['value'];
    }

    echo "## {$group['title']} (page: {$location})\n";

    foreach ($fields as $field) {
        $value = get_field($field['name'], 'option');
        $raw = get_option("options_{$field['name']}");

        $has_data = false;
        if ($field['type'] === 'repeater') {
            $count = is_array($value) ? count($value) : 0;
            $raw_count = intval($raw);
            echo "  [{$field['type']}] {$field['name']} (key: {$field['key']})\n";
            echo "    get_field: {$count} items\n";
            echo "    get_option count: {$raw_count}\n";

            if ($count > 0 && isset($field['sub_fields'])) {
                echo "    First item: ";
                $first = $value[0];
                foreach ($field['sub_fields'] as $sf) {
                    $sv = isset($first[$sf['name']]) ? $first[$sf['name']] : 'MISSING';
                    if (is_array($sv)) $sv = json_encode($sv);
                    if (strlen($sv) > 50) $sv = substr($sv, 0, 50) . '...';
                    echo "{$sf['name']}={$sv} | ";
                }
                echo "\n";
                $has_data = true;
            } elseif ($raw_count > 0) {
                // Data in options but not readable by get_field
                echo "    *** DATA EXISTS IN OPTIONS BUT get_field RETURNS NULL ***\n";
                if (isset($field['sub_fields'])) {
                    echo "    Raw first item: ";
                    foreach ($field['sub_fields'] as $sf) {
                        $rv = get_option("options_{$field['name']}_0_{$sf['name']}");
                        if (strlen($rv) > 50) $rv = substr($rv, 0, 50) . '...';
                        echo "{$sf['name']}={$rv} | ";
                    }
                    echo "\n";
                }
            } else {
                echo "    *** EMPTY ***\n";
            }
        } else {
            $display = $value ?: $raw ?: 'EMPTY';
            if (is_array($display)) $display = json_encode($display);
            if (strlen($display) > 80) $display = substr($display, 0, 80) . '...';
            echo "  [{$field['type']}] {$field['name']}: {$display}\n";
            $has_data = !empty($value) || !empty($raw);
        }
    }
    echo "\n";
}
