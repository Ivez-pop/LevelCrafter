import type { Tile } from "../../types/level";

import wall from "../../../tiles/wall.jpg";
import coin from "../../../tiles/coin.png";
import hazard from "../../../tiles/bomb.png";
import player from "../../../tiles/player.png";
import exit from "../../../tiles/trophy.png";
import floorSrc from "../../../tiles/tile.png";

export interface TileAsset {
  src: string | null;
  alt: string;
  hasFloor: boolean;
}

export const floorTile = {
  src: floorSrc,
  alt: "Floor tile",
};

const tileAssets: Record<Tile, TileAsset> = {
  empty: {
    src: null,
    alt: "Empty tile",
    hasFloor: true,
  },
  wall: {
    src: wall,
    alt: "Wall tile",
    hasFloor: false,
  },
  coin: {
    src: coin,
    alt: "Coin tile",
    hasFloor: true,
  },
  hazard: {
    src: hazard,
    alt: "Hazard tile",
    hasFloor: true,
  },
  player: {
    src: player,
    alt: "Player tile",
    hasFloor: true,
  },
  exit: {
    src: exit,
    alt: "Exit tile",
    hasFloor: true,
  },
};

export const getTileAsset = (tile: Tile): TileAsset => tileAssets[tile];

export const getTileStyle = () => "";
