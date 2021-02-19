// P707 Princeton Companion

// P is C in Turing's paper.
P = function (S, I) {
  return halt_or_not(S, I)
}

// Q is like H in Turing's paper.
Q = function (S) {
  if (P(S, S)) {
    loop()
  } else {
    halt()
  }
}

// now let's run:
Q(Q)
// if P(Q, Q) return true, it loops, a contradiction!
// if P(Q, Q) return false, it halts, a contradiction!