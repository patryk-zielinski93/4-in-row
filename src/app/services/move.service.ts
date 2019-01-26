import { Injectable } from '@angular/core';
import { GameBoard } from '../classes/game-board';
import { Player } from '../enum/player.enum';
import { MovePosition } from '../interfaces/move-position.interface';

@Injectable({
  providedIn: 'root'
})
export class MoveService {
  private depthLimit = 5;
  private gb: GameBoard;
  private nodesExplored = 0;
  private player: Player;
  private startTime: number;

  findBestMove(gb: GameBoard, player: Player, depthLimit): MovePosition {
    this.gb = gb;
    this.player = player;
    this.depthLimit = depthLimit;
    this.startTime = (new Date()).getTime();
    this.nodesExplored = 0;

    if (this.gb.board2.every(row => row.every(col => col === ''))) {
      return {
        col: 2,
        row: 2
      };
    }

    const possibleMoves = this.gb.getPossibleGameBoards();

    let bestMoveValue = -1000;

    console.log('-----------------------------\n');
    let moveChoices: MovePosition[] = [];

    possibleMoves.forEach(pm => {
      const moveValue = this.minValue(pm, -1000, 1000, 0);
      // const moveValue = this.negamax(pm, 0, -1000, 1000, 1);
      console.log(pm.consoleFormat(), 'color: red', 'color: black', '\nMove value: ' + moveValue);

      if (moveValue > bestMoveValue) {
        moveChoices = [];
        moveChoices.push({col: pm.lastMove.col, row: pm.lastMove.row});
        bestMoveValue = moveValue;
      } else if (moveValue === bestMoveValue) {
        moveChoices.push({col: pm.lastMove.col, row: pm.lastMove.row});
      }
    });

    const time = (new Date()).getTime();
    console.log(
      `Player: ${this.player}\n` +
      `Nodes explored: ${this.nodesExplored}\n` +
      `Time consumed: ${time - this.startTime}ms\n` +
      `Move value: ${bestMoveValue}\n` +
      `Move possibilities:`, moveChoices
    );

    const n = Math.floor(Math.random() * moveChoices.length);
    return moveChoices[n];
  }

  getOpponent(player?: Player): Player {
    if (player) {
      return player === Player.X ? Player.O : Player.X;
    }

    return this.player === Player.X ? Player.O : Player.X;
  }

  private calculateValue(gb: GameBoard, depth: number): number {
    if (gb.checkWin(this.player)) {
      return 1000 - depth;
    }

    if (gb.checkWin(this.getOpponent())) {
      return -1000 + depth;
    }

    return 0;
  }

  private isTerminal(gb: GameBoard): boolean {
    return gb.checkTie() || !!gb.checkWin(this.player) || !!gb.checkWin(this.getOpponent());
  }

  private maxValue(gb: GameBoard, a: number, b: number, depth: number): number {
    this.nodesExplored++;

    if (depth > this.depthLimit || this.isTerminal(gb)) {
      return this.calculateValue(gb, depth);
    }

    let v = -1000;

    const possibleMoves = gb.getPossibleGameBoards();
    for (let i = 0; i < possibleMoves.length; i++) {
      v = Math.max(v, this.minValue(possibleMoves[i], a, b, depth + 1));
      if (v >= b) {
        return v;
      }
      a = Math.max(a, v);
    }

    return v;
  }

  private minValue(gb: GameBoard, a: number, b: number, depth: number): number {
    this.nodesExplored++;

    if (depth > this.depthLimit || this.isTerminal(gb)) {
      return this.calculateValue(gb, depth);
    }

    let v = 1000;
    const possibleMoves = gb.getPossibleGameBoards();

    for (let i = 0; i < possibleMoves.length; i++) {
      v = Math.min(v, this.maxValue(possibleMoves[i], a, b, depth + 1));
      if (v <= a) {
        return v;
      }
      b = Math.min(b, v);
    }

    return v;
  }

  // @Todo
  private negamax(node: GameBoard, depth: number, a: number, b: number, color: number) {
    if (depth >= this.depthLimit || this.isTerminal(node)) {
      return color * this.negamaxValue(node, depth);
    }

    const childNodes = node.getPossibleGameBoards();
    let value = -1000;

    for (let i = 0; i < childNodes.length; i++) {
      value = Math.max(value, -this.negamax(childNodes[i], depth + 1, -b, -a, -color));
      a = Math.max(a, value);

      if (a >= b) {
        return value;
      }
    }

    return value;
  }

  private negamaxValue(node: GameBoard, depth: number): number {
    if (node.checkWin(node.currentPlayer)) {
      return 1000 - depth;
    }

    if (node.checkWin(this.getOpponent(node.currentPlayer))) {
      return -1000 + depth;
    }

    return 0;
  }
}
