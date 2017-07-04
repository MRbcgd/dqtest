function bitToMb (bit) {
    bit /= (8 * 1024 * 1024);
    return Math.round(bit);
};
