import { Player } from '../enum/player.enum';

export interface Move {
  col: number;
  player: Player;
  row: number;
}
