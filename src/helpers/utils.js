function lerp(a, b, n) {
    return (1 - n) * a + n * b;
}

function test () {
    return console.log("hello");
}

export { 
    lerp,
    test, 
}; 