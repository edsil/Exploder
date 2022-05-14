// Keyboard routines
const ctrl = {
    up: false,
    down: false,
    left: false,
    right: false,
    btn1: false,
    btn2: false,
};

export const controlers = {
    0: { ...ctrl },
    1: { ...ctrl },
    KeyA: (k) => (controlers[0].left = k),
    KeyW: (k) => (controlers[0].up = k),
    KeyS: (k) => (controlers[0].down = k),
    KeyD: (k) => (controlers[0].right = k),
    KeyE: (k) => (controlers[0].btn1 = k),

    ArrowLeft: (k) => (controlers[1].left = k),
    ArrowUp: (k) => (controlers[1].up = k),
    ArrowDown: (k) => (controlers[1].down = k),
    ArrowRight: (k) => (controlers[1].right = k),
    Space: (k) => (controlers[1].btn1 = k),
};

// Other options/settings
export const options = {
    wrap: true,
    cellSize: 30,
};
