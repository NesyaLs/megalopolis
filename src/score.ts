import * as World from './world.js';
import { Board, Position, Cardinal, Color } from './world.js';
import * as G from './graph.js';
import { Objectif } from './objectives.js';

const CARDINALS: Cardinal[] = [Cardinal.Nord, Cardinal.Est, Cardinal.Sud, Cardinal.Ouest];
const COLORS: Color[] = [Color.Orange, Color.Bleu, Color.Vert, Color.Gris];

/**
 *
 * @param position a position on the board (x is the line, y the column)
 * @param direction the direction to look at
 * @returns the position next to position in the given direction
 */
function neighbourPosition(position: Position, direction: Cardinal): Position {
    switch (direction) {
        case Cardinal.Nord:
            return {x: position.x - 1, y: position.y};
        case Cardinal.Sud:
            return {x: position.x + 1, y: position.y};
        case Cardinal.Est:
            return {x: position.x, y: position.y + 1};
        case Cardinal.Ouest:
        default:
            return {x: position.x, y: position.y - 1};
    }
}

/**
 *
 * @param board the current game board
 * @param key the key of a district of the board
 * @returns the keys of the districts placed next to this district (sharing a side)
 */
function neighbourKeys(board: Board, key: string): string[] {
    const position: Position = World.convertKeyToPosition(key);
    return CARDINALS.map(direction => World.genererateKey(neighbourPosition(position, direction))).filter(cle => cle in board);
}

/**
 *
 * @param board the current game board
 * @param key the key of a district of the board
 * @returns true if the district is on the edge of the city (one of its sides has no neighbour)
 */
function isPeripheral(board: Board, key: string): boolean {
    return neighbourKeys(board, key).length < CARDINALS.length;
}

/**
 *
 * @param board the current game board
 * @param color the type of district
 * @returns the keys of every district of this type
 */
function districtsOfColor(board: Board, color: Color): string[] {
    return Object.keys(board).filter(key => board[key].couleur === color);
}

/**
 * Groups keys in connected groups, using a graph whose vertices are the keys
 * @param keys the keys to group
 * @param linked gives the keys linked to a key
 * @returns the connected groups of keys
 */
function connectedGroups(keys: string[], linked: (key: string) => string[]): string[][] {
    const aGraph = keys.reduce((aTempGraph, key, i) =>
        G.graph__add(aTempGraph, i + 1, linked(key).filter(cle => keys.includes(cle)).map(cle => keys.indexOf(cle) + 1)),
        G.graph__empty());
    return G.graph__connectedComponents(aGraph).map(component => component.map(vertex => keys[vertex - 1]));
}

/**
 *
 * @param board the current game board
 * @param color the type of district
 * @returns the blocks (groups of connected districts) of this type
 */
function blocks(board: Board, color: Color): string[][] {
    return connectedGroups(districtsOfColor(board, color),
        key => neighbourKeys(board, key).filter(cle => board[cle].couleur === color));
}

/**
 *
 * @param board the current game board
 * @param color the type of district
 * @returns the number of districts of the largest block of this type
 */
function largestBlockSize(board: Board, color: Color): number {
    return Math.max(0, ...blocks(board, color).map(block => block.length));
}

/**
 *
 * @param board the current game board
 * @param key the key of a district with a road
 * @param direction one of the ends of the road of the district
 * @returns the key of the district where the road continues, null if the road stops here
 */
function connectedRoadKey(board: Board, key: string, direction: Cardinal): string | null {
    const cle: string = World.genererateKey(neighbourPosition(World.convertKeyToPosition(key), direction));
    if (cle in board) {
        const route = board[cle].extremum_route;
        if (route && route.includes(World.turnDirection(direction))) {
            return cle;
        }
    }
    return null;
}

/**
 *
 * @param board the current game board
 * @param key the key of a district with a road
 * @returns the keys of the districts where the road of this district continues
 */
function connectedRoadKeys(board: Board, key: string): string[] {
    const route = board[key].extremum_route;
    if (!route) {
        return [];
    }
    return route.map(direction => connectedRoadKey(board, key, direction)).filter((cle): cle is string => cle !== null);
}

/**
 *
 * @param board the current game board
 * @returns the roads of the city, each road is given by the keys of its sections
 */
function roads(board: Board): string[][] {
    const roadKeys: string[] = Object.keys(board).filter(key => board[key].extremum_route !== undefined);
    return connectedGroups(roadKeys, key => connectedRoadKeys(board, key));
}

/**
 *
 * @param board the current game board
 * @param road the keys of the sections of a road
 * @returns the number of ends of the road that don't continue in the next district
 */
function deadEnds(board: Board, road: string[]): number {
    return road.reduce((aTempNumber, key) => aTempNumber + 2 - connectedRoadKeys(board, key).length, 0);
}

/**
 *
 * @param board the current game board
 * @returns 1pt per district of the largest block of each type
 */
function calculate_score_blocks(board: Board): number {
    return COLORS.reduce((aTempScore, color) => aTempScore + largestBlockSize(board, color), 0);
}

/**
 *
 * @param board the current game board
 * @returns -1pt per road
 */
function calculate_score_roads(board: Board): number {
    return -roads(board).length;
}

function calculate_score_zero_impasse(board: Board): number {
    return 0 - roads(board).reduce((aTempNumber, road) => aTempNumber + deadEnds(board, road), 0);
}

function calculate_score_poumons_verts(board: Board): number {
    const parks: string[] = districtsOfColor(board, Color.Vert);
    const industrialNextToPark: string[] = districtsOfColor(board, Color.Gris).filter(key =>
        neighbourKeys(board, key).some(cle => board[cle].couleur === Color.Vert));
    return parks.length - 2 * industrialNextToPark.length;
}

function calculate_score_grand_boulevard(board: Board): number {
    const longestRoad: number = Math.max(0, ...roads(board).map(road => road.length));
    return Math.floor(longestRoad / 3);
}

function calculate_score_boucle_urbaine(board: Board): number {
    return roads(board).filter(road => deadEnds(board, road) === 0).reduce((aTempScore, road) => aTempScore + road.length, 0);
}

function calculate_score_centre_commercial(board: Board): number {
    const largest: number = largestBlockSize(board, Color.Bleu);
    const others: number = districtsOfColor(board, Color.Bleu).length - largest;
    return largest - others;
}

function calculate_score_cite_dortoir(board: Board): number {
    const quietDistricts: string[] = districtsOfColor(board, Color.Orange).filter(key => {
        const neighbours: string[] = neighbourKeys(board, key);
        return neighbours.length > 0 && neighbours.every(cle => board[cle].couleur === Color.Orange || board[cle].couleur === Color.Vert);
    });
    return 2 * quietDistricts.length;
}

/**
 *
 * @param board the current game board
 * @param color the type of district
 * @returns 1pt per district of this type on the edge of the city, -1pt per district of this type in the center
 */
function peripheralScore(board: Board, color: Color): number {
    return districtsOfColor(board, color).reduce((aTempScore, key) => aTempScore + (isPeripheral(board, key) ? 1 : -1), 0);
}

function calculate_score_zone_franche(board: Board): number {
    return peripheralScore(board, Color.Gris);
}

function calculate_score_ceinture_verte(board: Board): number {
    return peripheralScore(board, Color.Vert);
}

function calculate_score_mixite_sociale(board: Board): number {
    const positions: Position[] = Object.keys(board).map(World.convertKeyToPosition);
    const lines: number[] = [...new Set(positions.map(position => position.x))];
    const columns: number[] = [...new Set(positions.map(position => position.y))];

    const hasEveryColor = (keys: string[]): boolean => COLORS.every(color => keys.some(key => board[key].couleur === color));

    const mixedLines: number[] = lines.filter(x => hasEveryColor(Object.keys(board).filter(key => World.convertKeyToPosition(key).x === x)));
    const mixedColumns: number[] = columns.filter(y => hasEveryColor(Object.keys(board).filter(key => World.convertKeyToPosition(key).y === y)));
    return mixedLines.length + mixedColumns.length;
}

function calculate_score_bon_voisinage(board: Board): number {
    return districtsOfColor(board, Color.Orange).filter(key =>
        neighbourKeys(board, key).some(cle => board[cle].couleur === Color.Bleu) &&
        neighbourKeys(board, key).some(cle => board[cle].couleur === Color.Vert)).length;
}

function calculate_score_quartiers_jumeaux(board: Board): number {
    // Only looking at the south and east neighbours to count each pair once
    const pairs: number = Object.keys(board).reduce((aTempNumber, key) => {
        const position: Position = World.convertKeyToPosition(key);
        const sameNeighbours: number = [Cardinal.Sud, Cardinal.Est]
            .map(direction => World.genererateKey(neighbourPosition(position, direction)))
            .filter(cle => cle in board && board[cle].couleur === board[key].couleur).length;
        return aTempNumber + sameNeighbours;
    }, 0);
    return Math.floor(pairs / 2);
}

const calculators: Record<string, (board: Board) => number> = {
    zero_impasse: calculate_score_zero_impasse,
    poumons_verts: calculate_score_poumons_verts,
    grand_boulevard: calculate_score_grand_boulevard,
    boucle_urbaine: calculate_score_boucle_urbaine,
    centre_commercial: calculate_score_centre_commercial,
    cite_dortoir: calculate_score_cite_dortoir,
    zone_franche: calculate_score_zone_franche,
    ceinture_verte: calculate_score_ceinture_verte,
    mixite_sociale: calculate_score_mixite_sociale,
    bon_voisinage: calculate_score_bon_voisinage,
    quartiers_jumeaux: calculate_score_quartiers_jumeaux
};

/**
 *
 * @param anObjective an objective in play
 * @param board the current game board
 * @returns the points given by the objective for this board
 */
function computeObjectiveBoardScore(anObjective: Objectif, board: Board): number {
    return calculators[anObjective.name](board);
}

/**
 *
 * @param board the current game board
 * @param objectives the objectives in play
 * @returns the score of the board: blocks, roads and objectives
 */
function computeFinalScore(board: Board, objectives: Objectif[]): number {
    return objectives.reduce((aTempScore, anObjective) => aTempScore + computeObjectiveBoardScore(anObjective, board),
        calculate_score_blocks(board) + calculate_score_roads(board));
}

export {
    neighbourKeys,
    isPeripheral,
    blocks,
    largestBlockSize,
    roads,
    deadEnds,
    calculate_score_blocks,
    calculate_score_roads,
    computeObjectiveBoardScore,
    computeFinalScore
};
