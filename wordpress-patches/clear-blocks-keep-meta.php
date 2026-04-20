<?php
/**
 * Очищает блоки в WP «Контент страниц», но СОХРАНЯЕТ title и metaDescription.
 *
 * Запуск: wp eval-file ~/clear-blocks-keep-meta.php
 *
 * Зачем: фронт уже имеет хардкод-контент. Если seed-блоки дублируют хардкод,
 * получится визуальный дубль. Очищая блоки, мы оставляем админу пустой
 * редактор по каждой странице — он добавит туда что нужно (акция, объявление,
 * сезонная информация) и это появится на сайте через usePageContent.
 *
 * Title и metaDescription остаются — они НЕ дублируют хардкод, а используются
 * для SEO мета-тегов.
 */

if (!function_exists('update_field')) {
    echo "❌ ACF не активен.\n";
    return;
}

$current = get_field('termburg_pages', 'option');
if (!is_array($current)) {
    echo "ℹ️  Нет данных в termburg_pages.\n";
    return;
}

// Очищаем blocks но сохраняем slug, title, metaDescription
$cleaned = array_map(function ($p) {
    return [
        'slug'             => $p['slug'] ?? '',
        'page_title'       => $p['page_title'] ?? '',
        'meta_description' => $p['meta_description'] ?? '',
        'blocks'           => [],
    ];
}, $current);

update_field('termburg_pages', $cleaned, 'option');

echo "✅ Очищено блоков для " . count($cleaned) . " страниц. Title и meta сохранены.\n";
foreach ($cleaned as $p) {
    echo "   - {$p['slug']}: \"{$p['page_title']}\"\n";
}
echo "\nТеперь WP-админ может добавлять блоки через «Контент страниц» → нужная страница.\n";
echo "Пустые блоки = на сайте ничего нового не появится.\n";
