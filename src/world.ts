// "macro" for max number of tiles in game
const TILES_NUMBER: number = 15;

// Strings of color's ansi code
const ANSI_ORANGE: string = '\x1b[38;5;208m';
const ANSI_BLUE: string = '\x1b[1;34m';
const ANSI_GREEN: string = '\x1b[1;32m';
const ANSI_GRAY: string = '\x1b[1;90m';
const ANSI_RESET: string = '\x1b[0m';


//
enum Color {
    Orange = "Residentiel",
    Bleu = "Commercial",
    Vert = "Parc",
    Gris = "Industriel"
}

enum Cardinal {
    Nord,
    Est,
    Sud,
    Ouest
}

interface District {
    couleur: Color;
    extremum_route?: [Cardinal,Cardinal];
}

interface Tile {
    quartiers: District[]; // 4 quartiers
}

interface Position {
    x: number;
    y: number;
}

// Déclaration of a Key/ Value dictionnary, to implement the world. 
type Board = Record<string, District>;

/**
 * 
 * @param position (x,y)
 * @returns the position traduced in a string.
 */
function genererateKey(position: Position): string {
    return `${position.x},${position.y}`;
}

/**
 * 
 * @returns en empty board.
 */
function emptyBoard(): Board {
    const board: Board = {};
    return board; 
}

/**
 * 
 * @param board the current game board 
 * @returns 1 is the board is empty, 0 otherwise.
 */
function boardIsEmpty(board: Board): boolean {
    return Object.keys(board).length === 0;
}

/**
 * 
 * @param board the current game board 
 * @param position you want to check the adjacence
 * @returns 1 if position is adjacent to another already placed tile, 0 otherwise
 */
function positionIsAdjacentToAnotherTile(board: Board, position: Position): number {
    //On teste d'abord s'il existe un élément non undifined dans le plateau (cas de la première pièce à poser)
    if(!boardIsEmpty(board)){
        if( // Test des 4 positions sous la tuile et des 8 adjacentes. 
            genererateKey( {x: position.x    , y: position.y    } ) in board || 
            genererateKey( {x: position.x    , y: position.y + 1} ) in board || 
            genererateKey( {x: position.x + 1, y: position.y    } ) in board ||
            genererateKey( {x: position.x + 1, y: position.y +1 } ) in board || 
            
            genererateKey( {x: position.x - 1, y: position.y    } ) in board ||
            genererateKey( {x: position.x - 1, y: position.y + 1} ) in board ||
            
            genererateKey( {x: position.x    , y: position.y - 1} ) in board ||
            genererateKey( {x: position.x + 1, y: position.y - 1} ) in board ||
            
            genererateKey( {x: position.x    , y: position.y + 2} ) in board ||
            genererateKey( {x: position.x + 1, y: position.y + 2} ) in board ||
            
            genererateKey( {x: position.x + 2, y: position.y    } ) in board ||
            genererateKey( {x: position.x + 2, y: position.y + 1} ) in board  
            ) {
                return 1; 
            }
        //console.log(ANSI_ORANGE + "position non adjacente" + ANSI_RESET);
        return 0;
    }
    else {
        return 1;
    }
}

/**
 * 
 * @param position you want to check it's inside world's boundaries
 * @returns 1 if postion is in world, 0 otherwise
 */
const positionIsInWorld = (position: Position): boolean => position.x >= 0 && position.y >= 0 && position.x < TILES_NUMBER && position.y < TILES_NUMBER;

/**
 * 
 * @param board the current game board
 * @param position the position of the upper left district of the tile
 * @returns true if the 4 districts under the tile are already placed, a tile can't be completely covered
 */
function positionCoversWholeTile(board: Board, position: Position): boolean {
    return genererateKey( {x: position.x    , y: position.y    } ) in board &&
        genererateKey( {x: position.x    , y: position.y + 1} ) in board &&
        genererateKey( {x: position.x + 1, y: position.y    } ) in board &&
        genererateKey( {x: position.x + 1, y: position.y + 1} ) in board;
}

/**
 * 
 * @param board the current game board
 * @param position the position of the upper left district of the tile
 * @returns true if a tile can be placed at this position
 */
function TilePlacementIsValid(board: Board, position: Position): boolean {
    return positionIsInWorld(position) && positionIsAdjacentToAnotherTile(board, position) === 1 && !positionCoversWholeTile(board, position); 
}

/**
 * 
 * @param board current game board
 * @param tile the tile you want to add
 * @param position1 the position where you want to add it.
 * @returns a modified copy of board. 
 */
function boardAddTile(board: Board, tile: Tile, position1: Position): Board {
    // Créer une copie du tableau existant pour garantir la pureté
    const nouveauBoard: Board = { ...board };


    if(TilePlacementIsValid(board, position1)){
        // Calculer les 4 positions des 4 quartiers que représente la tuile.
        const position2: Position = {x: position1.x , y: position1.y +1 };  //haut droite 
        const position3: Position = {x: position1.x + 1, y: position1.y};  //bas gauche 
        const position4: Position = {x: position1.x + 1, y: position1.y + 1};  //bas droite

        const cle1: string = genererateKey(position1);
        const cle2: string = genererateKey(position2);
        const cle3: string = genererateKey(position3);
        const cle4: string = genererateKey(position4);

        // Ajouter les différents quartiers de la tuile aux positions souhaitées dans le dictionnaire.   
        nouveauBoard[cle1] = { ...tile.quartiers[0] };
        nouveauBoard[cle2] = { ...tile.quartiers[1] };
        nouveauBoard[cle3] = { ...tile.quartiers[2] };
        nouveauBoard[cle4] = { ...tile.quartiers[3] };
    }
    return nouveauBoard;
}

/**
 * This type is used for the display functions in order to only display nedded parts of the board. 
 */ 
type Boundbox = {
    upleft: Position; 
    downright: Position;
}

// Renvoie le point (x,y) correspondant à la chaine de caractère '(x: x, y: y)' qui fait clé dans le dico. 
/**
 * 
 * @param cle a string corresponding to a position in the board
 * @returns  type position of the key
 */
function convertKeyToPosition(cle: string): Position {
    const [xStr, yStr] = cle.split(",");
    const x = parseInt(xStr);
    const y = parseInt(yStr);
    return { x, y };
}

/**
 * 
 * @param board 
 * @returns the x value of the lowest position existing in the board
 */
function trouverValeurMinX(board: Board): number {
    if (boardIsEmpty(board)) {
        return -Infinity; // Retourne -Infinity si le tableau est vide
    }

    const positions: Position[] = Object.keys(board).map(convertKeyToPosition);
    return Math.min(...positions.map(position => position.x));
}

/**
 * 
 * @param board 
 * @returns the y value of the lowest position existing in the board
 */
function trouverValeurMinY(board: Board): number {
    if (boardIsEmpty(board)) {
        return -Infinity; // Retourne -Infinity si le tableau est vide
    }

    const positions: Position[] = Object.keys(board).map(convertKeyToPosition);
    return Math.min(...positions.map(position => position.y));
}

/**
 * 
 * @param board 
 * @returns the x value of the highest position existing in the board
 */
function trouverValeurMaxX(board: Board): number {
    if (boardIsEmpty(board)) {
        return -Infinity; // Retourne -Infinity si le tableau est vide
    }

    const positions: Position[] = Object.keys(board).map(convertKeyToPosition);
    return Math.max(...positions.map(position => position.x));
}

/**
 * 
 * @param board 
 * @returns the y value of the highest position existing in the board
 */
function trouverValeurMaxY(board: Board): number {
    if (boardIsEmpty(board)) {
        return -Infinity; // Retourne -Infinity si le tableau est vide
    }

    const positions: Position[] = Object.keys(board).map(convertKeyToPosition);
    return Math.max(...positions.map(position => position.y));
}

/**
 * 
 * @param board the current board_game
 * @returns the type boundbox{upleft: (x,y), downright: (x,y)} corresponding to the only area we need to display
 */
function computeBoundbox(board: Board): Boundbox {
    const upleftCorner: Position = {x: trouverValeurMinX(board) , y: trouverValeurMinY(board)}; 
    const downrigthCorner: Position = {x: trouverValeurMaxX(board) + 1 , y: trouverValeurMaxY(board) + 1}; 
    return {upleft: upleftCorner, downright: downrigthCorner}; 
}

/**
 * 
 * @param quartier Displays the right character for the wanted road of the district
 */
function afficheRoute(quartier : District) {
    const extremum_route = quartier.extremum_route;

    if (extremum_route) {
        const [cardinal1, cardinal2] = extremum_route;

        if ((cardinal1 === Cardinal.Nord && cardinal2 === Cardinal.Sud) || (cardinal1 === Cardinal.Sud && cardinal2 === Cardinal.Nord)) {
            process.stdout.write('| ');
        } else if ((cardinal1 === Cardinal.Est && cardinal2 === Cardinal.Ouest) || (cardinal1 === Cardinal.Ouest && cardinal2 === Cardinal.Est)) {
            process.stdout.write('─ ');
        } else if ((cardinal1 === Cardinal.Nord && cardinal2 === Cardinal.Ouest) || (cardinal1 === Cardinal.Ouest && cardinal2 === Cardinal.Nord)) {
            process.stdout.write('┘ ');
        } else if ((cardinal1 === Cardinal.Nord && cardinal2 === Cardinal.Est) || (cardinal1 === Cardinal.Est && cardinal2 === Cardinal.Nord)) {
            process.stdout.write('└ ');
        } else if ((cardinal1 === Cardinal.Est && cardinal2 === Cardinal.Sud) || (cardinal1 === Cardinal.Sud && cardinal2 === Cardinal.Est)) {
            process.stdout.write('┌ ');
        } else if ((cardinal1 === Cardinal.Sud && cardinal2 === Cardinal.Ouest) || (cardinal1 === Cardinal.Ouest && cardinal2 === Cardinal.Sud)) {
            process.stdout.write('┐ ');
        }
    } else {
        process.stdout.write('○ ');
    }
    process.stdout.write(ANSI_RESET); 

}

/**
 * 
 * @param quartier Displays the right color for the wanted district
 */
function afficheQuartier(quartier : District) {
    if (!quartier || quartier.couleur === undefined) {
        process.stdout.write("○ "); // process.stdout.write pour imprimer sans le saut de ligne que fait console.log
    } else {

        switch (quartier.couleur) {

            case Color.Orange:
                process.stdout.write(ANSI_ORANGE);
                afficheRoute(quartier);
                break;

            case Color.Bleu:
                process.stdout.write(ANSI_BLUE);
                afficheRoute(quartier);
                break;

            case Color.Vert:
                process.stdout.write(ANSI_GREEN + '□ ' + ANSI_RESET);
                break;

            case Color.Gris:
                process.stdout.write(ANSI_GRAY);
                afficheRoute(quartier);
                break;
        
            default:
          }
    }
}

/**
 * @param tile Display the given tile
 */

function tileDisplay(tile: Tile) {
    afficheQuartier(tile.quartiers[0]);
    afficheQuartier(tile.quartiers[1]);
    process.stdout.write('\n');
    afficheQuartier(tile.quartiers[2]);
    afficheQuartier(tile.quartiers[3]);
    console.log("\n");
}

/**
 * 
 * @param board Displays the whole board
 */
function affiche_plateau(board: Board){
    const boundBox: Boundbox = computeBoundbox(board); 

    for( let i = boundBox.upleft.x; i < boundBox.downright.x; i++ ){
        for(let j = boundBox.upleft.y; j < boundBox.downright.y; j++){
            const cle = genererateKey({x: i, y: j}); 
            if( cle in board ){
                afficheQuartier(board[cle]); 
            }
            else {
                process.stdout.write("  "); 
            }
            
        }
        console.log(); // Retour à la ligne après avoir affiché une ligne. 
    }
}

/**
 * 
 * @param seed an integer determining which tile will be returned 
 * @returns a tile 
 */
function createTile(seed: number): Tile {
    let quartier1: District;
    let quartier2: District;
    let quartier3: District;
    let quartier4: District;

    switch (seed%5) {
        case 0:
            quartier1 = {
                couleur: Color.Bleu,
                extremum_route: [Cardinal.Ouest, Cardinal.Est]
            };
            quartier2 = {
                couleur: Color.Gris,
                extremum_route: [Cardinal.Ouest, Cardinal.Est]
            };
            quartier3 = {
                couleur: Color.Orange,
                extremum_route: [Cardinal.Ouest, Cardinal.Sud]
            };
            quartier4 = {
                couleur: Color.Vert,
            };
            break;

        case 1:
            quartier1 = {
                couleur: Color.Orange,
                extremum_route: [Cardinal.Ouest, Cardinal.Nord]
            };
            quartier2 = {
                couleur: Color.Gris,
                extremum_route: [Cardinal.Nord, Cardinal.Sud]
            };
            quartier3 = {
                couleur: Color.Vert
            };
            quartier4 = {
                couleur: Color.Bleu,
                extremum_route: [Cardinal.Nord, Cardinal.Sud]
            };
            break;

        case 2:
            quartier1 = {
                couleur: Color.Vert
            };
            quartier2 = {
                couleur: Color.Gris,
                extremum_route: [Cardinal.Nord, Cardinal.Sud]
            };
            quartier3 = {
                couleur: Color.Bleu,
                extremum_route: [Cardinal.Est, Cardinal.Ouest]
            };
            quartier4 = {
                couleur: Color.Orange,
                extremum_route: [Cardinal.Nord, Cardinal.Ouest]
            };
            break;
        
        case 3:
            quartier1 = {
                couleur: Color.Orange,
                extremum_route: [Cardinal.Nord, Cardinal.Sud]
            };
            quartier2 = {
                couleur: Color.Vert
            };
            quartier3 = {
                couleur: Color.Bleu,
                extremum_route: [Cardinal.Est, Cardinal.Nord]
            };
            quartier4 = {
                couleur: Color.Gris,
                extremum_route: [Cardinal.Est, Cardinal.Ouest]
            };
            break;

        case 4:
            quartier1 = {
                couleur: Color.Gris,
                extremum_route: [Cardinal.Est, Cardinal.Sud]
            };
            quartier2 = {
                couleur: Color.Orange,
                extremum_route: [Cardinal.Est, Cardinal.Ouest]
            };
            quartier3 = {
                couleur: Color.Bleu,
                extremum_route: [Cardinal.Sud, Cardinal.Nord]
            };
            quartier4 = {
                couleur: Color.Vert
            };
            break;

        // Ajouter d'autres cas si nécessaire

        default:
            throw new Error("Seed invalide");
    }

    const tuile: Tile = {
        quartiers: [quartier1, quartier2, quartier3, quartier4]
    };

    return tuile;
}

/**
 * 
 * @param direction North South Est West
 * @returns 
 */
function turnDirection(direction: Cardinal): Cardinal {
    switch (direction) {
        case Cardinal.Nord:
            return Cardinal.Sud;
        case Cardinal.Sud:
            return Cardinal.Nord;
        case Cardinal.Est:
            return Cardinal.Ouest;
        case Cardinal.Ouest:
            return Cardinal.Est;
        default:
            return direction; // Si la direction n'est pas dans l'enum, retourne la même direction
    }
}

/**
 * 
 * @param district the district you want to turn
 * @returns a copy of the  district turned by 180°
 */
function turnDistrict(district: District): District {
    const turnedDistrict = { ...district}; 
    if(turnedDistrict.extremum_route) {
        turnedDistrict.extremum_route = [turnDirection(turnedDistrict.extremum_route[0]), turnDirection(turnedDistrict.extremum_route[1])];
    }
    return turnedDistrict; 
}

// Renvoie une tuile retournée comme ca A => V
function turnTile(tile: Tile): Tile {
    const turnedTile: Tile = { ...tile};
    
    //On retourne les quartiers pour que les routes soient dans un sens cohérent au retournement
    turnedTile.quartiers = turnedTile.quartiers.map(quartier => turnDistrict(quartier));

    // On change l'ordre des quartiers 0,1,2,3 => 3, 2, 1, 0
    turnedTile.quartiers = [turnedTile.quartiers[3], turnedTile.quartiers[2], turnedTile.quartiers[1], turnedTile.quartiers[0]];

    return turnedTile; 
} 



// Exports pour les fonctions utiles ailleurs

export {
    District,
    Color,
    Cardinal, 
    Tile, 
    Position, 
    Board,
    emptyBoard, 
    boardIsEmpty, 
    TilePlacementIsValid,
    boardAddTile, 
    createTile, 
    turnTile, 
    turnDirection, 
    affiche_plateau, 
    convertKeyToPosition, 
    genererateKey, 
    tileDisplay,
    TILES_NUMBER, 
    ANSI_BLUE, 
    ANSI_GRAY, 
    ANSI_GREEN, 
    ANSI_ORANGE, 
    ANSI_RESET, 
}; 