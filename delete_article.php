<?php
session_start();
require_once "config.php";

if(!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true){
    http_response_code(403);
    exit("Unauthorized");
}

if($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST["id"])){
    $id = trim($_POST["id"]);
    
    //check if exists
    $check_sql = "SELECT id FROM news WHERE id = $1 AND producer = $2";
    $check_result = pg_query_params($conn, $check_sql, array($id, $_SESSION["username"]));
    
    if($check_result && pg_num_rows($check_result) == 0){
        http_response_code(403);
        exit("Unauthorized to delete this article");
    }
    
    $sql = "DELETE FROM news WHERE id = $1";
    
    $result = pg_query_params($conn, $sql, array($id));
    
    if($result){
        echo "Article deleted successfully";
    } else{
        http_response_code(500);
        echo "Error deleting article";
    }
    
    pg_close($conn);
}
?> 