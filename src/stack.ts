import * as World from './world.js';

/**
 * A stack of tiles
 * 
 * stack: the stack of tiles
 * nbTiles: the number of tiles in the stack
 */
interface stackTiles {
    stack: World.Tile[];
    nbTiles: number;
}

/**
 * An empty stack
 */
const nil_stack: stackTiles = {
    stack: [],
    nbTiles: 0
};

/**
 * Returns an empty stack
 * 
 * @returns an empty stack
 */
function stack__empty(): stackTiles {
    return nil_stack;
}

/**
 * Returns a stack with n random tiles
 * 
 * @param numberOfTiles Number of tiles to put in the stack
 * @returns A stack with random tiles
 */
function stackInit(numberOfTiles: number): stackTiles {
    const stack: World.Tile[] = [];
    for (let i = 0; i < numberOfTiles; i++) {
        stack[i] = World.createTile(Math.floor(Math.random() * numberOfTiles));
    }
    return {
        stack: stack,
        nbTiles: numberOfTiles
    };
}

/**
 * Returns a stack with the tile added
 * 
 * @param stack stack to add the tile to
 * @param tile tile to add to the stack
 * @returns the stack with the tile added
 */
function stackAddTile(stack: stackTiles, tile: World.Tile): stackTiles {
    return {
        stack: [...stack.stack, tile],
        nbTiles: stack.nbTiles + 1
    };
}

/**
 * Returns the head tile of the stack
 * 
 * @param stack stack to get the head tile from
 * @returns the head tile of the stack
 */
function stackHeadTile(stack: stackTiles): World.Tile | null {
    if (stack.nbTiles === 0) {
        return null;
    }
    return {
        ...stack.stack[stack.nbTiles - 1]
    };
}

/**
 * Returns the stack without the head tile
 * 
 * @param stack stack to pop the tile from
 * @returns the stack without the head tile
 */
function stackPopTile(stack: stackTiles): stackTiles {
    if (stack.nbTiles === 0) {
        return stack;
    }
    return {
        stack: stack.stack.slice(0, stack.nbTiles - 1),
        nbTiles: stack.nbTiles - 1
    };
}

/**
 * Returns the number of tiles in the stack
 * 
 * @param stack stack to get the number of tiles from
 * @returns the number of tiles in the stack
 */
function stackGetNbTile(stack: stackTiles): number {
    return stack.nbTiles;
}

/**
 * Returns a boolean indicating if the stack is empty
 * 
 * @param stack the stack to check if it is empty
 * @returns a boolean indicating if the stack is empty
 */
function stackIsEmpty(stack: stackTiles): boolean {
    return stack.nbTiles === 0;
}

export {
    stackTiles,
    stack__empty,
    stackInit,
    stackAddTile,
    stackHeadTile,
    stackPopTile,
    stackGetNbTile,
    stackIsEmpty
};