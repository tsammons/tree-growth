"use strict";
var ctx, canvas;
canvas = document.getElementById('myCanvas');
ctx = myCanvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx.lineWidth = 1;
ctx.strokeStyle = '#7CFC00';

var depth = 16,
    branchSize = 6,
    branchAngle = 20,
    deg_to_rad = Math.PI / 180.0,
    startPt = {x: canvas.width / 2, y: canvas.height},
    startAngle = -95;

function drawTree(depth) {
    let entireTree = buildTree(depth);
    let treeProgress = populateProgressArray(entireTree);
    let currentBranch = 0;

    let myInterval = setInterval(() => {
        if (currentBranch >= entireTree.length) {
            clearInterval(myInterval);
        }

        let branchComplete = isBranchComplete(currentBranch, treeProgress);
        if (branchComplete) {
            currentBranch += 1;
            return;
        }

        for (var i = 0; i < treeProgress[currentBranch].length; i++) {
            let node = treeProgress[currentBranch][i];
            node.lengthDrawn += node.growthSpeed;
            let nextPoint = pointFromSlopeLength(node.coords, node.slope, node.lengthDrawn);
            drawLine(node.coords.x1, node.coords.y1, nextPoint.x, nextPoint.y);
        }
    }, 1);
}

function buildTree(treeDepth) {
    let allBranches = [];
    for (var seed = 0; seed < treeDepth; seed++) {
        allBranches.push([]);
    };

    for (var currentBranch = 0; currentBranch < treeDepth; currentBranch++) {
        if (currentBranch == 0) {
            let firstBranch = 
                {
                    angle: startAngle,
                    start: {
                        x: startPt.x, 
                        y: startPt.y
                    },
                    end: {
                        x: startPt.x + getSecondX(startAngle, treeDepth-currentBranch),
                        y: startPt.y + getSecondY(startAngle, treeDepth-currentBranch)
                    }
                };
            allBranches[currentBranch].push(firstBranch);
        } else {
            let parentBranches = allBranches[currentBranch-1];
            for (var i = 0; i < parentBranches.length; i++) {
                let parentBranch = parentBranches[i];
                let childBranchA = {
                    angle: parentBranch.angle - branchAngle,
                    start: parentBranch.end,
                    end: {
                        x: parentBranch.end.x + getSecondX(parentBranch.angle - (branchAngle * Math.random()), treeDepth - currentBranch),
                        y: parentBranch.end.y + getSecondY(parentBranch.angle - (branchAngle * Math.random()), treeDepth - currentBranch)
                    }
                };
                let childBranchB = {
                    angle: parentBranch.angle + branchAngle,
                    start: parentBranch.end,
                    end: {
                        x: parentBranch.end.x + getSecondX(parentBranch.angle + (branchAngle * Math.random()), treeDepth - currentBranch),
                        y: parentBranch.end.y + getSecondY(parentBranch.angle + (branchAngle * Math.random()), treeDepth - currentBranch)
                    }
                };
                if (Math.random() > 0.5) {
                    allBranches[currentBranch].push(childBranchA);
                }
                allBranches[currentBranch].push(childBranchB);
            }
        }
    }
    return allBranches;
}

function getSecondX(angle, depth) {
    return Math.cos(angle * deg_to_rad) * depth * branchSize;
}

function getSecondY(angle, depth) {
    return Math.sin(angle * deg_to_rad) * depth * branchSize;
}

function pointFromSlopeLength(coords, slope, length) {
    let dx = (length / Math.sqrt(1 + (slope * slope)));
    let nextX = coords.x1 + (Math.sign(coords.x2 - coords.x1) * dx);
    let nextY = coords.y1 + (Math.abs(slope) * dx * Math.sign(coords.y2 - coords.y1));
    if (!isFinite(slope)) {
        nextY = coords.y1 + length;
    }
    return {x: nextX, y: nextY};
}

function drawLine(x1, y1, x2, y2){
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function populateProgressArray(entireTree) {
    let treeProgress = [];
    for (var i = 0; i < entireTree.length; i++) {
        treeProgress.push([]);
        for (var j = 0; j < entireTree[i].length; j++) {
            let branchNode = entireTree[i][j];
            let branch = {
                length: Math.sqrt((branchNode.start.x - branchNode.end.x)*(branchNode.start.x - branchNode.end.x) + (branchNode.start.y - branchNode.end.y)*(branchNode.start.y - branchNode.end.y)),
                slope: (branchNode.end.y - branchNode.start.y) / (branchNode.end.x - branchNode.start.x),
                coords: {
                    x1: branchNode.start.x, 
                    y1: branchNode.start.y, 
                    x2: branchNode.end.x, 
                    y2: branchNode.end.y
                },
                growthSpeed: 2 + (2 * Math.random()),
                lengthDrawn: 0,
            };
            treeProgress[i].push(branch);
        }
    }
    return treeProgress;
}

function isBranchComplete(currentBranch, treeProgress) {
    for (var i = 0; i < treeProgress[currentBranch].length; i++) {
        if (treeProgress[currentBranch][i].lengthDrawn < treeProgress[currentBranch][i].length) {
            return false
        }
    }
    return true;
}

drawTree(depth);

