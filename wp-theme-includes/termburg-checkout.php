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

    // List user orders
    register_rest_route("termburg/v1", "/checkout/orders", array(
        "methods" => "GET",
        "callback" => "termburg_user_orders",
        "permission_callback" => "__return_true",
    ));
});

function termburg_create_order($request) {
    $params = $request->get_json_params();

    $product_name = sanitize_text_field(isset($params["name"]) ? $params["name"] : "");
    $amount = floatval(isset($params["amount"]) ? $params["amount"] : 0);
    $quantity = intval(isset($params["quantity"]) ? $params["quantity"] : 1);
    $email = sanitize_email(isset($params["email"]) ? $params["email"] : "");
    $phone = sanitize_text_field(isset($params["phone"]) ? $params["phone"] : "");
    $name = sanitize_text_field(isset($params["customerName"]) ? $params["customerName"] : "");
    $return_url = esc_url_raw(isset($params["returnUrl"]) ? $params["returnUrl"] : home_url("/account"));

    if (empty($product_name) || $amount <= 0) {
        return new WP_REST_Response(array("error" => "Product name and amount required"), 400);
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

    // Find or create product
    $product_id = termburg_find_or_create_product($product_name, $amount);
    if (!$product_id) {
        return new WP_REST_Response(array("error" => "Failed to create product"), 500);
    }

    // Create order
    $order = wc_create_order();

    // Add line item with correct price
    $item = new WC_Order_Item_Product();
    $product = wc_get_product($product_id);
    if ($product) {
        $item->set_product($product);
    }
    $item->set_name($product_name);
    $item->set_quantity($quantity);
    $item->set_subtotal($amount * $quantity);
    $item->set_total($amount * $quantity);
    $order->add_item($item);

    // Set billing info
    $order->set_billing_email($email);
    if ($phone) $order->set_billing_phone($phone);
    if ($name) {
        $parts = explode(" ", $name, 2);
        $order->set_billing_first_name($parts[0]);
        if (isset($parts[1])) $order->set_billing_last_name($parts[1]);
    }

    // Link to user if authenticated
    $user_id = termburg_get_user_from_token_checkout($request);
    if ($user_id) {
        $order->set_customer_id($user_id);
    }

    // Set payment method
    $order->set_payment_method("yookassa_epl");
    $order->set_payment_method_title("ЮKassa");

    // Calculate totals
    $order->calculate_totals();

    // Generate UUID for Dolphin
    $uuid = wp_generate_uuid4();
    $order->update_meta_data("_custom_uuid", $uuid);

    // Save order
    $order->save();

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
        "uuid" => $uuid,
        "total" => $order->get_total(),
        "status" => $order->get_status(),
        "paymentUrl" => $payment_url,
    ), 201);
}

function termburg_order_status($request) {
    $order_id = intval($request->get_param("id"));
    $order = wc_get_order($order_id);

    if (!$order) {
        return new WP_REST_Response(array("error" => "Order not found"), 404);
    }

    return new WP_REST_Response(array(
        "orderId" => $order->get_id(),
        "status" => $order->get_status(),
        "total" => $order->get_total(),
        "paymentMethod" => $order->get_payment_method_title(),
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
            "dateCreated" => $order->get_date_created() ? $order->get_date_created()->format("Y-m-d H:i:s") : null,
        );
    }

    return new WP_REST_Response($result, 200);
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

function termburg_is_valid_certificate_amount($amount) {
    $amount_int = intval(round(floatval($amount)));

    return abs(floatval($amount) - $amount_int) < 0.001
        && $amount_int >= 1000
        && $amount_int <= 99999999
        && $amount_int % 500 === 0;
}

function termburg_checkout_contains($haystack, $needle) {
    if (function_exists('mb_stripos')) {
        return mb_stripos($haystack, $needle, 0, 'UTF-8') !== false;
    }

    return stripos($haystack, $needle) !== false;
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
