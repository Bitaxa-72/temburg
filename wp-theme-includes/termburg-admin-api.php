<?php
/**
 * Термбург — ACF Options Pages + REST API
 * Include this file from functions.php: require_once get_template_directory() . '/termburg-admin-api.php';
 */

if ( ! defined( 'ABSPATH' ) ) exit;

/* ====================================================================
   1. ACF OPTIONS PAGES
   ==================================================================== */
add_action( 'acf/init', 'termburg_register_options_pages' );
function termburg_register_options_pages() {
    if ( ! function_exists( 'acf_add_options_page' ) ) return;

    acf_add_options_page( array(
        'page_title' => 'Термбург Настройки',
        'menu_title' => 'Термбург',
        'menu_slug'  => 'termburg-settings',
        'capability' => 'manage_options',
        'icon_url'   => 'dashicons-building',
        'position'   => 2,
    ) );

    $subs = array(
        array( 'Прайс-лист',            'termburg-pricing'  ),
        array( 'Меню кафе',             'termburg-cafe'     ),
        array( 'FAQ',                    'termburg-faq'      ),
        array( 'Расписание',            'termburg-schedule' ),
        array( 'Сотрудники',            'termburg-team'     ),
        array( 'Информационная лента',  'termburg-ticker'   ),
    );
    foreach ( $subs as $s ) {
        acf_add_options_sub_page( array(
            'page_title'  => $s[0],
            'menu_title'  => $s[0],
            'menu_slug'   => $s[1],
            'parent_slug' => 'termburg-settings',
        ) );
    }
}

/* ====================================================================
   2. ACF FIELD GROUPS (programmatic)
   ==================================================================== */
add_action( 'acf/init', 'termburg_register_field_groups' );
function termburg_register_field_groups() {
    if ( ! function_exists( 'acf_add_local_field_group' ) ) return;

    /* ---------- Settings ---------- */
    acf_add_local_field_group( array(
        'key'      => 'group_tb_settings',
        'title'    => 'Настройки сайта',
        'fields'   => array(
            array( 'key' => 'field_tb_phone',    'label' => 'Телефон',           'name' => 'tb_phone',    'type' => 'text',  'default_value' => '+7 (909) 167-47-46' ),
            array( 'key' => 'field_tb_email',    'label' => 'E-mail',            'name' => 'tb_email',    'type' => 'email', 'default_value' => 'info@termburg.ru' ),
            array( 'key' => 'field_tb_address',  'label' => 'Адрес',             'name' => 'tb_address',  'type' => 'text',  'default_value' => 'г. Москва, ул. Гурьянова, д. 30, 2 этаж' ),
            array( 'key' => 'field_tb_metro',    'label' => 'Метро',             'name' => 'tb_metro',    'type' => 'text',  'default_value' => 'м. Печатники' ),
            array( 'key' => 'field_tb_hours',    'label' => 'Время работы',      'name' => 'tb_hours',    'type' => 'text',  'default_value' => 'Ежедневно с 9:00 до 23:00 (кроме 1-го пн месяца — сан. день)' ),
            array( 'key' => 'field_tb_vk',       'label' => 'VK',                'name' => 'tb_vk',       'type' => 'url',   'default_value' => 'https://vk.com/termburg' ),
            array( 'key' => 'field_tb_tg',       'label' => 'Telegram',          'name' => 'tb_tg',       'type' => 'url' ),
            array( 'key' => 'field_tb_ig',       'label' => 'Instagram',         'name' => 'tb_ig',       'type' => 'url',   'default_value' => 'https://instagram.com/termburg' ),
            array( 'key' => 'field_tb_yt',       'label' => 'YouTube',           'name' => 'tb_yt',       'type' => 'url' ),
            array( 'key' => 'field_tb_wa',       'label' => 'WhatsApp',          'name' => 'tb_wa',       'type' => 'url' ),
        ),
        'location' => array( array( array( 'param' => 'options_page', 'operator' => '==', 'value' => 'termburg-settings' ) ) ),
    ) );

    /* ---------- Pricing ---------- */
    $pricing_slot_sub = array(
        array( 'key' => 'field_ps_name',    'label' => 'Название',      'name' => 'name',        'type' => 'text' ),
        array( 'key' => 'field_ps_dur',     'label' => 'Длительность',  'name' => 'duration',    'type' => 'text' ),
        array( 'key' => 'field_ps_adult',   'label' => 'Взрослый',      'name' => 'adult_price', 'type' => 'number' ),
        array( 'key' => 'field_ps_child',   'label' => 'Детский',       'name' => 'child_price', 'type' => 'number' ),
    );

    acf_add_local_field_group( array(
        'key'    => 'group_tb_pricing',
        'title'  => 'Прайс-лист',
        'fields' => array(
            array( 'key' => 'field_tb_wd_pricing', 'label' => 'Будни', 'name' => 'tb_weekday_pricing', 'type' => 'repeater', 'layout' => 'table',
                'sub_fields' => $pricing_slot_sub ),
            array( 'key' => 'field_tb_we_pricing', 'label' => 'Выходные', 'name' => 'tb_weekend_pricing', 'type' => 'repeater', 'layout' => 'table',
                'sub_fields' => array(
                    array( 'key' => 'field_ps2_name',  'label' => 'Название',      'name' => 'name',        'type' => 'text' ),
                    array( 'key' => 'field_ps2_dur',   'label' => 'Длительность',  'name' => 'duration',    'type' => 'text' ),
                    array( 'key' => 'field_ps2_adult', 'label' => 'Взрослый',      'name' => 'adult_price', 'type' => 'number' ),
                    array( 'key' => 'field_ps2_child', 'label' => 'Детский',       'name' => 'child_price', 'type' => 'number' ),
                ) ),
            array( 'key' => 'field_tb_pen_pricing', 'label' => 'Пенсионеры', 'name' => 'tb_pensioner_pricing', 'type' => 'repeater', 'layout' => 'table',
                'sub_fields' => array(
                    array( 'key' => 'field_pp_name',  'label' => 'Название',     'name' => 'name',     'type' => 'text' ),
                    array( 'key' => 'field_pp_dur',   'label' => 'Длительность', 'name' => 'duration', 'type' => 'text' ),
                    array( 'key' => 'field_pp_price', 'label' => 'Цена',         'name' => 'price',    'type' => 'number' ),
                ) ),
            array( 'key' => 'field_tb_child6',        'label' => 'Дети до 6 лет (безлимит)', 'name' => 'tb_child_under6', 'type' => 'number', 'default_value' => 470 ),
            array( 'key' => 'field_tb_overtime_wd',    'label' => 'Доплата будни (₽/мин)',    'name' => 'tb_overtime_wd',  'type' => 'number', 'default_value' => 10 ),
            array( 'key' => 'field_tb_overtime_we',    'label' => 'Доплата выходные (₽/мин)', 'name' => 'tb_overtime_we',  'type' => 'number', 'default_value' => 15 ),
            array( 'key' => 'field_tb_overtime_pen',   'label' => 'Доплата льготный (₽/мин)', 'name' => 'tb_overtime_pen', 'type' => 'number', 'default_value' => 9 ),
        ),
        'location' => array( array( array( 'param' => 'options_page', 'operator' => '==', 'value' => 'termburg-pricing' ) ) ),
    ) );

    /* ---------- Cafe ---------- */
    acf_add_local_field_group( array(
        'key'    => 'group_tb_cafe',
        'title'  => 'Меню кафе',
        'fields' => array(
            array( 'key' => 'field_tb_cafe_cats', 'label' => 'Категории', 'name' => 'tb_cafe_categories', 'type' => 'repeater', 'layout' => 'block',
                'sub_fields' => array(
                    array( 'key' => 'field_cc_name', 'label' => 'Название категории', 'name' => 'name', 'type' => 'text' ),
                    array( 'key' => 'field_cc_items', 'label' => 'Блюда', 'name' => 'items', 'type' => 'repeater', 'layout' => 'table',
                        'sub_fields' => array(
                            array( 'key' => 'field_ci_name',  'label' => 'Название',  'name' => 'name',        'type' => 'text' ),
                            array( 'key' => 'field_ci_desc',  'label' => 'Описание',  'name' => 'description', 'type' => 'text' ),
                            array( 'key' => 'field_ci_price', 'label' => 'Цена',      'name' => 'price',       'type' => 'number' ),
                            array( 'key' => 'field_ci_badge', 'label' => 'Бейдж',     'name' => 'badge',       'type' => 'text' ),
                            array( 'key' => 'field_ci_img',   'label' => 'Фото',      'name' => 'image',       'type' => 'image', 'return_format' => 'url' ),
                        ) ),
                ) ),
        ),
        'location' => array( array( array( 'param' => 'options_page', 'operator' => '==', 'value' => 'termburg-cafe' ) ) ),
    ) );

    /* ---------- FAQ ---------- */
    acf_add_local_field_group( array(
        'key'    => 'group_tb_faq',
        'title'  => 'Часто задаваемые вопросы',
        'fields' => array(
            array( 'key' => 'field_tb_faq_items', 'label' => 'Вопросы', 'name' => 'tb_faq_items', 'type' => 'repeater', 'layout' => 'block',
                'sub_fields' => array(
                    array( 'key' => 'field_faq_q',   'label' => 'Вопрос',    'name' => 'question', 'type' => 'text' ),
                    array( 'key' => 'field_faq_a',   'label' => 'Ответ',     'name' => 'answer',   'type' => 'textarea' ),
                    array( 'key' => 'field_faq_cat', 'label' => 'Категория', 'name' => 'category', 'type' => 'text' ),
                ) ),
        ),
        'location' => array( array( array( 'param' => 'options_page', 'operator' => '==', 'value' => 'termburg-faq' ) ) ),
    ) );

    /* ---------- Schedule ---------- */
    acf_add_local_field_group( array(
        'key'    => 'group_tb_schedule',
        'title'  => 'Расписание',
        'fields' => array(
            array( 'key' => 'field_tb_sched', 'label' => 'Мероприятия', 'name' => 'tb_schedule_events', 'type' => 'repeater', 'layout' => 'block',
                'sub_fields' => array(
                    array( 'key' => 'field_se_name', 'label' => 'Название',      'name' => 'name',     'type' => 'text' ),
                    array( 'key' => 'field_se_day',  'label' => 'Дни (через запятую)', 'name' => 'day', 'type' => 'text', 'instructions' => 'Понедельник, Вторник, ...' ),
                    array( 'key' => 'field_se_time', 'label' => 'Время',         'name' => 'time',     'type' => 'text' ),
                    array( 'key' => 'field_se_dur',  'label' => 'Длительность',  'name' => 'duration', 'type' => 'text' ),
                    array( 'key' => 'field_se_type', 'label' => 'Тип',           'name' => 'type',     'type' => 'select',
                        'choices' => array( 'free' => 'Бесплатно', 'paid' => 'Платно', 'special' => 'Специальное' ) ),
                    array( 'key' => 'field_se_price','label' => 'Цена',          'name' => 'price',    'type' => 'number' ),
                    array( 'key' => 'field_se_desc', 'label' => 'Описание',      'name' => 'description', 'type' => 'textarea' ),
                    array( 'key' => 'field_se_loc',  'label' => 'Локация',       'name' => 'location', 'type' => 'text' ),
                    array( 'key' => 'field_se_instructor', 'label' => 'Ведущий / инструктор', 'name' => 'instructor', 'type' => 'text' ),
                    array( 'key' => 'field_se_hl',   'label' => 'Выделить?',     'name' => 'highlight','type' => 'true_false' ),
                ) ),
        ),
        'location' => array( array( array( 'param' => 'options_page', 'operator' => '==', 'value' => 'termburg-schedule' ) ) ),
    ) );

    /* ---------- Team ---------- */
    acf_add_local_field_group( array(
        'key'    => 'group_tb_team',
        'title'  => 'Сотрудники',
        'fields' => array(
            array( 'key' => 'field_tb_team', 'label' => 'Сотрудники', 'name' => 'tb_team_members', 'type' => 'repeater', 'layout' => 'block',
                'sub_fields' => array(
                    array( 'key' => 'field_tm_name',  'label' => 'Имя',        'name' => 'name',        'type' => 'text' ),
                    array( 'key' => 'field_tm_role',  'label' => 'Должность',  'name' => 'role',        'type' => 'text' ),
                    array( 'key' => 'field_tm_desc',  'label' => 'Описание',   'name' => 'description', 'type' => 'textarea' ),
                    array( 'key' => 'field_tm_photo', 'label' => 'Фото',       'name' => 'photo',       'type' => 'image', 'return_format' => 'url' ),
                ) ),
        ),
        'location' => array( array( array( 'param' => 'options_page', 'operator' => '==', 'value' => 'termburg-team' ) ) ),
    ) );

    /* ---------- Ticker ---------- */
    acf_add_local_field_group( array(
        'key'    => 'group_tb_ticker',
        'title'  => 'Информационная лента',
        'fields' => array(
            array( 'key' => 'field_tb_ticker', 'label' => 'Сообщения', 'name' => 'tb_ticker_messages', 'type' => 'repeater', 'layout' => 'table',
                'sub_fields' => array(
                    array( 'key' => 'field_tick_text', 'label' => 'Текст', 'name' => 'text', 'type' => 'text' ),
                ) ),
        ),
        'location' => array( array( array( 'param' => 'options_page', 'operator' => '==', 'value' => 'termburg-ticker' ) ) ),
    ) );
}

/* ====================================================================
   3. REST API ENDPOINTS — termburg/v1
   ==================================================================== */
add_action( 'rest_api_init', 'termburg_register_rest_routes' );
function termburg_register_rest_routes() {
    $ns = 'termburg/v1';
    $pub = array( 'permission_callback' => '__return_true' );

    register_rest_route( $ns, '/settings',   array( 'methods' => 'GET', 'callback' => 'termburg_api_settings',   ) + $pub );
    register_rest_route( $ns, '/pricing',    array( 'methods' => 'GET', 'callback' => 'termburg_api_pricing',    ) + $pub );
    register_rest_route( $ns, '/cafe',       array( 'methods' => 'GET', 'callback' => 'termburg_api_cafe',       ) + $pub );
    register_rest_route( $ns, '/faq',        array( 'methods' => 'GET', 'callback' => 'termburg_api_faq',        ) + $pub );
    register_rest_route( $ns, '/schedule',   array( 'methods' => 'GET', 'callback' => 'termburg_api_schedule',   ) + $pub );
    register_rest_route( $ns, '/team',       array( 'methods' => 'GET', 'callback' => 'termburg_api_team',       ) + $pub );
    register_rest_route( $ns, '/ticker',     array( 'methods' => 'GET', 'callback' => 'termburg_api_ticker',     ) + $pub );
    register_rest_route( $ns, '/zones',      array( 'methods' => 'GET', 'callback' => 'termburg_api_zones',      ) + $pub );
    register_rest_route( $ns, '/promotions', array( 'methods' => 'GET', 'callback' => 'termburg_api_promotions', ) + $pub );
    register_rest_route( $ns, '/images',     array( 'methods' => 'GET', 'callback' => 'termburg_api_images',     ) + $pub );
}

/* ── Settings ── */
function termburg_api_settings() {
    return rest_ensure_response( array(
        'siteName'        => get_bloginfo( 'name' ),
        'siteDescription' => get_bloginfo( 'description' ),
        'phone'           => get_option( 'options_tb_phone' ) ?: '+7 (909) 167-47-46',
        'email'           => get_option( 'options_tb_email' ) ?: 'info@termburg.ru',
        'address'         => get_option( 'options_tb_address' ) ?: 'г. Москва, ул. Гурьянова, д. 30, 2 этаж',
        'metro'           => get_option( 'options_tb_metro' ) ?: 'м. Печатники',
        'workingHours'    => get_option( 'options_tb_hours' ) ?: 'Ежедневно с 9:00 до 23:00',
        'socialLinks'     => array(
            'vk'        => get_option( 'options_tb_vk' ) ?: 'https://vk.com/termburg',
            'telegram'  => get_option( 'options_tb_tg' ) ?: '',
            'instagram' => get_option( 'options_tb_ig' ) ?: 'https://instagram.com/termburg',
            'youtube'   => get_option( 'options_tb_yt' ) ?: '',
            'whatsapp'  => get_option( 'options_tb_wa' ) ?: '',
        ),
    ) );
}

/* ── Pricing ── */
function termburg_api_pricing() {
    // Read repeater via get_option (more reliable than get_field for programmatic data)
    $read_slots = function ($field_name, $name_key, $dur_key, $adult_key, $child_key) {
        $count = intval(get_option("options_{$field_name}"));
        $out = array();
        for ($i = 0; $i < $count; $i++) {
            $out[] = array(
                'id'         => $i + 1,
                'name'       => get_option("options_{$field_name}_{$i}_{$name_key}") ?: '',
                'duration'   => get_option("options_{$field_name}_{$i}_{$dur_key}") ?: '',
                'adultPrice' => intval(get_option("options_{$field_name}_{$i}_{$adult_key}")),
                'childPrice' => intval(get_option("options_{$field_name}_{$i}_{$child_key}")),
                'discount'   => null,
            );
        }
        return $out;
    };

    $weekday = $read_slots('tb_weekday_pricing', 'tb_slot_name', 'tb_slot_duration', 'tb_slot_adult_price', 'tb_slot_child_price');
    $weekend = $read_slots('tb_weekend_pricing', 'tb_slot_name', 'tb_slot_duration', 'tb_slot_adult_price', 'tb_slot_child_price');

    $pen_count = intval(get_option('options_tb_pensioner_pricing'));
    $pensioner = array();
    for ($i = 0; $i < $pen_count; $i++) {
        $pensioner[] = array(
            'id'       => $i + 1,
            'name'     => get_option("options_tb_pensioner_pricing_{$i}_tb_pen_name") ?: '',
            'duration' => get_option("options_tb_pensioner_pricing_{$i}_tb_pen_duration") ?: '',
            'price'    => intval(get_option("options_tb_pensioner_pricing_{$i}_tb_pen_price")),
        );
    }

    return rest_ensure_response( array(
        'weekday'       => $weekday,
        'weekend'       => $weekend,
        'pensioner'     => $pensioner,
        'childUnder6'   => intval(get_option('options_tb_child_price')) ?: 470,
        'overtime'      => array(
            'weekday'   => intval(get_option('options_tb_overtime_wd')) ?: 10,
            'weekend'   => intval(get_option('options_tb_overtime_we')) ?: 15,
            'pensioner' => intval(get_option('options_tb_overtime_pen')) ?: 9,
        ),
        'subscriptions' => array(),
        'certificates'  => array(),
    ) );
}

/* ── Cafe ── */
function termburg_api_cafe() {
    $cats = get_field( 'tb_cafe_categories', 'option' );
    if ( ! is_array( $cats ) || empty( $cats ) ) {
        return rest_ensure_response( array() );
    }
    $out = array();
    foreach ( $cats as $ci => $cat ) {
        $items = array();
        if ( is_array( $cat['items'] ) ) {
            foreach ( $cat['items'] as $item ) {
                $row = array(
                    'name'  => $item['name'],
                    'price' => intval( $item['price'] ),
                );
                if ( ! empty( $item['description'] ) ) $row['description'] = $item['description'];
                if ( ! empty( $item['badge'] ) )       $row['badge'] = $item['badge'];
                if ( ! empty( $item['image'] ) )       $row['image'] = $item['image'];
                $items[] = $row;
            }
        }
        $out[] = array(
            'id'    => sanitize_title( $cat['name'] ) ?: 'cat-' . $ci,
            'name'  => $cat['name'],
            'items' => $items,
        );
    }
    return rest_ensure_response( $out );
}

/* ── FAQ ── */
function termburg_api_faq() {
    $count = intval( get_option( 'options_tb_faq_items' ) );
    if ( $count < 1 ) {
        return rest_ensure_response( array( 'categories' => new stdClass(), 'allItems' => array() ) );
    }
    $all = array();
    $by_cat = array();
    for ( $i = 0; $i < $count; $i++ ) {
        $item = array(
            'question' => get_option( "options_tb_faq_items_{$i}_tb_faq_q" ) ?: '',
            'answer'   => get_option( "options_tb_faq_items_{$i}_tb_faq_a" ) ?: '',
            'category' => get_option( "options_tb_faq_items_{$i}_tb_faq_cat" ) ?: 'Общее',
        );
        $all[] = $item;
        $cat_name = $item['category'];
        if ( ! isset( $by_cat[ $cat_name ] ) ) {
            $by_cat[ $cat_name ] = array( 'name' => $cat_name, 'icon' => 'HelpCircle', 'items' => array() );
        }
        $by_cat[ $cat_name ]['items'][] = $item;
    }
    return rest_ensure_response( array(
        'title'       => 'Часто задаваемые вопросы',
        'description' => 'Ответы на популярные вопросы гостей Термбурга',
        'categories'  => $by_cat,
        'allItems'    => $all,
    ) );
}

/* ── Schedule ── */
function termburg_api_schedule() {
    $out = array();

    $rows = function_exists( 'get_field' ) ? get_field( 'tb_schedule_events', 'option' ) : array();
    if ( is_array( $rows ) && ! empty( $rows ) ) {
        foreach ( $rows as $i => $row ) {
            $day_raw = $row['day'] ?? '';
            $days = is_array( $day_raw )
                ? array_values( array_filter( array_map( 'trim', $day_raw ) ) )
                : array_values( array_filter( array_map( 'trim', explode( ',', $day_raw ) ) ) );
            $type = $row['type'] ?? 'free';
            $ev_price = $row['price'] ?? '';

            $out[] = array(
                'id'          => $i + 1,
                'name'        => $row['name'] ?? '',
                'title'       => $row['name'] ?? '',
                'time'        => $row['time'] ?? '',
                'duration'    => $row['duration'] ?? '',
                'day'         => $days,
                'weekdays'    => $days,
                'type'        => $type,
                'description' => $row['description'] ?? '',
                'location'    => $row['location'] ?? '',
                'instructor'  => $row['instructor'] ?? '',
                'price'       => $ev_price !== '' ? intval( $ev_price ) : null,
                'isFree'      => $type === 'free',
                'highlight'   => ! empty( $row['highlight'] ),
            );
        }
        return rest_ensure_response( $out );
    }

    $count = intval( get_option( 'options_tb_schedule_events' ) );
    for ( $i = 0; $i < $count; $i++ ) {
        $get = function ( $key, $legacy_key = null ) use ( $i ) {
            $value = get_option( "options_tb_schedule_events_{$i}_{$key}" );
            if ( ( $value === false || $value === '' ) && $legacy_key ) {
                $value = get_option( "options_tb_schedule_events_{$i}_{$legacy_key}" );
            }
            return $value === false ? '' : $value;
        };

        $day_raw = $get( 'day', 'tb_ev_day' );
        $days = array_values( array_filter( array_map( 'trim', explode( ',', $day_raw ) ) ) );
        $type = $get( 'type', 'tb_ev_type' ) ?: 'free';
        $ev_price = $get( 'price', 'tb_ev_price' );
        $ev = array(
            'id'          => $i + 1,
            'name'        => $get( 'name', 'tb_ev_name' ),
            'title'       => $get( 'name', 'tb_ev_name' ),
            'time'        => $get( 'time', 'tb_ev_time' ),
            'duration'    => $get( 'duration', 'tb_ev_dur' ),
            'day'         => $days,
            'weekdays'    => $days,
            'type'        => $type,
            'description' => $get( 'description', 'tb_ev_desc' ),
            'location'    => $get( 'location', 'tb_ev_loc' ),
            'instructor'  => $get( 'instructor', 'tb_ev_instructor' ),
            'price'       => $ev_price !== '' ? intval( $ev_price ) : null,
            'isFree'      => $type === 'free',
            'highlight'   => ! empty( $get( 'highlight', 'tb_ev_hl' ) ),
        );
        $out[] = $ev;
    }
    return rest_ensure_response( $out );
}

/* ── Team ── */
function termburg_api_team() {
    $count = intval( get_option( 'options_tb_team_members' ) );
    if ( $count < 1 ) {
        return rest_ensure_response( array() );
    }
    $out = array();
    for ( $i = 0; $i < $count; $i++ ) {
        $out[] = array(
            'id'          => $i + 1,
            'name'        => get_option( "options_tb_team_members_{$i}_tb_m_name" ) ?: '',
            'role'        => get_option( "options_tb_team_members_{$i}_tb_m_role" ) ?: '',
            'description' => get_option( "options_tb_team_members_{$i}_tb_m_desc" ) ?: '',
            'avatar'      => false,
        );
    }
    return rest_ensure_response( $out );
}

/* ── Ticker ── */
function termburg_api_ticker() {
    $count = intval( get_option( 'options_tb_ticker_messages' ) );
    if ( $count < 1 ) {
        // Sensible defaults
        return rest_ensure_response( array(
            array( 'id' => 1, 'text' => 'Режим работы: ежедневно 9:00-23:00 (1-й понедельник месяца — санитарный день)' ),
            array( 'id' => 2, 'text' => 'Адрес: Москва, ул. Гурьянова 30, Серф Плаза, 2 этаж, м. Печатники' ),
            array( 'id' => 3, 'text' => 'Телефон: +7 (909) 167-47-46' ),
        ) );
    }
    $out = array();
    for ( $i = 0; $i < $count; $i++ ) {
        $tick_text = get_option( "options_tb_ticker_messages_{$i}_tb_tick_text" ) ?: '';
        if ( ! empty( $tick_text ) ) {
            $out[] = array( 'id' => $i + 1, 'text' => $tick_text );
        }
    }
    return rest_ensure_response( $out );
}

/* ── Zones (from CPT) ── */
function termburg_api_zones() {
    $posts = get_posts( array(
        'post_type'      => 'zone',
        'posts_per_page' => 50,
        'orderby'        => 'menu_order',
        'order'          => 'ASC',
        'post_status'    => 'publish',
    ) );
    $out = array();
    foreach ( $posts as $p ) {
        $thumb = get_the_post_thumbnail_url( $p->ID, 'large' );
        $out[] = array(
            'id'          => $p->ID,
            'title'       => $p->post_title,
            'slug'        => $p->post_name,
            'description' => get_field( 'zone_description', $p->ID ) ?: wp_trim_words( $p->post_content, 30 ),
            'temperature' => get_field( 'zone_temperature', $p->ID ) ?: '',
            'humidity'    => get_field( 'zone_humidity', $p->ID ) ?: '',
            'category'    => get_field( 'zone_category', $p->ID ) ?: 'other',
            'image'       => $thumb ?: '',
        );
    }
    return rest_ensure_response( $out );
}

/* ── Promotions (from CPT) ── */
function termburg_api_promotions() {
    $posts = get_posts( array(
        'post_type'      => 'promotion',
        'posts_per_page' => 20,
        'orderby'        => 'date',
        'order'          => 'DESC',
        'post_status'    => 'publish',
    ) );
    $out = array();
    foreach ( $posts as $p ) {
        $thumb = get_the_post_thumbnail_url( $p->ID, 'large' );
        $out[] = array(
            'id'          => $p->ID,
            'title'       => $p->post_title,
            'slug'        => $p->post_name,
            'excerpt'     => get_the_excerpt( $p ),
            'content'     => apply_filters( 'the_content', $p->post_content ),
            'image'       => $thumb ?: '',
            'validUntil'  => get_field( 'promo_valid_until', $p->ID ) ?: '',
            'discount'    => get_field( 'promo_discount', $p->ID ) ?: '',
            'badge'       => get_field( 'promo_badge', $p->ID ) ?: '',
        );
    }
    return rest_ensure_response( $out );
}

/* ── Images (mapping for frontend) ── */
function termburg_api_images() {
    $map = array();
    $attachments = get_posts( array(
        'post_type'      => 'attachment',
        'post_mime_type' => 'image',
        'posts_per_page' => 200,
        'post_status'    => 'inherit',
        'meta_key'       => '_wp_attachment_image_alt',
    ) );
    foreach ( $attachments as $att ) {
        $alt = get_post_meta( $att->ID, '_wp_attachment_image_alt', true );
        if ( $alt ) {
            $map[ $alt ] = wp_get_attachment_image_url( $att->ID, 'full' );
        }
    }
    return rest_ensure_response( $map );
}

/* ── CORS headers for decoupled frontend ── */
add_action( 'rest_api_init', function () {
    remove_filter( 'rest_pre_serve_request', 'rest_send_cors_headers' );
    add_filter( 'rest_pre_serve_request', function ( $value ) {
        $origin = get_http_origin();
        if ( $origin ) {
            header( 'Access-Control-Allow-Origin: ' . esc_url_raw( $origin ) );
        } else {
            header( 'Access-Control-Allow-Origin: *' );
        }
        header( 'Access-Control-Allow-Methods: GET, OPTIONS' );
        header( 'Access-Control-Allow-Headers: Content-Type, Authorization' );
        return $value;
    } );
}, 15 );
