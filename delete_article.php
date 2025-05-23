<?php
require_once 'api_config.php';

// Get request body as JSON
$data = getRequestBody();

if(!isset($_SESSION["user_id"]) || !isset($_SESSION["username"])){
    sendError('Unauthorized', 403);
}

if($_SERVER["REQUEST_METHOD"] == "POST" && isset($data["id"])){
    $id = trim($data["id"]);
    
    //check if exists and belongs to user
    $check_sql = "SELECT id FROM news WHERE id = $1 AND producer = $2";
    $check_result = pg_query_params($conn, $check_sql, array($id, $_SESSION["username"]));
    
    if($check_result && pg_num_rows($check_result) == 0){
        sendError('Unauthorized to delete this article', 403);
    }
    
    $sql = "DELETE FROM news WHERE id = $1";
    $result = pg_query_params($conn, $sql, array($id));
    
    if($result){
        sendResponse(['message' => 'Article deleted successfully']);
    } else{
        sendError('Error deleting article', 500);
    }
} else {
    sendError('Invalid request', 400);
}

pg_close($conn);
?> 