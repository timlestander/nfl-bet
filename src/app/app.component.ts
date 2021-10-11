import { Component, OnInit } from '@angular/core';
import { ApiService } from './api.service';
import { map } from 'rxjs/operators';
import { Observable, forkJoin } from 'rxjs';

export interface TeamData {
  wins: number;
  divisionWins: number;
  ties: number;
  losses: number;
  name: string;
}

export interface GameData {
  homeTeam: string;
  awayTeam: string;
  homePoints: number;
  awayPoints: number;
  phase: string;
}

export interface GameData {
  homeTeam: string;
  homeScore: number,
  awayTeam: string;
  awayScore: number;
  date: Date;
  active: boolean;
  completed: boolean;
  time: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  public data$: Observable<TeamData[]>;
  public fullData$: Observable<any>;

  public allGameData$: Observable<GameData[]>;
  public startedGames$: Observable<GameData[]>;
  public upcomingGames$: Observable<GameData[]>;

  private allTeamData$: Observable<any>;
  public scoreboard$: Observable<TeamData[]>;
  public leagueData$: Observable<any>;

  public players = [
    { name: 'Tim', teamId: 23 },
    { name: 'KF & Joppe', teamId: 18 },
    { name: 'Martin & Danezen', teamId: 26 },
    { name: 'Babben', teamId: 27 },
    { name: 'Clabbe', teamId: 16 },
    { name: 'Chrisse', teamId: 10 },
    { name: 'Johan', teamId: 13 },
    { name: 'Filip', teamId: 24 },
    { name: 'Ola & Fegbert', teamId: 9 },
    { name: 'Joel', teamId: 29 },
    { name: 'Ogg', teamId: 7 }
  ];

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    let apiCalls: Array<Observable<any>> = this.players.map(player => this.apiService.getTeamData(player.teamId));

    this.leagueData$ = this.apiService.getLeagueData();
    this.allTeamData$ = forkJoin(apiCalls);

    this.scoreboard$ = this.allTeamData$.pipe(
      map(results => {
        return results.map((res, index) => {
          return {
            name: this.players[index].name,
            wins: res.team.record.items[0].stats[1].value,
            losses: res.team.record.items[0].stats[2].value,
            ties: res.team.record.items[0].stats[5].value,
            divisionWins: res.team.record.items[0].stats[19].value,
            team: res.team.shortDisplayName
          };
        })
      }),
      map((teamData: TeamData[]) => this.orderByPoints(teamData)),
    );

    this.allGameData$ = this.allTeamData$.pipe(
      map(results => {
        return results.map((res, index) => {
          return {
            homeTeam: res.team.nextEvent[0].competitions[0].competitors[0].team.shortDisplayName,
            homeScore: res.team.nextEvent[0].competitions[0].competitors[0].score ? res.team.nextEvent[0].competitions[0].competitors[0].score.value : 0,
            awayTeam: res.team.nextEvent[0].competitions[0].competitors[1].team.shortDisplayName,
            awayScore: res.team.nextEvent[0].competitions[0].competitors[1].score ? res.team.nextEvent[0].competitions[0].competitors[1].score.value : 0,
            date: res.team.nextEvent[0].date,
            active: res.team.nextEvent[0].competitions[0].status.type.state === "in",
            completed: res.team.nextEvent[0].competitions[0].status.type.completed,
            time: res.team.nextEvent[0].competitions[0].status.type.shortDetail
          }
        })
      }),
      map((upcomingGameData: GameData[]) => {
        return upcomingGameData.reduce((acc, g) => {
          const exists: boolean = acc.some(game => game.homeTeam === g.homeTeam);
          if (!exists) {
            acc.push(g);
          }
          return acc;
        }, []).sort(((a, b) => a.date > b.date ? 1 : -1))
      }),
    );

    this.upcomingGames$ = this.allGameData$.pipe(map(games => games.filter(game => !game.active && !game.completed)))
    this.startedGames$ = this.allGameData$.pipe(map(games => games.filter(game => game.active || game.completed)))
  }

  orderByPoints = (teams: TeamData[]) => {
    return teams.sort((a, b) => {
      if (a.wins > b.wins) {
        return -1;
      } else if (a.wins < b.wins) {
        return 1;
      } else {
        if (a.ties > b.ties) {
          return -1;
        } else if (a.ties < b.ties) {
          return 1;
        } else {
          if (a.losses < b.losses) {
            return -1;
          } else if (a.losses > b.losses) {
            return 1;
          } else {
            if (a.divisionWins > b.divisionWins) {
              return -1;
            } else {
              return -1;
            }
          }
        }
      }
    });
  }

}
