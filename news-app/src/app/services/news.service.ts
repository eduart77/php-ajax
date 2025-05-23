import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface Article {
  id: number;
  title: string;
  content: string;
  category: string;
  author_id?: number; 
  producer: string;
  created_at: string;
  author_name?: string;
}

export interface FilterOptions {
  startDate?: string;
  endDate?: string;
  category?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private apiUrl = 'http://localhost:8000';
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    }),
    withCredentials: true
  };

  constructor(private http: HttpClient) { }

  // Public articles - no login required
  getPublicArticles(filterOptions?: FilterOptions): Observable<Article[]> {
    let url = `${this.apiUrl}/get_filtered_news.php`;
    if (filterOptions) {
      const params = new URLSearchParams();
      if (filterOptions.startDate) params.append('startDate', filterOptions.startDate);
      if (filterOptions.endDate) params.append('endDate', filterOptions.endDate);
      if (filterOptions.category) params.append('category', filterOptions.category);
      url += `?${params.toString()}`;
    }
    return this.http.get<any[]>(url, this.httpOptions).pipe(
      map(articles => articles.map(article => ({
        ...article,
        id: parseInt(article.id, 10)  // Convert string ID to number
      }))),
      catchError(error => {
        console.error('Error fetching articles:', error);
        throw error;
      })
    );
  }

  // User's own articles - requires login
  getUserArticles(): Observable<Article[]> {
    return this.http.get<any[]>(`${this.apiUrl}/get_user_articles.php`, this.httpOptions).pipe(
      map(articles => articles.map(article => ({
        ...article,
        id: parseInt(article.id, 10)  // Convert string ID to number
      }))),
      catchError(error => {
        console.error('Error fetching user articles:', error);
        if (error.status === 403) {
          throw new Error('Unauthorized access. Please log in.');
        }
        throw error;
      })
    );
  }

  getArticle(id: number): Observable<Article> {
    return this.http.get<Article>(`${this.apiUrl}/get_article.php`, {
      ...this.httpOptions,
      params: { id: id.toString() }
    });
  }

  addArticle(article: Omit<Article, 'id' | 'author_id' | 'created_at'>): Observable<Article> {
    return this.http.post<Article>(`${this.apiUrl}/add_article.php`, article, this.httpOptions);
  }

  editArticle(article: Article): Observable<Article> {
    return this.http.put<Article>(`${this.apiUrl}/edit_article.php`, article, this.httpOptions);
  }

  deleteArticle(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/delete_article.php`, { id }, this.httpOptions);
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/get_categories.php`, this.httpOptions);
  }
} 