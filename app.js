window.onload = function() {
    /**
     * Dummy input
     * @type {[*]}
     */
    var input = [
        [2], //1
        [3, 5, 7], //2
        [1, 4], //3
        [5], //4
        [6], //5
        [4], //6
        [8], //7
        [0] //8
    ];
    /**
     * Initialize new instance of directed graph
     *
     * @type {Graph}
     */
    var givenGraph = new Graph(setConnections());
    /**
     * Set starting values for TarjansAlgorithm's searching algorithm
     *
     * @type {TarjansAlgorithm}
     */
    var tarjansAlgorithm = new TarjansAlgorithm(givenGraph);
    /**
     * Run algorithm
     */
    var scc = tarjansAlgorithm.run();
    logGraphsStrongConnectedComponents();
    /**
     * Append input results to HTML structure
     *
     * @param result
     */
    function appendResults (result) {
        var inputSelector = document.querySelector('.data_input_insert');
        var outputSelector = document.querySelector('.data_output_insert');
        var lengthNode = document.createElement('p');
        var newInputNode;

        if (!document.querySelector('.nodes_number')) {
            lengthNode.innerHTML = 'n = ' + input.length;
            lengthNode.classList.add('nodes_number');

            for (var i = 0; i < input.length; i++) {
                newInputNode = document.createElement('p');
                newInputNode.innerHTML = (i + 1) + ' [' + input[i] + ']';

                inputSelector.appendChild(newInputNode);
            }

            inputSelector.insertBefore(lengthNode, inputSelector.firstChild);
        }

        outputSelector.innerHTML = outputSelector.innerHTML + '{ ' + result + ' }' + '\n';
    }
    /**
     * Create new instances of Vertex for each vertex of given input
     *
     * @param input
     * @returns {{}}
     */
    function setVertices (input) {
        var verticesObj = {};
        var newVertex;
        for (var i = 0; i < input.length; i++) {
            newVertex = new Vertex(String(i + 1));
            verticesObj['v' + (i + 1)] = newVertex;
        }

        return verticesObj;
    }
    /**
     * Set connections between vertices
     *
     * @returns {Array}
     */
    function setConnections () {
        var verticesObj = setVertices(input);
        var currentIndex = 0;
        var verticesArr = [];

        for (var key in verticesObj) {
            for (var j = 0; j < input[currentIndex].length; j++) {
                verticesObj[key].connections.push(verticesObj['v' + input[currentIndex][j]]);
                verticesObj[key].connectedIndexes ? verticesObj[key].connectedIndexes.push(input[currentIndex][j]) : verticesObj[key].connectedIndexes = [input[currentIndex][j]];
            }

            verticesArr.push(verticesObj[key]);
            currentIndex++;
        }

        return verticesArr;
    }
    /**
     * Display all found Strongly connected components
     */
    function logGraphsStrongConnectedComponents () {
        for (var k = 0, length = scc.length; k < length; k++) {
            var result = '';
            for (var l = 0, le = scc[k].length; l < le; l++) {
                if (l == scc[k].length - 1) {
                    result += (scc[k][l].index + 1);
                } else {
                    result += (scc[k][l].index + 1) + ', ';
                }
            }

            appendResults(result);
        }
    }

    var neigh = new NeighboursFinder(input, scc);
    neigh.getNeighbours();

};
/**
 * Constructor function of new Graph
 *
 * @param vertices
 * @constructor
 */
function Graph (vertices ) {
    this.vertices = vertices || [];
}
/**
 * Constructor of new Vertex with it's properties
 *
 * @param name
 * @constructor
 */
function Vertex (name) {
    this.name = name || null;
    this.connections = [];
    /**
     * used in tarjan algorithm
     * went ahead and explicity initalized them
     * @type {number}
     */
    this.index= -1;
    this.lowlink = -1;
    /**
     * Check if vertexes are equal based on vertex.name property
     *
     * @param vertex
     * @returns {*|boolean}
     */
    this.equals = function(vertex) {
        return (vertex && vertex.name && this.name == vertex.name);
    }
}
/**
 * Initialize vertex stack of graph
 *
 * @param vertices
 * @constructor
 */
function VertexStack(vertices) {
    this.vertices = vertices || [];
    /**
     * Check if component contains current vertex by checking equality of a type and value
     *
     * @param vertex
     * @returns {boolean}
     */
    this.contains = function(vertex) {
        for (var i in this.vertices) {
            if (this.vertices[i] === vertex ) {
                return true;
            }
        }
        return false;
    }
}
/**
 * TarjansAlgorithm algorithm methods and stack
 *
 * @param graph
 * @constructor
 */
function TarjansAlgorithm(graph) {
    this.index = 0;
    this.stack = new VertexStack();
    this.graph = graph;
    this.stronglyConnectedComponent = [];
    /**
     * Run TarjansAlgorithm's algorithm for all vertices of given graph
     *
     * @returns {Array}
     */
    this.run = function() {
        for (var key in this.graph.vertices){
            if (this.graph.vertices[key].index<0){
                this.strongConnections(this.graph.vertices[key]);
            }
        }
        return this.stronglyConnectedComponent;
    }
    /**
     * Get all strong connected components of given graph
     *
     * @param vertex
     */
    this.strongConnections = function(vertex) {
        /**
         * Set the depth index for vertex to the smallest unused index
         *
         * @type {number}
         */
        vertex.index = this.index;
        vertex.lowlink = this.index;
        this.index = this.index + 1;
        this.stack.vertices.push(vertex);
        /**
         * check successors of vertex
         * consider each vertex in vertex.connections
         */
        for (var i in vertex.connections) {
            var vertex = vertex;
            var vertexConnections = vertex.connections[i];
            if (vertexConnections && vertexConnections.index < 0) {
                /**
                 * Successor connected vertex has not yet been visited; recurse on it
                 */
                this.strongConnections(vertexConnections);
                vertex.lowlink = Math.min(vertex.lowlink,vertexConnections.lowlink);
            } else if (this.stack.contains(vertexConnections)) {
                /**
                 * Successor connected vertex is in stack S and hence in the current SCC
                 * @type {number}
                 */
                vertex.lowlink = Math.min(vertex.lowlink,vertexConnections.index);
            }
        }
        /**
         * If vertex is a root node, pop the stack and generate an strongly connected component (SCC)
         */
        if (vertex.lowlink == vertex.index) {
            /**
             * initialize new strongly connected component (as array)
             *
             * @type {Array}
             */
            var vertices = [];
            var vertexConnections = null;
            if (this.stack.vertices.length > 0) {
                do {
                    vertexConnections = this.stack.vertices.pop();
                    /**
                     * add next vertex to current strongly connected component
                     */
                    vertices.push(vertexConnections);
                } while (!vertex.equals(vertexConnections));
            }
            /**
             * output the current strongly connected component -
             * push the results to a member stronglyConnectedComponent array variable
             */
            if (vertices.length > 0) {
                this.stronglyConnectedComponent.push(vertices);
            }
        }
    }
}

//Todo - find scc with highest number of neighbours sccs
function NeighboursFinder (input, sConnectedComponents) {
    var neighbours = {};

    this.getNeighbours = function () {
        sConnectedComponents.forEach(function (el, i) {
            el.forEach(function (elem, index) {
                elem.connectedIndexes.forEach(function (element) {
                    el = el[i] || el[0]
                    if (el.name == element) {
                        console.log(elem, ' ', el)
                    }
                })
            })
        });
    };
    this.getHighestNeighbourNumber = function () {

    };
}

