function create_2d (width, height, callback) {
    const arrays = [];

    for(let y = 0; y < height; ++y) {
        const array = [];

        for(let x = 0; x < width; ++x) {
            array.push(
                callback(x, y)
            );
        }

        arrays.push(array);
    }

    return arrays;
}

export {
    create_2d
};