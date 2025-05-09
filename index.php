<?php
require_once "config.php";
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>News Service</title>
    <link rel="stylesheet" href="style.css">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
</head>
<body>
    <div class="wrapper">
        <h2>Latest News</h2>
        
        <div class="filters">
            <div class="form-group">
                <label>Date Range:</label>
                <input type="date" id="startDate" class="form-control">
                <input type="date" id="endDate" class="form-control">
            </div>
            <div class="form-group">
                <label>Category:</label>
                <select id="category" class="form-control">
                    <option value="">All Categories</option>
                    <option value="politics">Politics</option>
                    <option value="society">Society</option>
                    <option value="health">Health</option>
                    <option value="technology">Technology</option>
                    <option value="sports">Sports</option>
                </select>
            </div>
            <button id="applyFilters" class="btn btn-primary">Apply Filters</button>
        </div>

        <div id="activeFilters" class="active-filters"></div>
        
        <div id="newsList" class="news-list"></div>

        <p>
            <a href="login.php" class="btn btn-primary">Login to Manage News</a>
        </p>
    </div>

    <script>
    $(document).ready(function(){
        let currentFilters = {
            startDate: '',
            endDate: '',
            category: ''
        };

        function loadNews() {
            $.ajax({
                url: 'get_filtered_news.php',
                type: 'GET',
                data: currentFilters,
                success: function(response) {
                    $('#newsList').html(response);
                }
            });
        }

        function updateActiveFilters() {
            let filterText = [];
            if(currentFilters.startDate && currentFilters.endDate) {
                filterText.push(`Date Range: ${currentFilters.startDate} to ${currentFilters.endDate}`);
            }
            if(currentFilters.category) {
                filterText.push(`Category: ${currentFilters.category}`);
            }
            
            if(filterText.length > 0) {
                $('#activeFilters').html('<h4>Active Filters:</h4><p>' + filterText.join(' | ') + '</p>');
            } else {
                $('#activeFilters').empty();
            }
        }

        // initial load of articles
        loadNews();

        // handle filter
        $('#applyFilters').click(function(){
            currentFilters.startDate = $('#startDate').val();
            currentFilters.endDate = $('#endDate').val();
            currentFilters.category = $('#category').val();
            
            loadNews();
            updateActiveFilters();
            // Reset the fields after applying filters
            $('#startDate').val('');
            $('#endDate').val('');
            $('#category').val('');
        });
    });
    </script>
</body>
</html> 