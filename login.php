<?php
require_once 'api_config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

$data = getRequestBody();

if (!isset($data['username']) || !isset($data['password'])) {
    sendError('Username and password are required');
}

$username = $data['username'];
$password = $data['password'];

$query = "SELECT id, username, password FROM users WHERE username = $1";
$result = pg_query_params($conn, $query, array($username));

if ($result && pg_num_rows($result) > 0) {
    $user = pg_fetch_assoc($result);
    if (password_verify($password, $user['password'])) {
        $_SESSION["user_id"] = $user['id'];
        $_SESSION["username"] = $user['username'];
        
        sendResponse([
            'message' => 'Login successful',
            'user' => [
                'id' => $user['id'],
                'username' => $user['username']
            ]
        ]);
    }
}

sendError('Invalid username or password', 401);
?> 