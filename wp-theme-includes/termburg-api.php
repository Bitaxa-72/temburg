<?php
/**
 * Termburg Custom API
 * Registration, login, profile for React frontend
 */

add_action("rest_api_init", function() {

    // Register user
    register_rest_route("termburg/v1", "/auth/register", array(
        "methods" => "POST",
        "callback" => "termburg_register_user",
        "permission_callback" => "__return_true",
    ));

    // Login user
    register_rest_route("termburg/v1", "/auth/login", array(
        "methods" => "POST",
        "callback" => "termburg_login_user",
        "permission_callback" => "__return_true",
    ));

    // Get profile
    register_rest_route("termburg/v1", "/auth/profile", array(
        "methods" => "GET",
        "callback" => "termburg_get_profile",
        "permission_callback" => "termburg_check_auth",
    ));

    // Update profile
    register_rest_route("termburg/v1", "/auth/profile", array(
        "methods" => "PATCH",
        "callback" => "termburg_update_profile",
        "permission_callback" => "termburg_check_auth",
    ));
});

function termburg_register_user($request) {
    $params = $request->get_json_params();
    $email = sanitize_email(isset($params["email"]) ? $params["email"] : "");
    $password = isset($params["password"]) ? $params["password"] : "";
    $name = sanitize_text_field(isset($params["name"]) ? $params["name"] : "");
    $phone = sanitize_text_field(isset($params["phone"]) ? $params["phone"] : "");

    if (empty($email) || empty($password)) {
        return new WP_REST_Response(array("error" => "Email and password required"), 400);
    }

    if (email_exists($email)) {
        return new WP_REST_Response(array("error" => "User with this email already exists"), 409);
    }

    if (strlen($password) < 6) {
        return new WP_REST_Response(array("error" => "Password must be at least 6 characters"), 400);
    }

    $user_id = wp_create_user($email, $password, $email);
    if (is_wp_error($user_id)) {
        return new WP_REST_Response(array("error" => $user_id->get_error_message()), 500);
    }

    wp_update_user(array(
        "ID" => $user_id,
        "display_name" => $name ? $name : $email,
        "first_name" => $name,
    ));

    if ($phone) {
        update_user_meta($user_id, "billing_phone", $phone);
    }

    $token = termburg_generate_token($user_id);

    return new WP_REST_Response(array(
        "user" => termburg_format_user($user_id),
        "token" => $token,
    ), 201);
}

function termburg_login_user($request) {
    $params = $request->get_json_params();
    $email = sanitize_email(isset($params["email"]) ? $params["email"] : "");
    $password = isset($params["password"]) ? $params["password"] : "";

    if (empty($email) || empty($password)) {
        return new WP_REST_Response(array("error" => "Email and password required"), 400);
    }

    $user = wp_authenticate($email, $password);
    if (is_wp_error($user)) {
        return new WP_REST_Response(array("error" => "Invalid email or password"), 401);
    }

    $token = termburg_generate_token($user->ID);

    return new WP_REST_Response(array(
        "user" => termburg_format_user($user->ID),
        "token" => $token,
    ), 200);
}

function termburg_get_profile($request) {
    $user_id = termburg_get_user_from_token($request);
    if (!$user_id) {
        return new WP_REST_Response(array("error" => "Unauthorized"), 401);
    }

    return new WP_REST_Response(termburg_format_user($user_id), 200);
}

function termburg_update_profile($request) {
    $user_id = termburg_get_user_from_token($request);
    if (!$user_id) {
        return new WP_REST_Response(array("error" => "Unauthorized"), 401);
    }

    $params = $request->get_json_params();
    $update = array("ID" => $user_id);

    if (isset($params["name"])) {
        $update["display_name"] = sanitize_text_field($params["name"]);
        $update["first_name"] = sanitize_text_field($params["name"]);
    }

    if (isset($params["phone"])) {
        update_user_meta($user_id, "billing_phone", sanitize_text_field($params["phone"]));
    }

    wp_update_user($update);

    return new WP_REST_Response(termburg_format_user($user_id), 200);
}

function termburg_check_auth($request) {
    return (bool) termburg_get_user_from_token($request);
}

function termburg_generate_token($user_id) {
    $secret = defined("AUTH_KEY") ? AUTH_KEY : "termburg-secret-key-2026";
    $payload = array(
        "user_id" => $user_id,
        "exp" => time() + (7 * 24 * 60 * 60), // 7 days
    );
    $json = json_encode($payload);
    $base64 = rtrim(strtr(base64_encode($json), "+/", "-_"), "=");
    $signature = hash_hmac("sha256", $base64, $secret);
    return $base64 . "." . $signature;
}

function termburg_get_user_from_token($request) {
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

function termburg_format_user($user_id) {
    $user = get_userdata($user_id);
    if (!$user) return null;

    return array(
        "id" => $user->ID,
        "email" => $user->user_email,
        "name" => $user->display_name,
        "phone" => get_user_meta($user_id, "billing_phone", true),
        "role" => $user->roles[0],
        "createdAt" => $user->user_registered,
    );
}
