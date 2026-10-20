import * as G from "../src/graph.js";

describe('Graph test', () => {
    
    test('Empty graph should be an empty graph', () => {
        const g = G.graph__empty();
        expect(g).toBe(G.nil);
        expect(G.graph__length(g)).toBe(0);
    });

    test('Adding an existing vertex gives the nil graph', () => {
        const g = G.graph__add(G.graph__empty(), 1, []);
        expect(G.graph__add(g, 1, [])).toBe(G.nil);
    });

    test('Removing a vertex removes its edges', () => {
        const g = { 1: [2, 3], 2: [1, 3], 3: [1, 2, 4], 4: [3] };
        expect(G.graph__remove(g, 3)).toEqual({ 1: [2], 2: [1], 4: [] });
    });

    test('Connected sub-graphs', () => {
        const g = { 1: [2, 3], 2: [1, 3], 3: [1, 2], 4: [5], 5: [4], 6: [] };
        expect(G.graph__connectedness(g)).toBe(3);
        expect(G.graph__connectedComponents(g).map(component => component.sort())).toEqual([[1, 2, 3], [4, 5], [6]]);
    });
}); 
