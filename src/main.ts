import * as World from './world.js';
import * as Play from './play.js';
import * as Stack from './stack.js';
import * as Objectives from './objectives.js';
import * as Score from './score.js';

// Number of objectives in play
const OBJECTIVES_NUMBER: number = 3;


function main() {

    let board = World.emptyBoard();

    const objectives = Objectives.selectRandomObjectives(OBJECTIVES_NUMBER);
    const objScore = Objectives.objectivesTargetScore(objectives);

    console.log("Objectifs de la partie :");
    objectives.forEach(anObjective => {
        console.log(` - ${anObjective.name} (${anObjective.score}) : ${anObjective.rule}`);
    });
    console.log(`Score à atteindre : ${objScore}\n`);

    let deck = Stack.stackInit(World.TILES_NUMBER);

    // Each turn, the head tile of the deck is drawn and placed where it gives the best score
    let turn = 1;
    while (!Stack.stackIsEmpty(deck)) {
        const tile = Stack.stackHeadTile(deck);
        deck = Stack.stackPopTile(deck);
        if (tile !== null) {
            console.log(World.ANSI_GRAY + "Tour numéro : " + turn + World.ANSI_RESET + "\n");
            World.tileDisplay(tile);
            board = Play.playBestTile(board, tile, objectives);
            World.affiche_plateau(board);
            console.log();
            turn++;
        }
    }

    const blocksScore = Score.calculate_score_blocks(board);
    const roadsScore = Score.calculate_score_roads(board);
    console.log("Score final :");
    console.log(` - plus grands blocs de chaque type : ${blocksScore}`);
    console.log(` - routes : ${roadsScore}`);
    objectives.forEach(anObjective => {
        console.log(` - ${anObjective.name} : ${Score.computeObjectiveBoardScore(anObjective, board)}`);
    });

    const finalScore = Score.computeFinalScore(board, objectives);
    const hasWon = (finalScore >= objScore);
    console.log(`Total : ${finalScore} / ${objScore}`);
    console.log(hasWon ? "Gagné !" : "Perdu...");
}

main();
