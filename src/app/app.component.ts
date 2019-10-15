import { Component, OnInit } from '@angular/core';
import { ApiService } from './api.service';
import { take, map, tap, filter } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { getLocaleDayNames } from '@angular/common';

export interface TeamData {
  name: string,
  wins: number;
  divisionWins: number;
  ties: number;
  losses: number;
  dude: string;
}

export interface FinishedGameData {
  homeTeam: string;
  awayTeam: string;
  homePoints: number;
  awayPoints: number;
  phase: string;
}

export interface UpcomingGameData {
  homeTeam: string;
  awayTeam: string;
  date: Date;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  public data$: Observable<TeamData[]>;
  public fullData$: Observable<any>;

  public finishedGames$: Observable<FinishedGameData[]>;
  public upcomingGames$: Observable<UpcomingGameData[]>;

  public players = {
    tim: 'Steelers',
    babben: 'Buccaneers',
    joel: 'Panthers',
    leryn: 'Seahawks',
    chrisse: 'Titans',
    KFJ: 'Saints',
    Clabbe: 'Vikings',
    Marbs: 'Rams',
    Filip: 'Chargers',
    Johan: 'Raiders',
  };

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.fullData$ = this.apiService.getStandings();
    this.data$ = this.apiService.getStandings().pipe(
      take(1),
      map((data: any) => data.teamStandings.filter(team => Object.values(this.players).includes(team.team.nick))),
      map((teams: any[]) => {
        return teams.map(team => {
          const dude = Object.keys(this.players).find(player => this.players[player] === team.team.nick);
          return {
            name: team.team.nick,
            wins: team.standing.overallWins,
            ties: team.standing.overallTies,
            losses: team.standing.overallLosses,
            divisionWins: team.standing.divisionWins,
            dude,
          };
        });
      }),
      map((teams: TeamData[]) => this.orderByPoints(teams)),
    );

    this.finishedGames$ = this.apiService.getGames().pipe(
      take(1),
      map((data: any) => {
        const interestingTeams: string[] = Object.values(this.players);
        return data.gameScores.filter(game => {
          return (interestingTeams.includes(game.gameSchedule.homeNickname) ||
            interestingTeams.includes(game.gameSchedule.visitorNickname)) &&
            game.score !== null;
        });
      }),
      map((games: any[]) => {
        return games.map(game => {
          return {
            homeTeam: game.gameSchedule.homeNickname,
            awayTeam: game.gameSchedule.visitorNickname,
            homePoints: game.score.homeTeamScore.pointTotal,
            awayPoints: game.score.visitorTeamScore.pointTotal,
            phase: game.score.phase,
          };
        });
      }),
    );

    this.upcomingGames$ = this.apiService.getGames().pipe(
      take(1),
      map((data: any) => {
        const interestingTeams: string[] = Object.values(this.players);
        return data.gameScores.filter(game => {
          return (interestingTeams.includes(game.gameSchedule.homeNickname) ||
            interestingTeams.includes(game.gameSchedule.visitorNickname)) &&
            game.score === null;
        });
      }),
      map((games: any[]) => {
        return games.map(game => {
          return {
            homeTeam: game.gameSchedule.homeNickname,
            awayTeam: game.gameSchedule.visitorNickname,
            date: new Date(game.gameSchedule.isoTime),
          };
        });
      }),
    );
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
