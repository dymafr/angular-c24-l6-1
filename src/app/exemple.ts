import { HttpClient } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-exemple-component',
  templateUrl: 'exemple.html',
  styleUrls: ['exemple.scss'],
})
export class ExempleComponent {
  displayedColumns = ['created', 'state', 'number', 'title'];
  exampleDatabase!: ExampleHttpDao;
  dataSource = new MatTableDataSource();

  resultsLength = 0;
  isLoading = true;

  @ViewChild(MatPaginator, { static: true }) paginateur!: MatPaginator;

  constructor(private http: HttpClient) {}

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginateur;

    this.exampleDatabase = new ExampleHttpDao(this.http);
    this.exampleDatabase!.getRepoIssues('created', 'desc', 1)
      .pipe(
        map((data) => {
          this.isLoading = false;
          this.resultsLength = data.total_count;
          return data.items.slice(0, 40);
        }),
        catchError(() => {
          this.isLoading = false;
          return of([]);
        })
      )
      .subscribe((data) => (this.dataSource.data = data));
  }
}

export interface GithubApi {
  items: GithubIssue[];
  total_count: number;
}

export interface GithubIssue {
  created_at: string;
  number: string;
  state: string;
  title: string;
}

export class ExampleHttpDao {
  constructor(private _httpClient: HttpClient) {}

  getRepoIssues(
    sort: string,
    order: string,
    page: number
  ): Observable<GithubApi> {
    const href = 'https://api.github.com/search/issues';
    const requestUrl = `${href}?q=repo:angular/components&sort=${sort}&order=${order}&page=${
      page + 1
    }`;

    return this._httpClient.get<GithubApi>(requestUrl);
  }
}
