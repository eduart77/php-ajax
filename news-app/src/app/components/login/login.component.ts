import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="wrapper">
      <h2>Login</h2>
      <p>Please fill in your credentials to login.</p>

      <div *ngIf="registered" class="alert alert-success">
        Registration successful! Please login with your credentials.
      </div>

      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label>Username</label>
          <input 
            type="text" 
            formControlName="username" 
            class="form-control" 
            [class.is-invalid]="loginError"
          >
        </div>

        <div class="form-group">
          <label>Password</label>
          <input 
            type="password" 
            formControlName="password" 
            class="form-control" 
            [class.is-invalid]="loginError"
          >
          <span class="invalid-feedback" *ngIf="loginError">{{loginError}}</span>
        </div>

        <div class="form-group">
          <button type="submit" class="btn btn-primary">Login</button>
        </div>

        <p>Don't have an account? <a routerLink="/register">Sign up now</a>.</p>
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
    }

    .btn-primary {
      background-color: #007bff;
      color: white;
    }

    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }

    .ml-2 {
      margin-left: 10px;
    }

    p {
      margin: 20px 0;
    }

    a {
      color: #007bff;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }

    .alert-success {
      color: #155724;
      background-color: #d4edda;
      border-color: #c3e6cb;
      padding: 15px;
      margin-bottom: 20px;
      border: 1px solid transparent;
      border-radius: 4px;
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loginError: string = '';
  registered: boolean = false;
  returnUrl: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    // Check if user just registered
    this.route.queryParams.subscribe(params => {
      this.registered = params['registered'] === 'true';
      // Store return URL if present
      this.returnUrl = params['returnUrl'] || '/news';
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    const { username, password } = this.loginForm.value;
    this.loginError = '';

    this.authService.login(username, password).subscribe({
      next: () => {
        // Redirect to return URL or default to news page
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (error) => {
        if (error.status === 401) {
          this.loginError = 'Invalid username or password';
        } else {
          console.error('Login error:', error);
          this.loginError = 'Something went wrong. Please try again later.';
        }
      }
    });
  }
}
