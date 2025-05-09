<?php
define('DB_SERVER', 'localhost');
define('DB_USERNAME', 'postgres'); 
define('DB_PASSWORD', 'admin'); 
define('DB_NAME', 'php'); 

$conn = pg_connect("host=" . DB_SERVER . " dbname=" . DB_NAME . " user=" . DB_USERNAME . " password=" . DB_PASSWORD);

if($conn === false){
    die("ERROR: Could not connect. " . pg_last_error());
}
?> 