import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { Tile, Position } from "../../../types/level";
import type { Direction } from "../../../game/movement";
import type { VentDestination } from "../../../types/gameState";
import { TileArtwork } from "../../tiles/TileArtwork";
import { blastTile } from "../../tiles/tileAssets";

interface GameBoardProps {
  width: number;
  grid: Tile[][];
  player: Position | null;
  explosion: Position | null;
  getTileStyle: (tile: Tile) => string;
  onMove: (direction: Direction) => void;
  onSelectVentDestination?: (destination: VentDestination) => void;
  isSelectingVent?: boolean;
  availableVentDestinations?: VentDestination[];
}

export function GameBoard({
  width,
  grid,
  player,
  explosion,
  getTileStyle,
  onMove,
  onSelectVentDestination,
  isSelectingVent = false,
  availableVentDestinations = [],
}: GameBoardProps) {
  const dragState = useRef<{
    pointerId: number | null;
    lastRow: number;
    lastCol: number;
    active: boolean;
  }>({
    pointerId: null,
    lastRow: -1,
    lastCol: -1,
    active: false,
  });
  const [dragPointerId, setDragPointerId] = useState<number | null>(null);

  const finishDrag = () => {
    const state = dragState.current;

    state.pointerId = null;
    state.active = false;
    setDragPointerId(null);
  };

  const moveIfAdjacent = (fromRow: number, fromCol: number, toRow: number, toCol: number) => {
    const deltaRow = toRow - fromRow;
    const deltaCol = toCol - fromCol;

    if (Math.abs(deltaRow) + Math.abs(deltaCol) !== 1) {
      return false;
    }

    const direction: Direction =
      deltaRow === -1 ? "up" : deltaRow === 1 ? "down" : deltaCol === -1 ? "left" : "right";

    onMove(direction);
    dragState.current.lastRow = toRow;
    dragState.current.lastCol = toCol;

    return true;
  };

  const getCellFromEventTarget = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) {
      return null;
    }

    const cell = target.closest<HTMLElement>("[data-row][data-col]");

    if (!cell) {
      return null;
    }

    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);

    if (Number.isNaN(row) || Number.isNaN(col)) {
      return null;
    }

    return { row, col };
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;

    const cell = getCellFromEventTarget(event.target);

    if (!cell || !player || cell.row !== player.y || cell.col !== player.x) {
      return;
    }

    dragState.current = {
      pointerId: event.pointerId,
      lastRow: cell.row,
      lastCol: cell.col,
      active: true,
    };
    setDragPointerId(event.pointerId);
  };

  const handlePointerEnter = (event: ReactPointerEvent<HTMLDivElement>) => {
    const state = dragState.current;
    const cell = getCellFromEventTarget(event.target);

    if (!state.active || state.pointerId !== event.pointerId || !cell) {
      return;
    }

    if (cell.row === state.lastRow && cell.col === state.lastCol) {
      return;
    }

    const rowDelta = Math.abs(cell.row - state.lastRow);
    const colDelta = Math.abs(cell.col - state.lastCol);

    if (rowDelta + colDelta !== 1) {
      return;
    }

    moveIfAdjacent(state.lastRow, state.lastCol, cell.row, cell.col);
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragState.current.pointerId === event.pointerId) {
      finishDrag();
    }
  };

  const handlePointerCancel = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragState.current.pointerId === event.pointerId) {
      finishDrag();
    }
  };

  useEffect(() => {
    if (dragPointerId === null) {
      return;
    }

    const handleWindowPointerUp = (event: PointerEvent) => {
      if (event.pointerId === dragPointerId) {
        finishDrag();
      }
    };

    const handleWindowPointerCancel = (event: PointerEvent) => {
      if (event.pointerId === dragPointerId) {
        finishDrag();
      }
    };

    window.addEventListener("pointerup", handleWindowPointerUp);
    window.addEventListener("pointercancel", handleWindowPointerCancel);

    return () => {
      window.removeEventListener("pointerup", handleWindowPointerUp);
      window.removeEventListener("pointercancel", handleWindowPointerCancel);
    };
  }, [dragPointerId]);

  const destinationByKey = new Map(
    availableVentDestinations.map((destination) => [
      `${destination.x},${destination.y}`,
      destination,
    ]),
  );

  return (
    <div className="border-4 border-black bg-black p-2 shadow-[8px_8px_0px_#000] sm:p-3">
      <div
        className="grid gap-0 bg-black"
        style={{
          gridTemplateColumns: `repeat(${width}, minmax(40px, 56px))`,
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              data-row={rowIndex}
              data-col={colIndex}
              onPointerDown={
                isSelectingVent && destinationByKey.has(`${colIndex},${rowIndex}`)
                  ? (event) => {
                      event.preventDefault();
                      const destination = destinationByKey.get(`${colIndex},${rowIndex}`);

                      if (destination) {
                        onSelectVentDestination?.(destination);
                      }
                    }
                  : player?.x === colIndex && player?.y === rowIndex
                  ? handlePointerDown
                  : undefined
              }
              onPointerEnter={handlePointerEnter}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
              className={
                `
                  relative
                  aspect-square
                  w-full
                  arcade-tile
                  ${getTileStyle(cell)}
                  ${isSelectingVent && destinationByKey.has(`${colIndex},${rowIndex}`) ? "ring-4 ring-cyan-300 ring-inset cursor-pointer" : ""}
                `
              }
            >
              <TileArtwork tile={cell} className="h-full w-full" imageClassName="p-0.5" />
              {isSelectingVent && cell === "vent" && destinationByKey.has(`${colIndex},${rowIndex}`) ? (
                <div className="absolute inset-0 z-10 bg-cyan-300/15" />
              ) : null}
              {explosion?.x === colIndex && explosion?.y === rowIndex ? (
                <img
                  src={blastTile.src ?? undefined}
                  alt={blastTile.alt}
                  draggable={false}
                  className="absolute inset-0 z-20 block h-full w-full object-cover"
                />
              ) : null}
            </div>
          )),
        )}
      </div>
    </div>
  );
}
