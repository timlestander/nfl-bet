import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {

  constructor(private http: HttpClient) { }

  public getLeagueData(): Observable<any> {
    return this.http.get('https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard');
  }

  public getTeamData(id: number): Observable<any> {
    return this.http.get(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${id}`);
  }

}
