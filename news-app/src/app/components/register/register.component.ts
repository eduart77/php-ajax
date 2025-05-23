import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="wrapper">
      <h2>Sign Up</h2>
      <p>Please fill this form to create an account.</p>
      
      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label>Username</label>
          <input 
            type="text" 
            formControlName="username" 
            class="form-control" 
            [class.is-invalid]="usernameError"
          >
          <span class="invalid-feedback" *ngIf="usernameError">{{usernameError}}</span>
        </div>

        <div class="form-group">
          <label>Password</label>
          <input 
            type="password" 
            formControlName="password" 
            class="form-control" 
            [class.is-invalid]="passwordError"
          >
          <span class="invalid-feedback" *ngIf="passwordError">{{passwordError}}</span>
        </div>

        <div class="form-group">
          <label>Confirm Password</label>
          <input 
            type="password" 
            formControlName="confirmPassword" 
            class="form-control" 
            [class.is-invalid]="confirmPasswordError"
          >
          <span class="invalid-feedback" *ngIf="confirmPasswordError">{{confirmPasswordError}}</span>
        </div>

        <div class="form-group">
          <button type="submit" class="btn btn-primary">Submit</button>
        </div>

        <p>Already have an account? <a routerLink="/login">Login here</a>.</p>
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
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  usernameError: string = '';
  passwordError: string = '';
  confirmPasswordError: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9_]+$/)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6)
      ]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  onSubmit() {
    // Reset errors
    this.usernameError = '';
    this.passwordError = '';
    this.confirmPasswordError = '';

    if (this.registerForm.invalid) {
      // Username validation
      if (this.registerForm.get('username')?.errors?.['required']) {
        this.usernameError = 'Please enter a username.';
      } else if (this.registerForm.get('username')?.errors?.['pattern']) {
        this.usernameError = 'Username can only contain letters, numbers, and underscores.';
      }

      // Password validation
      if (this.registerForm.get('password')?.errors?.['required']) {
        this.passwordError = 'Please enter a password.';
      } else if (this.registerForm.get('password')?.errors?.['minlength']) {
        this.passwordError = 'Password must have at least 6 characters.';
      }

      // Confirm password validation
      if (this.registerForm.get('confirmPassword')?.errors?.['required']) {
        this.confirmPasswordError = 'Please confirm password.';
      } else if (this.registerForm.get('password')?.value !== this.registerForm.get('confirmPassword')?.value) {
        this.confirmPasswordError = 'Passwords do not match.';
      }

      return;
    }

    const { username, password } = this.registerForm.value;

    this.authService.register(username, password).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        // Show success message and redirect to login
        this.router.navigate(['/login'], { 
          queryParams: { registered: 'true' } 
        });
      },
      error: (error) => {
        console.error('Registration error:', error);
        if (error.status === 409) {
          this.usernameError = 'This username is already taken.';
        } else if (error.error?.error) {
          // Handle specific error messages from the server
          const errorMessage = error.error.error;
          if (errorMessage.includes('username')) {
            this.usernameError = errorMessage;
          } else if (errorMessage.includes('password')) {
            this.passwordError = errorMessage;
          } else if (errorMessage.includes('confirm')) {
            this.confirmPasswordError = errorMessage;
          } else {
            this.usernameError = errorMessage;
          }
        } else {
          this.usernameError = 'An error occurred during registration. Please try again.';
        }
      }
    });
  }
}
