import { Component, OnInit } from '@angular/core';
import { ApiService } from './api.service';
import { take, map, tap, filter } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  public data$: Observable<any>;
  public players = ['Steelers', 'Buccaneers', 'Panthers'];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.data$ = this.apiService.getStandings().pipe(
      take(1),
      map(data => data.teamStandings.filter(team => {
        console.log(team);
        return this.players.includes(team.team.nick);
      }))
    );
  }

}
