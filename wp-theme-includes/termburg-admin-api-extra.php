<?php
/**
 * Термбург — дополнительные ACF Options Pages + REST API
 * Сертификаты, Услуги, Парные/зоны, Hero, Галерея,
 * Термлины, Правила, Акции
 */

if ( ! defined( 'ABSPATH' ) ) exit;

/* ====================================================================
   1. ACF OPTIONS SUB-PAGES
   ==================================================================== */
add_action( 'acf/init', 'termburg_extra_options_pages' );
function termburg_extra_options_pages() {
    if ( ! function_exists( 'acf_add_options_sub_page' ) ) return;

    $pages = array(
        array( 'Сертификаты',    'termburg-certificates' ),
        array( 'Услуги',         'termburg-services' ),
        array( 'Парные и зоны',  'termburg-zones-data' ),
        array( 'Hero секция',    'termburg-hero' ),
        array( 'Галерея',        'termburg-gallery' ),
        array( 'Термлины',       'termburg-termliny' ),
        array( 'Правила',        'termburg-rules' ),
        array( 'Акции',          'termburg-promotions-data' ),
    );
    foreach ( $pages as $p ) {
        acf_add_options_sub_page( array(
            'page_title'  => $p[0],
            'menu_title'  => $p[0],
            'menu_slug'   => $p[1],
            'parent_slug' => 'termburg-settings',
        ) );
    }
}

/* ====================================================================
   2. ACF FIELD GROUPS
   ==================================================================== */
add_action( 'acf/init', 'termburg_extra_field_groups' );
function termburg_extra_field_groups() {
    if ( ! function_exists( 'acf_add_local_field_group' ) ) return;

    /* ---------- Certificates ---------- */
    acf_add_local_field_group( array(
        'key'    => 'group_tb_certificates',
        'title'  => 'Сертификаты',
        'fields' => array(
            array( 'key' => 'field_tb_cert_cats', 'label' => 'Категории сертификатов', 'name' => 'tb_certificate_categories', 'type' => 'repeater', 'layout' => 'block',
                'sub_fields' => array(
                    array( 'key' => 'field_cert_name',  'label' => 'Название',  'name' => 'name',        'type' => 'text' ),
                    array( 'key' => 'field_cert_img',   'label' => 'Картинка',  'name' => 'image',       'type' => 'image', 'return_format' => 'url' ),
                    array( 'key' => 'field_cert_desc',  'label' => 'Описание',  'name' => 'description', 'type' => 'textarea' ),
                ) ),
        ),
        'location' => array( array( array( 'param' => 'options_page', 'operator' => '==', 'value' => 'termburg-certificates' ) ) ),
    ) );

    /* ---------- Services ---------- */
    $svc_sub = array(
        array( 'key' => 'field_svc_name',  'label' => 'Название',     'name' => 'name',        'type' => 'text' ),
        array( 'key' => 'field_svc_desc',  'label' => 'Описание',     'name' => 'description', 'type' => 'textarea' ),
        array( 'key' => 'field_svc_price', 'label' => 'Цена',         'name' => 'price',       'type' => 'number' ),
        array( 'key' => 'field_svc_dur',   'label' => 'Длительность', 'name' => 'duration',    'type' => 'text' ),
        array( 'key' => 'field_svc_img',   'label' => 'Фото',         'name' => 'image',       'type' => 'image', 'return_format' => 'url' ),
    );
    $svc_sub2 = array(
        array( 'key' => 'field_svc2_name',  'label' => 'Название',     'name' => 'name',        'type' => 'text' ),
        array( 'key' => 'field_svc2_desc',  'label' => 'Описание',     'name' => 'description', 'type' => 'textarea' ),
        array( 'key' => 'field_svc2_price', 'label' => 'Цена',         'name' => 'price',       'type' => 'number' ),
        array( 'key' => 'field_svc2_dur',   'label' => 'Длительность', 'name' => 'duration',    'type' => 'text' ),
        array( 'key' => 'field_svc2_img',   'label' => 'Фото',         'name' => 'image',       'type' => 'image', 'return_format' => 'url' ),
    );
    $svc_sub3 = array(
        array( 'key' => 'field_svc3_name',  'label' => 'Название',     'name' => 'name',        'type' => 'text' ),
        array( 'key' => 'field_svc3_desc',  'label' => 'Описание',     'name' => 'description', 'type' => 'textarea' ),
        array( 'key' => 'field_svc3_price', 'label' => 'Цена',         'name' => 'price',       'type' => 'number' ),
        array( 'key' => 'field_svc3_dur',   'label' => 'Длительность', 'name' => 'duration',    'type' => 'text' ),
        array( 'key' => 'field_svc3_img',   'label' => 'Фото',         'name' => 'image',       'type' => 'image', 'return_format' => 'url' ),
    );

    acf_add_local_field_group( array(
        'key'    => 'group_tb_services',
        'title'  => 'Услуги',
        'fields' => array(
            array( 'key' => 'field_tb_steam_svc',   'label' => 'Парение',  'name' => 'tb_steam_services',   'type' => 'repeater', 'layout' => 'block', 'sub_fields' => $svc_sub ),
            array( 'key' => 'field_tb_spa_svc',     'label' => 'SPA',      'name' => 'tb_spa_services',     'type' => 'repeater', 'layout' => 'block', 'sub_fields' => $svc_sub2 ),
            array( 'key' => 'field_tb_massage_svc', 'label' => 'Массаж',   'name' => 'tb_massage_services', 'type' => 'repeater', 'layout' => 'block', 'sub_fields' => $svc_sub3 ),
        ),
        'location' => array( array( array( 'param' => 'options_page', 'operator' => '==', 'value' => 'termburg-services' ) ) ),
    ) );

    /* ---------- Zones Data ---------- */
    acf_add_local_field_group( array(
        'key'    => 'group_tb_zones_data',
        'title'  => 'Парные и зоны',
        'fields' => array(
            array( 'key' => 'field_tb_zones_rep', 'label' => 'Зоны', 'name' => 'tb_zones', 'type' => 'repeater', 'layout' => 'block',
                'sub_fields' => array(
                    array( 'key' => 'field_zd_name',     'label' => 'Название',    'name' => 'name',        'type' => 'text' ),
                    array( 'key' => 'field_zd_subtitle', 'label' => 'Подзаголовок','name' => 'subtitle',    'type' => 'text' ),
                    array( 'key' => 'field_zd_desc',     'label' => 'Описание',    'name' => 'description', 'type' => 'textarea' ),
                    array( 'key' => 'field_zd_img',      'label' => 'Картинка',    'name' => 'image',       'type' => 'image', 'return_format' => 'url' ),
                    array( 'key' => 'field_zd_items',    'label' => 'Объекты',     'name' => 'items',       'type' => 'repeater', 'layout' => 'block',
                        'sub_fields' => array(
                            array( 'key' => 'field_zi_name',  'label' => 'Название',    'name' => 'name',        'type' => 'text' ),
                            array( 'key' => 'field_zi_temp',  'label' => 'Температура', 'name' => 'temp',        'type' => 'text' ),
                            array( 'key' => 'field_zi_desc',  'label' => 'Описание',    'name' => 'description', 'type' => 'textarea' ),
                            array( 'key' => 'field_zi_img',   'label' => 'Фото',        'name' => 'image',       'type' => 'image', 'return_format' => 'url' ),
                            array( 'key' => 'field_zi_feat',  'label' => 'Особенности', 'name' => 'features',    'type' => 'textarea', 'instructions' => 'По одной на строку' ),
                        ) ),
                ) ),
        ),
        'location' => array( array( array( 'param' => 'options_page', 'operator' => '==', 'value' => 'termburg-zones-data' ) ) ),
    ) );

    /* ---------- Hero ---------- */
    acf_add_local_field_group( array(
        'key'    => 'group_tb_hero',
        'title'  => 'Hero секция',
        'fields' => array(
            array( 'key' => 'field_tb_hero_title',    'label' => 'Заголовок',     'name' => 'tb_hero_title',       'type' => 'text',  'default_value' => 'Термбург' ),
            array( 'key' => 'field_tb_hero_subtitle', 'label' => 'Подзаголовок',  'name' => 'tb_hero_subtitle',    'type' => 'text',  'default_value' => 'Банный комплекс в Москве' ),
            array( 'key' => 'field_tb_hero_btn',      'label' => 'Текст кнопки',  'name' => 'tb_hero_button_text', 'type' => 'text',  'default_value' => 'Купить билет' ),
        ),
        'location' => array( array( array( 'param' => 'options_page', 'operator' => '==', 'value' => 'termburg-hero' ) ) ),
    ) );

    /* ---------- Gallery ---------- */
    acf_add_local_field_group( array(
        'key'    => 'group_tb_gallery',
        'title'  => 'Галерея',
        'fields' => array(
            array( 'key' => 'field_tb_gallery_imgs', 'label' => 'Изображения', 'name' => 'tb_gallery_images', 'type' => 'repeater', 'layout' => 'block',
                'sub_fields' => array(
                    array( 'key' => 'field_gi_img',  'label' => 'Фото',      'name' => 'image',    'type' => 'image', 'return_format' => 'url' ),
                    array( 'key' => 'field_gi_cap',  'label' => 'Подпись',   'name' => 'caption',  'type' => 'text' ),
                    array( 'key' => 'field_gi_cat',  'label' => 'Категория', 'name' => 'category', 'type' => 'select',
                        'choices' => array( 'steam' => 'Парные', 'pools' => 'Бассейны', 'spa' => 'SPA', 'general' => 'Общее' ) ),
                ) ),
        ),
        'location' => array( array( array( 'param' => 'options_page', 'operator' => '==', 'value' => 'termburg-gallery' ) ) ),
    ) );

    /* ---------- Termliny ---------- */
    acf_add_local_field_group( array(
        'key'    => 'group_tb_termliny',
        'title'  => 'Термлины',
        'fields' => array(
            array( 'key' => 'field_tb_termliny_rep', 'label' => 'Термлины', 'name' => 'tb_termliny', 'type' => 'repeater', 'layout' => 'block',
                'sub_fields' => array(
                    array( 'key' => 'field_tl_name',         'label' => 'Имя',             'name' => 'name',         'type' => 'text' ),
                    array( 'key' => 'field_tl_title',        'label' => 'Титул',           'name' => 'title',        'type' => 'text' ),
                    array( 'key' => 'field_tl_element',      'label' => 'Стихия',          'name' => 'element',      'type' => 'text' ),
                    array( 'key' => 'field_tl_name_meaning', 'label' => 'Значение имени',  'name' => 'name_meaning', 'type' => 'text' ),
                    array( 'key' => 'field_tl_signs',        'label' => 'Приметы',         'name' => 'signs',        'type' => 'textarea' ),
                    array( 'key' => 'field_tl_mission',      'label' => 'Миссия',          'name' => 'mission',      'type' => 'textarea' ),
                    array( 'key' => 'field_tl_baths',        'label' => 'Бани',            'name' => 'baths',        'type' => 'text' ),
                    array( 'key' => 'field_tl_history',      'label' => 'История',         'name' => 'history',      'type' => 'textarea' ),
                    array( 'key' => 'field_tl_character',    'label' => 'Характер',        'name' => 'character',    'type' => 'textarea' ),
                    array( 'key' => 'field_tl_habits',       'label' => 'Привычки',        'name' => 'habits',       'type' => 'textarea' ),
                    array( 'key' => 'field_tl_expressions',  'label' => 'Выражения',       'name' => 'expressions',  'type' => 'textarea', 'instructions' => 'По одному на строку' ),
                    array( 'key' => 'field_tl_omens',        'label' => 'Поверья',         'name' => 'omens',        'type' => 'textarea' ),
                    array( 'key' => 'field_tl_image',        'label' => 'Картинка',         'name' => 'image',        'type' => 'image', 'return_format' => 'url' ),
                    array( 'key' => 'field_tl_image_legacy', 'label' => 'Путь (старый)',   'name' => 'image_path',   'type' => 'text' ),
                ) ),
        ),
        'location' => array( array( array( 'param' => 'options_page', 'operator' => '==', 'value' => 'termburg-termliny' ) ) ),
    ) );

    /* ---------- Rules ---------- */
    acf_add_local_field_group( array(
        'key'    => 'group_tb_rules',
        'title'  => 'Правила посещения',
        'fields' => array(
            array( 'key' => 'field_tb_rules_rep', 'label' => 'Категории правил', 'name' => 'tb_rules_categories', 'type' => 'repeater', 'layout' => 'block',
                'sub_fields' => array(
                    array( 'key' => 'field_rl_title', 'label' => 'Заголовок', 'name' => 'title', 'type' => 'text' ),
                    array( 'key' => 'field_rl_rules', 'label' => 'Правила',   'name' => 'rules', 'type' => 'repeater', 'layout' => 'table',
                        'sub_fields' => array(
                            array( 'key' => 'field_rr_text', 'label' => 'Текст правила', 'name' => 'text', 'type' => 'text' ),
                        ) ),
                ) ),
        ),
        'location' => array( array( array( 'param' => 'options_page', 'operator' => '==', 'value' => 'termburg-rules' ) ) ),
    ) );

    /* ---------- Promotions ---------- */
    acf_add_local_field_group( array(
        'key'    => 'group_tb_promotions',
        'title'  => 'Акции',
        'fields' => array(
            array( 'key' => 'field_tb_promo_rep', 'label' => 'Акции', 'name' => 'tb_promotions', 'type' => 'repeater', 'layout' => 'block',
                'sub_fields' => array(
                    array( 'key' => 'field_pr_title',    'label' => 'Название',    'name' => 'title',       'type' => 'text' ),
                    array( 'key' => 'field_pr_desc',     'label' => 'Описание',    'name' => 'description', 'type' => 'textarea' ),
                    array( 'key' => 'field_pr_cond',     'label' => 'Условия',     'name' => 'conditions',  'type' => 'text' ),
                    array( 'key' => 'field_pr_discount', 'label' => 'Скидка %',    'name' => 'discount',    'type' => 'number' ),
                    array( 'key' => 'field_pr_badge',    'label' => 'Бейдж',       'name' => 'badge',       'type' => 'text' ),
                    array( 'key' => 'field_pr_image',    'label' => 'Картинка',    'name' => 'image',       'type' => 'image', 'return_format' => 'url' ),
                    array( 'key' => 'field_pr_banner',   'label' => 'Баннер URL',  'name' => 'banner_url',  'type' => 'text' ),
                ) ),
        ),
        'location' => array( array( array( 'param' => 'options_page', 'operator' => '==', 'value' => 'termburg-promotions-data' ) ) ),
    ) );
}

/* ====================================================================
   3. REST API ENDPOINTS
   ==================================================================== */
add_action( 'rest_api_init', 'termburg_extra_rest_routes' );
function termburg_extra_rest_routes() {
    $ns  = 'termburg/v1';
    $pub = array( 'permission_callback' => '__return_true' );

    register_rest_route( $ns, '/certificates',  array( 'methods' => 'GET', 'callback' => 'termburg_api_certificates' )  + $pub );
    register_rest_route( $ns, '/services-list', array( 'methods' => 'GET', 'callback' => 'termburg_api_services_list' ) + $pub );
    register_rest_route( $ns, '/zones-data',    array( 'methods' => 'GET', 'callback' => 'termburg_api_zones_data' )    + $pub );
    register_rest_route( $ns, '/gallery',          array( 'methods' => 'GET', 'callback' => 'termburg_api_gallery' )          + $pub );
    register_rest_route( $ns, '/termliny',         array( 'methods' => 'GET', 'callback' => 'termburg_api_termliny' )         + $pub );
    register_rest_route( $ns, '/rules',            array( 'methods' => 'GET', 'callback' => 'termburg_api_rules' )            + $pub );
    register_rest_route( $ns, '/promotions-data',  array( 'methods' => 'GET', 'callback' => 'termburg_api_promotions_data' )  + $pub );
}

/* ── Helper: resolve ACF image value to URL ──
 *  ACF image fields store attachment ID (numeric).
 *  Legacy data may contain a path string. Handle both. */
function termburg_resolve_image( $value ) {
    if ( empty( $value ) ) return '';
    if ( is_numeric( $value ) ) {
        $url = wp_get_attachment_url( intval( $value ) );
        return $url ? $url : '';
    }
    // Already a URL or path string — return as-is
    return $value;
}

/* ── Helper: read simple repeater via get_option ──
 *  $image_keys — array of sub-field names that are images (will be resolved) */
function termburg_read_repeater( $field, $sub_keys, $image_keys = array( 'image' ) ) {
    $count = intval( get_option( "options_{$field}" ) );
    $out   = array();
    for ( $i = 0; $i < $count; $i++ ) {
        $row = array( 'id' => $i + 1 );
        foreach ( $sub_keys as $k ) {
            $val = get_option( "options_{$field}_{$i}_{$k}" ) ?: '';
            if ( in_array( $k, $image_keys ) ) {
                $val = termburg_resolve_image( $val );
            }
            $row[ $k ] = $val;
        }
        $out[] = $row;
    }
    return $out;
}

/* ── Certificates ── */
function termburg_api_certificates() {
    $cats = termburg_read_repeater( 'tb_certificate_categories', array( 'name', 'image', 'description' ) );
    if ( empty( $cats ) ) {
        $defaults = array( 'День рождения', '8 марта', '23 февраля', 'Новый год', 'День матери', 'День защиты детей', 'День Победы', 'День семьи', 'SPA' );
        $cats = array();
        foreach ( $defaults as $idx => $name ) {
            $cats[] = array( 'id' => $idx + 1, 'name' => $name, 'image' => '', 'description' => '' );
        }
    }
    return rest_ensure_response( $cats );
}

/* ── Services List ── */
function termburg_api_services_list() {
    $keys = array( 'name', 'description', 'price', 'duration', 'image' );
    return rest_ensure_response( array(
        'steam'   => termburg_read_repeater( 'tb_steam_services',   $keys ),
        'spa'     => termburg_read_repeater( 'tb_spa_services',     $keys ),
        'massage' => termburg_read_repeater( 'tb_massage_services', $keys ),
    ) );
}

/* ── Zones Data ── */
function termburg_api_zones_data() {
    $count = intval( get_option( 'options_tb_zones' ) );
    $out   = array();
    for ( $i = 0; $i < $count; $i++ ) {
        $pre = "options_tb_zones_{$i}";
        $item_count = intval( get_option( "{$pre}_items" ) );
        $items = array();
        for ( $j = 0; $j < $item_count; $j++ ) {
            $ip = "{$pre}_items_{$j}";
            $feat_raw = get_option( "{$ip}_features" ) ?: '';
            $features = $feat_raw ? array_filter( array_map( 'trim', explode( "\n", $feat_raw ) ) ) : array();
            $items[] = array(
                'id'          => $j + 1,
                'name'        => get_option( "{$ip}_name" ) ?: '',
                'temp'        => get_option( "{$ip}_temp" ) ?: '',
                'description' => get_option( "{$ip}_description" ) ?: '',
                'image'       => termburg_resolve_image( get_option( "{$ip}_image" ) ?: '' ),
                'features'    => array_values( $features ),
            );
        }
        $out[] = array(
            'id'          => $i + 1,
            'name'        => get_option( "{$pre}_name" ) ?: '',
            'subtitle'    => get_option( "{$pre}_subtitle" ) ?: '',
            'description' => get_option( "{$pre}_description" ) ?: '',
            'image'       => termburg_resolve_image( get_option( "{$pre}_image" ) ?: '' ),
            'items'       => $items,
        );
    }
    return rest_ensure_response( $out );
}

/* ── Gallery ── */
function termburg_api_gallery() {
    $imgs = termburg_read_repeater( 'tb_gallery_images', array( 'image', 'caption', 'category' ) );
    return rest_ensure_response( $imgs );
}

/* ── Termliny ── */
function termburg_api_termliny() {
    $keys = array( 'name', 'title', 'element', 'name_meaning', 'signs', 'mission', 'baths', 'history', 'character', 'habits', 'expressions', 'omens', 'image', 'image_path' );
    $rows = termburg_read_repeater( 'tb_termliny', $keys );
    foreach ( $rows as &$row ) {
        $expr_raw = $row['expressions'] ?: '';
        $row['expressions'] = $expr_raw ? array_values( array_filter( array_map( 'trim', explode( "\n", $expr_raw ) ) ) ) : array();
    }
    return rest_ensure_response( $rows );
}

/* ── Rules ── */
function termburg_api_rules() {
    $count = intval( get_option( 'options_tb_rules_categories' ) );
    $out   = array();
    for ( $i = 0; $i < $count; $i++ ) {
        $pre = "options_tb_rules_categories_{$i}";
        $title = get_option( "{$pre}_title" ) ?: '';
        $rule_count = intval( get_option( "{$pre}_rules" ) );
        $rules = array();
        for ( $j = 0; $j < $rule_count; $j++ ) {
            $text = get_option( "{$pre}_rules_{$j}_text" ) ?: '';
            if ( $text ) $rules[] = $text;
        }
        $out[] = array(
            'id'    => $i + 1,
            'title' => $title,
            'rules' => $rules,
        );
    }
    return rest_ensure_response( $out );
}

/* ── Promotions Data ── */
function termburg_api_promotions_data() {
    $keys = array( 'title', 'description', 'conditions', 'discount', 'badge', 'image', 'banner_url' );
    $rows = termburg_read_repeater( 'tb_promotions', $keys );
    foreach ( $rows as &$row ) {
        $row['discount'] = $row['discount'] ? intval( $row['discount'] ) : null;
    }
    return rest_ensure_response( $rows );
}

/* ── Extend /settings with Hero fields ── */
add_filter( 'rest_pre_dispatch', 'termburg_extend_settings_hero', 10, 3 );
function termburg_extend_settings_hero( $result, $server, $request ) {
    if ( $request->get_route() !== '/termburg/v1/settings' ) return $result;

    add_filter( 'rest_post_dispatch', function ( $response ) {
        if ( ! ( $response instanceof WP_REST_Response ) ) return $response;
        $data = $response->get_data();
        if ( is_array( $data ) && isset( $data['phone'] ) ) {
            $data['hero'] = array(
                'title'      => get_option( 'options_tb_hero_title' ) ?: 'Термбург',
                'subtitle'   => get_option( 'options_tb_hero_subtitle' ) ?: 'Банный комплекс в Москве',
                'buttonText' => get_option( 'options_tb_hero_button_text' ) ?: 'Купить билет',
            );
            $response->set_data( $data );
        }
        return $response;
    } );

    return $result;
}
