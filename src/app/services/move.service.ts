import { Injectable } from '@angular/core';
import { GameBoard } from '../classes/game-board';
import { Player } from '../enum/player.enum';

@Injectable({
  providedIn: 'root'
})
export class MoveService {
  private depthReached = 0;
  private gb: GameBoard;
  private nodesExplored = 0;
  private player: Player;
  private startTime: number;
  private timeCutoff = 1000;
  private timeout = false;

  findBestMove(gb: GameBoard, player: Player): number {
    this.gb = gb;
    this.player = player;
    this.startTime = (new Date()).getTime();
    this.depthReached = 0;
    this.nodesExplored = 0;

    const possibleMoves = this.gb.getPossibleGameBoards(this.player);
    let moveChoices: number[] = [];

    let bestMoveValue = -1000;
    console.log('-----------------------------\n');
    for (let i = 0; i < possibleMoves.length; i++) {
      const moveValue = this.minValue(possibleMoves[i], -1000, 1000, 0);
      console.log(possibleMoves[i].consoleFormat(), 'color: red', 'color: black', '\nMove value: ' + moveValue);
      if (moveValue > bestMoveValue) {
        moveChoices = [];
        moveChoices.push(i);
        bestMoveValue = moveValue;
      } else if (moveValue === bestMoveValue) {
        moveChoices.push(i);
      }
    }

    if (moveChoices.length === 0) {
      moveChoices = possibleMoves.map((v, i) => i);
    }
    const time = (new Date()).getTime();
    console.log(
      `Player: ${this.player}\n` +
      `Nodes explored: ${this.nodesExplored}\n` +
      `Time consumed: ${time - this.startTime}ms\n` +
      `Move value: ${bestMoveValue}\n` +
      `Move possibilities:`, moveChoices
    );
    const n = Math.floor(Math.random() * moveChoices.length);
    return possibleMoves[moveChoices[n]].lastMove.position;
  }

  private calculateValue(gb: GameBoard, depth: number): number {
    if (gb.checkWin(this.player)) {
      return 1000 - depth;
    }

    if (gb.checkWin(this.getOpponent())) {
      return depth - 1000;
    }

    return 0;
  }

  private evaluateGameBoard(gb: GameBoard): number {
    const p = gb.checkNumPlays(this.player);
    const o = gb.checkNumPlays(this.getOpponent());

    return p - o;
  }

  private getOpponent(player?: Player): Player {
    return (player || this.player) === Player.X ? Player.O : Player.X;
  }

  private isGameOver(gb: GameBoard): boolean {
    return gb.checkTie() || !!gb.checkWin(this.player) || !!gb.checkWin(this.getOpponent());
  }

  private maxValue(gb: GameBoard, a: number, b: number, currentDepth: number): number {
    this.nodesExplored++;

    if (currentDepth > this.depthReached) {
      this.depthReached = currentDepth;
    }

    if (this.isGameOver(gb)) {
      return this.calculateValue(gb, currentDepth);
    }

    const time = (new Date()).getTime();
    if (time - this.startTime > this.timeCutoff) {
      this.timeout = true;
      return this.evaluateGameBoard(gb);
    }

    let v = -1000;

    const possibleMoves = gb.getPossibleGameBoards(this.player);
    for (let i = 0; i < possibleMoves.length; i++) {
      v = Math.max(v, this.minValue(possibleMoves[i], a, b, currentDepth++));
      if (v >= b) {
        return v;
      }
      a = Math.max(a, v);
    }

    return v;
  }

  private minValue(gb: GameBoard, a: number, b: number, currentDepth: number): number {
    this.nodesExplored++;

    if (currentDepth > this.depthReached) {
      this.depthReached = currentDepth;
    }

    if (this.isGameOver(gb)) {
      return this.calculateValue(gb, currentDepth);
    }

    const time = (new Date()).getTime();
    if (time - this.startTime > this.timeCutoff) {
      this.timeout = true;
      return this.evaluateGameBoard(gb);
    }

    let v = 1000;
    const possibleMoves = gb.getPossibleGameBoards(this.getOpponent());

    for (let i = 0; i < possibleMoves.length; i++) {
      v = Math.min(v, this.maxValue(possibleMoves[i], a, b, currentDepth++));
      if (v <= a) {
        return v;
      }
      b = Math.min(b, v);
    }

    return v;
  }
}
