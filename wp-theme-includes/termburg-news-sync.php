<?php
/**
 * Termburg News Sync
 * Auto-imports news from Telegram channel and Dzen
 * Runs daily via WP Cron
 */

if (!defined('ABSPATH')) exit;

define('TERMBURG_TG_CHANNEL', 'termburg');
define('TERMBURG_DZEN_ID', '652f7beb5939720dfbfa6bc8');

/**
 * Fetch posts from Telegram public channel
 */
function termburg_fetch_telegram_posts() {
    $url = 'https://t.me/s/' . TERMBURG_TG_CHANNEL;
    $response = wp_remote_get($url, array(
        'timeout' => 30,
        'headers' => array(
            'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ),
    ));

    if (is_wp_error($response)) return array();

    $body = wp_remote_retrieve_body($response);
    $posts = array();

    // Parse messages from HTML
    if (preg_match_all('/<div class="tgme_widget_message_bubble">(.*?)<\/div>\s*<\/div>\s*<\/div>/s', $body, $matches)) {
        foreach ($matches[1] as $msg) {
            // Get text
            $text = '';
            if (preg_match('/<div class="tgme_widget_message_text[^"]*"[^>]*>(.*?)<\/div>/s', $msg, $textMatch)) {
                $text = strip_tags($textMatch[1], '<br><b><i><a>');
                $text = trim(html_entity_decode($text, ENT_QUOTES, 'UTF-8'));
            }

            // Get date
            $date = '';
            if (preg_match('/datetime="([^"]+)"/', $msg, $dateMatch)) {
                $date = $dateMatch[1];
            }

            // Get image
            $image = '';
            if (preg_match('/background-image:url\(\'([^\']+)\'\)/', $msg, $imgMatch)) {
                $image = $imgMatch[1];
            }

            if (mb_strlen($text) > 30) {
                // Title = first line or first 80 chars
                $lines = preg_split('/\n|<br\s*\/?>/', $text);
                $title = strip_tags(trim($lines[0]));
                if (mb_strlen($title) > 100) $title = mb_substr($title, 0, 100) . '...';

                $posts[] = array(
                    'title' => $title,
                    'content' => $text,
                    'date' => $date,
                    'image' => $image,
                    'source' => 'telegram',
                );
            }
        }
    }

    return array_slice($posts, 0, 10); // Last 10 posts
}

/**
 * Fetch articles from Dzen channel
 */
function termburg_fetch_dzen_articles() {
    $url = 'https://dzen.ru/api/v3/launcher/more?channel_id=' . TERMBURG_DZEN_ID . '&page_size=10';
    $response = wp_remote_get($url, array(
        'timeout' => 30,
        'headers' => array(
            'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ),
    ));

    if (is_wp_error($response)) return array();

    $data = json_decode(wp_remote_retrieve_body($response), true);
    if (!$data || !isset($data['items'])) return array();

    $posts = array();
    foreach ($data['items'] as $item) {
        if (empty($item['title']) || $item['type'] !== 'card') continue;

        $posts[] = array(
            'title' => $item['title'],
            'content' => isset($item['text']) ? $item['text'] : '',
            'date' => isset($item['date']) ? $item['date'] : '',
            'image' => isset($item['image']) ? $item['image'] : '',
            'link' => isset($item['link']) ? $item['link'] : '',
            'source' => 'dzen',
        );
    }

    return $posts;
}

/**
 * Save posts to WP news CPT
 */
function termburg_save_news_posts($posts) {
    $saved = 0;

    foreach ($posts as $post) {
        // Check if already imported (by title hash)
        $hash = md5($post['title']);
        $existing = get_posts(array(
            'post_type' => 'news',
            'meta_key' => '_news_hash',
            'meta_value' => $hash,
            'posts_per_page' => 1,
        ));

        if (!empty($existing)) continue;

        // Create post
        $content = $post['content'];
        if (!empty($post['link'])) {
            $content .= "\n\n<a href=\"" . esc_url($post['link']) . "\" target=\"_blank\">Читать полностью</a>";
        }

        $post_date = '';
        if (!empty($post['date'])) {
            $ts = strtotime($post['date']);
            if ($ts) $post_date = date('Y-m-d H:i:s', $ts);
        }

        $pid = wp_insert_post(array(
            'post_type' => 'news',
            'post_title' => wp_strip_all_tags($post['title']),
            'post_content' => $content,
            'post_status' => 'publish',
            'post_date' => $post_date ?: current_time('mysql'),
        ));

        if ($pid && !is_wp_error($pid)) {
            update_post_meta($pid, '_news_hash', $hash);
            update_post_meta($pid, '_news_source', $post['source']);
            if (!empty($post['link'])) {
                update_post_meta($pid, '_news_link', $post['link']);
            }

            // Download and set featured image
            if (!empty($post['image'])) {
                termburg_set_featured_image($pid, $post['image']);
            }

            $saved++;
        }
    }

    return $saved;
}

/**
 * Download image and set as featured
 */
function termburg_set_featured_image($post_id, $image_url) {
    require_once(ABSPATH . 'wp-admin/includes/media.php');
    require_once(ABSPATH . 'wp-admin/includes/file.php');
    require_once(ABSPATH . 'wp-admin/includes/image.php');

    $tmp = download_url($image_url);
    if (is_wp_error($tmp)) return false;

    $file = array(
        'name' => 'news-' . $post_id . '.jpg',
        'tmp_name' => $tmp,
    );

    $attachment_id = media_handle_sideload($file, $post_id);
    if (is_wp_error($attachment_id)) {
        @unlink($tmp);
        return false;
    }

    set_post_thumbnail($post_id, $attachment_id);
    return true;
}

/**
 * Main sync function
 */
function termburg_sync_all_news() {
    $tg_posts = termburg_fetch_telegram_posts();
    $dzen_posts = termburg_fetch_dzen_articles();

    $all = array_merge($dzen_posts, $tg_posts);
    $saved = termburg_save_news_posts($all);

    update_option('termburg_news_last_sync', current_time('mysql'));
    update_option('termburg_news_last_result', array(
        'telegram' => count($tg_posts),
        'dzen' => count($dzen_posts),
        'saved' => $saved,
    ));

    return array(
        'telegram_fetched' => count($tg_posts),
        'dzen_fetched' => count($dzen_posts),
        'saved' => $saved,
    );
}

// WP Cron - every 6 hours
add_action('termburg_news_sync_cron', 'termburg_sync_all_news');
if (!wp_next_scheduled('termburg_news_sync_cron')) {
    wp_schedule_event(time(), 'twicedaily', 'termburg_news_sync_cron');
}

// Manual trigger via AJAX
add_action('wp_ajax_sync_news', function() {
    $result = termburg_sync_all_news();
    wp_send_json_success($result);
});

// REST endpoint for sync status
add_action('rest_api_init', function() {
    register_rest_route('termburg/v1', '/news-sync', array(
        'methods' => 'GET',
        'callback' => function() {
            return array(
                'last_sync' => get_option('termburg_news_last_sync', 'never'),
                'last_result' => get_option('termburg_news_last_result', array()),
            );
        },
        'permission_callback' => '__return_true',
    ));
});
