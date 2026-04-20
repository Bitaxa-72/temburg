<?php
require_once(__DIR__ . "/wp-load.php");

// === 1. Hide unused post types from admin ===
// Unregister empty/unused post types so they don't show in sidebar
add_action('init', function() {
    $hide = array('days', 'comment_other', 'deals', 'price_allday', 'price_notallday', 'wp_block', 'wp_navigation');
    foreach ($hide as $type) {
        if (post_type_exists($type)) {
            global $wp_post_types;
            $wp_post_types[$type]->show_ui = false;
            $wp_post_types[$type]->show_in_menu = false;
        }
    }
}, 999);

// === 2. Deactivate unnecessary plugins ===
deactivate_plugins(array(
    "contact-form-7/wp-contact-form-7.php",    // CF7 forms deleted, not used
    "carbon-fields/carbon-fields-plugin.php",   // ACF Pro is enough
));
echo "Deactivated CF7 and Carbon Fields\n";

// === 3. Rename post type labels for clarity ===
// This needs to be in theme functions.php permanently
$rename_code = '
// Rename admin menu labels for clarity
add_action("init", function() {
    // Hide unused post types
    $hide = array("days", "comment_other", "deals", "price_allday", "price_notallday");
    foreach ($hide as $type) {
        if (post_type_exists($type)) {
            global $wp_post_types;
            $wp_post_types[$type]->show_ui = false;
            $wp_post_types[$type]->show_in_menu = false;
        }
    }

    // Rename labels
    $renames = array(
        "services" => "Акции и промо",
        "otzav" => "Отзывы",
        "about_kompany" => "О компании",
        "news" => "Новости",
        "gallery_foto" => "Фотогалерея",
        "gallery_video" => "Видеогалерея",
        "certificates" => "Сертификаты",
        "timetable" => "Расписание",
        "pareniya" => "Парения",
        "vacancy" => "Вакансии",
        "price_list" => "Прайс-лист",
    );

    global $wp_post_types;
    foreach ($renames as $type => $label) {
        if (isset($wp_post_types[$type])) {
            $wp_post_types[$type]->labels->name = $label;
            $wp_post_types[$type]->labels->menu_name = $label;
            $wp_post_types[$type]->labels->singular_name = $label;
        }
    }
}, 999);

// Remove unnecessary admin menus
add_action("admin_menu", function() {
    remove_menu_page("edit.php");           // Posts (not used)
    remove_menu_page("edit-comments.php");  // Comments (not used)
    remove_menu_page("themes.php");         // Appearance (theme is fixed)
    remove_menu_page("tools.php");          // Tools (not needed for editors)
}, 999);
';

// Save to a separate include file
file_put_contents(
    ABSPATH . "wp-content/themes/termoistochnik/includes/admin-cleanup.php",
    "<?php\n" . $rename_code
);

// Include it in functions.php if not already
$functions_file = ABSPATH . "wp-content/themes/termoistochnik/functions.php";
$functions = file_get_contents($functions_file);
if (strpos($functions, "admin-cleanup") === false) {
    file_put_contents($functions_file, $functions . "\nrequire_once get_template_directory() . '/includes/admin-cleanup.php';\n");
}

echo "Admin cleanup file created and included\n";
echo "Done! Refresh WP admin to see changes.\n";
