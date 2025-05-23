<?php
require_once "config.php";

// Allow requests from Angular development server
header('Access-Control-Allow-Origin: http://localhost:4200');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Set content type to JSON
header('Content-Type: application/json');

$where_conditions = array();
$params = array();
$param_count = 1;

if(!empty($_GET['startDate'])) {
    $where_conditions[] = "created_at >= $" . $param_count;
    $params[] = $_GET['startDate'] . " 00:00:00";
    $param_count++;
}

if(!empty($_GET['endDate'])) {
    $where_conditions[] = "created_at <= $" . $param_count;
    $params[] = $_GET['endDate'] . " 23:59:59";
    $param_count++;
}

if(!empty($_GET['category'])) {
    $where_conditions[] = "category = $" . $param_count;
    $params[] = $_GET['category'];
    $param_count++;
}

$sql = "SELECT * FROM news";
if(!empty($where_conditions)) {
    $sql .= " WHERE " . implode(" AND ", $where_conditions);
}
$sql .= " ORDER BY created_at DESC";

$result = pg_query_params($conn, $sql, $params);
$articles = array();

if($result && pg_num_rows($result) > 0) {
    while($row = pg_fetch_assoc($result)) {
        $articles[] = array(
            'id' => $row['id'],
            'title' => $row['title'],
            'content' => $row['content'],
            'category' => $row['category'],
            'created_at' => $row['created_at'],
            'producer' => $row['producer']
        );
    }
}

echo json_encode($articles);
pg_close($conn);
?> 