import { Board, District, Color, Cardinal } from "../src/world.js";
import * as Score from "../src/score.js";
import { objectifs, Objectif } from "../src/objectives.js";

const { Nord, Est, Sud, Ouest } = Cardinal;

function district(couleur: Color, extremum_route?: [Cardinal, Cardinal]): District {
    return extremum_route ? { couleur, extremum_route } : { couleur };
}

function objective(name: string): Objectif {
    const found = objectifs.find(anObjective => anObjective.name === name);
    if (found === undefined) {
        throw new Error(`Unknown objective ${name}`);
    }
    return found;
}

const park = (): District => district(Color.Vert);

// 3x3 square of parks
function parkSquare(): Board {
    const board: Board = {};
    for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
            board[`${x},${y}`] = park();
        }
    }
    return board;
}

// 2x2 closed road: ┌ ┐ / └ ┘
const loopBoard: Board = {
    "0,0": district(Color.Orange, [Est, Sud]),
    "0,1": district(Color.Bleu, [Ouest, Sud]),
    "1,0": district(Color.Gris, [Nord, Est]),
    "1,1": district(Color.Orange, [Nord, Ouest]),
};

describe('Neighbours and periphery', () => {
    test('a district in the middle of a square has 4 neighbours and is not peripheral', () => {
        const board = parkSquare();
        expect(Score.neighbourKeys(board, "1,1").sort()).toEqual(["0,1", "1,0", "1,2", "2,1"]);
        expect(Score.isPeripheral(board, "1,1")).toBe(false);
    });

    test('corners and sides are peripheral', () => {
        const board = parkSquare();
        expect(Score.neighbourKeys(board, "0,0").sort()).toEqual(["0,1", "1,0"]);
        expect(Score.isPeripheral(board, "0,0")).toBe(true);
        expect(Score.isPeripheral(board, "0,1")).toBe(true);
    });
});

describe('Blocks', () => {
    const board: Board = {
        "0,0": district(Color.Orange, [Est, Ouest]),
        "0,1": district(Color.Orange, [Est, Ouest]),
        "1,1": district(Color.Orange, [Nord, Sud]),
        "0,2": park(),
        "0,3": district(Color.Orange, [Est, Ouest]),
        "1,3": district(Color.Bleu, [Nord, Sud]),
    };

    test('districts of the same type touching by a side are in the same block', () => {
        const orangeBlocks = Score.blocks(board, Color.Orange).map(block => block.sort());
        expect(orangeBlocks).toHaveLength(2);
        expect(orangeBlocks).toContainEqual(["0,0", "0,1", "1,1"]);
        expect(orangeBlocks).toContainEqual(["0,3"]);
    });

    test('largest block size of each type', () => {
        expect(Score.largestBlockSize(board, Color.Orange)).toBe(3);
        expect(Score.largestBlockSize(board, Color.Vert)).toBe(1);
        expect(Score.largestBlockSize(board, Color.Gris)).toBe(0);
    });

    test('blocks score adds the largest block of each type', () => {
        expect(Score.calculate_score_blocks(board)).toBe(3 + 1 + 1 + 0);
    });
});

describe('Roads', () => {
    test('a straight road through 3 districts is one road with 2 dead ends', () => {
        const board: Board = {
            "0,0": district(Color.Orange, [Ouest, Est]),
            "0,1": district(Color.Gris, [Ouest, Est]),
            "0,2": district(Color.Bleu, [Ouest, Est]),
        };
        const roads = Score.roads(board);
        expect(roads).toHaveLength(1);
        expect(roads[0].sort()).toEqual(["0,0", "0,1", "0,2"]);
        expect(Score.deadEnds(board, roads[0])).toBe(2);
        expect(Score.calculate_score_roads(board)).toBe(-1);
    });

    test('roads that do not face each other are not connected', () => {
        const board: Board = {
            "0,0": district(Color.Orange, [Ouest, Est]),
            "0,1": district(Color.Gris, [Nord, Sud]),
            "0,2": park(),
            "0,3": district(Color.Bleu, [Ouest, Est]),
        };
        expect(Score.roads(board)).toHaveLength(3);
        expect(Score.calculate_score_roads(board)).toBe(-3);
    });

    test('a closed loop has no dead end', () => {
        const roads = Score.roads(loopBoard);
        expect(roads).toHaveLength(1);
        expect(Score.deadEnds(loopBoard, roads[0])).toBe(0);
    });
});

describe('Objectives', () => {
    test('every objective has a score calculator', () => {
        objectifs.forEach(anObjective => {
            expect(typeof Score.computeObjectiveBoardScore(anObjective, loopBoard)).toBe("number");
        });
    });

    test('zero_impasse counts the dead ends', () => {
        const board: Board = {
            ...loopBoard,
            "0,2": district(Color.Bleu, [Ouest, Est]),
            "0,3": district(Color.Bleu, [Est, Sud]),
        };
        expect(Score.computeObjectiveBoardScore(objective("zero_impasse"), loopBoard)).toBe(0);
        expect(Score.computeObjectiveBoardScore(objective("zero_impasse"), board)).toBe(-4);
    });

    test('poumons_verts: parks minus industrial districts next to a park', () => {
        const board: Board = {
            "0,0": park(),
            "0,1": district(Color.Gris, [Nord, Sud]),
            "0,2": park(),
            "1,2": park(),
            "2,2": district(Color.Gris, [Nord, Sud]),
            "3,0": district(Color.Gris, [Nord, Sud]),
        };
        // 3 parks, 2 industrial districts next to a park
        expect(Score.computeObjectiveBoardScore(objective("poumons_verts"), board)).toBe(3 - 4);
    });

    test('grand_boulevard: 1pt every 3 sections of the longest road', () => {
        const board: Board = {};
        for (let y = 0; y < 7; y++) {
            board[`0,${y}`] = district(Color.Orange, [Ouest, Est]);
        }
        board["2,0"] = district(Color.Orange, [Ouest, Est]);
        expect(Score.computeObjectiveBoardScore(objective("grand_boulevard"), board)).toBe(2);
    });

    test('boucle_urbaine: sections of closed roads only', () => {
        const board: Board = {
            ...loopBoard,
            "3,0": district(Color.Bleu, [Ouest, Est]),
            "3,1": district(Color.Bleu, [Ouest, Est]),
        };
        expect(Score.computeObjectiveBoardScore(objective("boucle_urbaine"), board)).toBe(4);
    });

    test('centre_commercial: largest commercial block minus the other commercial districts', () => {
        const board: Board = {
            "0,0": district(Color.Bleu, [Nord, Sud]),
            "0,1": district(Color.Bleu, [Nord, Sud]),
            "0,2": district(Color.Bleu, [Nord, Sud]),
            "0,3": park(),
            "0,4": district(Color.Bleu, [Nord, Sud]),
        };
        expect(Score.computeObjectiveBoardScore(objective("centre_commercial"), board)).toBe(3 - 1);
    });

    test('cite_dortoir: residential districts only surrounded by residential districts and parks', () => {
        const board: Board = {
            "0,0": district(Color.Orange, [Nord, Sud]),
            "0,1": park(),
            "1,0": district(Color.Orange, [Nord, Sud]),
            "2,0": district(Color.Bleu, [Nord, Sud]),
        };
        // "0,0" is quiet, "1,0" is next to a commercial district
        expect(Score.computeObjectiveBoardScore(objective("cite_dortoir"), board)).toBe(2);
    });

    test('zone_franche and ceinture_verte: peripheral districts score, central ones lose points', () => {
        const board = parkSquare();
        board["1,1"] = district(Color.Gris, [Nord, Sud]);
        board["0,0"] = district(Color.Gris, [Nord, Sud]);
        expect(Score.computeObjectiveBoardScore(objective("zone_franche"), board)).toBe(1 - 1);
        expect(Score.computeObjectiveBoardScore(objective("ceinture_verte"), board)).toBe(7);

        const parks = parkSquare();
        expect(Score.computeObjectiveBoardScore(objective("ceinture_verte"), parks)).toBe(8 - 1);
    });

    test('mixite_sociale: lines and columns with the 4 types of districts', () => {
        const board: Board = {
            "0,0": district(Color.Orange, [Nord, Sud]),
            "0,1": district(Color.Bleu, [Nord, Sud]),
            "0,2": park(),
            "0,3": district(Color.Gris, [Nord, Sud]),
            "1,3": district(Color.Orange, [Nord, Sud]),
            "2,3": district(Color.Bleu, [Nord, Sud]),
            "3,3": park(),
        };
        // line 0 and column 3
        expect(Score.computeObjectiveBoardScore(objective("mixite_sociale"), board)).toBe(2);
    });

    test('bon_voisinage: residential districts next to a commercial district and a park', () => {
        const board: Board = {
            "1,1": district(Color.Orange, [Nord, Sud]),
            "0,1": district(Color.Bleu, [Nord, Sud]),
            "1,2": park(),
            "1,0": district(Color.Orange, [Nord, Sud]),
        };
        expect(Score.computeObjectiveBoardScore(objective("bon_voisinage"), board)).toBe(1);
    });

    test('quartiers_jumeaux: 1pt every 2 pairs of neighbours of the same type', () => {
        const board: Board = {};
        for (let y = 0; y < 5; y++) {
            board[`0,${y}`] = park();
        }
        board["1,0"] = park();
        // 4 pairs on the line, 1 pair on the column
        expect(Score.computeObjectiveBoardScore(objective("quartiers_jumeaux"), board)).toBe(2);
    });
});

describe('Final score', () => {
    test('final score adds blocks, roads and objectives', () => {
        const objectives = [objective("boucle_urbaine"), objective("zero_impasse")];
        // blocks: orange 1, bleu 1, gris 1 ; roads: -1 ; boucle_urbaine: 4 ; zero_impasse: 0
        expect(Score.computeFinalScore(loopBoard, objectives)).toBe(3 - 1 + 4 + 0);
    });
});
