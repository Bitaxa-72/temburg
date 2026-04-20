<?php
/**
 * Termburg Lead Notifications
 * - Partner inquiry endpoint
 * - WooCommerce order notification
 * - Overrides career-apply email to send to both addresses
 */

define("TERMBURG_LEAD_EMAILS", array("info@termburg.ru", "vahrushev_ilya@mail.ru"));

// Partner inquiry endpoint
add_action("rest_api_init", function() {
    register_rest_route("termburg/v1", "/partner-inquiry", array(
        "methods" => "POST",
        "callback" => "termburg_partner_inquiry",
        "permission_callback" => "__return_true",
    ));
});

function termburg_partner_inquiry($request) {
    $params = $request->get_json_params();
    $company = sanitize_text_field(isset($params["company"]) ? $params["company"] : "");
    $name = sanitize_text_field(isset($params["name"]) ? $params["name"] : "");
    $email = sanitize_email(isset($params["email"]) ? $params["email"] : "");
    $message = sanitize_textarea_field(isset($params["message"]) ? $params["message"] : "");

    if (empty($name) || empty($email)) {
        return new WP_REST_Response(array("error" => "Укажите имя и email"), 400);
    }

    $subject = "Запрос от партнёра — {$company} ({$name})";
    $body = "Новый запрос от партнёра\n\n";
    $body .= "Компания: {$company}\n";
    $body .= "Имя: {$name}\n";
    $body .= "Email: {$email}\n";
    $body .= "\nСообщение:\n{$message}\n";
    $body .= "\n---\nОтправлено с сайта termburg.ru";

    $headers = array(
        "Content-Type: text/plain; charset=UTF-8",
        "Reply-To: {$name} <{$email}>",
    );

    wp_mail(TERMBURG_LEAD_EMAILS, $subject, $body, $headers);

    return new WP_REST_Response(array("success" => true, "message" => "Запрос отправлен"), 200);
}

/**
 * WooCommerce new order — notify lead emails
 */
add_action("woocommerce_new_order", function($order_id) {
    $order = wc_get_order($order_id);
    if (!$order) return;

    $name = $order->get_billing_first_name() . " " . $order->get_billing_last_name();
    $email = $order->get_billing_email();
    $phone = $order->get_billing_phone();
    $total = $order->get_total();
    $items = array();
    foreach ($order->get_items() as $item) {
        $items[] = $item->get_name() . " x" . $item->get_quantity();
    }

    $subject = "Новый заказ #{$order_id} — {$total} ₽";
    $body = "Новый заказ на сайте Термбург\n\n";
    $body .= "Заказ: #{$order_id}\n";
    $body .= "Сумма: {$total} ₽\n";
    $body .= "Клиент: {$name}\n";
    $body .= "Email: {$email}\n";
    $body .= "Телефон: {$phone}\n";
    $body .= "\nТовары:\n" . implode("\n", $items) . "\n";
    $body .= "\n---\nОтправлено с сайта termburg.ru";

    $headers = array("Content-Type: text/plain; charset=UTF-8");
    wp_mail(TERMBURG_LEAD_EMAILS, $subject, $body, $headers);
});
