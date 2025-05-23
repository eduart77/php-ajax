<?php
require_once 'api_config.php';

// Get request body as JSON
$data = getRequestBody();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

// Validate required fields
if (!isset($data['username']) || !isset($data['password']) || !isset($data['confirm_password'])) {
    sendError('Username, password, and confirm password are required');
}

$username = trim($data['username']);
$password = trim($data['password']);
$confirm_password = trim($data['confirm_password']);

// Validate username
if (empty($username)) {
    sendError('Please enter a username');
} elseif (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
    sendError('Username can only contain letters, numbers, and underscores');
}

// Check if username exists
$sql = "SELECT id FROM users WHERE username = $1";
$result = pg_query_params($conn, $sql, array($username));

if ($result) {
    if (pg_num_rows($result) > 0) {
        sendError('This username is already taken', 409);
    }
} else {
    sendError('Database error occurred', 500);
}

// Validate password
if (empty($password)) {
    sendError('Please enter a password');
} elseif (strlen($password) < 6) {
    sendError('Password must have at least 6 characters');
}

// Validate confirm password
if (empty($confirm_password)) {
    sendError('Please confirm password');
} elseif ($password !== $confirm_password) {
    sendError('Passwords do not match');
}

// Insert new user
$sql = "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username";
$hashed_password = password_hash($password, PASSWORD_DEFAULT);
$result = pg_query_params($conn, $sql, array($username, $hashed_password));

if ($result && pg_num_rows($result) > 0) {
    $user = pg_fetch_assoc($result);
    sendResponse([
        'message' => 'Registration successful',
        'user' => [
            'id' => $user['id'],
            'username' => $user['username']
        ]
    ]);
} else {
    sendError('Error creating user account', 500);
}

pg_close($conn);
?> 