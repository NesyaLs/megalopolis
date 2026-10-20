import * as World from './world.js';

/**
 * An objective card
 *
 * score: the value of the card, the sum of the values of the objectives in play gives the score to reach
 * name: the name of the objective, also used to find its score calculator
 * rule: the scoring rule of the objective
 */
interface Objectif {
    score: number;
    name: string;
    rule: string;
    calculateScore?: (monde: World.Board) => number;
}

// Same objectives as in cards.yaml
const objectifs: Objectif[] = [
    { score: 5, name: "zero_impasse", rule: "-1pt par extrémité de route en impasse" },
    { score: 6, name: "poumons_verts", rule: "1pt par parc, -2pt par quartier industriel voisin d'un parc" },
    { score: 7, name: "grand_boulevard", rule: "1pt tous les 3 tronçons de la route la plus longue" },
    { score: 8, name: "boucle_urbaine", rule: "1pt par tronçon des routes qui forment une boucle sans impasse" },
    { score: 9, name: "centre_commercial", rule: "1pt par quartier commercial du plus grand bloc commercial, -1pt par autre quartier commercial" },
    { score: 10, name: "cite_dortoir", rule: "2pt par quartier résidentiel entouré uniquement de quartiers résidentiels et de parcs" },
    { score: 11, name: "zone_franche", rule: "1pt par quartier industriel en bordure de ville, -1pt par quartier industriel au centre" },
    { score: 12, name: "ceinture_verte", rule: "1pt par parc en bordure de ville, -1pt par parc au centre" },
    { score: 13, name: "mixite_sociale", rule: "1pt par ligne et par colonne contenant les 4 types de quartiers" },
    { score: 14, name: "bon_voisinage", rule: "1pt par quartier résidentiel voisin d'un quartier commercial et d'un parc" },
    { score: 15, name: "quartiers_jumeaux", rule: "1pt toutes les 2 paires de quartiers voisins de même type" }
];

/**
 *
 * @param number the number of objectives to select
 * @returns number different objectives chosen randomly
 */
function selectRandomObjectives(number: number): Objectif[] {
    const selectedObjectives: Objectif[] = [];
    const availableObjectives: Objectif[] = [...objectifs];

    for (let i = 0; i < number; i++) {
        const randIndex = Math.floor(Math.random() * availableObjectives.length);
        selectedObjectives.push(availableObjectives[randIndex]);
        availableObjectives.splice(randIndex, 1);
    }

    return selectedObjectives;
}

/**
 *
 * @param objectives the objectives in play
 * @returns the score to reach to win the game
 */
function objectivesTargetScore(objectives: Objectif[]): number {
    return objectives.reduce((aTempScore, anObjective) => aTempScore + anObjective.score, 0);
}

export {
    Objectif,
    objectifs,
    selectRandomObjectives,
    objectivesTargetScore
};
