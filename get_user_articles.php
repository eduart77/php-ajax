<?php
require_once 'api_config.php';

// Check if user is logged in
if(!isset($_SESSION["user_id"]) || !isset($_SESSION["username"])){
    sendError('Unauthorized', 403);
}

$sql = "SELECT * FROM news WHERE producer = $1 ORDER BY created_at DESC";
$result = pg_query_params($conn, $sql, array($_SESSION["username"]));

$articles = array();

if($result && pg_num_rows($result) > 0){
    while($row = pg_fetch_assoc($result)){
        $articles[] = array(
            'id' => $row['id'],
            'title' => $row['title'],
            'content' => $row['content'],
            'category' => $row['category'],
            'producer' => $row['producer'],
            'created_at' => $row['created_at']
        );
    }
}

sendResponse($articles);
pg_close($conn);
?> 