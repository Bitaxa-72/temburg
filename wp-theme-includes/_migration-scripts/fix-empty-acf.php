<?php
require_once(__DIR__ . "/wp-load.php");

// === 1. HERO ===
update_field('tb_hero_title', 'Термбург — ваш оазис в Москве', 'option');
update_field('tb_hero_subtitle', 'Более 12 парных, бассейны, SPA и массаж', 'option');
update_field('tb_hero_button_text', 'Хочу пойти', 'option');
echo "Hero: OK\n";

// === 2. PRICING ===
$weekday = array(
    array('name' => '1 час', 'duration' => '1 час', 'adult_price' => 540, 'child_price' => 470),
    array('name' => '2 часа', 'duration' => '2 часа', 'adult_price' => 1000, 'child_price' => 470),
    array('name' => '3 часа', 'duration' => '3 часа', 'adult_price' => 1500, 'child_price' => 470),
    array('name' => '4 часа', 'duration' => '4 часа', 'adult_price' => 1990, 'child_price' => 470),
    array('name' => 'Безлимит на день', 'duration' => '9:00–23:00', 'adult_price' => 2500, 'child_price' => 470),
);
update_field('tb_weekday_pricing', $weekday, 'option');

$weekend = array(
    array('name' => '1 час', 'duration' => '1 час', 'adult_price' => 760, 'child_price' => 470),
    array('name' => '2 часа', 'duration' => '2 часа', 'adult_price' => 1450, 'child_price' => 470),
    array('name' => '3 часа', 'duration' => '3 часа', 'adult_price' => 2150, 'child_price' => 470),
    array('name' => '4 часа', 'duration' => '4 часа', 'adult_price' => 2850, 'child_price' => 470),
    array('name' => 'Безлимит на день', 'duration' => '9:00–23:00', 'adult_price' => 3250, 'child_price' => 470),
);
update_field('tb_weekend_pricing', $weekend, 'option');

$pensioner = array(
    array('name' => '1 час', 'duration' => '1 час', 'price' => 360),
    array('name' => '2 часа', 'duration' => '2 часа', 'price' => 540),
    array('name' => '3 часа', 'duration' => '3 часа', 'price' => 720),
    array('name' => '4 часа', 'duration' => '4 часа', 'price' => 900),
    array('name' => 'Безлимит', 'duration' => 'до 18:00', 'price' => 1080),
);
update_field('tb_pensioner_pricing', $pensioner, 'option');
update_field('tb_child_under6', 470, 'option');
echo "Pricing: OK\n";

// === 3. TICKER ===
$ticker = array(
    array('text' => 'Режим работы: ежедневно 9:00–23:00 (1-й понедельник месяца — санитарный день)'),
    array('text' => 'Адрес: Москва, ул. Гурьянова 30, Серф Плаза, 2 этаж, м. Печатники'),
    array('text' => 'Телефон: +7 (909) 167-47-46'),
    array('text' => 'Школа плавания для детей — запись по телефону'),
);
update_field('tb_ticker_messages', $ticker, 'option');
echo "Ticker: OK\n";

// === 4. TEAM ===
$team = array(
    array('name' => 'Дергач Дмитрий', 'role' => 'Шеф-банщик', 'description' => 'Мастер традиционного русского парения с 10-летним опытом', 'photo' => ''),
    array('name' => 'Ахмед Хусейн', 'role' => 'Массажист', 'description' => 'Специалист по классическому и спортивному массажу', 'photo' => ''),
    array('name' => 'Марина Мельник', 'role' => 'Массажист', 'description' => 'Мастер расслабляющего и лимфодренажного массажа', 'photo' => ''),
    array('name' => 'Петр Гладков', 'role' => 'Массажист', 'description' => 'Специалист по интенсивному и спортивному массажу', 'photo' => ''),
    array('name' => 'Игорь Войтенко', 'role' => 'Банщик-массажист', 'description' => 'Мастер парения и массажа вениками', 'photo' => ''),
);
update_field('tb_team_members', $team, 'option');
echo "Team: OK\n";

// === 5. FAQ ===
$faq = array(
    array('question' => 'Что взять с собой?', 'answer' => 'Полотенца, тапочки и шапку мы предоставляем. С собой — купальник/плавки, сменное бельё.', 'category' => 'Первое посещение'),
    array('question' => 'Какой режим работы?', 'answer' => 'Ежедневно с 9:00 до 23:00. Первый понедельник месяца — санитарный день.', 'category' => 'Первое посещение'),
    array('question' => 'Возрастные ограничения?', 'answer' => 'Дети до 6 лет включительно — 470 руб безлимит. До 14 лет только в сопровождении взрослых.', 'category' => 'Первое посещение'),
    array('question' => 'Можно ли заказать парение?', 'answer' => 'Да! Индивидуальное парение с вениками 30-60 минут. Записывайтесь заранее.', 'category' => 'Услуги'),
    array('question' => 'Какие способы оплаты?', 'answer' => 'Наличные, банковские карты, СБП, онлайн через ЮKassa.', 'category' => 'Оплата'),
    array('question' => 'Есть ли парковка?', 'answer' => 'Да, бесплатная парковка на территории ТЦ Серф Плаза.', 'category' => 'Первое посещение'),
    array('question' => 'Можно ли купить абонемент?', 'answer' => 'Да: Семейный, На троих, Дневной безлимит, Основной безлимит, Хороший родитель.', 'category' => 'Оплата'),
    array('question' => 'Есть ли скидки?', 'answer' => 'Студентам 30% после 16:00, пенсионерам 50% по вторникам, именинникам — бесплатный вход.', 'category' => 'Оплата'),
);
update_field('tb_faq_items', $faq, 'option');
echo "FAQ: OK\n";

// === VERIFY ALL ===
echo "\n=== VERIFY ===\n";
$checks = array(
    'tb_hero_title' => 'Hero title',
    'tb_weekday_pricing' => 'Weekday pricing',
    'tb_weekend_pricing' => 'Weekend pricing',
    'tb_pensioner_pricing' => 'Pensioner pricing',
    'tb_child_under6' => 'Child price',
    'tb_ticker_messages' => 'Ticker',
    'tb_team_members' => 'Team',
    'tb_faq_items' => 'FAQ',
);

foreach ($checks as $field => $label) {
    $val = get_field($field, 'option');
    if (is_array($val)) {
        $first = $val[0];
        $keys = array_keys($first);
        $sample = $first[$keys[0]];
        if (is_array($sample)) $sample = json_encode($sample);
        echo "  {$label}: " . count($val) . " items, first {$keys[0]}={$sample}\n";
    } else {
        echo "  {$label}: {$val}\n";
    }
}
