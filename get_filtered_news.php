<?php
require_once "config.php";

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

if($result && pg_num_rows($result) > 0) {
    while($row = pg_fetch_assoc($result)) {
        echo '<div class="news-item">';
        echo '<h3>' . htmlspecialchars($row['title']) . '</h3>';
        echo '<p class="news-meta">Category: ' . htmlspecialchars($row['category']) . ' | Date: ' . date('Y-m-d', strtotime($row['created_at'])) . '</p>';
        echo '<p class="news-content">' . htmlspecialchars($row['content']) . '</p>';
        echo '<p class="news-producer">By: ' . htmlspecialchars($row['producer']) . '</p>';
        echo '</div>';
    }
} else {
    echo '<p>No news articles found.</p>';
}

pg_close($conn);
?> 