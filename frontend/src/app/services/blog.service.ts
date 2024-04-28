import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BlogService {
  private baseUrl: string = 'https://localhost:7072/blog/';

  constructor(private http: HttpClient) {}

  addNewBlog(formData: any) {
    return this.http.post(this.baseUrl + 'add-new-blog', formData);
  }

  getAllBlog() {
    return this.http.get(this.baseUrl + 'get-all-blog');
  }

  getBlogByID(id: number) {
    return this.http.get(this.baseUrl + 'get-blog-by-id', { params: { id } });
  }

  updateBlog(formData: any) {
    return this.http.post(this.baseUrl + 'update-blog', formData);
  }

  getBlogHome() {
    return this.http.get(this.baseUrl + 'get-blog-home');
  }

  getBlogSearch() {
    return this.http.get(this.baseUrl + 'get-blog-search');
  }

  addCountBlog(email: string, id: number) {
    return this.http.post(
      'https://localhost:7072/clickblog/add-count-blog',
      {},
      { params: { email, id } }
    );
  }

  getRecomment(articleId: number) {
    return this.http.get('https://localhost:7072/clickblog/recomment-blog', {
      params: { articleId },
    });
  }
}
