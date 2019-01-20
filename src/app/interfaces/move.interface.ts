import { Player } from '../enum/player.enum';

export interface Move {
  player: Player;
  position: number;
}
