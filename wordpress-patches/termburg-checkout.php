<?php
/**
 * Termburg Checkout API
 * Creates WooCommerce order and redirects to YooKassa payment
 */

add_action("rest_api_init", function() {

    // Create order and get payment URL
    register_rest_route("termburg/v1", "/checkout/create", array(
        "methods" => "POST",
        "callback" => "termburg_create_order",
        "permission_callback" => "__return_true",
    ));

    // Get order status
    register_rest_route("termburg/v1", "/checkout/status/(?P<id>\d+)", array(
        "methods" => "GET",
        "callback" => "termburg_order_status",
        "permission_callback" => "__return_true",
    ));

    // Availability for additional service bookings (massage, SPA, steaming).
    register_rest_route("termburg/v1", "/checkout/service-slots", array(
        "methods" => "GET",
        "callback" => "termburg_checkout_service_slots",
        "permission_callback" => "__return_true",
    ));

    // List user orders
    register_rest_route("termburg/v1", "/checkout/orders", array(
        "methods" => "GET",
        "callback" => "termburg_user_orders",
        "permission_callback" => "__return_true",
    ));

    // Attach a paid guest order to an authenticated customer.
    register_rest_route("termburg/v1", "/checkout/claim", array(
        "methods" => "POST",
        "callback" => "termburg_claim_order",
        "permission_callback" => "__return_true",
    ));
});

add_filter("woocommerce_get_return_url", "termburg_checkout_use_order_return_url", 10, 2);
add_filter("woocommerce_get_cancel_order_url", "termburg_checkout_use_order_cancel_url", 10, 2);
add_filter("woocommerce_get_cancel_order_url_raw", "termburg_checkout_use_order_cancel_url", 10, 2);
add_action("template_redirect", "termburg_checkout_handle_yookassa_return_url");
add_action("admin_menu", "termburg_checkout_register_service_bookings_admin_page");
add_filter("manage_edit-shop_order_columns", "termburg_checkout_add_service_booking_order_column", 40);
add_action("manage_shop_order_posts_custom_column", "termburg_checkout_render_service_booking_order_column", 40, 2);
add_filter("woocommerce_shop_order_list_table_columns", "termburg_checkout_add_service_booking_order_column", 40);
add_action("woocommerce_shop_order_list_table_custom_column", "termburg_checkout_render_hpos_service_booking_order_column", 40, 2);
add_action("add_meta_boxes_shop_order", "termburg_checkout_add_service_booking_order_metabox");
add_action("add_meta_boxes_woocommerce_page_wc-orders", "termburg_checkout_add_service_booking_order_metabox");

function termburg_checkout_use_order_return_url($return_url, $order) {
    if ($order instanceof WC_Order) {
        $custom_return_url = $order->get_meta("_termburg_return_url");
        if ($custom_return_url) {
            return esc_url_raw($custom_return_url);
        }
    }

    return $return_url;
}

function termburg_checkout_use_order_cancel_url($cancel_url, $order) {
    if ($order instanceof WC_Order) {
        return esc_url_raw(termburg_checkout_build_cancel_url($order));
    }

    return $cancel_url;
}

function termburg_checkout_handle_yookassa_return_url() {
    $request_path = isset($_SERVER["REQUEST_URI"])
        ? wp_parse_url(wp_unslash($_SERVER["REQUEST_URI"]), PHP_URL_PATH)
        : "";

    if (trim((string) $request_path, "/") !== "yookassa/returnUrl") {
        return;
    }

    $order_key = isset($_GET["yookassa-order-id"])
        ? sanitize_text_field(wp_unslash($_GET["yookassa-order-id"]))
        : "";

    if (!$order_key || !function_exists("wc_get_order_id_by_order_key")) {
        wp_safe_redirect(home_url("/"));
        exit;
    }

    $order_id = wc_get_order_id_by_order_key($order_key);
    $order = $order_id ? wc_get_order($order_id) : false;

    if (!$order instanceof WC_Order) {
        wp_safe_redirect(home_url("/"));
        exit;
    }

    if ($order->is_paid() || in_array($order->get_status(), array("processing", "completed"), true)) {
        wp_safe_redirect(termburg_checkout_build_return_url($order));
        exit;
    }

    wp_safe_redirect(home_url("/"));
    exit;
}

function termburg_create_order($request) {
    $params = $request->get_json_params();

    $product_name = sanitize_text_field(isset($params["name"]) ? $params["name"] : "");
    $amount = floatval(isset($params["amount"]) ? $params["amount"] : 0);
    $quantity = max(1, intval(isset($params["quantity"]) ? $params["quantity"] : 1));
    $email = sanitize_email(isset($params["email"]) ? $params["email"] : "");
    $phone = sanitize_text_field(isset($params["phone"]) ? $params["phone"] : "");
    $name = sanitize_text_field(isset($params["customerName"]) ? $params["customerName"] : "");
    $requires_visit_ticket = !empty($params["requires_visit_ticket"]);
    $visit_ticket_amount = floatval(isset($params["visit_ticket_amount"]) ? $params["visit_ticket_amount"] : 0);
    $visit_ticket_date = sanitize_text_field(isset($params["visit_ticket_date"]) ? $params["visit_ticket_date"] : "");
    $visit_ticket_tariff = sanitize_text_field(isset($params["visit_ticket_tariff"]) ? $params["visit_ticket_tariff"] : "");
    $promo_code = sanitize_text_field(isset($params["promoCode"]) ? $params["promoCode"] : (isset($params["promo_code"]) ? $params["promo_code"] : ""));

    if (empty($product_name) || $amount <= 0) {
        return new WP_REST_Response(array("error" => "Product name and amount required"), 400);
    }

    if ($requires_visit_ticket && ($visit_ticket_amount <= 0 || $amount <= $visit_ticket_amount || empty($visit_ticket_date) || empty($visit_ticket_tariff))) {
        return new WP_REST_Response(array("error" => "Для дополнительной услуги обязателен оплачиваемый входной билет"), 400);
    }

    $is_certificate_order = !empty($params["cert_design"]) || termburg_checkout_contains($product_name, "сертификат");
    if ($is_certificate_order && !termburg_is_valid_certificate_amount($amount)) {
        return new WP_REST_Response(array("error" => "Сумма сертификата должна быть от 1 000 ₽ и кратна 500 ₽"), 400);
    }

    if (empty($email)) {
        return new WP_REST_Response(array("error" => "Укажите email для получения чека"), 400);
    }

    if (!class_exists("WC_Order")) {
        return new WP_REST_Response(array("error" => "WooCommerce not available"), 500);
    }

    $line_items = termburg_checkout_normalize_line_items(
        isset($params["line_items"]) ? $params["line_items"] : array(),
        $product_name,
        $amount,
        $quantity
    );
    $line_items_total = termburg_checkout_line_items_total($line_items);
    if (abs($line_items_total - $amount) > 0.01) {
        return new WP_REST_Response(array(
            "code" => "invalid_line_items_total",
            "error" => "Сумма позиций чека не совпадает с суммой заказа",
            "expected" => $amount,
            "actual" => $line_items_total,
        ), 400);
    }

    $promo_validation = null;
    if ($promo_code !== "") {
        if (!function_exists("termburg_promocodes_validate_checkout_code")) {
            return new WP_REST_Response(array(
                "code" => "promocodes_unavailable",
                "error" => "Проверка промокода сейчас недоступна",
            ), 503);
        }

        $promo_validation = termburg_promocodes_validate_checkout_code($promo_code, $line_items, array(
            "email" => $email,
            "phone" => $phone,
        ));

        if (is_wp_error($promo_validation)) {
            return new WP_REST_Response(array(
                "code" => $promo_validation->get_error_code(),
                "error" => $promo_validation->get_error_message(),
            ), 400);
        }

        if (abs(floatval($promo_validation["total_before_discount"]) - $line_items_total) > 0.01) {
            return new WP_REST_Response(array(
                "code" => "invalid_promo_total",
                "error" => "Не удалось согласовать сумму заказа со скидкой",
            ), 400);
        }
    }

    $service_booking_required = $requires_visit_ticket && termburg_checkout_line_items_have_service($line_items);
    $service_booking = termburg_checkout_normalize_service_booking($params, $line_items);
    if ($service_booking_required) {
        if (is_wp_error($service_booking)) {
            return new WP_REST_Response(array(
                "code" => $service_booking->get_error_code(),
                "error" => $service_booking->get_error_message(),
            ), 400);
        }

        if (!termburg_checkout_service_booking_is_available($service_booking["date"], $service_booking["start_hour"], $service_booking["hours"], 0, $service_booking["section"])) {
            return new WP_REST_Response(array(
                "code" => "service_slot_unavailable",
                "error" => "Выбранное время услуги уже занято. Пожалуйста, выберите другой час.",
            ), 409);
        }
    } elseif (is_wp_error($service_booking)) {
        $service_booking = null;
    }

    // Create order
    $order = wc_create_order();
    $order_key = $order->get_order_key();
    $return_url = termburg_checkout_build_return_url($order);
    $service_booking_item_added = false;
    $promo_line_discounts = termburg_checkout_promo_line_discounts($promo_validation);

    foreach ($line_items as $line_index => $line) {
        $product_id = termburg_find_or_create_product($line["name"], $line["price"]);
        if (!$product_id) {
            return new WP_REST_Response(array("error" => "Failed to create product"), 500);
        }

        $item = new WC_Order_Item_Product();
        $product = wc_get_product($product_id);
        if ($product) {
            $item->set_product($product);
        }

        $line_total = round($line["price"] * $line["quantity"], 2);
        $line_discount = isset($promo_line_discounts[$line_index]) ? min($line_total, max(0, floatval($promo_line_discounts[$line_index]))) : 0;
        $discounted_line_total = round($line_total - $line_discount, 2);
        $item_name = $line_discount > 0
            ? termburg_checkout_promo_receipt_name($line["name"], $promo_validation["campaign_name"], $line_discount)
            : $line["name"];
        $item->set_name($item_name);
        $item->set_quantity($line["quantity"]);
        $item->set_subtotal($line_total);
        $item->set_total($discounted_line_total);
        if (!empty($line["kind"])) {
            $item->add_meta_data("_termburg_kind", $line["kind"], true);
        }
        if (!empty($line["product_key"])) {
            $item->add_meta_data("_termburg_product_key", $line["product_key"], true);
        }
        if (!empty($line["product_group"])) {
            $item->add_meta_data("_termburg_product_group", $line["product_group"], true);
        }
        if (!empty($line["source"])) {
            $item->add_meta_data("_termburg_source", $line["source"], true);
        }
        if (!empty($line["source_id"])) {
            $item->add_meta_data("_termburg_source_id", $line["source_id"], true);
        }
        if ($line_discount > 0) {
            $item->add_meta_data("Акция", $promo_validation["campaign_name"], true);
            $item->add_meta_data("Промокод", $promo_validation["code"], true);
            $item->add_meta_data("Скидка", number_format($line_discount, 2, ",", " ") . " ₽", true);
        }
        if (!empty($line["duration"])) {
            $item->add_meta_data("Длительность", $line["duration"], true);
        }
        if ($service_booking && !$service_booking_item_added && $line["kind"] === "service") {
            termburg_checkout_add_service_booking_meta_to_item($item, $service_booking);
            $service_booking_item_added = true;
        }
        if ($requires_visit_ticket && $line_index === 0) {
            $item->add_meta_data("Входной билет обязателен", "Да", true);
            $item->add_meta_data("Стоимость входного билета", $visit_ticket_amount . " ₽", true);
            $item->add_meta_data("Дата входного билета", $visit_ticket_date, true);
            $item->add_meta_data("Тариф входного билета", $visit_ticket_tariff, true);
        }
        if ($line_index === 0) {
            termburg_checkout_add_certificate_meta_to_item($item, $params);
        }

        $order->add_item($item);
    }

    // Set billing info
    $order->set_billing_email($email);
    if ($phone) $order->set_billing_phone($phone);
    if ($name) {
        $parts = explode(" ", $name, 2);
        $order->set_billing_first_name($parts[0]);
        if (isset($parts[1])) $order->set_billing_last_name($parts[1]);
    }

    // Link to user if authenticated.
    // Main path: React auth token from localStorage.
    // Fallback: WP cookie auth from the open WP admin session.
    $user_id = termburg_get_user_from_token_checkout($request);
    if (!$user_id && get_current_user_id()) {
        $user_id = get_current_user_id();
    }
    if (!$user_id) {
        $user_id = termburg_get_wp_cookie_user_id_for_checkout();
    }

    if ($user_id) {
        $order->set_customer_id($user_id);
    }

    if ($promo_validation) {
        $promo_validation["discount_applied_to_items"] = true;
        $promo_result = termburg_promocodes_apply_to_order($order, $promo_validation);
        if (is_wp_error($promo_result)) {
            return new WP_REST_Response(array(
                "code" => $promo_result->get_error_code(),
                "error" => $promo_result->get_error_message(),
            ), 400);
        }
    }

    // Set payment method
    $order->set_payment_method("yookassa_epl");
    $order->set_payment_method_title("ЮKassa");

    // Calculate totals
    $order->calculate_totals();

    // Generate UUID for Dolphin
    $uuid = wp_generate_uuid4();
    $order->update_meta_data("_custom_uuid", $uuid);
    $order->update_meta_data("_termburg_return_url", $return_url);
    if ($service_booking) {
        termburg_checkout_save_order_service_booking($order, $service_booking);
    }

    // Save order
    $order->save();

    // Admin test mode: create the order and trigger normal post-payment hooks
    // without redirecting to YooKassa. Guarded by a server flag and real WP caps.
    $admin_test_enabled = defined('TERMBURG_ADMIN_SKIP_PAYMENT') && TERMBURG_ADMIN_SKIP_PAYMENT;
    $is_admin_test = $admin_test_enabled && termburg_checkout_user_can_admin_test($user_id);

    if ($is_admin_test) {
        $order->set_payment_method('admin_test');
        $order->set_payment_method_title('Тест администратора без оплаты');
        $order->update_meta_data('_termburg_admin_test_checkout', 1);
        $order->update_meta_data('_termburg_admin_test_user_id', $user_id);
        $order->save();

        // processing triggers termburg_maybe_send_cert_pdf()
        $order->update_status('processing', 'Тестовый заказ администратора: оплата пропущена.');

        return new WP_REST_Response(array(
            "orderId" => $order->get_id(),
            "orderKey" => $order_key,
            "uuid" => $uuid,
            "total" => $order->get_total(),
            "discount" => $promo_validation ? floatval($promo_validation["discount_amount"]) : 0,
            "campaignName" => $promo_validation ? $promo_validation["campaign_name"] : "",
            "status" => $order->get_status(),
            "paymentUrl" => "",
            "adminTestMode" => true,
        ), 201);
    }

    // Get payment URL
    $payment_url = "";
    $available_gateways = WC()->payment_gateways->get_available_payment_gateways();
    if (isset($available_gateways["yookassa_epl"])) {
        $gateway = $available_gateways["yookassa_epl"];
        $result = $gateway->process_payment($order->get_id());
        if (isset($result["result"]) && $result["result"] === "success" && isset($result["redirect"])) {
            $payment_url = $result["redirect"];
        }
    }

    if (empty($payment_url)) {
        // Fallback: use WC checkout URL
        $payment_url = $order->get_checkout_payment_url();
    }

    return new WP_REST_Response(array(
        "orderId" => $order->get_id(),
        "orderKey" => $order_key,
        "uuid" => $uuid,
        "total" => $order->get_total(),
        "discount" => $promo_validation ? floatval($promo_validation["discount_amount"]) : 0,
        "campaignName" => $promo_validation ? $promo_validation["campaign_name"] : "",
        "status" => $order->get_status(),
        "paymentUrl" => $payment_url,
        "serviceBooking" => $service_booking ? termburg_checkout_format_order_service_booking($order) : null,
    ), 201);
}

function termburg_order_status($request) {
    $order_id = intval($request->get_param("id"));
    $order = wc_get_order($order_id);

    if (!$order) {
        return new WP_REST_Response(array("error" => "Order not found"), 404);
    }

    if (!termburg_checkout_request_can_access_order($request, $order)) {
        return new WP_REST_Response(array("error" => "Unauthorized"), 401);
    }

    return new WP_REST_Response(array(
        "orderId" => $order->get_id(),
        "status" => $order->get_status(),
        "total" => $order->get_total(),
        "paymentMethod" => $order->get_payment_method_title(),
        "serviceBooking" => termburg_checkout_format_order_service_booking($order),
        "dateCreated" => $order->get_date_created() ? $order->get_date_created()->format("Y-m-d H:i:s") : null,
    ), 200);
}

function termburg_user_orders($request) {
    $user_id = termburg_get_user_from_token_checkout($request);
    if (!$user_id) {
        return new WP_REST_Response(array("error" => "Unauthorized"), 401);
    }

    $orders = wc_get_orders(array(
        "customer_id" => $user_id,
        "limit" => 20,
        "orderby" => "date",
        "order" => "DESC",
    ));

    $result = array();
    foreach ($orders as $order) {
        $items = array();
        foreach ($order->get_items() as $item) {
            $items[] = array(
                "name" => $item->get_name(),
                "quantity" => $item->get_quantity(),
                "total" => $item->get_total(),
            );
        }

        $result[] = array(
            "orderId" => $order->get_id(),
            "status" => $order->get_status(),
            "total" => $order->get_total(),
            "items" => $items,
            "serviceBooking" => termburg_checkout_format_order_service_booking($order),
            "dateCreated" => $order->get_date_created() ? $order->get_date_created()->format("Y-m-d H:i:s") : null,
        );
    }

    return new WP_REST_Response($result, 200);
}

function termburg_claim_order($request) {
    $user_id = termburg_get_user_from_token_checkout($request);
    if (!$user_id) {
        return new WP_REST_Response(array("error" => "Unauthorized"), 401);
    }

    $params = $request->get_json_params();
    $order_id = intval(isset($params["orderId"]) ? $params["orderId"] : 0);
    $order_key = sanitize_text_field(isset($params["orderKey"]) ? $params["orderKey"] : "");
    $result = termburg_checkout_claim_order_for_user($order_id, $order_key, $user_id);

    if (is_wp_error($result)) {
        return new WP_REST_Response(array("error" => $result->get_error_message()), 400);
    }

    return new WP_REST_Response(array(
        "orderId" => $result->get_id(),
        "status" => $result->get_status(),
    ), 200);
}

function termburg_checkout_service_slots($request) {
    $date = sanitize_text_field($request->get_param("date"));
    $hours = max(1, min(24, intval($request->get_param("hours"))));
    $section = termburg_checkout_normalize_service_booking_section($request->get_param("section"));

    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        return new WP_REST_Response(array("error" => "Invalid date"), 400);
    }

    $settings = termburg_checkout_get_service_booking_hours_settings();
    $slots = termburg_checkout_build_service_booking_slots($date, $hours, 0, $section);
    foreach ($slots as &$slot) {
        $slot["bookingCount"] = isset($slot["bookings"]) && is_array($slot["bookings"]) ? count($slot["bookings"]) : 0;
        $slot["bookings"] = array();
    }
    unset($slot);

    return new WP_REST_Response(array(
        "date" => $date,
        "hours" => $hours,
        "section" => $section,
        "sectionLabel" => termburg_checkout_service_booking_section_label($section),
        "workingHours" => array(
            "startHour" => $settings["start_hour"],
            "startTime" => termburg_checkout_format_hour($settings["start_hour"]),
            "endHour" => $settings["end_hour"],
            "endTime" => termburg_checkout_format_hour($settings["end_hour"]),
        ),
        "slots" => $slots,
    ), 200);
}

function termburg_checkout_line_items_have_service($line_items) {
    foreach (is_array($line_items) ? $line_items : array() as $line) {
        if (isset($line["kind"]) && $line["kind"] === "service") {
            return true;
        }
    }

    return false;
}

function termburg_checkout_service_booking_sections() {
    return array(
        "massage" => "Массаж",
        "spa" => "SPA",
        "steaming" => "Парение",
        "service" => "Другое",
    );
}

function termburg_checkout_service_booking_section_label($section) {
    $section = sanitize_key($section);
    $sections = termburg_checkout_service_booking_sections();

    return isset($sections[$section]) ? $sections[$section] : $sections["service"];
}

function termburg_checkout_normalize_service_booking_section($section, $text = "") {
    $section = sanitize_key((string) $section);
    $sections = termburg_checkout_service_booking_sections();

    if (isset($sections[$section])) {
        return $section;
    }

    $text = trim((string) $text);
    if ($text !== "") {
        $normalized = function_exists("mb_strtolower") ? mb_strtolower($text, "UTF-8") : strtolower($text);

        if (termburg_checkout_contains($normalized, "массаж") || termburg_checkout_contains($normalized, "massage")) {
            return "massage";
        }
        if (termburg_checkout_contains($normalized, "spa") || termburg_checkout_contains($normalized, "спа")) {
            return "spa";
        }
        if (termburg_checkout_contains($normalized, "парени") || termburg_checkout_contains($normalized, "парение") || termburg_checkout_contains($normalized, "steaming") || termburg_checkout_contains($normalized, "steam")) {
            return "steaming";
        }
    }

    return "service";
}

function termburg_checkout_normalize_service_booking($params, $line_items) {
    $date = sanitize_text_field(isset($params["service_booking_date"]) ? $params["service_booking_date"] : "");
    $start_hour = isset($params["service_booking_start_hour"]) && $params["service_booking_start_hour"] !== ""
        ? intval($params["service_booking_start_hour"])
        : null;
    $hours = intval(isset($params["service_booking_hours"]) ? $params["service_booking_hours"] : 0);
    $label = sanitize_text_field(isset($params["service_booking_label"]) ? $params["service_booking_label"] : "");
    $section = sanitize_key(isset($params["service_booking_section"]) ? $params["service_booking_section"] : "");
    $duration = "";

    foreach (is_array($line_items) ? $line_items : array() as $line) {
        if (!isset($line["kind"]) || $line["kind"] !== "service") {
            continue;
        }

        if ($label === "") {
            $label = sanitize_text_field($line["name"]);
        }
        if ($duration === "" && !empty($line["duration"])) {
            $duration = sanitize_text_field($line["duration"]);
        }
        if ($date === "" && !empty($line["service_date"])) {
            $date = sanitize_text_field($line["service_date"]);
        }
        if ($start_hour === null && isset($line["service_start_hour"]) && $line["service_start_hour"] !== "") {
            $start_hour = intval($line["service_start_hour"]);
        }
        if ($hours <= 0 && !empty($line["reserved_hours"])) {
            $hours = intval($line["reserved_hours"]);
        }
        if ($section === "" && !empty($line["service_section"])) {
            $section = sanitize_key($line["service_section"]);
        }

        break;
    }

    $section = termburg_checkout_normalize_service_booking_section($section, trim($label . " " . $duration));

    if ($date === "" && $start_hour === null && $hours <= 0) {
        return new WP_Error("service_booking_missing", "Выберите дату и время услуги");
    }

    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        return new WP_Error("service_booking_invalid_date", "Некорректная дата услуги");
    }

    if ($date <= current_time("Y-m-d")) {
        return new WP_Error("service_booking_past_date", "Запись на услугу день в день недоступна. Выберите дату начиная с завтра");
    }

    $computed_hours = termburg_checkout_reserved_hours_from_duration($duration);
    $hours = max(1, min(24, max($hours, $computed_hours)));
    if ($hours > termburg_checkout_service_booking_window_hours()) {
        return new WP_Error("service_booking_too_long", "Длительность услуги не помещается в доступные часы записи");
    }

    if ($start_hour === null || $start_hour < termburg_checkout_service_booking_min_hour()) {
        return new WP_Error("service_booking_invalid_time", "Выберите час начала услуги");
    }
    if (termburg_checkout_service_booking_slot_is_past($date, $start_hour)) {
        return new WP_Error("service_booking_past_time", "Выбранный час услуги уже прошел");
    }

    $end_hour = $start_hour + $hours;
    if ($end_hour > termburg_checkout_service_booking_end_hour()) {
        return new WP_Error("service_booking_outside_hours", "Выбранное время выходит за доступные часы записи");
    }

    return array(
        "date" => $date,
        "start_hour" => $start_hour,
        "start_time" => termburg_checkout_format_hour($start_hour),
        "hours" => $hours,
        "end_hour" => $end_hour,
        "end_time" => termburg_checkout_format_hour($end_hour),
        "label" => $label,
        "section" => $section,
        "section_label" => termburg_checkout_service_booking_section_label($section),
        "duration" => $duration,
    );
}

function termburg_checkout_duration_minutes($duration) {
    $duration = trim((string) $duration);
    if ($duration === "") {
        return 60;
    }

    $normalized = function_exists("mb_strtolower") ? mb_strtolower($duration, "UTF-8") : strtolower($duration);
    $normalized = str_replace(",", ".", $normalized);
    $minutes = 0;

    if (preg_match_all('/(\d+(?:\.\d+)?)\s*(ч|час|часа|часов|h|hour|hours)/u', $normalized, $matches, PREG_SET_ORDER)) {
        foreach ($matches as $match) {
            $minutes += intval(round(floatval($match[1]) * 60));
        }
    }

    if (preg_match_all('/(\d+(?:\.\d+)?)\s*(м|мин|минута|минут|минуты|min|mins|minute|minutes)/u', $normalized, $matches, PREG_SET_ORDER)) {
        foreach ($matches as $match) {
            $minutes += intval(round(floatval($match[1])));
        }
    }

    if ($minutes <= 0 && preg_match('/\d+(?:\.\d+)?/', $normalized, $match)) {
        $minutes = intval(round(floatval($match[0])));
    }

    return max(1, $minutes);
}

function termburg_checkout_reserved_hours_from_duration($duration) {
    return max(1, intval(ceil(termburg_checkout_duration_minutes($duration) / 60)));
}

function termburg_checkout_get_service_booking_hours_settings() {
    $start_hour = intval(get_option("termburg_service_booking_start_hour", 9));
    $end_hour = intval(get_option("termburg_service_booking_end_hour", 21));

    $start_hour = max(0, min(23, $start_hour));
    $end_hour = max(1, min(24, $end_hour));

    if ($end_hour <= $start_hour) {
        $start_hour = 9;
        $end_hour = 21;
    }

    return array(
        "start_hour" => $start_hour,
        "end_hour" => $end_hour,
    );
}

function termburg_checkout_service_booking_min_hour() {
    $settings = termburg_checkout_get_service_booking_hours_settings();
    return $settings["start_hour"];
}

function termburg_checkout_service_booking_end_hour() {
    $settings = termburg_checkout_get_service_booking_hours_settings();
    return $settings["end_hour"];
}

function termburg_checkout_service_booking_window_hours() {
    return max(1, termburg_checkout_service_booking_end_hour() - termburg_checkout_service_booking_min_hour());
}

function termburg_checkout_format_hour($hour) {
    return sprintf("%02d:00", intval($hour));
}

function termburg_checkout_service_booking_slot_is_past($date, $start_hour) {
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', (string) $date)) {
        return true;
    }
    if ($date <= current_time("Y-m-d")) {
        return true;
    }

    try {
        $timezone = function_exists("wp_timezone") ? wp_timezone() : new DateTimeZone("UTC");
        $slot_datetime = new DateTimeImmutable($date . " " . termburg_checkout_format_hour($start_hour) . ":00", $timezone);
        $now_datetime = function_exists("current_datetime")
            ? current_datetime()
            : new DateTimeImmutable("now", $timezone);

        return $slot_datetime->getTimestamp() <= $now_datetime->getTimestamp();
    } catch (Exception $e) {
        return true;
    }
}

function termburg_checkout_service_booking_overlaps($start_hour, $hours, $booked_start_hour, $booked_hours) {
    $end_hour = intval($start_hour) + max(1, intval($hours));
    $booked_end_hour = intval($booked_start_hour) + max(1, intval($booked_hours));

    return intval($start_hour) < $booked_end_hour && intval($booked_start_hour) < $end_hour;
}

function termburg_checkout_service_booking_statuses() {
    return array("pending", "on-hold", "processing", "completed");
}

function termburg_checkout_get_service_bookings_for_date($date, $exclude_order_id = 0, $section = "") {
    if (!function_exists("wc_get_orders")) {
        return array();
    }

    $date = sanitize_text_field($date);
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        return array();
    }

    $section = $section ? termburg_checkout_normalize_service_booking_section($section) : "";

    $orders = wc_get_orders(array(
        "limit" => -1,
        "status" => termburg_checkout_service_booking_statuses(),
        "orderby" => "date",
        "order" => "ASC",
        "meta_query" => array(
            array(
                "key" => "_termburg_service_booking_date",
                "value" => $date,
                "compare" => "=",
            ),
        ),
    ));

    $bookings = array();
    foreach ($orders as $order) {
        if (!$order instanceof WC_Order) {
            continue;
        }
        if ($exclude_order_id && intval($order->get_id()) === intval($exclude_order_id)) {
            continue;
        }

        $booking = termburg_checkout_format_order_service_booking($order);
        if (!$booking || $booking["date"] !== $date) {
            continue;
        }
        if ($section && $booking["section"] !== $section) {
            continue;
        }

        $bookings[] = $booking;
    }

    return $bookings;
}

function termburg_checkout_build_service_booking_slots($date, $hours = 1, $exclude_order_id = 0, $section = "") {
    $hours = max(1, min(24, intval($hours)));
    if ($hours > termburg_checkout_service_booking_window_hours()) {
        return array();
    }

    $section = termburg_checkout_normalize_service_booking_section($section);
    $bookings = termburg_checkout_get_service_bookings_for_date($date, $exclude_order_id, $section);
    $slots = array();
    $last_start_hour = termburg_checkout_service_booking_end_hour() - $hours;

    for ($hour = termburg_checkout_service_booking_min_hour(); $hour <= $last_start_hour; $hour++) {
        $slot_bookings = array();
        $slot_is_past = termburg_checkout_service_booking_slot_is_past($date, $hour);
        foreach ($bookings as $booking) {
            if (termburg_checkout_service_booking_overlaps($hour, $hours, $booking["startHour"], $booking["hours"])) {
                $slot_bookings[] = $booking;
            }
        }

        $slots[] = array(
            "hour" => $hour,
            "label" => termburg_checkout_format_hour($hour),
            "endHour" => $hour + $hours,
            "endLabel" => termburg_checkout_format_hour($hour + $hours),
            "available" => empty($slot_bookings) && !$slot_is_past,
            "booked" => !empty($slot_bookings),
            "past" => $slot_is_past,
            "bookings" => $slot_bookings,
        );
    }

    return $slots;
}

function termburg_checkout_service_booking_is_available($date, $start_hour, $hours, $exclude_order_id = 0, $section = "") {
    if (termburg_checkout_service_booking_slot_is_past($date, $start_hour)) {
        return false;
    }

    $section = termburg_checkout_normalize_service_booking_section($section);
    $bookings = termburg_checkout_get_service_bookings_for_date($date, $exclude_order_id, $section);
    foreach ($bookings as $booking) {
        if (termburg_checkout_service_booking_overlaps($start_hour, $hours, $booking["startHour"], $booking["hours"])) {
            return false;
        }
    }

    return true;
}

function termburg_checkout_save_order_service_booking($order, $booking) {
    if (!$order instanceof WC_Order || !is_array($booking)) {
        return;
    }

    $order->update_meta_data("_termburg_service_booking_date", $booking["date"]);
    $order->update_meta_data("_termburg_service_booking_start_hour", $booking["start_hour"]);
    $order->update_meta_data("_termburg_service_booking_start_time", $booking["start_time"]);
    $order->update_meta_data("_termburg_service_booking_hours", $booking["hours"]);
    $order->update_meta_data("_termburg_service_booking_end_hour", $booking["end_hour"]);
    $order->update_meta_data("_termburg_service_booking_end_time", $booking["end_time"]);
    $order->update_meta_data("_termburg_service_booking_label", $booking["label"]);
    $order->update_meta_data("_termburg_service_booking_section", $booking["section"]);
    $order->update_meta_data("_termburg_service_booking_section_label", $booking["section_label"]);
    $order->update_meta_data("_termburg_service_booking_duration", $booking["duration"]);
}

function termburg_checkout_add_service_booking_meta_to_item($item, $booking) {
    if (!$item instanceof WC_Order_Item || !is_array($booking)) {
        return;
    }

    $item->add_meta_data("Дата услуги", $booking["date"], true);
    $item->add_meta_data("Время услуги", $booking["start_time"] . "–" . $booking["end_time"], true);
    $item->add_meta_data("Раздел услуги", $booking["section_label"], true);
    $item->add_meta_data("Забронировано часов", $booking["hours"], true);
}

function termburg_checkout_format_order_service_booking($order) {
    if (!$order instanceof WC_Order) {
        return null;
    }

    $date = sanitize_text_field($order->get_meta("_termburg_service_booking_date"));
    $start_hour = intval($order->get_meta("_termburg_service_booking_start_hour"));
    $hours = max(1, intval($order->get_meta("_termburg_service_booking_hours")));

    if (!$date || !$start_hour) {
        return null;
    }

    $end_hour = intval($order->get_meta("_termburg_service_booking_end_hour"));
    if (!$end_hour) {
        $end_hour = $start_hour + $hours;
    }

    $label = sanitize_text_field($order->get_meta("_termburg_service_booking_label"));
    if (!$label) {
        foreach ($order->get_items() as $item) {
            $label = $item->get_name();
            break;
        }
    }

    $section = termburg_checkout_normalize_service_booking_section($order->get_meta("_termburg_service_booking_section"), $label);
    $section_label = sanitize_text_field($order->get_meta("_termburg_service_booking_section_label"));
    if (!$section_label) {
        $section_label = termburg_checkout_service_booking_section_label($section);
    }

    return array(
        "date" => $date,
        "startHour" => $start_hour,
        "startTime" => termburg_checkout_format_hour($start_hour),
        "hours" => $hours,
        "endHour" => $end_hour,
        "endTime" => termburg_checkout_format_hour($end_hour),
        "label" => $label,
        "section" => $section,
        "sectionLabel" => $section_label,
        "duration" => sanitize_text_field($order->get_meta("_termburg_service_booking_duration")),
        "orderId" => $order->get_id(),
        "orderNumber" => $order->get_order_number(),
        "status" => $order->get_status(),
        "customerName" => $order->get_formatted_billing_full_name(),
        "phone" => $order->get_billing_phone(),
        "email" => $order->get_billing_email(),
        "editUrl" => $order->get_edit_order_url(),
    );
}

function termburg_checkout_register_service_bookings_admin_page() {
    add_submenu_page(
        "woocommerce",
        "Бронирование услуг",
        "Бронирование услуг",
        "manage_woocommerce",
        "termburg-service-bookings",
        "termburg_checkout_render_service_bookings_admin_page"
    );
}

function termburg_checkout_render_service_bookings_admin_page() {
    if (!current_user_can("manage_woocommerce") && !current_user_can("manage_options")) {
        wp_die(esc_html__("You do not have permission to access this page."));
    }

    $settings_notice = "";
    if (
        isset($_POST["termburg_service_booking_settings"])
        && isset($_POST["termburg_service_booking_settings_nonce"])
        && wp_verify_nonce(sanitize_text_field(wp_unslash($_POST["termburg_service_booking_settings_nonce"])), "termburg_service_booking_settings")
    ) {
        $new_start_hour = isset($_POST["service_booking_start_hour"]) ? absint(wp_unslash($_POST["service_booking_start_hour"])) : 9;
        $new_end_hour = isset($_POST["service_booking_end_hour"]) ? absint(wp_unslash($_POST["service_booking_end_hour"])) : 21;
        $new_start_hour = max(0, min(23, $new_start_hour));
        $new_end_hour = max(1, min(24, $new_end_hour));

        if ($new_end_hour <= $new_start_hour) {
            $settings_notice = '<div class="notice notice-error"><p>Час окончания должен быть позже часа начала.</p></div>';
        } else {
            update_option("termburg_service_booking_start_hour", $new_start_hour, false);
            update_option("termburg_service_booking_end_hour", $new_end_hour, false);
            $settings_notice = '<div class="notice notice-success is-dismissible"><p>Часы работы услуг сохранены.</p></div>';
        }
    }

    $date = isset($_GET["service_booking_date"])
        ? sanitize_text_field(wp_unslash($_GET["service_booking_date"]))
        : current_time("Y-m-d");
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        $date = current_time("Y-m-d");
    }

    $previous_date = date("Y-m-d", strtotime($date . " -1 day"));
    $next_date = date("Y-m-d", strtotime($date . " +1 day"));
    $sections = termburg_checkout_service_booking_sections();
    unset($sections["service"]);
    $selected_section = isset($_GET["service_booking_section"])
        ? termburg_checkout_normalize_service_booking_section(wp_unslash($_GET["service_booking_section"]))
        : "massage";
    if (!isset($sections[$selected_section])) {
        $selected_section = "massage";
    }
    $bookings = termburg_checkout_get_service_bookings_for_date($date, 0, $selected_section);
    $settings = termburg_checkout_get_service_booking_hours_settings();
    $last_one_hour_start = max($settings["start_hour"], $settings["end_hour"] - 1);

    echo '<div class="wrap termburg-service-bookings">';
    echo '<h1>Бронирование услуг</h1>';
    echo $settings_notice;
    echo '<p>Показываются заказы со временем услуги: массаж, SPA, парение и другие дополнительные услуги с обязательным входным билетом.</p>';
    echo '<style>
        .termburg-service-bookings .tb-toolbar{display:flex;gap:12px;align-items:center;margin:16px 0 20px;flex-wrap:wrap}
        .termburg-service-bookings .tb-settings{margin:16px 0 20px;padding:14px 16px;border:1px solid #dcdcde;background:#fff;border-radius:6px;max-width:760px}
        .termburg-service-bookings .tb-settings-row{display:flex;gap:12px;align-items:end;flex-wrap:wrap}
        .termburg-service-bookings .tb-field label{display:block;margin-bottom:4px;font-weight:600}
        .termburg-service-bookings .tb-date{padding:6px 10px}
        .termburg-service-bookings .tb-table td,.termburg-service-bookings .tb-table th{vertical-align:top}
        .termburg-service-bookings .tb-free{color:#2271b1;font-weight:600}
        .termburg-service-bookings .tb-busy{color:#b32d2e;font-weight:700}
        .termburg-service-bookings .tb-booking{margin:0 0 8px;padding:8px 10px;border:1px solid #dcdcde;border-radius:6px;background:#fff}
        .termburg-service-bookings .tb-muted{color:#646970}
    </style>';

    echo '<form class="tb-settings" method="post">';
    wp_nonce_field("termburg_service_booking_settings", "termburg_service_booking_settings_nonce");
    echo '<input type="hidden" name="termburg_service_booking_settings" value="1" />';
    echo '<h2 style="margin-top:0">Часы работы услуг</h2>';
    echo '<div class="tb-settings-row">';
    echo '<div class="tb-field"><label for="service_booking_start_hour">Начало</label><select id="service_booking_start_hour" name="service_booking_start_hour">';
    for ($hour = 0; $hour <= 23; $hour++) {
        echo '<option value="' . esc_attr($hour) . '"' . selected($settings["start_hour"], $hour, false) . '>' . esc_html(termburg_checkout_format_hour($hour)) . '</option>';
    }
    echo '</select></div>';
    echo '<div class="tb-field"><label for="service_booking_end_hour">Окончание</label><select id="service_booking_end_hour" name="service_booking_end_hour">';
    for ($hour = 1; $hour <= 24; $hour++) {
        echo '<option value="' . esc_attr($hour) . '"' . selected($settings["end_hour"], $hour, false) . '>' . esc_html(termburg_checkout_format_hour($hour)) . '</option>';
    }
    echo '</select></div>';
    echo '<button class="button button-primary" type="submit">Сохранить часы</button>';
    echo '</div>';
    echo '<p class="description">Окончание — это граница бронирования. Сейчас окно ' . esc_html(termburg_checkout_format_hour($settings["start_hour"]) . "–" . termburg_checkout_format_hour($settings["end_hour"])) . ', последний старт для услуги на 1 ч: ' . esc_html(termburg_checkout_format_hour($last_one_hour_start)) . '.</p>';
    echo '</form>';

    echo '<form class="tb-toolbar" method="get">';
    echo '<input type="hidden" name="page" value="termburg-service-bookings" />';
    echo '<a class="button" href="' . esc_url(add_query_arg(array("page" => "termburg-service-bookings", "service_booking_date" => $previous_date, "service_booking_section" => $selected_section), admin_url("admin.php"))) . '">← Предыдущий день</a>';
    echo '<input class="tb-date" type="date" name="service_booking_date" value="' . esc_attr($date) . '" />';
    echo '<select name="service_booking_section">';
    foreach ($sections as $section_key => $section_label) {
        echo '<option value="' . esc_attr($section_key) . '"' . selected($selected_section, $section_key, false) . '>' . esc_html($section_label) . '</option>';
    }
    echo '</select>';
    echo '<button class="button button-primary" type="submit">Показать</button>';
    echo '<a class="button" href="' . esc_url(add_query_arg(array("page" => "termburg-service-bookings", "service_booking_date" => $next_date, "service_booking_section" => $selected_section), admin_url("admin.php"))) . '">Следующий день →</a>';
    echo '</form>';
    echo '<p><strong>Раздел:</strong> ' . esc_html(termburg_checkout_service_booking_section_label($selected_section)) . '</p>';

    echo '<table class="widefat striped tb-table">';
    echo '<thead><tr><th style="width:110px">Час</th><th style="width:120px">Статус</th><th>Заказы</th></tr></thead><tbody>';

    for ($hour = termburg_checkout_service_booking_min_hour(); $hour < termburg_checkout_service_booking_end_hour(); $hour++) {
        $hour_bookings = array();
        foreach ($bookings as $booking) {
            if (termburg_checkout_service_booking_overlaps($hour, 1, $booking["startHour"], $booking["hours"])) {
                $hour_bookings[] = $booking;
            }
        }

        echo '<tr>';
        echo '<td><strong>' . esc_html(termburg_checkout_format_hour($hour)) . '</strong></td>';
        echo empty($hour_bookings) ? '<td class="tb-free">Свободно</td>' : '<td class="tb-busy">Занято</td>';
        echo '<td>';
        if (empty($hour_bookings)) {
            echo '<span class="tb-muted">Нет броней на этот час</span>';
        } else {
            foreach ($hour_bookings as $booking) {
                $order_url = !empty($booking["editUrl"]) ? $booking["editUrl"] : get_edit_post_link($booking["orderId"]);
                $status_label = function_exists("wc_get_order_status_name")
                    ? wc_get_order_status_name("wc-" . $booking["status"])
                    : $booking["status"];

                echo '<div class="tb-booking">';
                echo '<strong>' . esc_html($booking["startTime"] . "–" . $booking["endTime"]) . '</strong> ';
                echo esc_html($booking["label"]);
                echo '<br><a href="' . esc_url($order_url) . '">Заказ #' . esc_html($booking["orderNumber"]) . '</a>';
                echo ' · ' . esc_html($status_label);
                if (!empty($booking["customerName"])) {
                    echo ' · ' . esc_html($booking["customerName"]);
                }
                if (!empty($booking["phone"])) {
                    echo '<br><span class="tb-muted">' . esc_html($booking["phone"]) . '</span>';
                }
                echo '</div>';
            }
        }
        echo '</td>';
        echo '</tr>';
    }

    echo '</tbody></table>';
    echo '</div>';
}

function termburg_checkout_add_service_booking_order_column($columns) {
    if (isset($columns["termburg_service_booking"])) {
        return $columns;
    }

    $new_columns = array();
    $inserted = false;
    foreach ($columns as $key => $label) {
        if (!$inserted && in_array($key, array("order_status", "order_total", "wc_actions"), true)) {
            $new_columns["termburg_service_booking"] = "Время услуги";
            $inserted = true;
        }
        $new_columns[$key] = $label;
    }

    if (!$inserted) {
        $new_columns["termburg_service_booking"] = "Время услуги";
    }

    return $new_columns;
}

function termburg_checkout_render_service_booking_order_column($column, $post_id) {
    if ($column !== "termburg_service_booking") {
        return;
    }

    $order = wc_get_order($post_id);
    termburg_checkout_echo_order_service_booking_summary($order);
}

function termburg_checkout_render_hpos_service_booking_order_column($column, $order) {
    if ($column !== "termburg_service_booking") {
        return;
    }

    termburg_checkout_echo_order_service_booking_summary($order);
}

function termburg_checkout_echo_order_service_booking_summary($order) {
    $booking = termburg_checkout_format_order_service_booking($order);
    if (!$booking) {
        echo '<span class="na">—</span>';
        return;
    }

    echo '<strong>' . esc_html($booking["date"]) . '</strong><br>';
    echo esc_html($booking["sectionLabel"] . ": " . $booking["startTime"] . "–" . $booking["endTime"]);
}

function termburg_checkout_add_service_booking_order_metabox() {
    $screen = function_exists("get_current_screen") ? get_current_screen() : null;
    $screen_id = $screen && !empty($screen->id) ? $screen->id : "shop_order";

    add_meta_box(
        "termburg_service_booking",
        "Бронирование услуги",
        "termburg_checkout_render_service_booking_order_metabox",
        $screen_id,
        "side",
        "high"
    );
}

function termburg_checkout_render_service_booking_order_metabox($post_or_order) {
    $order = null;
    if ($post_or_order instanceof WC_Order) {
        $order = $post_or_order;
    } elseif ($post_or_order instanceof WP_Post) {
        $order = wc_get_order($post_or_order->ID);
    } elseif (isset($_GET["id"])) {
        $order = wc_get_order(absint($_GET["id"]));
    }

    $booking = termburg_checkout_format_order_service_booking($order);
    if (!$booking) {
        echo '<p>Для этого заказа время услуги не указано.</p>';
        return;
    }

    echo '<p><strong>Дата:</strong> ' . esc_html($booking["date"]) . '</p>';
    echo '<p><strong>Время:</strong> ' . esc_html($booking["startTime"] . "–" . $booking["endTime"]) . '</p>';
    echo '<p><strong>Раздел:</strong> ' . esc_html($booking["sectionLabel"]) . '</p>';
    echo '<p><strong>Услуга:</strong> ' . esc_html($booking["label"]) . '</p>';
    echo '<p><strong>Бронь:</strong> ' . esc_html($booking["hours"]) . ' ч.</p>';
    echo '<p><a class="button" href="' . esc_url(add_query_arg(array("page" => "termburg-service-bookings", "service_booking_date" => $booking["date"], "service_booking_section" => $booking["section"]), admin_url("admin.php"))) . '">Открыть день</a></p>';
}

function termburg_checkout_build_return_url($order) {
    return add_query_arg(array(
        "payment" => "success",
        "order_id" => $order->get_id(),
        "key" => $order->get_order_key(),
    ), home_url("/"));
}

function termburg_checkout_build_cancel_url($order) {
    return home_url("/");
}

function termburg_checkout_request_can_access_order($request, $order) {
    $order_key = sanitize_text_field($request->get_param("key"));
    if ($order_key && hash_equals($order->get_order_key(), $order_key)) {
        return true;
    }

    $user_id = termburg_get_user_from_token_checkout($request);
    if (!$user_id) return false;

    return intval($order->get_customer_id()) === intval($user_id)
        || user_can($user_id, "manage_woocommerce")
        || user_can($user_id, "manage_options");
}

function termburg_checkout_get_claimable_order($order_id, $order_key, $email) {
    $order = wc_get_order($order_id);
    if (!$order) {
        return new WP_Error("termburg_order_not_found", "Order not found");
    }

    if (!$order_key || !hash_equals($order->get_order_key(), $order_key)) {
        return new WP_Error("termburg_invalid_order_key", "Invalid order key");
    }

    if (!in_array($order->get_status(), array("processing", "completed"), true)) {
        return new WP_Error("termburg_order_not_paid", "Order payment is not confirmed");
    }

    $billing_email = sanitize_email($order->get_billing_email());
    if (!$billing_email || strtolower($billing_email) !== strtolower(sanitize_email($email))) {
        return new WP_Error("termburg_order_email_mismatch", "Order email does not match account email");
    }

    return $order;
}

function termburg_checkout_claim_order_for_user($order_id, $order_key, $user_id) {
    $user = get_userdata($user_id);
    if (!$user) {
        return new WP_Error("termburg_user_not_found", "User not found");
    }

    $order = termburg_checkout_get_claimable_order($order_id, $order_key, $user->user_email);
    if (is_wp_error($order)) return $order;

    $customer_id = intval($order->get_customer_id());
    if ($customer_id && $customer_id !== intval($user_id)) {
        return new WP_Error("termburg_order_already_claimed", "Order already belongs to another account");
    }

    if (!$customer_id) {
        $order->set_customer_id($user_id);
        $order->save();
    }

    return $order;
}

function termburg_emoji_to_hex($str) {
    if (empty($str)) return "";
    // Если уже hex через запятую — возвращаем как есть
    if (preg_match('/^[a-f0-9,\s-]+$/i', $str)) return $str;
    $codes = array();
    $len = mb_strlen($str, "UTF-8");
    for ($i = 0; $i < $len; $i++) {
        $ch = mb_substr($str, $i, 1, "UTF-8");
        $ord = mb_ord($ch, "UTF-8");
        // Пропускаем обычные ASCII/пробелы/VS16 (fe0f) — Twemoji даёт качественный результат без них
        if ($ord && $ord > 0x1000 && $ord !== 0xfe0f && $ord !== 0x200d) {
            $codes[] = dechex($ord);
        }
    }
    return implode(",", array_slice($codes, 0, 4));
}

function termburg_find_or_create_product($name, $price) {
    // Search existing product
    $products = wc_get_products(array(
        "limit" => 1,
        "s" => $name,
        "status" => "publish",
    ));

    if (!empty($products)) {
        return $products[0]->get_id();
    }

    // Use generic "Запись" product (ID 3882 from old site)
    $generic = wc_get_product(3882);
    if ($generic) return 3882;

    return null;
}

function termburg_checkout_normalize_line_items($raw_items, $fallback_name, $fallback_amount, $fallback_quantity = 1) {
    $items = array();

    if (is_array($raw_items)) {
        foreach ($raw_items as $raw_item) {
            if (!is_array($raw_item)) {
                continue;
            }

            $name = sanitize_text_field(isset($raw_item["name"]) ? $raw_item["name"] : "");
            $price = isset($raw_item["price"]) ? round(floatval($raw_item["price"]), 2) : 0;
            $quantity = max(1, intval(isset($raw_item["quantity"]) ? $raw_item["quantity"] : 1));
            $duration = sanitize_text_field(isset($raw_item["duration"]) ? $raw_item["duration"] : "");
            $kind = sanitize_key(isset($raw_item["kind"]) ? $raw_item["kind"] : "");
            $service_date = sanitize_text_field(isset($raw_item["serviceDate"]) ? $raw_item["serviceDate"] : (isset($raw_item["service_date"]) ? $raw_item["service_date"] : ""));
            $service_start_hour = isset($raw_item["serviceStartHour"]) ? intval($raw_item["serviceStartHour"]) : (isset($raw_item["service_start_hour"]) ? intval($raw_item["service_start_hour"]) : null);
            $reserved_hours = isset($raw_item["reservedHours"]) ? intval($raw_item["reservedHours"]) : (isset($raw_item["reserved_hours"]) ? intval($raw_item["reserved_hours"]) : 0);
            $service_section = sanitize_key(isset($raw_item["serviceSection"]) ? $raw_item["serviceSection"] : (isset($raw_item["service_section"]) ? $raw_item["service_section"] : ""));
            $product_key = sanitize_text_field(isset($raw_item["productKey"]) ? $raw_item["productKey"] : (isset($raw_item["product_key"]) ? $raw_item["product_key"] : ""));
            $product_group = sanitize_key(isset($raw_item["productGroup"]) ? $raw_item["productGroup"] : (isset($raw_item["product_group"]) ? $raw_item["product_group"] : ""));
            $source = sanitize_key(isset($raw_item["source"]) ? $raw_item["source"] : "");
            $source_id = sanitize_text_field(isset($raw_item["sourceId"]) ? $raw_item["sourceId"] : (isset($raw_item["source_id"]) ? $raw_item["source_id"] : ""));

            if ($name === "" || $price <= 0) {
                continue;
            }

            $items[] = array(
                "name" => $name,
                "price" => $price,
                "quantity" => $quantity,
                "duration" => $duration,
                "kind" => $kind,
                "service_date" => $service_date,
                "service_start_hour" => $service_start_hour,
                "reserved_hours" => $reserved_hours,
                "service_section" => $service_section,
                "product_key" => $product_key,
                "product_group" => $product_group,
                "source" => $source,
                "source_id" => $source_id,
            );
        }
    }

    if (empty($items)) {
        $items[] = array(
            "name" => sanitize_text_field($fallback_name),
            "price" => round(floatval($fallback_amount), 2),
            "quantity" => 1,
            "duration" => "",
            "kind" => "",
            "service_date" => "",
            "service_start_hour" => null,
            "reserved_hours" => 0,
            "service_section" => "",
            "product_key" => "",
            "product_group" => "",
            "source" => "",
            "source_id" => "",
        );
    }

    return $items;
}

function termburg_checkout_line_items_total($items) {
    $total = 0;
    foreach (is_array($items) ? $items : array() as $item) {
        $total += round(floatval($item["price"]) * max(1, intval($item["quantity"])), 2);
    }

    return round($total, 2);
}

function termburg_checkout_promo_line_discounts($validation) {
    $discounts = array();
    if (!is_array($validation) || empty($validation["line_discounts"]) || !is_array($validation["line_discounts"])) {
        return $discounts;
    }

    foreach ($validation["line_discounts"] as $line) {
        if (!is_array($line) || !isset($line["index"], $line["amount"])) {
            continue;
        }
        $discounts[intval($line["index"])] = round(max(0, floatval($line["amount"])), 2);
    }

    return $discounts;
}

function termburg_checkout_promo_receipt_name($name, $campaign_name, $discount) {
    $name = sanitize_text_field($name);
    $campaign_name = sanitize_text_field($campaign_name);
    $campaign_name = function_exists("mb_substr")
        ? mb_substr($campaign_name, 0, 60, "UTF-8")
        : substr($campaign_name, 0, 60);
    $discount_text = number_format(floatval($discount), 2, ",", " ") . " ₽";
    $suffix = " — акция «" . $campaign_name . "», скидка " . $discount_text;
    $limit = 128;
    $suffix_length = function_exists("mb_strlen") ? mb_strlen($suffix, "UTF-8") : strlen($suffix);
    $name_limit = max(1, $limit - $suffix_length);
    $short_name = function_exists("mb_substr")
        ? mb_substr($name, 0, $name_limit, "UTF-8")
        : substr($name, 0, $name_limit);

    return $short_name . $suffix;
}

function termburg_checkout_add_certificate_meta_to_item($item, $params) {
    $cert_design = sanitize_text_field(isset($params["cert_design"]) ? $params["cert_design"] : "");
    if (!$cert_design) {
        return;
    }

    $item->add_meta_data("cert_design", $cert_design, true);
    $item->add_meta_data("cert_occasion", sanitize_text_field(isset($params["cert_occasion"]) ? $params["cert_occasion"] : ""), true);
    $item->add_meta_data("cert_recipient", sanitize_text_field(isset($params["cert_recipient"]) ? $params["cert_recipient"] : ""), true);
    $item->add_meta_data("cert_recipient_phone", sanitize_text_field(isset($params["cert_recipient_phone"]) ? $params["cert_recipient_phone"] : ""), true);
    $item->add_meta_data("cert_wish", sanitize_textarea_field(isset($params["cert_wish"]) ? $params["cert_wish"] : ""), true);
    $item->add_meta_data("cert_color", sanitize_text_field(isset($params["cert_color"]) ? $params["cert_color"] : "emerald"), true);

    $front_b64 = isset($params["cert_front_image"]) ? $params["cert_front_image"] : "";
    $back_b64  = isset($params["cert_back_image"])  ? $params["cert_back_image"]  : "";
    if ($front_b64 || $back_b64) {
        $upload_dir = wp_upload_dir();
        $src_dir = $upload_dir["basedir"] . "/termburg-certs/source";
        if (!is_dir($src_dir)) wp_mkdir_p($src_dir);
        $ts = time() . "-" . wp_rand(1000, 9999);

        $save_b64 = function($b64, $filename) use ($src_dir) {
            if (!$b64) return "";
            if (preg_match('#^data:image/(png|jpeg);base64,(.+)$#', $b64, $m)) {
                $data = base64_decode($m[2]);
                if ($data === false) return "";
                $path = $src_dir . "/" . $filename;
                file_put_contents($path, $data);
                return $path;
            }
            return "";
        };

        $front_path = $save_b64($front_b64, "cert-{$ts}-front.png");
        $back_path  = $save_b64($back_b64,  "cert-{$ts}-back.png");
        if ($front_path) $item->add_meta_data("cert_front_image_path", $front_path, true);
        if ($back_path)  $item->add_meta_data("cert_back_image_path",  $back_path,  true);
    }

    $emoji_raw = isset($params["cert_emoji"]) ? $params["cert_emoji"] : "";
    $emoji_hex = termburg_emoji_to_hex($emoji_raw);
    $item->add_meta_data("cert_emoji", $emoji_hex, true);
}

function termburg_is_valid_certificate_amount($amount) {
    $amount_int = intval(round(floatval($amount)));

    return abs(floatval($amount) - $amount_int) < 0.001
        && $amount_int >= 1000
        && $amount_int <= 99999999
        && $amount_int % 500 === 0;
}

function termburg_checkout_contains($haystack, $needle) {
    if (function_exists("mb_stripos")) {
        return mb_stripos($haystack, $needle, 0, "UTF-8") !== false;
    }

    return stripos($haystack, $needle) !== false;
}

function termburg_checkout_user_can_admin_test($user_id) {
    if (!$user_id) return false;

    return user_can($user_id, 'manage_woocommerce') || user_can($user_id, 'manage_options');
}

function termburg_get_wp_cookie_user_id_for_checkout() {
    if (!function_exists('wp_validate_auth_cookie')) return false;
    if (empty($_COOKIE) || !is_array($_COOKIE)) return false;

    foreach ($_COOKIE as $name => $value) {
        if (strpos($name, 'wordpress_logged_in_') !== 0) continue;

        $user_id = wp_validate_auth_cookie($value, 'logged_in');
        if ($user_id) return $user_id;
    }

    return false;
}

function termburg_get_user_from_token_checkout($request) {
    $auth = $request->get_header("authorization");
    if (!$auth || strpos($auth, "Bearer ") !== 0) return false;

    $token = substr($auth, 7);
    $parts = explode(".", $token);
    if (count($parts) !== 2) return false;

    $secret = defined("AUTH_KEY") ? AUTH_KEY : "termburg-secret-key-2026";
    $expected_sig = hash_hmac("sha256", $parts[0], $secret);
    if (!hash_equals($expected_sig, $parts[1])) return false;

    $json = base64_decode(strtr($parts[0], "-_", "+/"));
    $payload = json_decode($json, true);
    if (!$payload || !isset($payload["user_id"]) || !isset($payload["exp"])) return false;
    if ($payload["exp"] < time()) return false;

    return $payload["user_id"];
}
