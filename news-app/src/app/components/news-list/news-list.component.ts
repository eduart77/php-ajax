import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { NewsService, Article, FilterOptions } from '../../services/news.service';
import { AuthService } from '../../services/auth.service';
import { filter, Subscription, debounceTime, distinctUntilChanged, take } from 'rxjs';

@Component({
  selector: 'app-news-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="wrapper">
        <h2>Latest News</h2>
        
        <div *ngIf="error" class="alert alert-danger">
            {{ error }}
        </div>

        <form [formGroup]="filterForm" class="filters">
            <div class="form-group">
                <label>Date Range:</label>
                <input type="date" id="startDate" formControlName="startDate" class="form-control">
                <input type="date" id="endDate" formControlName="endDate" class="form-control">
            </div>
            <div class="form-group">
                <label>Category:</label>
                <select id="category" formControlName="category" class="form-control">
                    <option value="">All Categories</option>
                    <option *ngFor="let cat of categories" [value]="cat">{{cat | titlecase}}</option>
                </select>
            </div>
            <button type="submit" (click)="applyFilters()" class="btn btn-primary" [class.disabled]="isLoading">
                {{ isLoading ? 'Loading...' : 'Apply Filters' }}
            </button>
            <button type="button" (click)="clearFilters()" class="btn btn-secondary" [class.disabled]="isLoading">
                Clear Filters
            </button>
        </form>

        <div class="active-filters" *ngIf="activeFilters.length > 0">
            <h4>Active Filters:</h4>
            <p>{{activeFilters.join(' | ')}}</p>
        </div>

        <div id="newsList" class="news-list">
            <div *ngIf="isLoading" class="loading">
                <div class="spinner"></div>
                Loading articles...
            </div>

            <div *ngIf="!isLoading && articles.length === 0 && !error" class="no-articles">
                No news articles found.
            </div>

            <div *ngFor="let article of articles" class="news-item">
                <h3>{{article.title}}</h3>
                <div class="news-meta">
                    Category: {{article.category | titlecase}} | 
                    Date: {{article.created_at | date:'mediumDate'}}
                </div>
                <div class="news-content">{{article.content}}</div>
                <div class="news-producer">By: {{article.producer}}</div>
                <div class="article-actions" *ngIf="isLoggedIn && article.producer === currentUser?.username">
                    <a [routerLink]="['/news/edit', article.id]" class="btn btn-primary">Edit</a>
                    <button (click)="deleteArticle(article.id)" class="btn btn-danger" [disabled]="isLoading">Delete</button>
                </div>
            </div>
        </div>

        <p>
            <a *ngIf="!isLoggedIn" routerLink="/login" class="btn btn-primary">Login to Manage News</a>
            <a *ngIf="isLoggedIn" routerLink="/dashboard" class="btn btn-secondary">My Articles</a>
        </p>
    </div>
  `,
  styles: [`
    :host {
        display: block;
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 20px;
    }

    .wrapper {
        width: 80%;
        max-width: 1200px;
        margin: 0 auto;
        background-color: #fff;
        padding: 20px;
        border-radius: 5px;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }

    h2 {
        color: #333;
        margin-bottom: 20px;
    }

    .filters {
        background-color: #f8f9fa;
        padding: 15px;
        border-radius: 4px;
        margin-bottom: 20px;
    }

    .form-group {
        margin-bottom: 15px;
    }

    .form-group label {
        display: block;
        margin-bottom: 5px;
        color: #666;
    }

    .form-control {
        width: 100%;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        box-sizing: border-box;
        margin-bottom: 10px;
    }

    .btn {
        padding: 10px 15px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        margin-right: 10px;
        text-decoration: none;
        display: inline-block;
    }

    .btn-primary {
        background-color: #007bff;
        color: white;
    }

    .btn-secondary {
        background-color: #6c757d;
        color: white;
    }

    .btn-danger {
        background-color: #dc3545;
        color: white;
    }

    .news-item {
        border: 1px solid #ddd;
        padding: 15px;
        margin-bottom: 15px;
        border-radius: 4px;
    }

    .news-item h3 {
        color: #333;
        margin: 0 0 10px 0;
    }

    .news-meta {
        color: #666;
        font-size: 14px;
        margin: 5px 0;
    }

    .news-content {
        margin: 10px 0;
        line-height: 1.6;
        color: #444;
    }

    .news-producer {
        color: #666;
        font-style: italic;
        margin-top: 10px;
    }

    .article-actions {
        margin-top: 10px;
    }

    .active-filters {
        margin: 15px 0;
        padding: 10px;
        background-color: #e9ecef;
        border-radius: 4px;
    }

    .active-filters h4 {
        margin: 0 0 5px 0;
        color: #495057;
        font-size: 14px;
    }

    .active-filters p {
        margin: 0;
        color: #6c757d;
        font-size: 14px;
    }

    .alert {
      padding: 15px;
      margin-bottom: 20px;
      border: 1px solid transparent;
      border-radius: 4px;
    }

    .alert-danger {
      color: #721c24;
      background-color: #f8d7da;
      border-color: #f5c6cb;
    }

    .spinner {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 3px solid rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      border-top-color: #007bff;
      animation: spin 1s ease-in-out infinite;
      margin-right: 10px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .loading {
      text-align: center;
      padding: 20px;
      color: #666;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .disabled {
      opacity: 0.7;
      cursor: not-allowed;
      pointer-events: none;
    }

    button.disabled {
      background-color: #ccc;
    }

    .ml-2 {
        margin-left: 10px;
    }

    p {
        margin: 20px 0;
    }
  `]
})
export class NewsListComponent implements OnInit, OnDestroy {
  articles: Article[] = [];
  filterForm: FormGroup;
  isLoading = false;
  isLoggedIn = false;
  currentUser: { username: string } | null = null;
  categories: string[] = ['politics', 'society', 'health', 'technology', 'sports'];
  activeFilters: string[] = [];
  error: string | null = null;

  private routerSubscription: Subscription;
  private loadSubscription: Subscription | null = null;
  private isDestroyed = false;

  constructor(
    private newsService: NewsService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.filterForm = this.fb.group({
      category: [{ value: '', disabled: false }],
      startDate: [{ value: '', disabled: false }],
      endDate: [{ value: '', disabled: false }]
    });

    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      distinctUntilChanged((prev, curr) => {
        const prevUrl = (prev as NavigationEnd).url;
        const currUrl = (curr as NavigationEnd).url;
        return prevUrl === currUrl || 
               (prevUrl.includes('/news') && currUrl.includes('/news'));
      }),
      debounceTime(300)
    ).subscribe(() => {
      if (!this.isDestroyed) {
        this.loadArticles();
      }
    });
  }

  ngOnInit() {
    this.loadArticles();
    this.isLoggedIn = this.authService.isLoggedIn();
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnDestroy() {
    this.isDestroyed = true;
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.loadSubscription) {
      this.loadSubscription.unsubscribe();
    }
  }

  loadArticles() {
    if (this.loadSubscription) {
      this.loadSubscription.unsubscribe();
    }

    if (this.isDestroyed) {
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.filterForm.disable();
    
    const filters: FilterOptions = this.filterForm.value;
    
    this.loadSubscription = this.newsService.getPublicArticles(filters).pipe(
      take(1)
    ).subscribe({
      next: (articles) => {
        if (!this.isDestroyed) {
          this.articles = articles;
          this.updateActiveFilters(filters);
          this.isLoading = false;
          this.error = null;
          this.filterForm.enable();
        }
      },
      error: (err) => {
        console.error('Error loading articles:', err);
        if (!this.isDestroyed) {
          this.isLoading = false;
          this.filterForm.enable();
          
          if (err.status === 0) {
            this.error = 'Unable to connect to the server. Please check if the backend is running.';
          } else if (err.status === 404) {
            this.error = 'Articles endpoint not found. Please check the server configuration.';
          } else {
            this.error = 'Failed to load articles. Please try again.';
          }
          this.articles = [];
        }
      }
    });
  }

  updateActiveFilters(filters: FilterOptions) {
    this.activeFilters = [];
    if (filters.startDate && filters.endDate) {
      this.activeFilters.push(`Date Range: ${filters.startDate} to ${filters.endDate}`);
    }
    if (filters.category) {
      this.activeFilters.push(`Category: ${filters.category}`);
    }
  }

  applyFilters() {
    if (!this.isLoading) {
      this.loadArticles();
      this.filterForm.patchValue({
        startDate: '',
        endDate: '',
        category: ''
      });
    }
  }

  clearFilters() {
    if (!this.isLoading) {
      this.filterForm.reset();
      this.activeFilters = [];
      this.loadArticles();
    }
  }

  deleteArticle(id: number) {
    if (confirm('Are you sure you want to delete this article?')) {
      this.newsService.deleteArticle(id).subscribe({
        next: () => {
          this.articles = this.articles.filter(article => article.id !== id);
        },
        error: (err) => {
          console.error('Error deleting article:', err);
          this.error = 'Failed to delete article. Please try again.';
        }
      });
    }
  }
}
