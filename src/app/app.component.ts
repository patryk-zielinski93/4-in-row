import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { GameBoard } from './classes/game-board';
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

  ngOnInit(): void {
    this.gameBoard$ = this.gameService.gameBoard$.pipe(tap(gb => {
      console.log(gb.checkWin(this.gameService.human));
    }));
    this.gameService.start();
  }

  onMove(move: number): void {
    this.gameService.move(this.gameService.human, move);
  }

  trackByIndex(index: number): number {
    return index;
  }
}
