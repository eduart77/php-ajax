<?php
session_start();
require_once "config.php";

if(!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true){
    header("location: login.php");
    exit;
}

$title = $content = $category = "";
$title_err = $content_err = $category_err = "";

if(isset($_GET["id"]) && !empty(trim($_GET["id"]))){
    $id = trim($_GET["id"]);
    
    $sql = "SELECT * FROM news WHERE id = $1 AND producer = $2";
    $result = pg_query_params($conn, $sql, array($id, $_SESSION["username"]));
    
    if($result && pg_num_rows($result) == 1){
        $row = pg_fetch_assoc($result);
        
        $title = $row["title"];
        $content = $row["content"];
        $category = $row["category"];
    } else{
        header("location: dashboard.php");
        exit();
    }
    
    pg_close($conn);
}

if($_SERVER["REQUEST_METHOD"] == "POST"){
    $id = $_POST["id"];
    
    if(empty(trim($_POST["title"]))){
        $title_err = "Please enter a title.";
    } else{
        $title = trim($_POST["title"]);
    }
    
    if(empty(trim($_POST["content"]))){
        $content_err = "Please enter content.";
    } else{
        $content = trim($_POST["content"]);
    }
    
    if(empty(trim($_POST["category"]))){
        $category_err = "Please select a category.";
    } else{
        $category = trim($_POST["category"]);
    }
    
    if(empty($title_err) && empty($content_err) && empty($category_err)){
        $sql = "UPDATE news SET title=$1, content=$2, category=$3 WHERE id=$4 AND producer=$5";
        
        $result = pg_query_params($conn, $sql, array($title, $content, $category, $id, $_SESSION["username"]));
        
        if($result){
            header("location: dashboard.php");
            exit();
        } else{
            echo "Oops! Something went wrong. Please try again later.";
        }
    }
    
    pg_close($conn);
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Edit Article - News Service</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="wrapper">
        <h2>Edit Article</h2>
        <form action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>" method="post">
            <div class="form-group">
                <label>Title</label>
                <input type="text" name="title" class="form-control <?php echo (!empty($title_err)) ? 'is-invalid' : ''; ?>" value="<?php echo $title; ?>">
                <span class="invalid-feedback"><?php echo $title_err;?></span>
            </div>
            <div class="form-group">
                <label>Content</label>
                <textarea name="content" class="form-control <?php echo (!empty($content_err)) ? 'is-invalid' : ''; ?>"><?php echo $content; ?></textarea>
                <span class="invalid-feedback"><?php echo $content_err;?></span>
            </div>
            <div class="form-group">
                <label>Category</label>
                <select name="category" class="form-control <?php echo (!empty($category_err)) ? 'is-invalid' : ''; ?>">
                    <option value="">Select Category</option>
                    <option value="politics" <?php echo ($category == "politics") ? 'selected' : ''; ?>>Politics</option>
                    <option value="society" <?php echo ($category == "society") ? 'selected' : ''; ?>>Society</option>
                    <option value="health" <?php echo ($category == "health") ? 'selected' : ''; ?>>Health</option>
                    <option value="technology" <?php echo ($category == "technology") ? 'selected' : ''; ?>>Technology</option>
                    <option value="sports" <?php echo ($category == "sports") ? 'selected' : ''; ?>>Sports</option>
                </select>
                <span class="invalid-feedback"><?php echo $category_err;?></span>
            </div>
            <input type="hidden" name="id" value="<?php echo $id; ?>"/>
            <div class="form-group">
                <input type="submit" class="btn btn-primary" value="Submit">
                <a href="dashboard.php" class="btn btn-secondary ml-2">Cancel</a>
            </div>
        </form>
    </div>
</body>
</html> 