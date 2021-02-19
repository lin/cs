function doubleHashing (key, m) {
    let result = [];
    for (let i = 0; i < 10; i++) {
        let v = key + i * (1 + key % (m-1));
        let r = v % m;
        result.push(r);
    }
    console.log(result)
}

doubleHashing(59, 11)
