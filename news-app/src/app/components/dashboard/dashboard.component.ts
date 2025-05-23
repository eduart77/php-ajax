import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NewsService, Article } from '../../services/news.service';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="wrapper">
      <h2>Welcome, {{currentUser?.username}}</h2>
      
      <div class="news-management">
        <h3>Add New Article</h3>
        <form [formGroup]="articleForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Title</label>
            <input 
              type="text" 
              formControlName="title" 
              class="form-control" 
              [class.is-invalid]="titleError"
            >
            <span class="invalid-feedback" *ngIf="titleError">{{titleError}}</span>
          </div>

          <div class="form-group">
            <label>Content</label>
            <textarea 
              formControlName="content" 
              class="form-control" 
              rows="6"
              [class.is-invalid]="contentError"
            ></textarea>
            <span class="invalid-feedback" *ngIf="contentError">{{contentError}}</span>
          </div>

          <div class="form-group">
            <label>Category</label>
            <select 
              formControlName="category" 
              class="form-control"
              [class.is-invalid]="categoryError"
            >
              <option value="">Select a category</option>
              <option *ngFor="let cat of categories" [value]="cat">{{cat | titlecase}}</option>
            </select>
            <span class="invalid-feedback" *ngIf="categoryError">{{categoryError}}</span>
          </div>

          <div class="form-group">
            <button type="submit" class="btn btn-primary" [disabled]="isSubmitting">
              {{isSubmitting ? 'Adding...' : 'Add Article'}}
            </button>
          </div>
        </form>
      </div>

      <div class="news-list">
        <h3>Your Articles</h3>
        
        <div *ngIf="error" class="alert alert-danger">
          {{ error }}
        </div>

        <div *ngIf="isLoading" class="loading">
          <div class="spinner"></div>
          Loading your articles...
        </div>

        <div *ngIf="!isLoading && articles.length === 0 && !error" class="no-articles">
          You haven't published any articles yet.
        </div>

        <div *ngFor="let article of articles" class="article-item">
          <h3>{{article.title}}</h3>
          <div class="article-meta">
            Category: {{article.category | titlecase}} | 
            Date: {{article.created_at | date:'mediumDate'}}
          </div>
          <div class="article-content">{{article.content}}</div>
          <div class="article-actions">
            <a [routerLink]="['/news/edit', article.id]" class="btn btn-primary">Edit</a>
            <button (click)="deleteArticle(article.id)" class="btn btn-danger" [disabled]="isLoading">Delete</button>
          </div>
        </div>
      </div>

      <p>
        <a routerLink="/news" class="btn btn-secondary">View All News</a>
        <button (click)="logout()" class="btn btn-danger">Sign Out</button>
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

    h2, h3 {
      color: #333;
      margin-bottom: 20px;
    }

    .news-management {
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 4px;
      margin-bottom: 30px;
    }

    .form-group {
      margin-bottom: 20px;
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
    }

    textarea.form-control {
      resize: vertical;
      min-height: 100px;
    }

    .is-invalid {
      border-color: #dc3545;
    }

    .invalid-feedback {
      color: #dc3545;
      font-size: 12px;
      margin-top: 5px;
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

    .btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
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

    .article-item {
      border: 1px solid #ddd;
      padding: 15px;
      margin-bottom: 15px;
      border-radius: 4px;
    }

    .article-item h3 {
      color: #333;
      margin: 0 0 10px 0;
    }

    .article-meta {
      color: #666;
      font-size: 14px;
      margin: 5px 0;
    }

    .article-content {
      margin: 10px 0;
      line-height: 1.6;
      color: #444;
    }

    .article-actions {
      margin-top: 10px;
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

    .no-articles {
      text-align: center;
      padding: 20px;
      color: #666;
    }

    p {
      margin: 20px 0;
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  articles: Article[] = [];
  articleForm: FormGroup;
  isLoading = false;
  isSubmitting = false;
  error: string | null = null;
  currentUser: { username: string } | null = null;
  categories: string[] = ['politics', 'society', 'health', 'technology', 'sports'];
  titleError: string | null = null;
  contentError: string | null = null;
  categoryError: string | null = null;

  private subscription: Subscription | null = null;

  constructor(
    private newsService: NewsService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.articleForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      content: ['', [Validators.required, Validators.minLength(10)]],
      category: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.loadUserArticles();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadUserArticles() {
    this.isLoading = true;
    this.error = null;

    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.subscription = this.newsService.getUserArticles().subscribe({
      next: (articles) => {
        this.articles = articles;
        this.isLoading = false;
        this.error = null;
      },
      error: (err) => {
        console.error('Error loading user articles:', err);
        this.isLoading = false;
        this.articles = [];
        
        if (err.status === 0) {
          this.error = 'Unable to connect to the server. Please check if the backend is running.';
        } else if (err.status === 403) {
          this.error = 'Your session has expired. Please log in again.';
          this.authService.logout();
        } else if (err.status === 404) {
          this.error = 'Articles endpoint not found. Please check the server configuration.';
        } else {
          this.error = err.message || 'Failed to load articles. Please try again.';
        }
      }
    });
  }

  onSubmit() {
    if (this.articleForm.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.titleError = null;
    this.contentError = null;
    this.categoryError = null;

    const article = {
      title: this.articleForm.get('title')?.value,
      content: this.articleForm.get('content')?.value,
      category: this.articleForm.get('category')?.value,
      producer: this.currentUser?.username || ''
    };

    this.newsService.addArticle(article).subscribe({
      next: (newArticle) => {
        this.articles.unshift(newArticle);
        this.articleForm.reset();
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Error adding article:', err);
        this.isSubmitting = false;
        if (err.error) {
          if (err.error.title) this.titleError = err.error.title;
          if (err.error.content) this.contentError = err.error.content;
          if (err.error.category) this.categoryError = err.error.category;
        } else {
          this.error = 'Failed to add article. Please try again.';
        }
      }
    });
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

  logout() {
    this.authService.logout();
  }
}
