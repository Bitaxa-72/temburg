<?php
/**
 * Termburg Page Content — ACF flexible content + REST endpoint
 *
 * Назначение:
 * Позволяет редактировать через WP-админку текстовые блоки страниц фронтенда
 * (About, Pricing, Rules, Family и т.д.) — то, что раньше было зашито в JS.
 *
 * Куда положить:
 *   wp-content/themes/termoistochnik/includes/termburg-page-content.php
 *
 * Подключить в functions.php темы:
 *   require_once get_stylesheet_directory() . '/includes/termburg-page-content.php';
 *
 * Что появится в админке:
 *   Меню «Контент страниц» → Выбрать страницу (about/pricing/rules/...) → Блоки контента
 *   Каждый блок: тип (text/heading/image/list/note) + поля
 *
 * REST endpoint:
 *   GET https://termburg.ru/wp-json/termburg/v1/page-content/{slug}
 *   Возвращает: { slug, title, metaDescription, blocks: [...] }
 *
 * Фронт уже подключён:
 *   src/api/wordpress.ts — api.getPageContent(slug)
 *   src/hooks/useWordPressData.ts — usePageContent(slug)
 *
 * Использование на странице (на примере AboutPage):
 *   const { data: pageContent } = usePageContent('about');
 *   {pageContent?.blocks?.length > 0 ? (
 *     pageContent.blocks.map((b, i) => <ContentBlock key={i} block={b} />)
 *   ) : (
 *     // Fallback на текущий хардкод
 *   )}
 */

if (!defined('ABSPATH')) {
    exit;
}

// ============================================================================
// 1. Регистрация ACF Options Page «Контент страниц»
// ============================================================================
add_action('acf/init', function () {
    if (!function_exists('acf_add_options_page')) return;

    acf_add_options_page([
        'page_title' => 'Контент страниц',
        'menu_title' => 'Контент страниц',
        'menu_slug'  => 'termburg-page-content',
        'capability' => 'edit_posts',
        'icon_url'   => 'dashicons-edit-page',
        'position'   => 21,
        'redirect'   => false,
    ]);
});

// ============================================================================
// 2. Регистрация ACF полей (через PHP — переносимо, без зависимости от UI)
// ============================================================================
add_action('acf/init', function () {
    if (!function_exists('acf_add_local_field_group')) return;

    acf_add_local_field_group([
        'key'    => 'group_termburg_page_content',
        'title'  => 'Контент страниц',
        'fields' => [
            [
                'key'          => 'field_termburg_pages',
                'label'        => 'Страницы',
                'name'         => 'termburg_pages',
                'type'         => 'repeater',
                'instructions' => 'Добавьте страницу и заполните её блоки. Slug должен совпадать с маршрутом фронта без слешей: about, pricing, rules, family, etc.',
                'collapsed'    => 'field_termburg_page_slug',
                'min'          => 0,
                'layout'       => 'block',
                'button_label' => 'Добавить страницу',
                'sub_fields'   => [
                    [
                        'key'      => 'field_termburg_page_slug',
                        'label'    => 'Slug страницы',
                        'name'     => 'slug',
                        'type'     => 'select',
                        'required' => 1,
                        'choices'  => [
                            'home'            => 'home — Главная',
                            'about'           => 'about — О Термбурге',
                            'termliny'        => 'termliny — Термлины',
                            'services'        => 'services — Услуги',
                            'steam-rooms'     => 'steam-rooms — Парные',
                            'pools'           => 'pools — Бассейны',
                            'jacuzzi'         => 'jacuzzi — Джакузи',
                            'plunge-pools'    => 'plunge-pools — Купели',
                            'family'          => 'family — Семейный отдых',
                            'cafe'            => 'cafe — Кафетерий',
                            'swimming-school' => 'swimming-school — Школа плавания',
                            'steam-school'    => 'steam-school — Школа парения',
                            'pricing'         => 'pricing — Цены',
                            'promotions'      => 'promotions — Акции',
                            'schedule'        => 'schedule — Расписание',
                            'news'            => 'news — Новости',
                            'gallery'         => 'gallery — Галерея',
                            'faq'             => 'faq — FAQ',
                            'rules'           => 'rules — Правила посещения',
                            'map'             => 'map — Карта',
                            'contacts'        => 'contacts — Контакты',
                            'corporate'       => 'corporate — Корпоративный отдых',
                            'partners'        => 'partners — Партнёры',
                            'careers'         => 'careers — Вакансии',
                            'offer'           => 'offer — Договор-оферта',
                            'privacy'         => 'privacy — Политика конфиденциальности',
                            'login'           => 'login — Вход',
                            'account'         => 'account — Личный кабинет',
                        ],
                    ],
                    [
                        'key'   => 'field_termburg_page_title',
                        'label' => 'Заголовок страницы (H1)',
                        'name'  => 'page_title',
                        'type'  => 'text',
                    ],
                    [
                        'key'   => 'field_termburg_page_meta_desc',
                        'label' => 'Meta description',
                        'name'  => 'meta_description',
                        'type'  => 'textarea',
                        'rows'  => 2,
                        'instructions' => 'Рекомендуется 140–170 символов. Используется в SEO.',
                    ],
                    [
                        'key'          => 'field_termburg_page_blocks',
                        'label'        => 'Блоки контента',
                        'name'         => 'blocks',
                        'type'         => 'flexible_content',
                        'button_label' => 'Добавить блок',
                        'layouts'      => [
                            'layout_text' => [
                                'key'        => 'layout_termburg_text',
                                'name'       => 'text',
                                'label'      => 'Текстовый блок',
                                'sub_fields' => [
                                    [
                                        'key'   => 'field_termburg_text_heading',
                                        'label' => 'Заголовок (опционально)',
                                        'name'  => 'heading',
                                        'type'  => 'text',
                                    ],
                                    [
                                        'key'      => 'field_termburg_text_body',
                                        'label'    => 'Текст',
                                        'name'     => 'body',
                                        'type'     => 'wysiwyg',
                                        'tabs'     => 'visual',
                                        'toolbar'  => 'basic',
                                        'media_upload' => 0,
                                    ],
                                ],
                            ],
                            'layout_heading' => [
                                'key'        => 'layout_termburg_heading',
                                'name'       => 'heading',
                                'label'      => 'Заголовок',
                                'sub_fields' => [
                                    [
                                        'key'   => 'field_termburg_h_text',
                                        'label' => 'Текст заголовка',
                                        'name'  => 'heading',
                                        'type'  => 'text',
                                    ],
                                ],
                            ],
                            'layout_image' => [
                                'key'        => 'layout_termburg_image',
                                'name'       => 'image',
                                'label'      => 'Изображение',
                                'sub_fields' => [
                                    [
                                        'key'           => 'field_termburg_img_url',
                                        'label'         => 'Изображение',
                                        'name'          => 'image',
                                        'type'          => 'image',
                                        'return_format' => 'url',
                                    ],
                                    [
                                        'key'   => 'field_termburg_img_alt',
                                        'label' => 'Alt-текст',
                                        'name'  => 'heading',
                                        'type'  => 'text',
                                    ],
                                ],
                            ],
                            'layout_list' => [
                                'key'        => 'layout_termburg_list',
                                'name'       => 'list',
                                'label'      => 'Список',
                                'sub_fields' => [
                                    [
                                        'key'   => 'field_termburg_list_heading',
                                        'label' => 'Заголовок (опционально)',
                                        'name'  => 'heading',
                                        'type'  => 'text',
                                    ],
                                    [
                                        'key'          => 'field_termburg_list_items',
                                        'label'        => 'Пункты',
                                        'name'         => 'items',
                                        'type'         => 'repeater',
                                        'min'          => 1,
                                        'button_label' => 'Добавить пункт',
                                        'sub_fields'   => [
                                            [
                                                'key'   => 'field_termburg_list_item',
                                                'label' => 'Текст',
                                                'name'  => 'item',
                                                'type'  => 'text',
                                            ],
                                        ],
                                    ],
                                ],
                            ],
                            'layout_note' => [
                                'key'        => 'layout_termburg_note',
                                'name'       => 'note',
                                'label'      => 'Заметка / Предупреждение',
                                'sub_fields' => [
                                    [
                                        'key'   => 'field_termburg_note_body',
                                        'label' => 'Текст заметки',
                                        'name'  => 'body',
                                        'type'  => 'textarea',
                                        'rows'  => 3,
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ],
        'location' => [[[
            'param'    => 'options_page',
            'operator' => '==',
            'value'    => 'termburg-page-content',
        ]]],
    ]);
});

// ============================================================================
// 3. REST endpoint: /wp-json/termburg/v1/page-content/{slug}
// ============================================================================
add_action('rest_api_init', function () {
    register_rest_route('termburg/v1', '/page-content/(?P<slug>[a-z0-9-]+)', [
        'methods'  => 'GET',
        'callback' => 'termburg_get_page_content',
        'permission_callback' => '__return_true',
        'args' => [
            'slug' => [
                'required' => true,
                'type'     => 'string',
                'sanitize_callback' => 'sanitize_title',
            ],
        ],
    ]);
});

function termburg_get_page_content($request) {
    $slug = $request['slug'];

    if (!function_exists('get_field')) {
        return new WP_Error('no_acf', 'ACF не установлен', ['status' => 500]);
    }

    $pages = get_field('termburg_pages', 'option');
    if (!is_array($pages)) {
        return ['slug' => $slug, 'blocks' => []];
    }

    $found = null;
    foreach ($pages as $page) {
        if (($page['slug'] ?? '') === $slug) {
            $found = $page;
            break;
        }
    }

    if (!$found) {
        return ['slug' => $slug, 'blocks' => []];
    }

    // Преобразуем ACF flexible content в чистый JSON для фронта
    $blocks = [];
    if (!empty($found['blocks']) && is_array($found['blocks'])) {
        foreach ($found['blocks'] as $b) {
            $type = $b['acf_fc_layout'] ?? 'text';
            $entry = ['type' => $type];

            if (!empty($b['heading'])) $entry['heading'] = $b['heading'];
            if (!empty($b['body']))    $entry['body']    = $b['body'];
            if (!empty($b['image']))   $entry['image']   = $b['image'];

            // Список — собрать items в плоский массив
            if ($type === 'list' && !empty($b['items']) && is_array($b['items'])) {
                $items = [];
                foreach ($b['items'] as $it) {
                    if (!empty($it['item'])) $items[] = $it['item'];
                }
                $entry['items'] = $items;
            }

            $blocks[] = $entry;
        }
    }

    return [
        'slug'            => $slug,
        'title'           => $found['page_title'] ?? '',
        'metaDescription' => $found['meta_description'] ?? '',
        'blocks'          => $blocks,
    ];
}
