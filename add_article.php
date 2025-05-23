<?php
require_once 'api_config.php';

// Get request body as JSON
$data = getRequestBody();

if(!isset($_SESSION["user_id"]) || !isset($_SESSION["username"])){
    sendError('Unauthorized', 403);
}

if($_SERVER["REQUEST_METHOD"] == "POST"){
    // Validate required fields
    if(empty($data['title']) || empty($data['content']) || empty($data['category'])) {
        sendError('Title, content, and category are required', 400);
    }

    // Insert article into database
    $sql = "INSERT INTO news (title, content, category, producer) VALUES ($1, $2, $3, $4) RETURNING id, title, content, category, producer, created_at";
    $result = pg_query_params($conn, $sql, array(
        $data['title'],
        $data['content'],
        $data['category'],
        $_SESSION["username"]
    ));

    if($result && pg_num_rows($result) > 0) {
        $newArticle = pg_fetch_assoc($result);
        sendResponse($newArticle);
    } else {
        sendError('Error adding article', 500);
    }
}

pg_close($conn);
?> 