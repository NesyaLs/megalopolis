
type graph = { [key:number] : number[] };
const nil : graph = {};

/**
 * Create an empty graph
 * @returns {graph} Return an empty graph without any vertices
 */
function graph__empty() : graph{
    return nil;
}

/**
 * Add vertex to graph
 * @param {graph} aGraph The graph in which vertex and edges will be add
 * @param {number} vertexToAdd Represents the vertex to add
 * @param {number} edges Represents the edges of new vertex
 * @returns {graph} The new graph with vertex and edges added
 */
function graph__add(aGraph : graph, vertexToAdd : number, edges : number[]) : graph{
    if (!(Object.keys(aGraph).map(Number).includes(vertexToAdd))){
        return {
        ...aGraph,
        [vertexToAdd]: edges,
        };
    }else{
        return nil;
    }
}

/**
 * Remove a vertex in a graph
 * @param aGraph The graph which contains the vertex to remove
 * @param vertexToRemove The id of vertex to remove
 * @returns The new graph without the vertex
 */
function graph__remove(aGraph : graph, vertexToRemove : number) : graph{
    if (Object.keys(aGraph).map(Number).includes(vertexToRemove)){
        const newGraph = { ... aGraph};
        delete newGraph[vertexToRemove];
        
        for (const vertex in newGraph) {
            newGraph[vertex] = newGraph[vertex].filter(neighbor => neighbor !== vertexToRemove);    
        }

    return newGraph;
    }else{
        return nil;
    }
}

/**
 * Computes the length of graph
 * @param {graph} aGraph The graph whose we want its length
 * @returns {number} The length of graph, number of vertices in graph
 */
function graph__length(aGraph: graph) : number{
    const keys : string[] = Object.keys(aGraph);
    if (keys.length === 0){
        return 0;
    }else{
        return Math.max(...keys.map(Number));
    }
}

/**
 * Computes the connected vertices to vertex with a depth-first search 
 * @param {graph} aGraph The graph for which we want to search
 * @param {number} vertex The origin vertex for search
 * @param {number[]} visited The array which includes visited vertices
 * @returns {number[]} The array which includes all visited vertices
 */
function depth_first_search(aGraph : graph, vertex : number, visited : number[]) : number[]{
    let visited_tmp = [...visited]; 
    if (!visited_tmp.includes(vertex)) {
        visited_tmp.push(vertex);
    }

    const waiting = aGraph[vertex].filter(ver => !visited_tmp.includes(ver));

    for (const ver of waiting) {
        visited_tmp = depth_first_search(aGraph, ver, visited_tmp);
    }

    return visited_tmp;
}

/**
 * Computes the number of connected sub-graphs in the graph
 * @param {graph} aGraph The graph for which we want to compute the number of connected sub-graphs
 * @returns {number} The number of connected sub-graphs
 */
function graph__connectedness(aGraph: graph) : number{
    const n : number = graph__length(aGraph);
    const visited : number[] = [];
    const connected_components : number[][] = [];
    let connected_subgraph : number = 0;
    let new_vertex : number = 1;
    while (visited.length !== n){
        for (let i = 1; i <= n; i++){
            if (!visited.includes(i)){
                new_vertex = i;
                break;
            }
        }
        const new_visited = depth_first_search(aGraph, new_vertex, []);
        connected_components.push(new_visited);
        new_visited.forEach(ver => visited.push(ver));
        connected_subgraph++;
    }

    return connected_subgraph;
}

/**
 * Computes the connected sub-graphs of the graph
 * @param {graph} aGraph The graph for which we want the connected sub-graphs
 * @returns {number[][]} The array of connected sub-graphs, each one given by its vertices
 */
function graph__connectedComponents(aGraph: graph) : number[][]{
    const visited : number[] = [];
    const connected_components : number[][] = [];
    Object.keys(aGraph).map(Number).forEach(vertex => {
        if (!visited.includes(vertex)){
            const new_visited = depth_first_search(aGraph, vertex, []);
            connected_components.push(new_visited);
            new_visited.forEach(ver => visited.push(ver));
        }
    });

    return connected_components;
}

/**
 * Displays the graph
 * @param {graph} aGraph The graph for which we want to display
 */
function graph__display(aGraph : graph) : void{
    if (aGraph === nil){
        console.log(`Graph is nil`);
    }else{
        Object.keys(aGraph).forEach(vertex => {
            const vertexNumber = parseInt(vertex, 10);
            console.log(`Vertex ${vertexNumber} is connected to vertices: ${aGraph[vertexNumber].join(', ')}`);
        });
    }
}

export{
    nil,
    graph__empty,
    graph__add,
    graph__remove,
    graph__length,
    graph__connectedness,
    graph__connectedComponents,
    graph__display,
};
