"use strict";
var ctx, canvas;

var depth = 16,
    branchSize = 6,
    branchAngle = 20,
    deg_to_rad = Math.PI / 180.0;

function init() {
    canvas = document.getElementById('myCanvas');
    ctx = myCanvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.lineWidth = 1;
    drawTree(depth);
}

function drawTree(depth) {
    let treePts = buildTree(depth);
    let treeProgress = [];
    for (var seed = 0; seed < treePts.length; seed++) {
        treeProgress.push([]);
    }

    let currentBranch = 0;
    let myInterval = setInterval(() => {
        if (currentBranch >= treePts.length) {
            clearInterval(myInterval);
        }

        if (treeProgress[currentBranch].length == 0) {
            for (var populate = 0; populate < treePts[currentBranch].length; populate++) {
                let branchNode = treePts[currentBranch][populate];
                let coords = {x: branchNode.start[0], y: branchNode.start[1], x2: branchNode.end[0], y2: branchNode.end[1]};
                let newBranchTracker = {
                    length: Math.sqrt((branchNode.start[0] - branchNode.end[0])*(branchNode.start[0] - branchNode.end[0]) + (branchNode.start[1] - branchNode.end[1])*(branchNode.start[1] - branchNode.end[1])),
                    slope:   (branchNode.end[1] - branchNode.start[1]) / (branchNode.end[0] - branchNode.start[0]),
                    coords: coords,
                    growthSpeed: 2 + (2 * Math.random()),
                    lengthDrawn: 0,
                };
                treeProgress[currentBranch].push(newBranchTracker);
            }       
        }

        let progressCheck = [];
        for (var i = 0; i < treeProgress[currentBranch].length; i++) {
            if (treeProgress[currentBranch][i].lengthDrawn >= treeProgress[currentBranch][i].length) {
                progressCheck.push(true);
            } else {
                progressCheck.push(false);
            }
        }
        if (progressCheck.every((val, i, arr) => val === true )) {
            currentBranch += 1;
            return;
        }

        for (var i = 0; i < treeProgress[currentBranch].length; i++) {
            let node = treeProgress[currentBranch][i];
            node.lengthDrawn += node.growthSpeed;
            let endPt = pointFromSlopeLength(node.coords, node.slope, node.lengthDrawn);
            drawLine(node.coords.x, node.coords.y, endPt.x, endPt.y);
        }
    }, 1);
}

function buildTree(numberOfBreaks) {
    let allBranches = [];
    for (var seed = 0; seed < numberOfBreaks; seed++) {
        allBranches.push([]);
    };

    for (var i = 0; i < numberOfBreaks; i++) {
        if (i == 0) {
            let startAngle = -75;
            let startX = canvas.width / 2;
            let startY = canvas.height;
            let newBranch = 
            {
                angle: startAngle,
                start: [startX, startY],
                end: [startX + getSecondX(startAngle, numberOfBreaks-i), startY + getSecondY(startAngle, numberOfBreaks-i)],
            };
            allBranches[i].push(newBranch);
        } else {
            let lastEnds = allBranches[i-1];
            for (var k = 0; k < lastEnds.length; k++) {
                let parentBranch = lastEnds[k];
                let childBranchA = {
                    angle: parentBranch.angle - branchAngle,
                    start: parentBranch.end,
                    end: [parentBranch.end[0] + getSecondX(parentBranch.angle - (branchAngle * Math.random()), numberOfBreaks - i), parentBranch.end[1] + getSecondY(parentBranch.angle - (branchAngle * Math.random()), numberOfBreaks - i)],
                };
                let childBranchB = {
                    angle: parentBranch.angle + branchAngle,
                    start: parentBranch.end,
                    end: [parentBranch.end[0] + getSecondX(parentBranch.angle + (branchAngle * Math.random()), numberOfBreaks - i), parentBranch.end[1] + getSecondY(parentBranch.angle + (branchAngle * Math.random()), numberOfBreaks - i)],
                };
                allBranches[i].push(childBranchA);
                allBranches[i].push(childBranchB);
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

function pointFromSlopeLength(start, slope, length) {
    let dx = (length / Math.sqrt(1 + (slope * slope)));
    let x2 = start.x + (Math.sign(start.x2 - start.x) * dx);
    let y2 = start.y + (Math.abs(slope) * dx * Math.sign(start.y2 - start.y));
    if (!isFinite(slope)) {
        y2 = start.y + length;
    }
    return {x: x2, y: y2};
}

function drawLine(x1, y1, x2, y2){
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

init();

