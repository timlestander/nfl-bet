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

  private allTeamData$: Observable<any>;
  public scoreboard$: Observable<TeamData[]>;
  public mockScoreboard$: Observable<any>;
  public leagueData$: Observable<any>;

  public players = [
    { name: 'Tim', teamId: 23 },
    { name: 'KF & Joppe', teamId: 18 },
    { name: 'Martin', teamId: 26 },
    { name: 'Babben', teamId: 27 },
    { name: 'Clabbe', teamId: 16 },
    { name: 'Chrisse', teamId: 10 },
    { name: 'Johan', teamId: 13 },
    { name: 'Filip', teamId: 24 },
    { name: 'Ola', teamId: 9 },
    { name: 'Joel', teamId: 29 },
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

    this.upcomingGames$ = this.allTeamData$.pipe(
      map(results => {
        return results.map((res, index) => {
          return {
            homeTeam: res.team.nextEvent[0].competitions[0].competitors[0].team.shortDisplayName,
            awayTeam: res.team.nextEvent[0].competitions[0].competitors[1].team.shortDisplayName,
            date: res.team.nextEvent[0].date
          }
        })
      }),
      map((upcomingGameData: UpcomingGameData[]) => upcomingGameData.sort((a, b) => a.date > b.date ? 1 : -1))
    )

    // this.teamData$ = this.apiService.getTeamData(23).pipe(
    //   map((data: any) => {
    //     console.log(data);
    //     return {
    //       name: data.team.name,
    //       wins: data.team.record.items[0].stats[1].value,
    //       losses: data.team.record.items[0].stats[2].value,
    //       ties: data.team.record.items[0].stats[5].value,
    //       divisionWins: data.team.record.items[0].stats[19].value,
    //       dude: 'Tim'
    //     };
    //   })
    // );

    // this.data$ = this.apiService.getStandings().pipe(
    //   take(1),
    //   map((data: any) => data.teamStandings.filter(team => Object.values(this.players).includes(team.team.nick))),
    //   map((teams: any[]) => {
    //     return teams.map(team => {
    //       const dude = Object.keys(this.players).find(player => this.players[player] === team.team.nick);
    //       return {
    //         name: team.team.nick,
    //         wins: team.standing.overallWins,
    //         ties: team.standing.overallTies,
    //         losses: team.standing.overallLosses,
    //         divisionWins: team.standing.divisionWins,
    //         dude,
    //       };
    //     });
    //   }),
    //   map((teams: TeamData[]) => this.orderByPoints(teams)),
    // );

    // this.finishedGames$ = this.apiService.getGames().pipe(
    //   take(1),
    //   map((data: any) => {
    //     const interestingTeams: string[] = Object.values(this.players);
    //     return data.gameScores.filter(game => {
    //       return (interestingTeams.includes(game.gameSchedule.homeNickname) ||
    //         interestingTeams.includes(game.gameSchedule.visitorNickname)) &&
    //         game.score !== null;
    //     });
    //   }),
    //   map((games: any[]) => {
    //     return games.map(game => {
    //       return {
    //         homeTeam: game.gameSchedule.homeNickname,
    //         awayTeam: game.gameSchedule.visitorNickname,
    //         homePoints: game.score.homeTeamScore.pointTotal,
    //         awayPoints: game.score.visitorTeamScore.pointTotal,
    //         phase: game.score.phase,
    //       };
    //     });
    //   }),
    // );

    // this.upcomingGames$ = this.apiService.getGames().pipe(
    //   take(1),
    //   map((data: any) => {
    //     const interestingTeams: string[] = Object.values(this.players);
    //     return data.gameScores.filter(game => {
    //       return (interestingTeams.includes(game.gameSchedule.homeNickname) ||
    //         interestingTeams.includes(game.gameSchedule.visitorNickname)) &&
    //         game.score === null;
    //     });
    //   }),
    //   map((games: any[]) => {
    //     return games.map(game => {
    //       return {
    //         homeTeam: game.gameSchedule.homeNickname,
    //         awayTeam: game.gameSchedule.visitorNickname,
    //         date: new Date(game.gameSchedule.isoTime),
    //       };
    //     });
    //   }),
    // );
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
