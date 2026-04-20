<?php
/**
 * Admin Cleanup - clean WP admin interface for Termburg
 * Groups: Console | Content | Termburg (ACF) | Shop
 */

// Hide ALL unused post types from admin sidebar
add_action("init", function() {
    $hide = array(
        "days", "comment_other", "deals", "price_allday", "price_notallday",
        "gallery_foto", "gallery_video", "timetable", "certificates",
        "price_list", "pareniya", "about_kompany",
    );
    global $wp_post_types;
    foreach ($hide as $type) {
        if (isset($wp_post_types[$type])) {
            $wp_post_types[$type]->show_ui = false;
            $wp_post_types[$type]->show_in_menu = false;
        }
    }

    // Rename visible CPTs
    $renames = array(
        "services" => "Акции и промо",
        "otzav"    => "Отзывы",
        "news"     => "Новости",
        "vacancy"  => "Вакансии",
    );
    foreach ($renames as $type => $label) {
        if (isset($wp_post_types[$type])) {
            $wp_post_types[$type]->labels->name = $label;
            $wp_post_types[$type]->labels->menu_name = $label;
            $wp_post_types[$type]->labels->singular_name = $label;
        }
    }

    // Set CPT menu icons
    $icons = array(
        "news"     => "dashicons-megaphone",
        "services" => "dashicons-tag",
        "otzav"    => "dashicons-star-filled",
        "vacancy"  => "dashicons-groups",
    );
    foreach ($icons as $type => $icon) {
        if (isset($wp_post_types[$type])) {
            $wp_post_types[$type]->menu_icon = $icon;
        }
    }
}, 999);

// ── Restructure admin sidebar ──
add_action("admin_menu", function() {
    global $menu;

    // ═══════════════════════════════════════════
    // REMOVE all unwanted menus
    // ═══════════════════════════════════════════
    remove_menu_page("edit.php");                  // Записи
    remove_menu_page("edit.php?post_type=page");   // Страницы
    remove_menu_page("upload.php");                // Медиафайлы
    remove_menu_page("edit-comments.php");         // Комментарии
    remove_menu_page("themes.php");                // Внешний вид
    remove_menu_page("tools.php");                 // Инструменты

    // Plugins - hide for non-admins
    if (!current_user_can("manage_options")) {
        remove_menu_page("plugins.php");
    }

    // Yoast SEO
    remove_menu_page("wpseo_dashboard");

    // MailPoet
    remove_menu_page("mailpoet-homepage");
    remove_menu_page("mailpoet-newsletters");

    // Google Site Kit
    remove_menu_page("googlesitekit-dashboard");

    // WP Telegram
    remove_menu_page("wptelegram");

    // WP Mail SMTP
    remove_menu_page("wp-mail-smtp");
    remove_menu_page("wp-mail-smtp-lite");

    // Amelia
    remove_menu_page("wpamelia");

    // Wordfence - hide for non-admins
    if (!current_user_can("manage_options")) {
        remove_menu_page("Wordfence");
    }

    // ACF - hide for non-admins
    if (!current_user_can("manage_options")) {
        remove_menu_page("edit.php?post_type=acf-field-group");
    }

    // Yandex Metrika
    remove_menu_page("yandex-metrika");
    remove_menu_page("wp-yandex-metrika");

    // Hide WooCommerce sub-menus we don't need
    remove_submenu_page("woocommerce", "wc-reports");
    remove_submenu_page("woocommerce", "wc-addons");
    remove_submenu_page("woocommerce", "wc-admin");

    // ═══════════════════════════════════════════
    // ADD separators between groups
    // ═══════════════════════════════════════════
    $menu[4]  = array('', 'read', 'separator-content',  '', 'wp-menu-separator');
    $menu[19] = array('', 'read', 'separator-termburg', '', 'wp-menu-separator');
    $menu[49] = array('', 'read', 'separator-shop',     '', 'wp-menu-separator');

}, 999);

// ── Custom menu order ──
add_filter("custom_menu_order", "__return_true");
add_filter("menu_order", function($menu_order) {
    $new_order = array();

    // Dashboard
    $new_order[] = 'index.php';

    // ─── КОНТЕНТ ───
    $new_order[] = 'separator-content';
    $new_order[] = 'edit.php?post_type=news';
    $new_order[] = 'edit.php?post_type=services';
    $new_order[] = 'edit.php?post_type=otzav';
    $new_order[] = 'edit.php?post_type=vacancy';

    // ─── ТЕРМБУРГ ───
    $new_order[] = 'separator-termburg';
    $new_order[] = 'termburg-settings';

    // ─── МАГАЗИН ───
    $new_order[] = 'separator-shop';
    $new_order[] = 'woocommerce';
    $new_order[] = 'edit.php?post_type=shop_order';
    $new_order[] = 'edit.php?post_type=product';

    // Append everything else not in our list (settings, wordfence for admins, etc.)
    foreach ($menu_order as $item) {
        if (!in_array($item, $new_order)) {
            $new_order[] = $item;
        }
    }

    return $new_order;
});

// ── Rename Термбург sub-pages in sidebar for clarity ──
add_action("admin_menu", function() {
    global $submenu;
    if (isset($submenu['termburg-settings'])) {
        foreach ($submenu['termburg-settings'] as &$item) {
            if ($item[2] === 'termburg-settings') {
                $item[0] = 'Общие настройки';
            }
        }
    }
}, 1000);

// ── Section labels via CSS ──
add_action("admin_head", function() {
    echo '<style>
    #adminmenu li.wp-menu-separator.separator-content + li:before,
    #adminmenu li.wp-menu-separator.separator-termburg + li:before,
    #adminmenu li.wp-menu-separator.separator-shop + li:before {
        display: block;
        padding: 8px 12px 4px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #999;
        white-space: nowrap;
    }
    li.separator-content { margin-top: 0 !important; }
    li.separator-termburg { margin-top: 0 !important; }
    li.separator-shop { margin-top: 0 !important; }
    #adminmenu li.wp-menu-separator.separator-content + li:before { content: "КОНТЕНТ"; }
    #adminmenu li.wp-menu-separator.separator-termburg + li:before { content: "ТЕРМБУРГ"; }
    #adminmenu li.wp-menu-separator.separator-shop + li:before { content: "МАГАЗИН"; }
    </style>';
});

// ── Clean admin bar ──
add_action("wp_before_admin_bar_render", function() {
    global $wp_admin_bar;
    $wp_admin_bar->remove_menu("comments");
    $wp_admin_bar->remove_menu("new-content");
    $wp_admin_bar->remove_menu("wp-logo");
}, 999);

// Custom admin footer
add_filter("admin_footer_text", function() {
    return "Термбург — управление сайтом";
});

// Prevent WP from serving single CPT pages (avoid duplicate content)
add_action("template_redirect", function() {
    if (is_singular(array("news","services","otzav","certificates","timetable","pareniya","price_list","gallery_foto","gallery_video","vacancy","about_kompany"))) {
        wp_redirect(home_url("/"), 301);
        exit;
    }
});

// Disable Yoast XML sitemaps
add_filter("wpseo_sitemaps_enabled", "__return_false");

// ── Custom dashboard widget ──
add_action("wp_dashboard_setup", function() {
    // Remove default widgets
    remove_meta_box("dashboard_quick_press", "dashboard", "side");
    remove_meta_box("dashboard_right_now", "dashboard", "normal");
    remove_meta_box("dashboard_activity", "dashboard", "normal");
    remove_meta_box("dashboard_primary", "dashboard", "side");
    remove_meta_box("wpseo-dashboard-overview", "dashboard", "normal");
    remove_meta_box("wordfence_activity_report_widget", "dashboard", "normal");

    // Add navigation widget
    wp_add_dashboard_widget("termburg_dashboard", "Термбург — Панель управления", function() {
        echo '<div style="font-size:14px;line-height:1.8;">';

        echo '<p><strong>КОНТЕНТ:</strong></p>';
        echo '<ul style="list-style:disc;padding-left:20px;">';
        echo '<li><a href="edit.php?post_type=news">Новости</a></li>';
        echo '<li><a href="edit.php?post_type=services">Акции и промо</a></li>';
        echo '<li><a href="edit.php?post_type=otzav">Отзывы</a></li>';
        echo '<li><a href="edit.php?post_type=vacancy">Вакансии</a></li>';
        echo '</ul>';

        echo '<p style="margin-top:10px;"><strong>ТЕРМБУРГ:</strong></p>';
        echo '<ul style="list-style:disc;padding-left:20px;">';
        echo '<li><a href="admin.php?page=termburg-settings">Общие настройки</a> — телефон, адрес, соцсети, часы</li>';
        echo '<li><a href="admin.php?page=termburg-pricing">Прайс-лист</a></li>';
        echo '<li><a href="admin.php?page=termburg-schedule">Расписание</a></li>';
        echo '<li><a href="admin.php?page=termburg-faq">FAQ</a></li>';
        echo '<li><a href="admin.php?page=termburg-cafe">Меню кафе</a></li>';
        echo '<li><a href="admin.php?page=termburg-team">Сотрудники</a></li>';
        echo '<li><a href="admin.php?page=termburg-ticker">Бегущая строка</a></li>';
        echo '<li><a href="admin.php?page=termburg-hero">Hero секция</a></li>';
        echo '<li><a href="admin.php?page=termburg-certificates">Сертификаты</a></li>';
        echo '<li><a href="admin.php?page=termburg-services">Услуги (SPA, массаж, парение)</a></li>';
        echo '<li><a href="admin.php?page=termburg-zones-data">Парные и зоны</a></li>';
        echo '<li><a href="admin.php?page=termburg-termliny">Термлины</a></li>';
        echo '<li><a href="admin.php?page=termburg-rules">Правила</a></li>';
        echo '<li><a href="admin.php?page=termburg-promotions-data">Акции (настройки)</a></li>';
        echo '<li><a href="admin.php?page=termburg-gallery">Галерея</a></li>';
        echo '</ul>';

        echo '<p style="margin-top:10px;"><strong>МАГАЗИН:</strong></p>';
        echo '<ul style="list-style:disc;padding-left:20px;">';
        echo '<li><a href="edit.php?post_type=shop_order">Заказы</a></li>';
        echo '<li><a href="edit.php?post_type=product">Товары</a></li>';
        echo '</ul>';

        echo '<p style="margin-top:15px;color:#666;">Сайт: <a href="https://termburg.ru" target="_blank">termburg.ru</a></p>';
        echo '</div>';
    });
});
