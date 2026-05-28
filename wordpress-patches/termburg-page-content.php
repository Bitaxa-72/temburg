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
// 0. Legal pages live inside the main "Термбург" admin menu
// ============================================================================
function termburg_legal_content_pages_config() {
    return [
        'offer' => [
            'menu_title'       => 'Оферта',
            'page_title'       => 'Публичная оферта',
            'menu_slug'        => 'termburg-offer',
            'field_prefix'     => 'tb_offer',
            'field_key_prefix' => 'field_tb_offer',
            'group_key'        => 'group_tb_offer_page_content',
            'meta_description' => 'Публичная оферта на оказание услуг термального комплекса Термбург. Условия посещения, порядок оплаты, права и обязанности сторон.',
        ],
        'privacy' => [
            'menu_title'       => 'Политика конфиденциальности',
            'page_title'       => 'Политика конфиденциальности',
            'menu_slug'        => 'termburg-privacy',
            'field_prefix'     => 'tb_privacy',
            'field_key_prefix' => 'field_tb_privacy',
            'group_key'        => 'group_tb_privacy_page_content',
            'meta_description' => 'Политика конфиденциальности термального комплекса Термбург. Обработка и защита персональных данных в соответствии с 152-ФЗ.',
        ],
        'rules' => [
            'menu_title'       => 'Страница правил',
            'page_title'       => 'Правила комплекса',
            'menu_slug'        => 'termburg-rules-page',
            'field_prefix'     => 'tb_rules_page',
            'field_key_prefix' => 'field_tb_rules_page',
            'group_key'        => 'group_tb_rules_page_content',
            'meta_description' => 'Правила посещения термального комплекса Термбург: полный список требований безопасности, условий посещения и поведения гостей.',
        ],
    ];
}

add_action('acf/init', 'termburg_register_legal_content_options_pages');
function termburg_register_legal_content_options_pages() {
    if (!function_exists('acf_add_options_sub_page')) {
        return;
    }

    foreach (termburg_legal_content_pages_config() as $config) {
        acf_add_options_sub_page([
            'page_title'  => $config['page_title'],
            'menu_title'  => $config['menu_title'],
            'menu_slug'   => $config['menu_slug'],
            'parent_slug' => 'termburg-settings',
        ]);
    }
}

add_action('acf/init', 'termburg_register_legal_content_field_groups');
function termburg_register_legal_content_field_groups() {
    if (!function_exists('acf_add_local_field_group')) {
        return;
    }

    foreach (termburg_legal_content_pages_config() as $config) {
        $prefix = $config['field_prefix'];
        $key_prefix = $config['field_key_prefix'];

        acf_add_local_field_group([
            'key'    => $config['group_key'],
            'title'  => $config['page_title'],
            'fields' => [
                [
                    'key'           => "{$key_prefix}_page_title",
                    'label'         => 'Заголовок страницы (H1)',
                    'name'          => "{$prefix}_page_title",
                    'type'          => 'text',
                    'default_value' => $config['page_title'],
                ],
                [
                    'key'           => "{$key_prefix}_meta_description",
                    'label'         => 'Meta description',
                    'name'          => "{$prefix}_meta_description",
                    'type'          => 'textarea',
                    'rows'          => 2,
                    'instructions'  => 'Рекомендуется 140–170 символов. Используется в SEO.',
                    'default_value' => $config['meta_description'],
                ],
                [
                    'key'          => "{$key_prefix}_blocks",
                    'label'        => 'Блоки контента страницы',
                    'name'         => "{$prefix}_blocks",
                    'type'         => 'flexible_content',
                    'button_label' => 'Добавить блок',
                    'layouts'      => termburg_legal_content_acf_layouts($key_prefix),
                ],
            ],
            'location' => [[[
                'param'    => 'options_page',
                'operator' => '==',
                'value'    => $config['menu_slug'],
            ]]],
        ]);
    }
}

add_action('acf/init', 'termburg_register_careers_content_options_page');
function termburg_register_careers_content_options_page() {
    if (!function_exists('acf_add_options_sub_page')) {
        return;
    }

    acf_add_options_sub_page([
        'page_title'  => 'Страница вакансий',
        'menu_title'  => 'Страница вакансий',
        'menu_slug'   => 'termburg-careers-page',
        'parent_slug' => 'termburg-settings',
    ]);
}

add_action('acf/init', 'termburg_register_careers_content_field_group');
function termburg_register_careers_content_field_group() {
    if (!function_exists('acf_add_local_field_group')) {
        return;
    }

    acf_add_local_field_group([
        'key'    => 'group_tb_careers_page_content',
        'title'  => 'Страница вакансий',
        'fields' => [
            [
                'key'   => 'field_tb_careers_tab_seo',
                'label' => 'SEO и первый экран',
                'type'  => 'tab',
            ],
            [
                'key'           => 'field_tb_careers_page_title',
                'label'         => 'Заголовок страницы',
                'name'          => 'tb_careers_page_title',
                'type'          => 'text',
                'default_value' => 'Работа в Термбурге',
            ],
            [
                'key'           => 'field_tb_careers_meta_description',
                'label'         => 'Meta description',
                'name'          => 'tb_careers_meta_description',
                'type'          => 'textarea',
                'rows'          => 2,
                'default_value' => 'Вакансии термального комплекса Термбург в Москве: открытые позиции, условия работы и форма отклика.',
            ],
            [
                'key'           => 'field_tb_careers_hero_title',
                'label'         => 'Hero: заголовок',
                'name'          => 'tb_careers_hero_title',
                'type'          => 'text',
                'default_value' => 'Работа в Термбурге',
            ],
            [
                'key'           => 'field_tb_careers_hero_subtitle',
                'label'         => 'Hero: подзаголовок',
                'name'          => 'tb_careers_hero_subtitle',
                'type'          => 'text',
                'default_value' => 'Присоединяйтесь к нашей команде',
            ],
            [
                'key'   => 'field_tb_careers_tab_blocks',
                'label' => 'Контент страницы',
                'type'  => 'tab',
            ],
            [
                'key'          => 'field_tb_careers_blocks',
                'label'        => 'Блоки контента после первого экрана',
                'name'         => 'tb_careers_blocks',
                'type'         => 'flexible_content',
                'button_label' => 'Добавить блок',
                'layouts'      => termburg_legal_content_acf_layouts('field_tb_careers'),
            ],
            [
                'key'          => 'field_tb_careers_stats',
                'label'        => 'Статистика',
                'name'         => 'tb_careers_stats',
                'type'         => 'repeater',
                'layout'       => 'table',
                'button_label' => 'Добавить показатель',
                'sub_fields'   => [
                    [
                        'key'   => 'field_tb_careers_stat_value',
                        'label' => 'Значение',
                        'name'  => 'value',
                        'type'  => 'text',
                    ],
                    [
                        'key'   => 'field_tb_careers_stat_label',
                        'label' => 'Подпись',
                        'name'  => 'label',
                        'type'  => 'text',
                    ],
                ],
            ],
            [
                'key'          => 'field_tb_careers_benefits',
                'label'        => 'Преимущества работы',
                'name'         => 'tb_careers_benefits',
                'type'         => 'repeater',
                'layout'       => 'block',
                'button_label' => 'Добавить преимущество',
                'sub_fields'   => [
                    [
                        'key'     => 'field_tb_careers_benefit_icon',
                        'label'   => 'Иконка',
                        'name'    => 'icon',
                        'type'    => 'select',
                        'choices' => [
                            'graduation' => 'Обучение',
                            'briefcase'  => 'Карьера',
                            'users'      => 'Команда',
                            'party'      => 'Корпоративы',
                        ],
                    ],
                    [
                        'key'   => 'field_tb_careers_benefit_title',
                        'label' => 'Заголовок',
                        'name'  => 'title',
                        'type'  => 'text',
                    ],
                    [
                        'key'   => 'field_tb_careers_benefit_text',
                        'label' => 'Текст',
                        'name'  => 'text',
                        'type'  => 'textarea',
                        'rows'  => 2,
                    ],
                ],
            ],
            [
                'key'   => 'field_tb_careers_tab_vacancies',
                'label' => 'Открытые вакансии',
                'type'  => 'tab',
            ],
            [
                'key'           => 'field_tb_careers_vacancies_title',
                'label'         => 'Заголовок секции',
                'name'          => 'tb_careers_vacancies_title',
                'type'          => 'text',
                'default_value' => 'Наши вакансии',
            ],
            [
                'key'           => 'field_tb_careers_vacancies_subtitle',
                'label'         => 'Подзаголовок секции',
                'name'          => 'tb_careers_vacancies_subtitle',
                'type'          => 'text',
                'default_value' => 'Открытые позиции в команде Термбурга',
            ],
            [
                'key'          => 'field_tb_careers_vacancies',
                'label'        => 'Карточки вакансий',
                'name'         => 'tb_careers_vacancies',
                'type'         => 'repeater',
                'layout'       => 'block',
                'button_label' => 'Добавить вакансию',
                'sub_fields'   => [
                    [
                        'key'   => 'field_tb_careers_vacancy_title',
                        'label' => 'Название вакансии',
                        'name'  => 'title',
                        'type'  => 'text',
                    ],
                    [
                        'key'   => 'field_tb_careers_vacancy_schedule',
                        'label' => 'График',
                        'name'  => 'schedule',
                        'type'  => 'text',
                    ],
                    [
                        'key'   => 'field_tb_careers_vacancy_salary',
                        'label' => 'Доход',
                        'name'  => 'salary',
                        'type'  => 'text',
                    ],
                    [
                        'key'   => 'field_tb_careers_vacancy_employment',
                        'label' => 'Условия оформления',
                        'name'  => 'employment',
                        'type'  => 'text',
                    ],
                    [
                        'key'           => 'field_tb_careers_vacancy_tasks_title',
                        'label'         => 'Заголовок списка задач',
                        'name'          => 'tasks_title',
                        'type'          => 'text',
                        'default_value' => 'Задачи, которые у тебя будут:',
                    ],
                    [
                        'key'          => 'field_tb_careers_vacancy_tasks',
                        'label'        => 'Задачи',
                        'name'         => 'tasks',
                        'type'         => 'repeater',
                        'layout'       => 'table',
                        'button_label' => 'Добавить задачу',
                        'sub_fields'   => [
                            [
                                'key'   => 'field_tb_careers_vacancy_task',
                                'label' => 'Текст',
                                'name'  => 'text',
                                'type'  => 'text',
                            ],
                        ],
                    ],
                    [
                        'key'          => 'field_tb_careers_vacancy_perks',
                        'label'        => 'Плашки условий',
                        'name'         => 'perks',
                        'type'         => 'repeater',
                        'layout'       => 'table',
                        'button_label' => 'Добавить плашку',
                        'sub_fields'   => [
                            [
                                'key'   => 'field_tb_careers_vacancy_perk',
                                'label' => 'Текст',
                                'name'  => 'text',
                                'type'  => 'text',
                            ],
                        ],
                    ],
                    [
                        'key'           => 'field_tb_careers_vacancy_button',
                        'label'         => 'Текст кнопки',
                        'name'          => 'button_label',
                        'type'          => 'text',
                        'default_value' => 'Откликнуться',
                    ],
                ],
            ],
            [
                'key'   => 'field_tb_careers_tab_apply',
                'label' => 'Форма и нижний CTA',
                'type'  => 'tab',
            ],
            [
                'key'           => 'field_tb_careers_apply_title',
                'label'         => 'Заголовок секции формы',
                'name'          => 'tb_careers_apply_title',
                'type'          => 'text',
                'default_value' => 'Оставить заявку',
            ],
            [
                'key'           => 'field_tb_careers_form_title',
                'label'         => 'Заголовок формы',
                'name'          => 'tb_careers_form_title',
                'type'          => 'text',
                'default_value' => 'Хотите работать у нас?',
            ],
            [
                'key'           => 'field_tb_careers_form_text',
                'label'         => 'Текст формы',
                'name'          => 'tb_careers_form_text',
                'type'          => 'textarea',
                'rows'          => 2,
                'default_value' => 'Заполните форму, и мы свяжемся с вами.',
            ],
            [
                'key'           => 'field_tb_careers_success_title',
                'label'         => 'Заголовок успешной отправки',
                'name'          => 'tb_careers_success_title',
                'type'          => 'text',
                'default_value' => 'Заявка отправлена!',
            ],
            [
                'key'           => 'field_tb_careers_success_text',
                'label'         => 'Текст успешной отправки',
                'name'          => 'tb_careers_success_text',
                'type'          => 'text',
                'default_value' => 'Мы свяжемся с вами.',
            ],
            [
                'key'           => 'field_tb_careers_direct_title',
                'label'         => 'Нижний CTA: заголовок',
                'name'          => 'tb_careers_direct_title',
                'type'          => 'text',
                'default_value' => 'Напишите нам напрямую',
            ],
            [
                'key'           => 'field_tb_careers_direct_text',
                'label'         => 'Нижний CTA: текст',
                'name'          => 'tb_careers_direct_text',
                'type'          => 'textarea',
                'rows'          => 2,
                'default_value' => 'Отправьте резюме на почту — мы рассмотрим вашу кандидатуру.',
            ],
            [
                'key'           => 'field_tb_careers_direct_email',
                'label'         => 'Email для резюме',
                'name'          => 'tb_careers_direct_email',
                'type'          => 'email',
                'default_value' => 'info@termburg.ru',
            ],
        ],
        'location' => [[[
            'param'    => 'options_page',
            'operator' => '==',
            'value'    => 'termburg-careers-page',
        ]]],
    ]);
}

function termburg_legal_content_acf_layouts($key_prefix) {
    return [
        'layout_text' => [
            'key'        => "{$key_prefix}_layout_text",
            'name'       => 'text',
            'label'      => 'Текстовый блок',
            'sub_fields' => [
                [
                    'key'   => "{$key_prefix}_text_heading",
                    'label' => 'Заголовок (опционально)',
                    'name'  => 'heading',
                    'type'  => 'text',
                ],
                [
                    'key'          => "{$key_prefix}_text_body",
                    'label'        => 'Текст',
                    'name'         => 'body',
                    'type'         => 'wysiwyg',
                    'tabs'         => 'visual',
                    'toolbar'      => 'basic',
                    'media_upload' => 0,
                ],
            ],
        ],
        'layout_heading' => [
            'key'        => "{$key_prefix}_layout_heading",
            'name'       => 'heading',
            'label'      => 'Заголовок',
            'sub_fields' => [
                [
                    'key'   => "{$key_prefix}_heading_text",
                    'label' => 'Текст заголовка',
                    'name'  => 'heading',
                    'type'  => 'text',
                ],
            ],
        ],
        'layout_list' => [
            'key'        => "{$key_prefix}_layout_list",
            'name'       => 'list',
            'label'      => 'Список',
            'sub_fields' => [
                [
                    'key'   => "{$key_prefix}_list_heading",
                    'label' => 'Заголовок (опционально)',
                    'name'  => 'heading',
                    'type'  => 'text',
                ],
                [
                    'key'          => "{$key_prefix}_list_items",
                    'label'        => 'Пункты',
                    'name'         => 'items',
                    'type'         => 'repeater',
                    'min'          => 1,
                    'button_label' => 'Добавить пункт',
                    'sub_fields'   => [
                        [
                            'key'   => "{$key_prefix}_list_item",
                            'label' => 'Текст',
                            'name'  => 'item',
                            'type'  => 'text',
                        ],
                    ],
                ],
            ],
        ],
        'layout_note' => [
            'key'        => "{$key_prefix}_layout_note",
            'name'       => 'note',
            'label'      => 'Заметка / Предупреждение',
            'sub_fields' => [
                [
                    'key'   => "{$key_prefix}_note_body",
                    'label' => 'Текст заметки',
                    'name'  => 'body',
                    'type'  => 'textarea',
                    'rows'  => 3,
                ],
            ],
        ],
    ];
}

// ============================================================================
// 1. Регистрация ACF Options Page «Контент страниц»
// ============================================================================
add_action('acf/init', function () {
    if (!function_exists('acf_add_options_sub_page')) return;

    acf_add_options_sub_page([
        'page_title' => 'Контент страниц',
        'menu_title' => 'Контент страниц',
        'menu_slug'  => 'termburg-page-content',
        'capability' => 'edit_posts',
        'parent_slug' => 'termburg-settings',
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

    if ($slug === 'careers') {
        return termburg_get_careers_page_content();
    }

    $legal_config = termburg_legal_content_pages_config();
    if (isset($legal_config[$slug])) {
        return termburg_get_legal_page_content($slug);
    }

    $pages = get_field('termburg_pages', 'option');
    if (!is_array($pages)) {
        $pages = [];
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

    return [
        'slug'            => $slug,
        'title'           => $found['page_title'] ?? '',
        'metaDescription' => $found['meta_description'] ?? '',
        'blocks'          => termburg_normalize_page_content_blocks($found['blocks'] ?? []),
    ];
}

function termburg_get_careers_page_content() {
    $defaults = termburg_careers_page_defaults();

    $blocks = termburg_careers_repeater_or_default('tb_careers_blocks', $defaults['blocks']);
    $blocks = termburg_page_content_apply_site_context(
        termburg_page_blocks_to_names($blocks, 'field_tb_careers')
    );

    $stats = termburg_careers_repeater_or_default('tb_careers_stats', $defaults['careers']['stats']);
    $benefits = termburg_careers_repeater_or_default('tb_careers_benefits', $defaults['careers']['benefits']);
    $vacancies = termburg_careers_repeater_or_default('tb_careers_vacancies', $defaults['careers']['vacancies']);

    $careers = [
        'pageTitle'         => termburg_page_content_option('tb_careers_page_title', $defaults['title']),
        'heroTitle'         => termburg_page_content_option('tb_careers_hero_title', $defaults['careers']['heroTitle']),
        'heroSubtitle'      => termburg_page_content_option('tb_careers_hero_subtitle', $defaults['careers']['heroSubtitle']),
        'stats'             => termburg_normalize_careers_stats($stats),
        'benefits'          => termburg_normalize_careers_benefits($benefits),
        'vacanciesTitle'    => termburg_page_content_option('tb_careers_vacancies_title', $defaults['careers']['vacanciesTitle']),
        'vacanciesSubtitle' => termburg_page_content_option('tb_careers_vacancies_subtitle', $defaults['careers']['vacanciesSubtitle']),
        'vacancies'         => termburg_normalize_careers_vacancies($vacancies),
        'applyTitle'        => termburg_page_content_option('tb_careers_apply_title', $defaults['careers']['applyTitle']),
        'formTitle'         => termburg_page_content_option('tb_careers_form_title', $defaults['careers']['formTitle']),
        'formText'          => termburg_page_content_option('tb_careers_form_text', $defaults['careers']['formText']),
        'successTitle'      => termburg_page_content_option('tb_careers_success_title', $defaults['careers']['successTitle']),
        'successText'       => termburg_page_content_option('tb_careers_success_text', $defaults['careers']['successText']),
        'directTitle'       => termburg_page_content_option('tb_careers_direct_title', $defaults['careers']['directTitle']),
        'directText'        => termburg_page_content_option('tb_careers_direct_text', $defaults['careers']['directText']),
        'directEmail'       => termburg_page_content_option('tb_careers_direct_email', $defaults['careers']['directEmail']),
    ];

    $careers = termburg_page_content_apply_site_context($careers);

    return [
        'slug'            => 'careers',
        'title'           => termburg_page_content_apply_site_context(termburg_page_content_option('tb_careers_page_title', $defaults['title'])),
        'metaDescription' => termburg_page_content_apply_site_context(termburg_page_content_option('tb_careers_meta_description', $defaults['metaDescription'])),
        'blocks'          => termburg_normalize_page_content_blocks($blocks),
        'careers'         => $careers,
    ];
}

function termburg_careers_repeater_or_default($field_name, $default) {
    $value = function_exists('get_field') ? get_field($field_name, 'option') : null;
    if (is_array($value)) {
        return $value;
    }

    $stored = get_option("options_{$field_name}", '__tb_missing__');
    if ($stored === '__tb_missing__' || $stored === false || $stored === '') {
        return $default;
    }

    return [];
}

function termburg_normalize_careers_stats($items) {
    $out = [];
    if (!is_array($items)) {
        return $out;
    }

    foreach ($items as $item) {
        if (!is_array($item)) {
            continue;
        }

        $value = trim((string) ($item['value'] ?? ''));
        $label = trim((string) ($item['label'] ?? ''));
        if ($value === '' || $label === '') {
            continue;
        }

        $out[] = [
            'value' => $value,
            'label' => $label,
        ];
    }

    return $out;
}

function termburg_normalize_careers_benefits($items) {
    $out = [];
    if (!is_array($items)) {
        return $out;
    }

    foreach ($items as $item) {
        if (!is_array($item)) {
            continue;
        }

        $title = trim((string) ($item['title'] ?? ''));
        $text = trim((string) ($item['text'] ?? ''));
        if ($title === '' && $text === '') {
            continue;
        }

        $out[] = [
            'icon'  => trim((string) ($item['icon'] ?? 'briefcase')),
            'title' => $title,
            'text'  => $text,
        ];
    }

    return $out;
}

function termburg_normalize_careers_vacancies($items) {
    $out = [];
    if (!is_array($items)) {
        return $out;
    }

    foreach ($items as $item) {
        if (!is_array($item)) {
            continue;
        }

        $title = trim((string) ($item['title'] ?? ''));
        if ($title === '') {
            continue;
        }

        $out[] = [
            'title'       => $title,
            'schedule'    => trim((string) ($item['schedule'] ?? '')),
            'salary'      => trim((string) ($item['salary'] ?? '')),
            'employment'  => trim((string) ($item['employment'] ?? '')),
            'tasksTitle'  => trim((string) ($item['tasks_title'] ?? '')),
            'tasks'       => termburg_careers_text_rows($item['tasks'] ?? []),
            'perks'       => termburg_careers_text_rows($item['perks'] ?? []),
            'buttonLabel' => trim((string) ($item['button_label'] ?? 'Откликнуться')),
        ];
    }

    return $out;
}

function termburg_careers_text_rows($items) {
    $out = [];
    if (!is_array($items)) {
        return $out;
    }

    foreach ($items as $item) {
        if (is_array($item)) {
            $text = trim((string) ($item['text'] ?? $item['item'] ?? ''));
        } else {
            $text = trim((string) $item);
        }

        if ($text !== '') {
            $out[] = $text;
        }
    }

    return $out;
}

function termburg_get_legal_page_content($slug) {
    $config = termburg_legal_content_pages_config()[$slug];
    $defaults = termburg_legal_page_content_defaults()[$slug];
    $prefix = $config['field_prefix'];

    $title = termburg_page_content_option("{$prefix}_page_title", $defaults['page_title']);
    $meta = termburg_page_content_option("{$prefix}_meta_description", $defaults['meta_description']);
    $blocks = get_field("{$prefix}_blocks", 'option');

    if (!termburg_page_content_blocks_have_content($blocks)) {
        $blocks = $defaults['blocks'];
    }

    $blocks = termburg_page_content_apply_site_context(
        termburg_legal_page_blocks_to_names($blocks, $slug)
    );

    return [
        'slug'            => $slug,
        'title'           => termburg_page_content_apply_site_context($title),
        'metaDescription' => termburg_page_content_apply_site_context($meta),
        'blocks'          => termburg_normalize_page_content_blocks($blocks),
    ];
}

function termburg_page_content_option($key, $fallback = '') {
    $value = function_exists('get_field') ? get_field($key, 'option') : null;
    if ($value === null || $value === false || $value === '') {
        $value = get_option("options_{$key}");
    }
    return ($value === null || $value === false || $value === '') ? $fallback : $value;
}

function termburg_page_content_site_value($key, $fallback = '') {
    if (function_exists('termburg_theme_option')) {
        return termburg_theme_option($key, $fallback);
    }

    $value = function_exists('get_field') ? get_field($key, 'option') : null;
    if ($value === null || $value === false || $value === '') {
        $value = get_option("options_{$key}");
    }

    return ($value === null || $value === false || $value === '') ? $fallback : $value;
}

function termburg_page_content_site_context() {
    $site_url = termburg_page_content_site_value('tb_site_domain', 'https://termburg.ru');
    $site_label = termburg_page_content_site_value('tb_site_label', '');

    if ($site_label === '') {
        $site_label = parse_url($site_url, PHP_URL_HOST);
        if (!$site_label) {
            $site_label = preg_replace('#^https?://#', '', $site_url);
        }
    }

    return [
        'site_url'            => rtrim($site_url, '/'),
        'site_label'          => $site_label ?: 'termburg.ru',
        'public_email'        => termburg_page_content_site_value('tb_email', 'info@termburg.ru'),
        'legal_email'         => termburg_page_content_site_value('tb_legal_email', termburg_page_content_site_value('tb_email', 'info@termburg.ru')),
        'legal_company_name'  => termburg_page_content_site_value('tb_legal_company_name', 'ООО «ТЕРМБУРГ»'),
        'legal_inn'           => termburg_page_content_site_value('tb_legal_inn', '9723159498'),
        'legal_ogrn'          => termburg_page_content_site_value('tb_legal_ogrn', '1237700686002'),
        'public_address'      => termburg_page_content_site_value('tb_address', 'г. Москва, ул. Гурьянова, д. 30, 2 этаж'),
        'legal_address'       => termburg_page_content_site_value('tb_legal_address', termburg_page_content_site_value('tb_address', 'г. Москва, ул. Гурьянова, д. 30, 2 этаж')),
        'certificate_address' => termburg_page_content_site_value('tb_certificate_address', termburg_page_content_site_value('tb_address', 'г. Москва, ул. Гурьянова, д. 30, 2 этаж')),
    ];
}

function termburg_page_content_apply_site_context($value) {
    if (is_array($value)) {
        foreach ($value as $key => $item) {
            $value[$key] = termburg_page_content_apply_site_context($item);
        }
        return $value;
    }

    if (!is_string($value) || $value === '') {
        return $value;
    }

    $ctx = termburg_page_content_site_context();
    return str_replace(
        [
            'https://termburg.ru',
            'info@termburg.ru',
            'termburg.ru',
            'ООО «ТЕРМБУРГ»',
            '9723159498',
            '1237700686002',
            'г. Москва, ул. Гурьянова, д. 30, 2 этаж',
            'г. Москва, ул. Гурьянова, д. 30',
            'Москва, ул. Гурьянова 30, Серф Плаза, 2 этаж, м. Печатники',
            'ул. Гурьянова, д. 30',
        ],
        [
            $ctx['site_url'],
            $ctx['legal_email'],
            $ctx['site_label'],
            $ctx['legal_company_name'],
            $ctx['legal_inn'],
            $ctx['legal_ogrn'],
            $ctx['legal_address'],
            $ctx['legal_address'],
            $ctx['public_address'],
            $ctx['certificate_address'],
        ],
        $value
    );
}

function termburg_legal_page_blocks_to_names($blocks, $slug) {
    $configs = termburg_legal_content_pages_config();
    if (empty($configs[$slug]) || !is_array($blocks)) {
        return $blocks;
    }

    return termburg_page_blocks_to_names($blocks, $configs[$slug]['field_key_prefix']);
}

function termburg_page_blocks_to_names($blocks, $key_prefix) {
    if (!is_array($blocks)) {
        return $blocks;
    }

    $out = [];

    foreach ($blocks as $block) {
        if (!is_array($block)) {
            continue;
        }

        $layout = $block['acf_fc_layout'] ?? 'text';
        $row = $block;

        if ($layout === 'text') {
            if (empty($row['heading']) && isset($block["{$key_prefix}_text_heading"])) {
                $row['heading'] = $block["{$key_prefix}_text_heading"];
            }
            if (empty($row['body']) && isset($block["{$key_prefix}_text_body"])) {
                $row['body'] = $block["{$key_prefix}_text_body"];
            }
        } elseif ($layout === 'heading') {
            if (empty($row['heading']) && isset($block["{$key_prefix}_heading_text"])) {
                $row['heading'] = $block["{$key_prefix}_heading_text"];
            }
        } elseif ($layout === 'list') {
            if (empty($row['heading']) && isset($block["{$key_prefix}_list_heading"])) {
                $row['heading'] = $block["{$key_prefix}_list_heading"];
            }
            if (empty($row['items']) && isset($block["{$key_prefix}_list_items"]) && is_array($block["{$key_prefix}_list_items"])) {
                $row['items'] = [];
                foreach ($block["{$key_prefix}_list_items"] as $item) {
                    if (is_array($item)) {
                        $row['items'][] = [
                            'item' => $item["{$key_prefix}_list_item"] ?? '',
                        ];
                    }
                }
            }
        } elseif ($layout === 'note') {
            if (empty($row['body']) && isset($block["{$key_prefix}_note_body"])) {
                $row['body'] = $block["{$key_prefix}_note_body"];
            }
        }

        $out[] = $row;
    }

    return $out;
}

function termburg_normalize_page_content_blocks($raw_blocks) {
    $blocks = [];

    if (!is_array($raw_blocks) || empty($raw_blocks)) {
        return $blocks;
    }

    foreach ($raw_blocks as $b) {
        if (!is_array($b)) {
            continue;
        }

        $type = $b['acf_fc_layout'] ?? 'text';
        $entry = ['type' => $type];

        if (!empty($b['heading'])) {
            $entry['heading'] = $b['heading'];
        }
        if (!empty($b['body'])) {
            $entry['body'] = $b['body'];
        }
        if (!empty($b['image'])) {
            $entry['image'] = $b['image'];
        }

        if ($type === 'list' && !empty($b['items']) && is_array($b['items'])) {
            $items = [];
            foreach ($b['items'] as $it) {
                if (is_array($it) && !empty($it['item'])) {
                    $items[] = $it['item'];
                } elseif (is_string($it) && trim($it) !== '') {
                    $items[] = $it;
                }
            }
            $entry['items'] = $items;
        }

        $blocks[] = $entry;
    }

    return $blocks;
}

// ============================================================================
// 4. Safe defaults for legal pages inside the main "Термбург" menu
// ============================================================================
add_filter('acf/load_value/name=tb_offer_blocks', 'termburg_seed_legal_page_blocks_value', 20, 3);
add_filter('acf/load_value/name=tb_privacy_blocks', 'termburg_seed_legal_page_blocks_value', 20, 3);
add_filter('acf/load_value/name=tb_rules_page_blocks', 'termburg_seed_legal_page_blocks_value', 20, 3);
add_action('acf/init', 'termburg_seed_legal_page_content_to_db', 80);
add_action('acf/init', 'termburg_seed_careers_page_content_to_db', 80);

function termburg_seed_legal_page_blocks_value($value, $post_id, $field) {
    if ($post_id !== 'option' && $post_id !== 'options') {
        return $value;
    }

    if (termburg_page_content_blocks_have_content($value)) {
        return $value;
    }

    $slug = termburg_legal_slug_by_blocks_field($field['name'] ?? '');
    if (!$slug) {
        return $value;
    }

    $defaults = termburg_legal_page_content_defaults();
    return termburg_legal_page_blocks_for_acf($slug);
}

function termburg_seed_legal_page_content_to_db() {
    if (!is_admin() || !function_exists('get_field') || !function_exists('update_field')) {
        return;
    }

    $defaults = termburg_legal_page_content_defaults();

    foreach (termburg_legal_content_pages_config() as $slug => $config) {
        $prefix = $config['field_prefix'];
        $key_prefix = $config['field_key_prefix'];

        if (!termburg_page_content_option("{$prefix}_page_title", '')) {
            update_field("{$key_prefix}_page_title", $defaults[$slug]['page_title'], 'option');
        }

        if (!termburg_page_content_option("{$prefix}_meta_description", '')) {
            update_field("{$key_prefix}_meta_description", $defaults[$slug]['meta_description'], 'option');
        }

        $blocks = get_field("{$prefix}_blocks", 'option');
        if (!termburg_page_content_blocks_have_content($blocks)) {
            update_field("{$key_prefix}_blocks", termburg_legal_page_blocks_for_acf($slug), 'option');
        }
    }
}

function termburg_seed_careers_page_content_to_db() {
    if (!is_admin() || !function_exists('update_field')) {
        return;
    }

    $defaults = termburg_careers_page_defaults();
    $fields = [
        'field_tb_careers_page_title'          => ['tb_careers_page_title', $defaults['title']],
        'field_tb_careers_meta_description'    => ['tb_careers_meta_description', $defaults['metaDescription']],
        'field_tb_careers_hero_title'          => ['tb_careers_hero_title', $defaults['careers']['heroTitle']],
        'field_tb_careers_hero_subtitle'       => ['tb_careers_hero_subtitle', $defaults['careers']['heroSubtitle']],
        'field_tb_careers_vacancies_title'     => ['tb_careers_vacancies_title', $defaults['careers']['vacanciesTitle']],
        'field_tb_careers_vacancies_subtitle'  => ['tb_careers_vacancies_subtitle', $defaults['careers']['vacanciesSubtitle']],
        'field_tb_careers_apply_title'         => ['tb_careers_apply_title', $defaults['careers']['applyTitle']],
        'field_tb_careers_form_title'          => ['tb_careers_form_title', $defaults['careers']['formTitle']],
        'field_tb_careers_form_text'           => ['tb_careers_form_text', $defaults['careers']['formText']],
        'field_tb_careers_success_title'       => ['tb_careers_success_title', $defaults['careers']['successTitle']],
        'field_tb_careers_success_text'        => ['tb_careers_success_text', $defaults['careers']['successText']],
        'field_tb_careers_direct_title'        => ['tb_careers_direct_title', $defaults['careers']['directTitle']],
        'field_tb_careers_direct_text'         => ['tb_careers_direct_text', $defaults['careers']['directText']],
        'field_tb_careers_direct_email'        => ['tb_careers_direct_email', $defaults['careers']['directEmail']],
    ];

    foreach ($fields as $field_key => [$field_name, $default]) {
        if (get_option("options_{$field_name}", '__tb_missing__') === '__tb_missing__') {
            update_field($field_key, $default, 'option');
        }
    }

    if (get_option('options_tb_careers_blocks', '__tb_missing__') === '__tb_missing__') {
        update_field('field_tb_careers_blocks', termburg_page_blocks_for_acf($defaults['blocks'], 'field_tb_careers'), 'option');
    }

    if (get_option('options_tb_careers_stats', '__tb_missing__') === '__tb_missing__') {
        update_field('field_tb_careers_stats', $defaults['careers']['stats'], 'option');
    }

    if (get_option('options_tb_careers_benefits', '__tb_missing__') === '__tb_missing__') {
        update_field('field_tb_careers_benefits', $defaults['careers']['benefits'], 'option');
    }

    if (get_option('options_tb_careers_vacancies', '__tb_missing__') === '__tb_missing__') {
        update_field('field_tb_careers_vacancies', $defaults['careers']['vacancies'], 'option');
    }
}

function termburg_legal_page_blocks_for_acf($slug) {
    $configs = termburg_legal_content_pages_config();
    $defaults = termburg_legal_page_content_defaults();

    if (empty($configs[$slug]) || empty($defaults[$slug]['blocks'])) {
        return [];
    }

    $key_prefix = $configs[$slug]['field_key_prefix'];
    $rows = [];

    foreach ($defaults[$slug]['blocks'] as $block) {
        if (!is_array($block)) {
            continue;
        }

        $layout = $block['acf_fc_layout'] ?? 'text';
        $row = ['acf_fc_layout' => $layout];

        if ($layout === 'text') {
            $row["{$key_prefix}_text_heading"] = $block['heading'] ?? '';
            $row["{$key_prefix}_text_body"] = $block['body'] ?? '';
        } elseif ($layout === 'heading') {
            $row["{$key_prefix}_heading_text"] = $block['heading'] ?? '';
        } elseif ($layout === 'list') {
            $row["{$key_prefix}_list_heading"] = $block['heading'] ?? '';
            $row["{$key_prefix}_list_items"] = [];

            if (!empty($block['items']) && is_array($block['items'])) {
                foreach ($block['items'] as $item) {
                    $text = is_array($item) ? ($item['item'] ?? '') : $item;
                    $row["{$key_prefix}_list_items"][] = [
                        "{$key_prefix}_list_item" => $text,
                    ];
                }
            }
        } elseif ($layout === 'note') {
            $row["{$key_prefix}_note_body"] = $block['body'] ?? '';
        }

        $rows[] = $row;
    }

    return $rows;
}

function termburg_page_blocks_for_acf($blocks, $key_prefix) {
    if (!is_array($blocks) || empty($blocks)) {
        return [];
    }

    $rows = [];

    foreach ($blocks as $block) {
        if (!is_array($block)) {
            continue;
        }

        $layout = $block['acf_fc_layout'] ?? 'text';
        $row = ['acf_fc_layout' => $layout];

        if ($layout === 'text') {
            $row["{$key_prefix}_text_heading"] = $block['heading'] ?? '';
            $row["{$key_prefix}_text_body"] = $block['body'] ?? '';
        } elseif ($layout === 'heading') {
            $row["{$key_prefix}_heading_text"] = $block['heading'] ?? '';
        } elseif ($layout === 'list') {
            $row["{$key_prefix}_list_heading"] = $block['heading'] ?? '';
            $row["{$key_prefix}_list_items"] = [];

            if (!empty($block['items']) && is_array($block['items'])) {
                foreach ($block['items'] as $item) {
                    $text = is_array($item) ? ($item['item'] ?? '') : $item;
                    $row["{$key_prefix}_list_items"][] = [
                        "{$key_prefix}_list_item" => $text,
                    ];
                }
            }
        } elseif ($layout === 'note') {
            $row["{$key_prefix}_note_body"] = $block['body'] ?? '';
        }

        $rows[] = $row;
    }

    return $rows;
}

function termburg_legal_slug_by_blocks_field($field_name) {
    foreach (termburg_legal_content_pages_config() as $slug => $config) {
        if ($field_name === "{$config['field_prefix']}_blocks") {
            return $slug;
        }
    }

    return '';
}

function termburg_page_content_blocks_have_content($blocks) {
    if (!is_array($blocks) || empty($blocks)) {
        return false;
    }

    return termburg_page_content_value_has_content($blocks);
}

function termburg_page_content_value_has_content($value) {
    if (is_array($value)) {
        foreach ($value as $key => $item) {
            if ($key === 'acf_fc_layout') {
                continue;
            }
            if (termburg_page_content_value_has_content($item)) {
                return true;
            }
        }

        return false;
    }

    return trim((string) $value) !== '';
}

function termburg_page_text_block($heading, $body) {
    return [
        'acf_fc_layout' => 'text',
        'heading'       => $heading,
        'body'          => $body,
    ];
}

function termburg_page_list_block($heading, $items) {
    return [
        'acf_fc_layout' => 'list',
        'heading'       => $heading,
        'items'         => array_map(function ($item) {
            return ['item' => $item];
        }, $items),
    ];
}

function termburg_page_note_block($body) {
    return [
        'acf_fc_layout' => 'note',
        'body'          => $body,
    ];
}

function termburg_careers_page_defaults() {
    $defaults = [
        'slug'            => 'careers',
        'title'           => 'Работа в Термбурге',
        'metaDescription' => 'Вакансии термального комплекса Термбург в Москве: открытые позиции, условия работы и форма отклика.',
        'blocks'          => [
            termburg_page_text_block(
                'Работа в команде Термбурга',
                '<p>Мы — дружная команда профессионалов, которые любят своё дело. В Термбурге ценят опыт, обучают новичков и помогают развиваться. Если вы хотите работать в комфортной атмосфере с хорошим коллективом — присылайте резюме.</p>'
            ),
        ],
        'careers'         => [
            'heroTitle'         => 'Работа в Термбурге',
            'heroSubtitle'      => 'Присоединяйтесь к нашей команде',
            'stats'             => [
                ['value' => '12', 'label' => 'видов парных'],
                ['value' => '50+', 'label' => 'сотрудников'],
                ['value' => '2', 'label' => 'года на рынке'],
                ['value' => '4.8', 'label' => 'рейтинг'],
            ],
            'benefits'          => [
                [
                    'icon'  => 'graduation',
                    'title' => 'Обучение',
                    'text'  => 'Плавная адаптация по работе комплекса с наставником',
                ],
                [
                    'icon'  => 'briefcase',
                    'title' => 'Карьерный рост',
                    'text'  => 'Прозрачная система грейдов и возможности для роста',
                ],
                [
                    'icon'  => 'users',
                    'title' => 'Дружный коллектив',
                    'text'  => 'Команда единомышленников с общими ценностями',
                ],
                [
                    'icon'  => 'party',
                    'title' => 'Корпоративы',
                    'text'  => 'Праздники, тимбилдинги и совместный отдых',
                ],
            ],
            'vacanciesTitle'    => 'Наши вакансии',
            'vacanciesSubtitle' => 'Открытые позиции в команде Термбурга',
            'vacancies'         => [
                [
                    'title'        => 'Администратор',
                    'schedule'     => 'График 2/2, 3/3',
                    'salary'       => 'от 85 000 рублей + KPI',
                    'employment'   => 'Оформление по ТК РФ',
                    'tasks_title'  => 'Задачи, которые у тебя будут:',
                    'tasks'        => [
                        ['text' => 'Встреча гостей, создание комфортного микроклимата'],
                        ['text' => 'Консультация клиентов по услугам и программам комплекса'],
                        ['text' => 'Вежливость и умение находить общий язык с разными посетителями'],
                        ['text' => 'Знание кассовой дисциплины'],
                        ['text' => 'Знание Word и Excel'],
                    ],
                    'perks'        => [
                        ['text' => 'Дружный коллектив'],
                        ['text' => 'Обеды от компании'],
                    ],
                    'button_label' => 'Откликнуться',
                ],
            ],
            'applyTitle'        => 'Оставить заявку',
            'formTitle'         => 'Хотите работать у нас?',
            'formText'          => 'Заполните форму, и мы свяжемся с вами.',
            'successTitle'      => 'Заявка отправлена!',
            'successText'       => 'Мы свяжемся с вами.',
            'directTitle'       => 'Напишите нам напрямую',
            'directText'        => 'Отправьте резюме на почту — мы рассмотрим вашу кандидатуру.',
            'directEmail'       => termburg_page_content_site_value('tb_email', 'info@termburg.ru'),
        ],
    ];

    return termburg_page_content_apply_site_context($defaults);
}

function termburg_legal_page_content_defaults() {
    $defaults = [
        'offer' => [
            'slug'             => 'offer',
            'page_title'       => 'Публичная оферта',
            'meta_description' => 'Публичная оферта на оказание услуг термального комплекса Термбург. Условия посещения, порядок оплаты, права и обязанности сторон.',
            'blocks'           => termburg_default_offer_blocks(),
        ],
        'privacy' => [
            'slug'             => 'privacy',
            'page_title'       => 'Политика конфиденциальности',
            'meta_description' => 'Политика конфиденциальности термального комплекса Термбург. Обработка и защита персональных данных в соответствии с 152-ФЗ.',
            'blocks'           => termburg_default_privacy_blocks(),
        ],
        'rules' => [
            'slug'             => 'rules',
            'page_title'       => 'Правила комплекса',
            'meta_description' => 'Правила посещения термального комплекса Термбург: полный список требований безопасности, условий посещения и поведения гостей.',
            'blocks'           => termburg_default_rules_blocks(),
        ],
    ];

    return termburg_page_content_apply_site_context($defaults);
}

function termburg_default_offer_blocks() {
    return [
        termburg_page_text_block('', '<p><em>Редакция от 01.01.2024 г.</em></p><p>Общество с ограниченной ответственностью «ТЕРМБУРГ» (ИНН 9723159498, ОГРН 1237700686002), именуемое в дальнейшем «Исполнитель», в лице генерального директора, действующего на основании Устава, публикует настоящую публичную оферту в соответствии со ст. 435, ст. 437 Гражданского кодекса Российской Федерации, адресованную неопределённому кругу лиц.</p>'),
        termburg_page_text_block('1. Общие положения', '<p>1.1. Настоящая Оферта является официальным предложением Исполнителя любому физическому лицу заключить договор на оказание услуг термального комплекса на условиях, определённых в настоящей Оферте.</p><p>1.2. В Оферте используются термины: Исполнитель — ООО «ТЕРМБУРГ»; Заказчик — дееспособное физическое лицо, принявшее условия Оферты; Оферта — настоящий документ, опубликованный на сайте termburg.ru; Акцепт — полное и безоговорочное принятие условий; Услуги — посещение термальных зон, бань, бассейна, SPA-процедуры и иные услуги комплекса.</p><p>1.3. Оферта вступает в силу с момента размещения на сайте и действует до момента отзыва.</p><p>1.4. Исполнитель вправе изменять условия Оферты без предварительного уведомления. Новая редакция вступает в силу с момента публикации на сайте.</p>'),
        termburg_page_text_block('2. Предмет оферты', '<p>2.1. Исполнитель обязуется оказать Заказчику услуги термального комплекса «Термбург», расположенного по адресу: г. Москва, ул. Гурьянова, д. 30, 2 этаж, а Заказчик обязуется оплатить эти услуги.</p><p>2.2. Перечень и характеристики услуг определяются действующим прайс-листом на сайте termburg.ru и на рецепции комплекса.</p><p>2.3. Акцептом Оферты является оплата услуг, приобретение билета, абонемента или сертификата, либо фактическое посещение комплекса.</p><p>2.4. Акцепт означает согласие Заказчика со всеми условиями Оферты, Правилами посещения и действующим прайс-листом.</p>'),
        termburg_page_text_block('3. Стоимость услуг и порядок оплаты', '<p>3.1. Стоимость услуг определяется действующим прайс-листом. Цены указаны в рублях и включают НДС в случаях, предусмотренных законодательством.</p><p>3.2. Исполнитель вправе изменять стоимость услуг в одностороннем порядке. Изменение стоимости не распространяется на уже оплаченные услуги.</p><p>3.3. Оплата производится наличными на рецепции, банковскими картами, онлайн-оплатой через сайт или иными способами, предусмотренными Исполнителем.</p><p>3.4. Оплата производится до начала оказания услуг, если иное не предусмотрено отдельным соглашением или специальными предложениями.</p><p>3.5. Подтверждением оплаты является кассовый чек.</p>'),
        termburg_page_text_block('4. Порядок оказания услуг', '<p>4.1. Услуги оказываются в соответствии с режимом работы комплекса. Актуальный режим публикуется на сайте и размещается на рецепции.</p><p>4.2. Заказчик обязуется соблюдать Правила посещения комплекса.</p><p>4.3. Исполнитель вправе отказать в оказании услуг лицам в состоянии алкогольного или наркотического опьянения, лицам с признаками заболеваний, представляющих угрозу для других гостей, а также лицам, нарушающим правила и общественный порядок.</p><p>4.4. Посещение комплекса имеет медицинские противопоказания. Заказчик самостоятельно несёт ответственность за состояние здоровья и наличие противопоказаний, рекомендуется предварительная консультация с врачом.</p><p>4.5. Дети до 14 лет допускаются только в сопровождении родителей или законных представителей. Для детей действуют специальные условия и тарифы.</p><p>4.6. Исполнитель вправе ограничить количество посетителей для обеспечения комфорта и безопасности.</p>'),
        termburg_page_text_block('5. Права и обязанности сторон', '<p>5.1. Исполнитель обязуется оказывать услуги надлежащего качества, обеспечивать санитарно-гигиенические нормы, информировать Заказчика об условиях оказания услуг и обеспечивать безопасность при соблюдении правил.</p><p>5.2. Исполнитель вправе изменять перечень и стоимость услуг, устанавливать режим работы, приостанавливать оказание услуг при технических работах, отказать в обслуживании или удалить Заказчика при нарушении правил.</p><p>5.3. Заказчик обязуется своевременно оплачивать услуги, соблюдать правила, бережно относиться к имуществу, уважать других гостей и персонал, самостоятельно оценивать состояние здоровья и сообщать персоналу об ухудшении самочувствия или неисправностях.</p><p>5.4. Заказчик вправе получать полную информацию об услугах, пользоваться услугами по оплаченному тарифу и обращаться с претензиями по качеству услуг.</p>'),
        termburg_page_text_block('6. Ответственность сторон', '<p>6.1. Стороны несут ответственность в соответствии с законодательством Российской Федерации.</p><p>6.2. Исполнитель не несёт ответственности за вред здоровью Заказчика, возникший вследствие нарушения правил, несоблюдения противопоказаний или по причинам, не зависящим от Исполнителя.</p><p>6.3. Исполнитель не несёт ответственности за сохранность вещей, оставленных без присмотра, за исключением вещей, сданных на хранение в установленном порядке.</p><p>6.4. Заказчик несёт материальную ответственность за ущерб имуществу Исполнителя.</p><p>6.5. Стороны освобождаются от ответственности при обстоятельствах непреодолимой силы.</p>'),
        termburg_page_text_block('7. Порядок разрешения споров', '<p>7.1. Споры и разногласия разрешаются путём переговоров.</p><p>7.2. При невозможности разрешения спора применяется претензионный порядок. Претензия направляется письменно по адресу Исполнителя или на email info@termburg.ru. Срок рассмотрения — 30 календарных дней.</p><p>7.3. При невозможности урегулирования спор рассматривается судом по месту нахождения Исполнителя.</p>'),
        termburg_page_text_block('8. Прочие условия', '<p>8.1. Оферта регулируется законодательством Российской Федерации.</p><p>8.2. Недействительность отдельного положения не влечёт недействительности остальных положений.</p><p>8.3. Заказчик даёт согласие на обработку персональных данных в соответствии с Федеральным законом № 152-ФЗ.</p><p>8.4. Уведомления могут направляться по электронной почте, размещаться на сайте или передаваться иными способами.</p><p>8.5. Бездействие Исполнителя при нарушении условий не означает отказ от прав.</p>'),
        termburg_page_text_block('9. Реквизиты Исполнителя', '<p><strong>ООО «ТЕРМБУРГ»</strong></p><p>ИНН: 9723159498<br>ОГРН: 1237700686002<br>Юридический адрес: г. Москва, ул. Гурьянова, д. 30, 2 этаж<br>Телефон: <a href="tel:+79091674746">+7 (909) 167-47-46</a><br>Email: <a href="mailto:info@termburg.ru">info@termburg.ru</a><br>Сайт: <a href="https://termburg.ru">termburg.ru</a></p>'),
    ];
}

function termburg_default_privacy_blocks() {
    return [
        termburg_page_text_block('', '<p>Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных пользователей сайта termburg.ru, принадлежащего ООО «ТЕРМБУРГ».</p><p>Дата последнего обновления: 1 января 2025 г.</p>'),
        termburg_page_text_block('1. Общие положения', '<p>1.1. Оператором персональных данных является ООО «ТЕРМБУРГ» (ИНН 9723159498, ОГРН 1237700686002), зарегистрированное по адресу: г. Москва, ул. Гурьянова, д. 30, 2 этаж.</p><p>1.2. Политика разработана в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных данных» и иными нормативными актами РФ.</p><p>1.3. Политика действует в отношении всех персональных данных, получаемых при использовании сайта, бронировании, покупке услуг и исполнении договоров.</p><p>1.4. Использование сайта означает согласие Пользователя с условиями Политики.</p>'),
        termburg_page_list_block('2. Цели обработки персональных данных', ['Бронирование посещений и отдельных процедур', 'Оказание услуг термального комплекса', 'Оформление и исполнение договоров', 'Обработка платежей и возвратов', 'Информационные и рекламные рассылки при наличии согласия', 'Информирование об акциях и мероприятиях', 'Улучшение качества обслуживания и работы сайта', 'Статистика и аналитика посещений', 'Обратная связь и обработка обращений', 'Исполнение требований законодательства РФ']),
        termburg_page_list_block('3. Правовые основания обработки', ['Согласие субъекта персональных данных', 'Исполнение договора, стороной которого является субъект персональных данных', 'Законные интересы Оператора, не нарушающие права и свободы субъекта', 'Исполнение обязанностей, возложенных на Оператора законодательством РФ']),
        termburg_page_text_block('4. Состав персональных данных', '<p>4.1. Оператор может обрабатывать фамилию, имя, отчество, телефон, email, дату рождения, платёжные данные и данные о посещениях сайта: IP-адрес, cookie, данные браузера, время доступа и адреса страниц.</p><p>4.2. Оператор не обрабатывает специальные категории персональных данных, касающиеся расовой или национальной принадлежности, политических взглядов, религиозных убеждений, состояния здоровья и интимной жизни.</p>'),
        termburg_page_text_block('5. Порядок обработки персональных данных', '<p>5.1. Обработка включает сбор, запись, систематизацию, накопление, хранение, уточнение, извлечение, использование, передачу, обезличивание, блокирование, удаление и уничтожение.</p><p>5.2. Сбор данных осуществляется при заполнении форм на сайте и автоматически при посещении сайта.</p><p>5.3. Обработка производится с использованием средств автоматизации и без них.</p><p>5.4. Данные уничтожаются по достижении целей обработки, истечении срока хранения, отзыве согласия или выявлении неправомерной обработки.</p>'),
        termburg_page_text_block('6. Хранение и защита данных', '<p>6.1. Персональные данные хранятся на территории Российской Федерации.</p><p>6.2. Срок хранения определяется целями обработки, сроком действия согласия или требованиями законодательства.</p><p>6.3. Оператор принимает организационные и технические меры защиты: SSL/TLS, ограничение доступа сотрудников, обновление ПО, аудит систем обработки данных и резервное копирование.</p>'),
        termburg_page_text_block('7. Права субъекта персональных данных', '<p>7.1. Пользователь вправе получать информацию об обработке данных, требовать уточнения, блокирования или уничтожения данных, отозвать согласие, требовать удаления данных, обжаловать действия Оператора в Роскомнадзор или суд.</p><p>7.2. Для реализации прав Пользователь может направить запрос на email <a href="mailto:info@termburg.ru">info@termburg.ru</a> или по почтовому адресу Оператора. Срок рассмотрения — 30 календарных дней.</p>'),
        termburg_page_text_block('8. Использование файлов cookie', '<p>8.1. Сайт использует cookie для корректной работы, персонализации контента и анализа трафика.</p><p>8.2. Используются необходимые, функциональные, аналитические и маркетинговые cookie.</p><p>8.3. Пользователь может отключить cookie в настройках браузера, при этом часть функций сайта может стать недоступной.</p>'),
        termburg_page_text_block('9. Передача данных третьим лицам', '<p>9.1. Оператор не передаёт персональные данные третьим лицам, кроме случаев, предусмотренных Политикой и законодательством.</p><p>9.2. Передача допускается платёжным системам для обработки платежей, хостинг-провайдеру для работы сайта, сервисам аналитики в обезличенном виде и государственным органам по законному запросу.</p><p>9.3. При передаче данных Оператор обеспечивает соблюдение требований законодательства о персональных данных.</p>'),
        termburg_page_text_block('10. Изменения в Политике', '<p>10.1. Оператор вправе изменять Политику конфиденциальности. Новая редакция вступает в силу с момента размещения на сайте.</p><p>10.2. Действующая редакция доступна на странице <a href="/privacy">termburg.ru/privacy</a>.</p><p>10.3. Продолжение использования сайта после изменений означает согласие с новой редакцией.</p>'),
        termburg_page_text_block('11. Контактная информация', '<p>По вопросам обработки персональных данных можно обратиться к Оператору.</p><p>Наименование: ООО «ТЕРМБУРГ»<br>ИНН: 9723159498<br>ОГРН: 1237700686002<br>Адрес: г. Москва, ул. Гурьянова, д. 30, 2 этаж<br>Email: <a href="mailto:info@termburg.ru">info@termburg.ru</a></p>'),
    ];
}

function termburg_default_rules_blocks() {
    $rules = [
        'Общие положения' => ['Комплекс открыт для оказания физкультурно-оздоровительных услуг.', 'Посетитель должен ознакомиться с правилами перед оплатой услуг.', 'Подписью расписки подтверждается ознакомление с правилами и согласие их соблюдать.', 'Расписка, чек или браслет подтверждают ознакомление с правилами.', 'Информация о фирме размещена на информационном стенде.'],
        'Дети и сопровождающие' => ['Комплекс не несёт ответственность за детей без присмотра сопровождающих.', 'Родители несут персональную ответственность за детей до 18 лет.', 'Родители обязаны находиться на территории во время посещения детьми.', 'Дети должны соблюдать правила посещения.', 'Родители несут материальную ответственность за ущерб, причинённый имуществу.', 'Несовершеннолетние до 18 лет должны находиться в сопровождении взрослого.', 'Детям до 18 запрещено посещать бани без постоянного наблюдения.', 'Запрещено оставлять детей в хаммаме без присмотра.'],
        'Браслет и пропуск' => ['Входным билетом является электронный браслет с кредитом.', 'Браслет носится на запястье и передача запрещена.', 'При получении браслета нужно визуально проверить его целостность.', 'Об утрате или повреждении браслета следует сообщить незамедлительно.', 'За утрату или повреждение браслета взимается компенсация 2000 рублей.', 'За утрату номерка от гардероба взимается 500 рублей.'],
        'Режим работы и оплата' => ['Количество одновременно находящихся посетителей ограничено.', 'Режим работы и стоимость размещены у входа и на сайте.', 'Посетитель самостоятельно контролирует время пребывания.', 'Вход прекращается за 1 час до окончания работы.', 'На допустимых территориях ведётся видеонаблюдение для безопасности.', 'Стоимость указана на кассах и на сайте termburg.ru.', 'При льготном тарифе нужно предъявить оригиналы документов.', 'При покупке билета предъявляется документ, удостоверяющий личность.', 'К дополнительным услугам относятся питание, массаж, пилинг и прочее.', 'Пребывание сверх оплаченного времени оплачивается по тарифу доплаты.', 'При неспособности заплатить деньги взыскиваются в порядке, установленном законом.', 'Посетитель может досрочно прекратить сеанс без возмещения.', 'При технических неполадках компонентов возмещение не производится.'],
        'Вход и раздевалка' => ['Рекомендуется иметь медицинскую справку и предъявить по просьбе.', 'Вход осуществляется в сменной обуви, верхняя одежда оставляется в гардеробе.', 'В летний период верхняя одежда оставляется в пакете в шкафчике.', 'Комплекс не несёт ответственность за оставленные вещи в шкафчиках.', 'Администрация не рекомендует иметь на себе украшения и цепочки.', 'Началом посещения считается пересечение центрального турникета.', 'Посетитель переодевается в купальный костюм и резиновую обувь.', 'Рекомендуется использовать купальные костюмы без висящих элементов.', 'Посетители до 3 лет должны быть в специальных непромокаемых подгузниках.', 'Одежда складывается в персональный шкафчик с номером на браслете.'],
        'Гигиена и душ' => ['Посетитель обязан принять душ с моющими средствами до и после.', 'Запрещается вносить моющие средства в стеклянной таре.', 'При недомоганиях следует обратиться к администратору.', 'При спуске по лестницам необходимо держаться за поручни.', 'В саунах посетители обязаны использовать полотенце.', 'Перед использованием компонентов нужно ознакомиться с правилами безопасности.', 'Запрещено проводить индивидуальные процедуры личной гигиены.', 'После саун нужно принять душ перед бассейном.'],
        'Бани и сауны' => ['Запрещено посещение людям с повышенной чувствительностью к температурам.', 'Пар в хаммаме подаётся автоматически, не прислоняться к выходам.', 'Долгое пребывание в хаммаме опасно для здоровья.', 'Электрокаменка саун горячая, избегать прикосновения.', 'Поверхность полков высокой температуры, использовать полотенце.', 'Перед посещением изучить информационную табличку компонента.', 'Запрещено использовать закрытые на обслуживание компоненты.', 'Технические характеристики указаны на информационных табличках.', 'Запрещено посещать бани в состоянии опьянения.', 'Запрещено входить в бани с едой и напитками.', 'Запрещено использовать личные средства гигиены в парной.', 'Запрещено использовать воду для подливания на камни кроме русской парной.', 'Запрещено проведение коллективных парений с веером.', 'Нельзя резко вставать после процедуры парения.', 'Запрещено совершать опасные действия.', 'Посетитель учитывает медицинские противопоказания парной.', 'Администрация может остановить работу парной в любой момент.', 'Ответственность за травмы при несоблюдении правил на посетителе.', 'Посетитель несёт материальную ответственность за ущерб оборудованию.', 'Запрещено использовать парную, закрытую на обслуживание.'],
        'Глиняные процедуры' => ['Посетитель использует зону глиняных процедур под свою ответственность.', 'Косметические составы имеют медицинские противопоказания.', 'Комплекс не несёт ответственность за последствия от косметических составов.', 'Перед применением нужно изучить инструкции в зоне.', 'При посещении глиняных процедур соблюдаются специальные правила.', 'Медицинские противопоказания для глиняных процедур перечислены.', 'Администрация может остановить работу зоны глиняных процедур.', 'Ответственность за травмы от процедур на посетителе.'],
        'Бассейны' => ['Перед водно-развлекательной зоной нужно принять душ.', 'Несовершеннолетние до 18 лет в зоне только в сопровождении взрослого.', 'Перед бассейном нужно ознакомиться с правилами безопасности.', 'Не умеющие плавать должны надеть спасательный жилет.', 'В соляном бассейне высокая концентрация соли, промыть глаза пресной водой.', 'В бассейнах запрещены определённые действия и поведение.', 'Администрация предупреждает, купальные костюмы могут прийти в негодность.', 'При входе в бассейн изучить информационную табличку.', 'Запрещено использовать закрытые на обслуживание бассейны.', 'Ответственность за травмы в бассейне на посетителе.', 'Перед бассейном ознакомиться с правилами безопасности на табличке.', 'Под водой находятся ступени и выступы.', 'Под водой находятся элементы технологического оборудования.', 'Администрация может остановить работу бассейна в любой момент.', 'Ответственность за травмы при несоблюдении правил на посетителе.', 'Запрещено использовать бассейн, закрытый на техническое обслуживание.'],
        'Соляной бассейн' => ['Медицинские противопоказания к соляному бассейну перечислены.', 'Не рекомендуется находиться в соляном бассейне более 15 минут.', 'При попадании соленой воды промыть слизистые пресной водой.', 'После соляного бассейна принять душ и вымыть руки.'],
        'Запреты' => ['Запрещено быстро ходить или бегать во избежание травм.', 'Запрещено громко разговаривать в термо-релаксационной зоне.', 'Запрещено курение, включая электронные сигареты, штраф 5000 рублей.', 'Запрещена торговая и рекламная деятельность без разрешения.', 'Запрещено приносить оружие, взрывчатые и токсичные вещества.', 'Приносить личные игрушки запрещено.', 'Запрещено находиться лицам с инфекционными заболеваниями и прочими условиями.', 'Запрещено вносить детские коляски и подобные предметы.', 'Приносить продукты и напитки запрещено, штраф 3000 рублей.', 'Запрещено входить в технические помещения без разрешения.', 'Запрещено оставлять полотенца в банях и саунах.', 'Запрещено осуществлять приём пищи в неотведённых местах.', 'Запрещено залезать на ограждения и инженерные конструкции.', 'Запрещено оставлять обувь, создавая препятствия.'],
        'Права и обязанности' => ['Посетитель имеет право на информацию, оплаченные услуги и безопасность.', 'Посетитель обязан ознакомиться с правилами и соблюдать их.', 'Информацию о безопасности можно получить от администраторов.', 'Администрация обязана предоставлять информацию и обеспечивать безопасность.', 'Администрация имеет право не допускать лиц, нарушающих порядок.', 'Администрация имеет право отказать без объяснения причин.', 'Администрация может остановить работу компонентов в установленных случаях.', 'Администрация несёт ответственность в соответствии с законодательством.'],
        'Претензии и ответственность' => ['Претензии должны быть предъявлены в письменном виде.', 'Порядок удовлетворения претензий регулируется законодательством РФ.', 'Посетитель несёт ответственность за детей и нарушения правил.', 'Администрация не несёт ответственность за оставленных без присмотра детей.', 'Комплекс не принимает вещи на хранение и не несёт ответственность.', 'При нарушении правил администрация претензии не рассматривает.', 'Ответственность за ущерб при несоблюдении правил на посетителе.', 'При ущербе обратиться к администратору для фиксации обстоятельств.', 'Комплекс не несёт ответственность за технические неудобства.', 'Подписью расписки даётся согласие на использование изображений.'],
        'Безопасность и медпомощь' => ['При травме обратиться к администратору для фиксации происшествия.', 'Сотрудники оказывают первую медицинскую помощь используя аптечки.', 'При травме предлагается вызов скорой помощи, отказ снимает ответственность.', 'Аптечки находятся в фойе, зоне массажа, у администрации и спасателя.', 'При чрезвычайных ситуациях выполнять команды персонала и эвакуироваться.', 'Условные обозначения размещены на входе в комплекс.', 'Правила размещены на информационном стенде и сайте termburg.ru.'],
    ];

    $blocks = [
        termburg_page_text_block('Правила посещения', '<p>Перед посещением комплекса ознакомьтесь с правилами. Они помогают сделать отдых безопасным и комфортным для всех гостей.</p>'),
    ];

    foreach ($rules as $heading => $items) {
        $blocks[] = termburg_page_list_block($heading, $items);
    }

    $blocks[] = termburg_page_note_block('Правила размещены на информационном стенде и на сайте termburg.ru. Посещая комплекс, гости подтверждают согласие с правилами.');

    return $blocks;
}
