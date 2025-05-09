<?php
session_start();

if(!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true){
    header("location: login.php");
    exit;
}

require_once "config.php";
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Dashboard - News Service</title>
    <link rel="stylesheet" href="style.css">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
</head>
<body>
    <div class="wrapper">
        <h2>Welcome, <?php echo htmlspecialchars($_SESSION["username"]); ?></h2>
        <div class="news-management">
            <h3>Add New Article</h3>
            <form id="newsForm">
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" name="title" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Content</label>
                    <textarea name="content" class="form-control" required></textarea>
                </div>
                <div class="form-group">
                    <label>Category</label>
                    <select name="category" class="form-control" required>
                        <option value="politics">Politics</option>
                        <option value="society">Society</option>
                        <option value="health">Health</option>
                        <option value="technology">Technology</option>
                        <option value="sports">Sports</option>
                    </select>
                </div>
                <div class="form-group">
                    <input type="submit" class="btn btn-primary" value="Add Article">
                </div>
            </form>
        </div>

        <div class="news-list">
            <h3>Your Articles</h3>
            <div id="articlesList"></div>
        </div>

        <p>
            <a href="logout.php" class="btn btn-danger">Sign Out</a>
            <a href="index.php" class="btn btn-secondary">View All News</a>
        </p>
    </div>

    <script>
    $(document).ready(function(){
        //load the articles 
        function loadArticles() {
            $.ajax({
                url: 'get_articles.php',
                type: 'GET',
                success: function(response) {
                    $('#articlesList').html(response);
                }
            });
        }

        //initial load
        loadArticles();

        //handle submit
        $('#newsForm').on('submit', function(e){
            e.preventDefault();
            $.ajax({
                url: 'add_article.php',
                type: 'POST',
                data: $(this).serialize(),
                success: function(response) {
                    alert('Article added successfully!');
                    $('#newsForm')[0].reset();
                    loadArticles();
                },
                error: function() {
                    alert('Error adding article');
                }
            });
        });

        //handle article deletion
        $(document).on('click', '.delete-article', function(){
            if(confirm('Are you sure you want to delete this article?')) {
                var articleId = $(this).data('id');
                $.ajax({
                    url: 'delete_article.php',
                    type: 'POST',
                    data: {id: articleId},
                    success: function(response) {
                        alert('Article deleted successfully!');
                        loadArticles();
                    },
                    error: function() {
                        alert('Error deleting article');
                    }
                });
            }
        });

        //handle article editing
        $(document).on('click', '.edit-article', function(){
            var articleId = $(this).data('id');
            window.location.href = 'edit_article.php?id=' + articleId;
        });
    });
    </script>
</body>
</html> 