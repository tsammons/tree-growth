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
  startBranchAngle = 50,
  deg_to_rad = Math.PI / 180.0,
  startPt = {x: canvas.width / 2, y: canvas.height},
  startAngle = -95;

function drawTree(depth, branchAngle) {
  let entireTree = buildTree(depth, branchAngle);
  let drawingProgress = populateProgressArray(entireTree);
  let currentBranch = 0;

  let myInterval = setInterval(() => {
    if (currentBranch >= entireTree.length) {
      clearInterval(myInterval);
      setTimeout(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawTree(depth, 25 + Math.floor(10 * Math.random()));
      }, 1000);
      return;
    }

    let branchLevelComplete = isBranchLevelComplete(currentBranch, drawingProgress);
    if (branchLevelComplete) {
      currentBranch += 1;
      return;
    }

    for (var i = 0; i < drawingProgress[currentBranch].length; i++) {
      let node = drawingProgress[currentBranch][i];
      node.lengthDrawn += node.growthSpeed;
      let nextPoint = pointFromSlopeLength(node.coords, node.slope, node.lengthDrawn);
      drawLine(node.coords.x1, node.coords.y1, nextPoint.x, nextPoint.y);
    }
  }, 1);
}

function buildTree(treeDepth, branchAngle) {
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
            x: startPt.x + getNextX(startAngle, currentBranch, treeDepth),
            y: startPt.y + getNextY(startAngle, currentBranch, treeDepth)
          }
        };
      allBranches[currentBranch].push(firstBranch);
    } else {
      let parentBranches = allBranches[currentBranch-1];
      for (var i = 0; i < parentBranches.length; i++) {
        let parentBranch = parentBranches[i];

        let angleA = parentBranch.angle - (branchAngle * Math.random());
        let childBranchA = {
          angle: angleA,
          start: parentBranch.end,
          end: {
            x: parentBranch.end.x + getNextX(angleA, currentBranch, treeDepth),
            y: parentBranch.end.y + getNextY(angleA, currentBranch, treeDepth)
          }
        };

        let angleB = parentBranch.angle + (branchAngle * Math.random());
        let childBranchB = {
          angle: angleB,
          start: parentBranch.end,
          end: {
            x: parentBranch.end.x + getNextX(angleB, currentBranch, treeDepth),
            y: parentBranch.end.y + getNextY(angleB, currentBranch, treeDepth)
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

function populateProgressArray(entireTree) {
  let drawingProgress = [];
  for (var i = 0; i < entireTree.length; i++) {
    drawingProgress.push([]);
    for (var j = 0; j < entireTree[i].length; j++) {
      let branchNode = entireTree[i][j];
      let branch = {
        length: getLength(branchNode),
        slope: getSlope(branchNode),
        coords: {
          x1: branchNode.start.x, 
          y1: branchNode.start.y, 
          x2: branchNode.end.x, 
          y2: branchNode.end.y
        },
        growthSpeed: 2 + (2 * Math.random()),
        lengthDrawn: 0,
      };
      drawingProgress[i].push(branch);
    }
  }
  return drawingProgress;
}

function isBranchLevelComplete(currentBranch, drawingProgress) {
  for (var i = 0; i < drawingProgress[currentBranch].length; i++) {
    if (drawingProgress[currentBranch][i].lengthDrawn < drawingProgress[currentBranch][i].length) {
      return false
    }
  }
  return true;
}

function getNextX(angle, currentDepth, depth) {
  return Math.cos(angle * deg_to_rad) * branchSize * (depth - currentDepth);
}

function getNextY(angle, currentDepth, depth) {
  return Math.sin(angle * deg_to_rad) * branchSize * (depth - currentDepth);
}

function getSlope(branchNode) {
  let dx = branchNode.end.x - branchNode.start.x;
  let dy = branchNode.end.y - branchNode.start.y;
  return dy / dx;
}

function getLength(branchNode) {
  let dx = branchNode.start.x - branchNode.end.x;
  let dy = branchNode.start.y - branchNode.end.y;
  return Math.sqrt((dx)*(dx) + (dy)*(dy));
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

drawTree(depth, startBranchAngle);

