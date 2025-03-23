const screenSize = 256
const screenHeight = 16
// 16x16 screen

const bank1 = new Memory(getBuilding("bank1"))
const bank2 = new Memory(getBuilding("bank2"))
const bank3 = new Memory(getBuilding("bank3"))
const bank4 = new Memory(getBuilding("bank4"))
// 1 and 2 are for on/off, 3 and 4 are for color

const red = Items.blastCompound;
const orange = Items.pyratite;
const lightOrange = Items.phaseFabric;
const yellow = Items.surgeAlloy;
const green = Items.plastanium;
const turquoise = Items.oxide;
const blue = Items.titanium;
const purple = Items.sporePod;
const pink = Items.thorium;
const black = Items.coal;
const darkGray = Items.silicon;
const gray = Items.tungsten;
const lightGray = Items.graphite;
const white = Items.metaglass;

const readFromMemory = function (loc) {
    if (loc < 512) {
        return bank1[loc]
    } else {
        return bank2[loc]
    }
    // can support up to 32x32 grids
}

const readColorFromMemory = function (loc) {
    if (loc < 512) {
        return bank3[loc]
    } else {
        return bank4[loc]
    }
}

const writeToMemory = function (loc, bit, color) {
    if (loc < 512) {
        asm`sensor lookup ${color} @id`
        bank1[loc] = bit
        bank3[loc] = getVar("lookup")
    } else {
        asm`sensor lookup ${color} @id`
        bank2[loc] = bit
        bank4[loc] = getVar("lookup")
    }   // writes state to 1st banks, color to second banks
}

const writeToDisplay = function (loc, bit, color) {
    writeToMemory(loc, bit, color)
} // redundant

const displayFlush = function () {
    for (let i = 0; i < screenSize; i++) {
        const drawColor = lookup.item(readColorFromMemory(i))
        control.config(getLink(i), readFromMemory(i) ? drawColor : undefined)
    } // flushes all draw operations stored to memory
}

const clearDisplay = function () {
    for (let i = 0; i < screenSize; i++) {
        writeToDisplay(i, 1, black)
    } // all black screen (coal)
}

const drawPixel = function (x, y, bit, color) {
    writeToDisplay(Math.floor(x+4) - 1 + (screenHeight - Math.floor(y)) * screenHeight, bit, color)
} // draws pixel at x,y

function drawLine(x1, y1, x2, y2, bit, color) {
    let cx1 = x1
    let cx2 = x2
    let cy1 = y1
    let cy2 = y2
    let dx = Math.abs(x2 - x1);
    let dy = Math.abs(y2 - y1);
    let sx = x1 < x2 ? 1 : -1;
    let sy = y1 < y2 ? 1 : -1;
    let err = dx - dy;

    while (true) {
        drawPixel(cx1, cy1, bit, color);

        if (cx1 === cx2 && cy1 === cy2) break;
        let e2 = 2 * err;

        if (e2 > -dy) {
            err -= dy;
            cx1 += sx;
        }
        if (e2 < dx) {
            err += dx;
            cy1 += sy;
        }
    }
    // draws line from x1,y1 to x2,y2 using the Bresenham method
}

const drawRect = function (x1, y1, x2, y2, bit, color) {
    for (let y = y1; y <= y2; y++) {
        for (let x = x1; x <= x2; x++) {
            drawPixel(x, y, bit, color)
        }
    }
} // draw a rectangle from x1,y1 being the bottom left corner and x2,y2 being the upper right corner

function drawCircle(cx, cy, r, bit, color) {
    for (let y = cy - r; y <= cy + r; y++) {
        for (let x = cx - r; x <= cx + r; x++) {
            let dx = x - cx;
            let dy = y - cy;
            if (dx * dx + dy * dy <= r * r) {
                drawPixel(x, y, bit, color);
            }
        }
    }
} // draw a circle centered on cx,cy with radius

// AVAIABLE FUNCTIONS
// clearDisplay() drawPixel(x,y,bit,color) drawLine(x1,y1,x2,y2,color)
// drawRect(x1, y1, x2, y2, bit, color) drawCircle(x, y, radius, bit, color)
// bit should be 1, if 0 then no draw will take place
// do your tomfoolery down here !!!

clearDisplay()

drawCircle(8,8,Math.floor(Math.abs(Math.sin(Vars.time/10)*7)),1,orange)

displayFlush()
