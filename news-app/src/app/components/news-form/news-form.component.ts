import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { NewsService, Article } from '../../services/news.service';

@Component({
  selector: 'app-news-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="wrapper">
      <h2>{{isEditMode ? 'Edit Article' : 'Add New Article'}}</h2>
      
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
          <label>Content</label>
          <textarea 
            formControlName="content" 
            class="form-control" 
            rows="6"
            [class.is-invalid]="contentError"
          ></textarea>
          <span class="invalid-feedback" *ngIf="contentError">{{contentError}}</span>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" [disabled]="isSubmitting">
            {{isSubmitting ? 'Saving...' : (isEditMode ? 'Update Article' : 'Publish Article')}}
          </button>
          <button type="button" class="btn btn-secondary" (click)="goBack()">Cancel</button>
        </div>
      </form>
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
      max-width: 800px;
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

    .is-invalid {
      border-color: #dc3545;
    }

    .invalid-feedback {
      color: #dc3545;
      font-size: 12px;
      margin-top: 5px;
    }

    .form-actions {
      margin-top: 20px;
    }

    .btn {
      padding: 10px 15px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      margin-right: 10px;
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

    textarea {
      resize: vertical;
    }
  `]
})
export class NewsFormComponent implements OnInit {
  articleForm: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  articleId: number | null = null;
  categories: string[] = ['politics', 'society', 'health', 'technology', 'sports'];
  titleError: string = '';
  categoryError: string = '';
  contentError: string = '';

  constructor(
    private fb: FormBuilder,
    private newsService: NewsService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.articleForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      category: ['', [Validators.required]],
      content: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.articleId = +id;
      this.loadArticle(this.articleId);
    }
  }

  loadArticle(id: number) {
    this.newsService.getUserArticles().subscribe({
      next: (articles) => {
        const article = articles.find(a => a.id === id);
        if (article) {
          this.articleForm.patchValue({
            title: article.title,
            category: article.category,
            content: article.content
          });
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        console.error('Error loading article:', err);
        this.router.navigate(['/dashboard']);
      }
    });
  }

  onSubmit() {
    if (this.articleForm.invalid) {
      this.validateForm();
      return;
    }

    this.isSubmitting = true;
    const articleData = this.articleForm.value;

    const request = this.isEditMode
      ? this.newsService.editArticle({ ...articleData, id: this.articleId })
      : this.newsService.addArticle(articleData);

    request.subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Error saving article:', err);
        this.isSubmitting = false;
        // Show error message
        if (err.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  validateForm() {
    this.titleError = '';
    this.categoryError = '';
    this.contentError = '';

    const titleControl = this.articleForm.get('title');
    if (titleControl?.errors?.['required']) {
      this.titleError = 'Title is required';
    } else if (titleControl?.errors?.['minlength']) {
      this.titleError = 'Title must be at least 3 characters long';
    }

    const categoryControl = this.articleForm.get('category');
    if (categoryControl?.errors?.['required']) {
      this.categoryError = 'Please select a category';
    }

    const contentControl = this.articleForm.get('content');
    if (contentControl?.errors?.['required']) {
      this.contentError = 'Content is required';
    } else if (contentControl?.errors?.['minlength']) {
      this.contentError = 'Content must be at least 10 characters long';
    }
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
