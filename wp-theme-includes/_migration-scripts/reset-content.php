<?php
require_once(__DIR__ . "/wp-load.php");
global $wpdb;

// 1. DELETE ALL old CPT posts (except products, orders, ACF, otzav we created)
$delete_types = array('news','services','gallery_foto','gallery_video','timetable','certificates','price_list','pareniya','vacancy','about_kompany');

foreach ($delete_types as $type) {
    $wpdb->query($wpdb->prepare(
        "DELETE pm FROM {$wpdb->postmeta} pm INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id WHERE p.post_type = %s",
        $type
    ));
    $count = $wpdb->query($wpdb->prepare(
        "DELETE FROM {$wpdb->posts} WHERE post_type = %s",
        $type
    ));
    echo "Deleted {$type}: {$count}\n";
}

// 2. CREATE FRESH NEWS
$news = array(
    array("Чемпионат России по коллективному парению", "Приглашаем вас на чемпионат по коллективному парению — уникальную возможность стать свидетелем захватывающего мероприятия. 18 апреля в Термбурге!"),
    array("Новые программы парений", "Мы расширили линейку программ индивидуального парения. Теперь доступны авторские программы с медово-солевым скрабом и пихтовыми вениками."),
    array("Школа плавания для детей", "Набираем группы в школу плавания для детей 6-12 лет. Занятия по пятницам и воскресеньям. Абонемент от 4 000 ₽."),
    array("Йога в Термбург", "Бесплатные занятия йогой: вторник 10:00 и четверг 12:00. Включено в стоимость посещения."),
    array("Скидка студентам", "Скидка 30% студентам очной формы обучения на посещение после 16:00 в будние дни. При предъявлении студенческого билета."),
    array("Подарок имениннику", "Бесплатный вход по тарифу «Безлимит» в течение 3 дней до или после дня рождения. При предъявлении паспорта."),
);

foreach ($news as $n) {
    wp_insert_post(array(
        'post_type' => 'news',
        'post_title' => $n[0],
        'post_content' => $n[1],
        'post_status' => 'publish',
    ));
}
echo "Created " . count($news) . " news\n";

// 3. CREATE FRESH SERVICES/PROMOTIONS
$services = array(
    array("Стаканчик кофе в подарок", "При покупке любой СПА-услуги дарим стаканчик ароматного кофе. Пн-Пт с 10:00 до 13:00."),
    array("Скидка студентам 30%", "Скидка на билеты для студентов очной формы обучения после 16:00 в будние дни."),
    array("Подарок имениннику", "Бесплатный вход по безлимиту в течение 3 дней до/после дня рождения. 10% скидка гостям (от 3 чел.), 20% (от 8 чел.)."),
    array("Скидка для серебряного возраста", "Скидка 50% пенсионерам при покупке безлимита по вторникам."),
    array("Йога в Термбург", "Вторник 10:00 и четверг 12:00. Бесплатно — включено в стоимость посещения."),
    array("Аквааэробика", "Понедельник, среда, пятница в 10:00. Бесплатно — включено в стоимость посещения."),
);

foreach ($services as $s) {
    wp_insert_post(array(
        'post_type' => 'services',
        'post_title' => $s[0],
        'post_content' => $s[1],
        'post_status' => 'publish',
    ));
}
echo "Created " . count($services) . " services\n";

// 4. CREATE FRESH VACANCY
wp_insert_post(array(
    'post_type' => 'vacancy',
    'post_title' => 'Банщик-парильщик',
    'post_content' => 'Опыт от 1 года. Знание техник парения. Работа с вениками. Оформление по ТК РФ.',
    'post_status' => 'publish',
));
echo "Created 1 vacancy\n";

// 5. CREATE ABOUT
wp_insert_post(array(
    'post_type' => 'about_kompany',
    'post_title' => 'О Термбурге',
    'post_content' => 'Термбург — термальный комплекс и семейный оздоровительный центр в Москве. Более 10 видов парных, бассейны, SPA-процедуры. Ежедневно с 9:00 до 23:00.',
    'post_status' => 'publish',
));
echo "Created 1 about\n";

// 6. Clean orphans
$wpdb->query("DELETE pm FROM {$wpdb->postmeta} pm LEFT JOIN {$wpdb->posts} p ON p.ID = pm.post_id WHERE p.ID IS NULL");
$wpdb->query("DELETE tr FROM {$wpdb->term_relationships} tr LEFT JOIN {$wpdb->posts} p ON p.ID = tr.object_id WHERE p.ID IS NULL");

// Optimize
$tables = $wpdb->get_col("SHOW TABLES");
foreach ($tables as $t) $wpdb->query("OPTIMIZE TABLE `$t`");

// Summary
echo "\n=== FINAL STATE ===\n";
$all = $wpdb->get_results("SELECT post_type, COUNT(*) as cnt FROM {$wpdb->posts} WHERE post_status = 'publish' GROUP BY post_type ORDER BY cnt DESC");
foreach ($all as $a) echo "  {$a->post_type}: {$a->cnt}\n";

$size = $wpdb->get_var("SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) FROM information_schema.tables WHERE table_schema = DATABASE()");
echo "\nDB size: {$size} MB\n";
