"use strict";
var ctx, canvas;
canvas = document.getElementById('myCanvas');
ctx = myCanvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx.lineWidth = 1;
ctx.strokeStyle = '#00FFFF';

var depth = 20,
  branchSize = 3,
  startBranchAngle = 50,
  deg_to_rad = Math.PI / 180.0,
  startPt = {x: canvas.width/2, y: canvas.height},
  startAngle = -95,
  currentTrees = 0,
  maxTrees = 1,
  waitTime = 1000;

var allColors = [
  "#F7A43E", 
  "#EA6675", 
  "#FA425C", 
  "#6880FF", 
  "#1AEBFD", 
  "#76E707", 
  "#E54B11", 
  "#79CEBB", 
  "#1AD75E", 
  "#EC0180", 
  "#72BA8F", 
  "#66F098", 
  "#0EE68C", 
  "#AB6229",
  "#F0D2EB",
  "#A405FB",
  "#78C464",
  "#BFE0F4",
];

function drawTree(depth, branchAngle) {
  let treeData = buildTree(depth, branchAngle);
  let drawingData = populateDrawingData(treeData);
  let currentDepth = 0;

  let newColorIndex = Math.floor(Math.random() * allColors.length);
  ctx.strokeStyle = allColors[newColorIndex];

  let myInterval = setInterval(() => {
    // redraw
    if (currentDepth >= treeData.length) {
      reset(myInterval, waitTime);
      return;
    }

    // next depth
    let depthDrawn = isDepthDrawn(currentDepth, drawingData);
    if (depthDrawn) {
      currentDepth += 1;
      return;
    }

    // extend branches
    for (var i = 0; i < drawingData[currentDepth].length; i++) {
      let branchNode = drawingData[currentDepth][i];
      if (!branchNode.isComplete) {
        if (branchNode.length - branchNode.lengthDrawn <= branchNode.growthSpeed) {
          branchNode.lengthDrawn = branchNode.length;
          branchNode.isComplete = true;
        } else {
          branchNode.lengthDrawn += branchNode.growthSpeed;
        }

        let nextPoint = pointFromSlopeLength(branchNode.coords, branchNode.slope, branchNode.lengthDrawn);
        drawLine(branchNode.coords.x1, branchNode.coords.y1, nextPoint.x, nextPoint.y);
      }
    }
  }, 1);
}

function buildTree(treeDepth, branchAngle) {
  let allBranches = [];

  for (var currentDepth = 0; currentDepth < treeDepth; currentDepth++) {
    allBranches.push([]);
    if (currentDepth == 0) {
      let firstBranch = 
        {
          angle: startAngle,
          start: startPt,
          end: getNextPoint(startPt, startAngle, currentDepth, treeDepth),
        };
      allBranches[currentDepth].push(firstBranch);
    } else {
      let parentBranches = allBranches[currentDepth-1];
      for (var i = 0; i < parentBranches.length; i++) {
        let parentBranch = parentBranches[i];

        let angleA = parentBranch.angle - (branchAngle * Math.random());
        let childBranchA = {
          angle: angleA,
          start: parentBranch.end,
          end: getNextPoint(parentBranch.end, angleA, currentDepth, treeDepth),
        };

        let angleB = parentBranch.angle + (branchAngle * Math.random());
        let childBranchB = {
          angle: angleB,
          start: parentBranch.end,
          end: getNextPoint(parentBranch.end, angleB, currentDepth, treeDepth),
        };
        if (Math.random() > 0.5) {
          if (Math.random() > 0.5) {
            allBranches[currentDepth].push(childBranchA);
          }
          allBranches[currentDepth].push(childBranchB);
        } else {
          allBranches[currentDepth].push(childBranchA);
          if (Math.random() > 0.5) {
            allBranches[currentDepth].push(childBranchB);
          }
        }
      }
    }
  }
  return allBranches;
}

function populateDrawingData(treeData) {
  let drawingData = [];
  for (var i = 0; i < treeData.length; i++) {
    drawingData.push([]);
    for (var j = 0; j < treeData[i].length; j++) {
      let branchNode = treeData[i][j];
      let data = {
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
        isComplete: false,
      };
      drawingData[i].push(data);
    }
  }
  return drawingData;
}

function reset(interval, waitTime) {
  currentTrees += 1;
  clearInterval(interval);
  setTimeout(() => {
    if (currentTrees >= maxTrees) {
      currentTrees = 0;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    let newDepth = 15 + (Math.floor(15 * Math.random()));
    let newAngle = 25 + Math.floor(10 * Math.random());
    drawTree(newDepth, newAngle);
  }, waitTime);
}

function isDepthDrawn(currentDepth, drawingData) {
  for (var i = 0; i < drawingData[currentDepth].length; i++) {
    if (!drawingData[currentDepth][i].isComplete) {
      return false;
    }
  }
  return true;
}

function getNextPoint(endPt, angle, currentDepth, depth) {
  return {
    x: endPt.x + Math.cos(angle * deg_to_rad) * branchSize * (depth - currentDepth),
    y: endPt.y + Math.sin(angle * deg_to_rad) * branchSize * (depth - currentDepth)
  };
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

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

drawTree(depth, startBranchAngle);