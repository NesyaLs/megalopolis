import * as World from "../src/world.js";
import * as Play from "../src/play.js";
import * as Score from "../src/score.js";
import * as Objectives from "../src/objectives.js";

describe('Tiles and placement', () => {
    test('turning a tile twice gives back the same tile, without changing the original tile', () => {
        const tile = World.createTile(0);
        const copy = World.createTile(0);
        const turned = World.turnTile(tile);
        expect(tile).toEqual(copy);
        expect(turned).not.toEqual(tile);
        expect(World.turnTile(turned)).toEqual(tile);
    });

    test('a tile must touch the city and cannot completely cover another tile', () => {
        const board = World.boardAddTile(World.emptyBoard(), World.createTile(1), { x: 5, y: 5 });
        expect(World.TilePlacementIsValid(board, { x: 5, y: 5 })).toBe(false);
        expect(World.TilePlacementIsValid(board, { x: 5, y: 6 })).toBe(true);
        expect(World.TilePlacementIsValid(board, { x: 5, y: 7 })).toBe(true);
        expect(World.TilePlacementIsValid(board, { x: 5, y: 9 })).toBe(false);
    });
});

describe('Play', () => {
    test('the first tile is placed in the middle of the world', () => {
        const board = Play.playTile(World.emptyBoard(), World.createTile(2));
        expect(Object.keys(board)).toHaveLength(4);
        expect(World.TilePlacementIsValid(board, { x: 7, y: 7 })).toBe(false);
    });

    test('the best placement scores at least as much as any random placement', () => {
        const objectives = Objectives.objectifs.slice(0, 3);
        const start = Play.playBestTile(World.emptyBoard(), World.createTile(3), objectives);
        const tile = World.createTile(4);
        const best = Score.computeFinalScore(Play.playBestTile(start, tile, objectives), objectives);
        for (let i = 0; i < 20; i++) {
            const random = Score.computeFinalScore(Play.playTile(start, tile), objectives);
            expect(best).toBeGreaterThanOrEqual(random);
        }
    });
});
