// Collision detectors
export function boxCollision(first, second) {
    if (
        !(
            first.x > second.x + second.width ||
            first.x + first.width < second.x ||
            first.y > second.y + second.height ||
            first.y + first.height < second.y
        )
    ) {
        return true;
    }
}

export function boxCircleCollision(rect, circle) {
    // Rect must contain .x, .y, .width, .height
    // Circle must contain .x, .y, .radius
    if (
        !(
            "x" in rect &&
            "y" in rect &&
            "width" in rect &&
            "height" in rect &&
            "x" in circle &&
            "y" in circle &&
            "radius" in circle
        )
    ) {
        throw "rect must contain .x, .y, .width, .height and circle must contain .x, .y, .radius!";
    }
    let is_in = false;
    // Translate rect so circle is at 0,0
    let x1 = rect.x - circle.x;
    let x2 = x1 + rect.width;
    let y1 = rect.y - circle.y;
    let y2 = y1 + rect.height;
    let r = circle.radius;

    is_in = x1 < -r && x2 > r && y1 < -r && y2 > r;
    if (!is_in) {
        let x = (x1 + x2) / 2;
        let y = (y1 + y2) / 2;
        let sqDist = Math.sqrt(x * x + y * y);
        is_in = sqDist <= r;
    }
    if (!is_in && Math.abs(x1) < r) {
        let yIntersect = Math.sqrt(r * r - x1 * x1);
        is_in = (y1 < -yIntersect && -yIntersect < y2) || (y1 < yIntersect && yIntersect < y2);
    }
    if (!is_in && Math.abs(x2) < r) {
        let yIntersect = Math.sqrt(r * r - x2 * x2);
        is_in = (y1 < -yIntersect && -yIntersect < y2) || (y1 < yIntersect && yIntersect < y2);
    }
    if (!is_in && Math.abs(y1) < r) {
        let yIntersect = Math.sqrt(r * r - y1 * y1);
        is_in = (x1 < -yIntersect && -yIntersect < x2) || (x1 < yIntersect && yIntersect < x2);
    }
    if (!is_in && Math.abs(y2) < r) {
        let yIntersect = Math.sqrt(r * r - y2 * y2);
        is_in = (x1 < -yIntersect && -yIntersect < x2) || (x1 < yIntersect && yIntersect < x2);
    }
    return is_in;
}
