import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of as observableOf, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {

  constructor(private http: HttpClient) { }

  public getStandings(): Observable<any> {
    // return this.http.get('../assets/data.json');
    return this.http.get('https://feeds.nfl.com/feeds-rs/standings.json');
  }

  public getGames(): Observable<any> {
    // return this.http.get('../assets/games.json');
    return this.http.get('https://feeds.nfl.com/feeds-rs/scores.json');
  }

}
