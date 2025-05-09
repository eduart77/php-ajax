<?php
session_start();
require_once "config.php";

if(!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true){
    http_response_code(403);
    exit("Unauthorized");
}

if($_SERVER["REQUEST_METHOD"] == "POST"){
    $title = trim($_POST["title"]);
    $content = trim($_POST["content"]);
    $category = trim($_POST["category"]);
    $producer = $_SESSION["username"];

    if(empty($title) || empty($content) || empty($category)){
        http_response_code(400);
        exit("Please fill all required fields");
    }

    $sql = "INSERT INTO news (title, content, category, producer) VALUES ($1, $2, $3, $4)";
    
    $result = pg_query_params($conn, $sql, array($title, $content, $category, $producer));
    
    if($result){
        echo "Article added successfully";
    } else{
        http_response_code(500);
        echo "Error adding article";
    }
    
    pg_close($conn);
}
?> 