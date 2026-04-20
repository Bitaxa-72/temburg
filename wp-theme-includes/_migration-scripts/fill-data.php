<?php
require_once(__DIR__ . "/wp-load.php");

// Helper
function set_opt($key, $val, $field_key = null) {
    update_option("options_" . $key, $val);
    if ($field_key) update_option("_options_" . $key, $field_key);
}

// === SETTINGS ===
set_opt("tb_phone", "+7 (495) 191-64-38", "field_tb_phone");
set_opt("tb_email", "info@termburg.ru", "field_tb_email");
set_opt("tb_address", "г. Москва, ул. Гурьянова, д. 30, 2 этаж", "field_tb_address");
set_opt("tb_metro", "м. Печатники", "field_tb_metro");
set_opt("tb_hours", "Ежедневно 9:00–23:00 (1-й пн месяца — сан. день)", "field_tb_hours");
set_opt("tb_vk", "https://vk.com/termburg", "field_tb_vk");
set_opt("tb_tg", "https://t.me/termburg", "field_tb_tg");
set_opt("tb_ig", "https://instagram.com/termburg", "field_tb_ig");
set_opt("tb_child_price", 470, "field_tb_child_price");
set_opt("tb_overtime_wd", 10, "field_tb_overtime_wd");
set_opt("tb_overtime_we", 15, "field_tb_overtime_we");
set_opt("tb_overtime_pen", 9, "field_tb_overtime_pen");
echo "Settings OK\n";

// === WEEKDAY PRICING ===
$wd = array(
    array("1 час", "1 час", 540, 470),
    array("2 часа", "2 часа", 1000, 470),
    array("3 часа", "3 часа", 1500, 470),
    array("4 часа", "4 часа", 1990, 470),
    array("Безлимит на день", "9:00–23:00", 2500, 470),
);
set_opt("tb_weekday_pricing", count($wd), "field_tb_wd_pricing");
foreach ($wd as $i => $r) {
    set_opt("tb_weekday_pricing_{$i}_tb_slot_name", $r[0], "field_tb_slot_name");
    set_opt("tb_weekday_pricing_{$i}_tb_slot_duration", $r[1], "field_tb_slot_dur");
    set_opt("tb_weekday_pricing_{$i}_tb_slot_adult_price", $r[2], "field_tb_slot_adult");
    set_opt("tb_weekday_pricing_{$i}_tb_slot_child_price", $r[3], "field_tb_slot_child");
}

// === WEEKEND PRICING ===
$we = array(
    array("1 час", "1 час", 760, 470),
    array("2 часа", "2 часа", 1450, 470),
    array("3 часа", "3 часа", 2150, 470),
    array("4 часа", "4 часа", 2850, 470),
    array("Безлимит на день", "9:00–23:00", 3250, 470),
);
set_opt("tb_weekend_pricing", count($we), "field_tb_we_pricing");
foreach ($we as $i => $r) {
    set_opt("tb_weekend_pricing_{$i}_tb_slot_name", $r[0], "field_tb_slot_name");
    set_opt("tb_weekend_pricing_{$i}_tb_slot_duration", $r[1], "field_tb_slot_dur");
    set_opt("tb_weekend_pricing_{$i}_tb_slot_adult_price", $r[2], "field_tb_slot_adult");
    set_opt("tb_weekend_pricing_{$i}_tb_slot_child_price", $r[3], "field_tb_slot_child");
}

// === PENSIONER PRICING ===
$pen = array(
    array("1 час", "1 час", 360),
    array("2 часа", "2 часа", 540),
    array("3 часа", "3 часа", 720),
    array("4 часа", "4 часа", 900),
    array("Безлимит", "до 18:00", 1080),
);
set_opt("tb_pensioner_pricing", count($pen), "field_tb_pen_pricing");
foreach ($pen as $i => $r) {
    set_opt("tb_pensioner_pricing_{$i}_tb_pen_name", $r[0], "field_tb_pen_name");
    set_opt("tb_pensioner_pricing_{$i}_tb_pen_duration", $r[1], "field_tb_pen_dur");
    set_opt("tb_pensioner_pricing_{$i}_tb_pen_price", $r[2], "field_tb_pen_price");
}
echo "Pricing OK\n";

// === TICKER ===
$ticks = array(
    "Режим работы: ежедневно 9:00–23:00 (1-й понедельник месяца — санитарный день)",
    "Адрес: Москва, ул. Гурьянова 30, Серф Плаза, 2 этаж, м. Печатники",
    "Телефон: +7 (495) 191-64-38",
    "Школа плавания для детей — запись по телефону",
);
set_opt("tb_ticker_messages", count($ticks), "field_tb_ticker");
foreach ($ticks as $i => $t) {
    set_opt("tb_ticker_messages_{$i}_tb_tick_text", $t, "field_tb_tick_text");
}
echo "Ticker OK\n";

// === SCHEDULE ===
$events = array(
    array("Бесплатное коллективное парение", "Понедельник,Вторник,Среда,Четверг,Пятница,Суббота,Воскресенье", "11:00", "30 мин", "free", 0, "Сибирская парная"),
    array("Платное коллективное парение", "Понедельник,Вторник,Среда,Четверг,Пятница,Суббота,Воскресенье", "14:00", "45 мин", "paid", 450, "Мультикаменная сауна"),
    array("Бесплатное коллективное парение", "Понедельник,Вторник,Среда,Четверг,Пятница,Суббота,Воскресенье", "17:00", "30 мин", "free", 0, "Сибирская парная"),
    array("Платное коллективное парение", "Понедельник,Вторник,Среда,Четверг,Пятница,Суббота,Воскресенье", "20:00", "45 мин", "paid", 450, "Мультикаменная сауна"),
    array("Йога", "Вторник", "10:00", "60 мин", "free", 0, "Зал"),
    array("Йога", "Четверг", "12:00", "60 мин", "free", 0, "Зал"),
    array("Аквааэробика", "Понедельник,Среда,Пятница", "10:00", "45 мин", "free", 0, "Бассейн"),
);
set_opt("tb_schedule_events", count($events), "field_tb_sched");
foreach ($events as $i => $e) {
    set_opt("tb_schedule_events_{$i}_tb_ev_name", $e[0], "field_tb_ev_name");
    set_opt("tb_schedule_events_{$i}_tb_ev_day", $e[1], "field_tb_ev_day");
    set_opt("tb_schedule_events_{$i}_tb_ev_time", $e[2], "field_tb_ev_time");
    set_opt("tb_schedule_events_{$i}_tb_ev_dur", $e[3], "field_tb_ev_dur");
    set_opt("tb_schedule_events_{$i}_tb_ev_type", $e[4], "field_tb_ev_type");
    set_opt("tb_schedule_events_{$i}_tb_ev_price", $e[5], "field_tb_ev_price");
    set_opt("tb_schedule_events_{$i}_tb_ev_desc", $e[6], "field_tb_ev_desc");
}
echo "Schedule OK\n";

// === TEAM ===
$team = array(
    array("Дергач Дмитрий", "Шеф-банщик", "Мастер традиционного русского парения"),
    array("Ахмед Хусейн", "Массажист", "Классический и спортивный массаж"),
    array("Марина Мельник", "Массажист", "Расслабляющий и лимфодренажный массаж"),
    array("Петр Гладков", "Массажист", "Интенсивный и спортивный массаж"),
    array("Игорь Войтенко", "Банщик-массажист", "Парение и массаж вениками"),
);
set_opt("tb_team_members", count($team), "field_tb_team");
foreach ($team as $i => $m) {
    set_opt("tb_team_members_{$i}_tb_m_name", $m[0], "field_tb_m_name");
    set_opt("tb_team_members_{$i}_tb_m_role", $m[1], "field_tb_m_role");
    set_opt("tb_team_members_{$i}_tb_m_desc", $m[2], "field_tb_m_desc");
}
echo "Team OK\n";

// === FAQ ===
$faq = array(
    array("Что взять с собой?", "Полотенца, тапочки, шапку мы предоставляем. С собой — купальник/плавки, сменное бельё.", "Первое посещение"),
    array("Какой режим работы?", "Ежедневно с 9:00 до 23:00. Первый понедельник месяца — санитарный день.", "Первое посещение"),
    array("Возрастные ограничения?", "Дети до 6 лет включительно — 470 руб безлимит. До 14 лет только в сопровождении взрослых.", "Первое посещение"),
    array("Можно ли заказать индивидуальное парение?", "Да! 30-60 минут с берёзовыми, дубовыми или можжевеловыми вениками. Записывайтесь заранее.", "Услуги"),
    array("Какие способы оплаты?", "Наличные, банковские карты, СБП, онлайн через ЮKassa.", "Оплата"),
    array("Есть ли парковка?", "Да, бесплатная парковка на территории ТЦ Серф Плаза.", "Первое посещение"),
    array("Можно ли купить абонемент?", "Да: Семейный, На троих, Дневной безлимит, Основной безлимит, Хороший родитель.", "Оплата"),
    array("Есть ли скидки?", "Студентам 30% после 16:00, пенсионерам 50% по вторникам, именинникам — бесплатный вход.", "Оплата"),
);
set_opt("tb_faq_items", count($faq), "field_tb_faq_items");
foreach ($faq as $i => $f) {
    set_opt("tb_faq_items_{$i}_tb_faq_q", $f[0], "field_tb_faq_q");
    set_opt("tb_faq_items_{$i}_tb_faq_a", $f[1], "field_tb_faq_a");
    set_opt("tb_faq_items_{$i}_tb_faq_cat", $f[2], "field_tb_faq_cat");
}
echo "FAQ OK\n";

echo "\nALL DATA FILLED!\n";
