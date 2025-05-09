<?php
session_start();
require_once "config.php";

if(!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true){
    http_response_code(403);
    exit("Unauthorized");
}

$sql = "SELECT * FROM news WHERE producer = $1 ORDER BY created_at DESC";
$result = pg_query_params($conn, $sql, array($_SESSION["username"]));

if($result && pg_num_rows($result) > 0){
    while($row = pg_fetch_assoc($result)){
        echo '<div class="article-item">';
        echo '<h3>' . htmlspecialchars($row['title']) . '</h3>';
        echo '<p class="article-meta">Category: ' . htmlspecialchars($row['category']) . ' | Date: ' . date('Y-m-d', strtotime($row['created_at'])) . '</p>';
        echo '<p class="article-content">' . htmlspecialchars($row['content']) . '</p>';
        echo '<div class="article-actions">';
        echo '<button class="btn btn-primary edit-article" data-id="' . $row['id'] . '">Edit</button>';
        echo '<button class="btn btn-danger delete-article" data-id="' . $row['id'] . '">Delete</button>';
        echo '</div>';
        echo '</div>';
    }
} else {
    echo '<p>No articles found.</p>';
}

pg_close($conn);
?> 