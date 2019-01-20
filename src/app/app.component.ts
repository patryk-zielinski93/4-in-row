import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { GameBoard } from './classes/game-board';
import { Player } from './enum/player.enum';
import { GameService } from './services/game.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  gameBoard$: Observable<GameBoard>;

  constructor(private gameService: GameService) {
  }

  displayFn(player: Player): string {
    if (player === 0) {
      return '';
    }
    return player === Player.X ? 'X' : 'O';
  }

  ngOnInit(): void {
    this.gameBoard$ = this.gameService.gameBoard$.pipe(tap(gb => {
      console.log(gb.checkWin(this.gameService.human));
    }));
    this.gameService.start();
  }

  onMove(move: number): void {
    this.gameService.move(move);
  }

  trackByKeyValue(value: number, key: number): string {
    return `${value}${key}`;
  }
}
