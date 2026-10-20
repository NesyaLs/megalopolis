import { readFileSync } from "fs";
import * as Objectives from "../src/objectives.js";

describe('Objectives selection', () => {
    test('selected objectives are all different and come from the objective list', () => {
        for (let i = 0; i < 20; i++) {
            const selected = Objectives.selectRandomObjectives(3);
            expect(selected).toHaveLength(3);
            expect(new Set(selected.map(anObjective => anObjective.name)).size).toBe(3);
            selected.forEach(anObjective => expect(Objectives.objectifs).toContain(anObjective));
        }
    });

    test('selecting every objective returns the whole list', () => {
        const selected = Objectives.selectRandomObjectives(Objectives.objectifs.length);
        expect(selected.map(anObjective => anObjective.name).sort())
            .toEqual(Objectives.objectifs.map(anObjective => anObjective.name).sort());
    });

    test('the score to reach is the sum of the values of the objectives', () => {
        const selected = [Objectives.objectifs[0], Objectives.objectifs[3], Objectives.objectifs[10]];
        expect(Objectives.objectivesTargetScore(selected)).toBe(5 + 8 + 15);
        expect(Objectives.objectivesTargetScore([])).toBe(0);
    });

    test('the objective list matches cards.yaml', () => {
        const cards = readFileSync("cards.yaml", "utf8");
        const names = [...cards.matchAll(/^ {2}(\w+):$/gm)].map(match => match[1]);
        const scores = [...cards.matchAll(/^ {4}score: (\d+)$/gm)].map(match => Number(match[1]));
        expect(names).toEqual(Objectives.objectifs.map(anObjective => anObjective.name));
        expect(scores).toEqual(Objectives.objectifs.map(anObjective => anObjective.score));
    });
});
