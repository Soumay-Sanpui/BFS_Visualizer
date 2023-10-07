const root = document.getElementById("root");
const startButton = document.getElementById("fps");
const wallSet = new Set();
const selectedBoxSet = new Set();
let srcBlock = 0, destBlock = 0;
let destinationReached = null;

function chooseBlock(maxval) {
    return Math.floor(Math.random() * maxval);
}

function grid(parent) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const boxSize = 20;
    const numRows = Math.floor(viewportHeight / boxSize);
    const numCols = Math.floor(viewportWidth / boxSize);
    parent.style.display = "grid";
    parent.style.gridTemplateRows = `repeat(${numRows}, ${boxSize}px)`;
    parent.style.gridTemplateColumns = `repeat(${numCols}, ${boxSize}px)`;

    srcBlock = chooseBlock(numRows * numCols);
    destBlock = chooseBlock(numRows * numCols);

    if (srcBlock === destBlock) {
        destBlock += numCols;
        destBlock %= numRows * numCols;
    }

    for (let row = 0; row < numRows * numCols; row++) {
        const box = document.createElement("div");
        box.id = `box${row}`;
        box.value = row;
        if (row === srcBlock) {
            const img = document.createElement("img");
            img.src = "src.png";
            img.alt = "Source";
            img.style.width = "100%";
            img.style.height = "100%";
            box.appendChild(img);
        } else if (row === destBlock) {
            const img = document.createElement("img");
            img.src = "dest.png";
            img.alt = "Destination";
            img.style.width = "100%";
            img.style.height = "100%";
            box.appendChild(img);
        } else {
            box.classList.add("box");
        }
        parent.appendChild(box);
    }

    return { numRows, numCols, srcBlock, destBlock };
}

function selector(box) {
    const boxValue = parseInt(box.value);
    if (!wallSet.has(boxValue)) {
        box.style.background = "#4fc2f7";
        selectedBoxSet.add(box.id);
        setTimeout(() => {
            if (!destinationReached) {
                box.style.background = "#42f598";
            }
        }, 500);
        setTimeout(() => {
            if (!destinationReached) {
                box.style.background = "#d96bf2";
            }
        }, 1000);
    }
}

function wallAdder() {
    const boxes = document.querySelectorAll(".box");
    boxes.forEach((box) => {
        const boxValue = parseInt(box.value);
        box.addEventListener("contextmenu", (event) => {
            event.preventDefault();
            box.style.background = "gold";
            wallSet.add(boxValue);
        });
    });
}

function bfsTraversal(grid) {
    const { numRows, numCols, srcBlock, destBlock } = grid;
    const queue = [srcBlock];
    const visited = new Set();
    visited.add(srcBlock);

    // Add a parent object to keep track of parents
    const parent = {};
    parent[srcBlock] = null;

    const directions = [-1, 1, -numCols, numCols];

    function processNode(node) {
        const box = document.getElementById(`box${node}`);
        selector(box);

        if (node === destBlock) {
            return true;
        }

        for (const dir of directions) {
            const neighbor = node + dir;

            if (
                neighbor >= 0 &&
                neighbor < numRows * numCols &&
                !visited.has(neighbor) &&
                !wallSet.has(neighbor)
            ) {
                queue.push(neighbor);
                visited.add(neighbor);
                parent[neighbor] = node;
            }
        }

        return false;
    }

    const shortestPath = []; // Store the shortest path nodes

    function traverseNext() {
        if (queue.length === 0) {
            console.log("No path found.");
            destinationReached = false;
            return;
        }

        const node = queue.shift();
        const found = processNode(node);

        if (!found) {
            shortestPath.push(node);
            setTimeout(traverseNext, 50);
        } else {
            // Reconstruct the shortest path
            const path = [];
            let currentNode = destBlock;

            while (currentNode !== null) {
                path.push(currentNode);
                currentNode = parent[currentNode];
            }
            // uncomment this to trace the path backwards (from destination to source)
            // path.reverse();
            colorShortestPath(path);
        }
    }

    traverseNext();
}

function colorShortestPath(path) {
    let delay = 50;

    function changeColor() {
        if (path.length === 0) {
            return;
        }

        const boxId = `box${path.pop()}`;
        const box = document.getElementById(boxId);

        if (box.style.background !== "orange") {
            box.style.background = "orange";
        }

        setTimeout(changeColor, delay);
    }

    changeColor();
}


const gridData = grid(root);
wallAdder();
startButton.addEventListener("click", () => {
    destinationReached = false
    startButton.disabled = true;
    startButton.style.backgroundColor = "lightgrey"
    bfsTraversal(gridData);
})
if (destinationReached == false) {
    alert("No Path found from source to Destination");
}
