import * as World from './world.js';
import { Board, Tile, Position, boardAddTile, TILES_NUMBER, TilePlacementIsValid } from './world.js';
import * as Score from './score.js';
import { Objectif } from './objectives.js';

// Position of the first tile, in the middle of the world
const STARTING_POSITION: Position = {x: Math.floor(TILES_NUMBER / 2), y: Math.floor(TILES_NUMBER / 2) };

/**
 *
 * @param board the current game board
 * @returns every position where a tile can be placed
 */
function validPositions(board: Board): Position[] {
    // Filling a list with every existing position.
    const everyPosition: Position[] = Array.from({ length: 2*World.TILES_NUMBER }, (_, x) =>
    Array.from({ length: 2*World.TILES_NUMBER }, (_, y) => ({ x, y }))).flat();

    // Filtering only valid positions.
    return everyPosition.filter(position =>
        TilePlacementIsValid(board, position)
    );
}

/**
 *
 * @param world the current game board
 * @param tuile the tile you want to play
 * Computes every possible position, Filters the valid ones, Choose randomly a postion among these.
 * If it's the 1st move (the board is empty), the tile is placed in the center of the world.
 */
function playTile(board: Board, tile: Tile): Board {

    if(World.boardIsEmpty(board)){
        return World.boardAddTile(board, tile, STARTING_POSITION);
    }

    const positionsValides: Position[] = validPositions(board);

    // Randomly choosing a position among the valid ones
    const finalRandomPosition: Position = positionsValides[ Math.floor(Math.random() * positionsValides.length) ];

    const aNewBoard: Board = World.boardAddTile(board,tile,finalRandomPosition);

    return aNewBoard;
}

/**
 *
 * @param board the current game board
 * @param tile the tile you want to play
 * @param objectives the objectives in play
 * Tries every valid position with the tile and the turned tile, keeps the board with the best score.
 * If it's the 1st move (the board is empty), the tile is placed in the center of the world.
 */
function playBestTile(board: Board, tile: Tile, objectives: Objectif[]): Board {

    if(World.boardIsEmpty(board)){
        return World.boardAddTile(board, tile, STARTING_POSITION);
    }

    const positionsValides: Position[] = validPositions(board);
    const candidates: Board[] = [tile, World.turnTile(tile)].flatMap(aTile =>
        positionsValides.map(position => boardAddTile(board, aTile, position)));

    return candidates.reduce((aBestBoard, aBoard) =>
        Score.computeFinalScore(aBoard, objectives) > Score.computeFinalScore(aBestBoard, objectives) ? aBoard : aBestBoard);
}

export {
    playTile,
    playBestTile,
};
