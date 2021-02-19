def binomial(n, k):
    if k == 0:
        return 1
    return n * binomial(n - 1, k - 1) // k

def binomial_iter(n, k):
    lmul = rdiv = 1
    while k > 0:
        (n, k, lmul, rdiv) = (n - 1, k - 1, lmul * n, k * rdiv)
    return lmul // rdiv

print(binomial(6, 2))
