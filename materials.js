// Resources after explosions
// types
const imgCoins = new Image();
imgCoins.src = "./Images/bling_coins.png";
const paramCoins = [imgCoins, 21, 21, 0, 0, 16, 21, 1, 0.06, [{ row: 0, cols: [0, 3] }]];
export const carbon = {
    paramResource: paramCoins,
    width: 0.3,
    height: 0.3,
    alivetime: 1800,
};
