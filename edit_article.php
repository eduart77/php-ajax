<?php
require_once 'api_config.php';

// Get request body as JSON
$data = getRequestBody();

if(!isset($_SESSION["user_id"]) || !isset($_SESSION["username"])){
    sendError('Unauthorized', 403);
}

if($_SERVER["REQUEST_METHOD"] == "PUT" && isset($data["id"])){
    $id = trim($data["id"]);
    
    // Validate required fields
    if(empty($data['title']) || empty($data['content']) || empty($data['category'])) {
        sendError('Title, content, and category are required', 400);
    }

    // Check if article exists and belongs to user
    $check_sql = "SELECT id FROM news WHERE id = $1 AND producer = $2";
    $check_result = pg_query_params($conn, $check_sql, array($id, $_SESSION["username"]));
    
    if($check_result && pg_num_rows($check_result) == 0){
        sendError('Unauthorized to edit this article', 403);
    }
    
    // Update article
    $sql = "UPDATE news SET title = $1, content = $2, category = $3 WHERE id = $4 AND producer = $5 RETURNING id, title, content, category, producer, created_at";
    $result = pg_query_params($conn, $sql, array(
        $data['title'],
        $data['content'],
        $data['category'],
        $id,
        $_SESSION["username"]
    ));
    
    if($result && pg_num_rows($result) > 0){
        $updatedArticle = pg_fetch_assoc($result);
        sendResponse($updatedArticle);
    } else{
        sendError('Error updating article', 500);
    }
} else {
    sendError('Invalid request', 400);
}

pg_close($conn);
?> 