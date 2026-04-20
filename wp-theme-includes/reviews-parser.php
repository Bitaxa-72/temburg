<?php
/**
 * Reviews Parser - парсит реальные отзывы с Яндекс Карт и 2ГИС
 * Сохраняет в CPT otzav
 * Крон: раз в день. Ручной запуск: /wp-admin/admin-ajax.php?action=parse_reviews
 */

define("YANDEX_ORG_ID", "57257381853");
define("TWOGIS_FIRM_ID", "70000001078632628");

function termburg_fetch_yandex_reviews() {
    $url = "https://yandex.ru/maps/org/" . YANDEX_ORG_ID . "/reviews/";
    $args = array(
        "timeout" => 30,
        "headers" => array(
            "User-Agent" => "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept" => "text/html,application/xhtml+xml",
            "Accept-Language" => "ru-RU,ru;q=0.9",
        ),
    );
    $response = wp_remote_get($url, $args);
    if (is_wp_error($response)) return array();
    $body = wp_remote_retrieve_body($response);
    $reviews = array();
    if (preg_match_all("/<script type=\"application\/ld\+json\">(.*?)<\/script>/s", $body, $matches)) {
        foreach ($matches[1] as $json) {
            $data = json_decode($json, true);
            if (!$data) continue;
            if (isset($data["review"])) {
                foreach ($data["review"] as $r) {
                    $reviews[] = array(
                        "author" => isset($r["author"]["name"]) ? $r["author"]["name"] : "Гость",
                        "text" => isset($r["reviewBody"]) ? $r["reviewBody"] : "",
                        "rating" => intval(isset($r["reviewRating"]["ratingValue"]) ? $r["reviewRating"]["ratingValue"] : 5),
                        "date" => isset($r["datePublished"]) ? $r["datePublished"] : date("Y-m-d"),
                        "platform" => "yandex",
                    );
                }
            }
            if (isset($data["aggregateRating"])) {
                update_option("termburg_yandex_rating", $data["aggregateRating"]["ratingValue"]);
                update_option("termburg_yandex_count", $data["aggregateRating"]["reviewCount"]);
            }
        }
    }
    return array_filter($reviews, function($r) { return mb_strlen($r["text"]) > 20; });
}

function termburg_fetch_2gis_reviews() {
    $url = "https://public-api.reviews.2gis.com/2.0/branches/" . TWOGIS_FIRM_ID . "/reviews?limit=20&is_advertiser=false&fields=reviews.text,reviews.rating,reviews.date_created,reviews.user&sort_by=date_created&key=b3e87e78-fdc1-4ef2-bfc1-37a1e4bd0c52";
    $args = array(
        "timeout" => 30,
        "headers" => array(
            "User-Agent" => "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept" => "application/json",
        ),
    );
    $response = wp_remote_get($url, $args);
    if (is_wp_error($response)) return array();
    $data = json_decode(wp_remote_retrieve_body($response), true);
    if (!$data || !isset($data["reviews"])) return array();
    if (isset($data["meta"]["branch_rating"])) {
        update_option("termburg_2gis_rating", $data["meta"]["branch_rating"]);
    }
    if (isset($data["meta"]["branch_reviews_count"])) {
        update_option("termburg_2gis_count", $data["meta"]["branch_reviews_count"]);
    }
    $reviews = array();
    foreach ($data["reviews"] as $r) {
        if (empty($r["text"])) continue;
        $name = "Гость";
        if (isset($r["user"]["first_name"])) {
            $last = isset($r["user"]["last_name"]) ? mb_substr($r["user"]["last_name"], 0, 1) . "." : "";
            $name = $r["user"]["first_name"] . " " . $last;
        } elseif (isset($r["user"]["name"])) {
            $name = $r["user"]["name"];
        }
        $reviews[] = array(
            "author" => $name,
            "text" => $r["text"],
            "rating" => intval(isset($r["rating"]) ? $r["rating"] : 5),
            "date" => isset($r["date_created"]) ? $r["date_created"] : date("Y-m-d"),
            "platform" => "2gis",
        );
    }
    return array_filter($reviews, function($r) { return mb_strlen($r["text"]) > 20; });
}

function termburg_save_reviews($reviews) {
    $saved = 0;
    foreach ($reviews as $review) {
        $hash = md5($review["author"] . mb_substr($review["text"], 0, 50));
        $existing = get_posts(array(
            "post_type" => "otzav",
            "meta_key" => "_review_hash",
            "meta_value" => $hash,
            "posts_per_page" => 1,
        ));
        if (!empty($existing)) continue;
        $pid = wp_insert_post(array(
            "post_type" => "otzav",
            "post_title" => $review["author"],
            "post_content" => $review["text"],
            "post_status" => "publish",
        ));
        if ($pid && !is_wp_error($pid)) {
            update_post_meta($pid, "_review_platform", $review["platform"]);
            update_post_meta($pid, "_review_rating", $review["rating"]);
            update_post_meta($pid, "_review_date", $review["date"]);
            update_post_meta($pid, "_review_hash", $hash);
            $saved++;
        }
    }
    return $saved;
}

function termburg_parse_all_reviews() {
    $yandex = termburg_fetch_yandex_reviews();
    $twogis = termburg_fetch_2gis_reviews();
    $all = array_merge($yandex, $twogis);
    $saved = termburg_save_reviews($all);
    update_option("termburg_reviews_last_sync", date("Y-m-d H:i:s"));
    return array(
        "yandex_fetched" => count($yandex),
        "twogis_fetched" => count($twogis),
        "saved" => $saved,
        "total_in_db" => wp_count_posts("otzav")->publish,
    );
}

add_action("termburg_daily_reviews_sync", "termburg_parse_all_reviews");
if (!wp_next_scheduled("termburg_daily_reviews_sync")) {
    wp_schedule_event(time(), "daily", "termburg_daily_reviews_sync");
}

add_action("wp_ajax_parse_reviews", function() {
    $result = termburg_parse_all_reviews();
    wp_send_json_success($result);
});

add_action("rest_api_init", function() {
    register_rest_route("termburg/v1", "/reviews-stats", array(
        "methods" => "GET",
        "callback" => function() {
            return array(
                "yandex" => array(
                    "rating" => floatval(get_option("termburg_yandex_rating", 5.0)),
                    "count" => intval(get_option("termburg_yandex_count", 1552)),
                ),
                "twogis" => array(
                    "rating" => floatval(get_option("termburg_2gis_rating", 4.5)),
                    "count" => intval(get_option("termburg_2gis_count", 180)),
                ),
                "last_sync" => get_option("termburg_reviews_last_sync", "never"),
            );
        },
        "permission_callback" => "__return_true",
    ));
});
