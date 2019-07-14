### 1. Grammar that is `SLR(1)`, but not `LR(0)`
```
S -> a A c | a B d.
A -> z.
B -> z.
```
The test string can be `azc`.

[Click for more about the above grammar](http://smlweb.cpsc.ucalgary.ca/vital-stats.php?grammar=S+-%3E+a+A+c+%7C+a+B+d.%0D%0AA+-%3E+z.%0D%0AB+-%3E+z.), [LR(0) Item Sets](http://smlweb.cpsc.ucalgary.ca/lr0.php?grammar=S+-%3E+a+A+c+%7C+a+B+d.%0AA+-%3E+z.%0AB+-%3E+z.&substs=)

![1](http://smlweb.cpsc.ucalgary.ca/lr0-automaton.php?grammar=S+-%3E+a+A+c+%7C+a+B+d.%0AA+-%3E+z.%0AB+-%3E+z.&substs=)

The reason it's not `LR(0)` is that after reading the same token `a`, and same token `z`, you have two choices to reduce. (state 5)

But you can distinguish A and B by comparing the follow sets of A and B. where {c} for A and {d} for B.

### 2. Grammar that is `LR(1)`, but not `SLR(1)` (But it's `LALR(1)`)
```
S -> a A c | a B d | B c.
A -> z.
B -> z.
```
The test string can be `azc`.

[Click for more about the above grammar](http://smlweb.cpsc.ucalgary.ca/vital-stats.php?grammar=S+-%3E+a+A+c+%7C+a+B+d+%7C+B+c.%0D%0AA+-%3E+z.%0D%0AB+-%3E+z.)

It's not `SLR(1)` since the follow set of B also includes `c`.

But you can trace the path of DFA to further examine the follow set. This is why `LR(1)` is more flexible when conflicts occur. It's a little hard to understand. It's helpful to see the DFA of both [SLR](http://smlweb.cpsc.ucalgary.ca/lr0.php?grammar=S+-%3E+a+A+c+%7C+a+B+d+%7C+B+c.%0AA+-%3E+z.%0AB+-%3E+z.&substs=):

![SLR](http://smlweb.cpsc.ucalgary.ca/lr0-automaton.php?grammar=S+-%3E+a+A+c+%7C+a+B+d+%7C+B+c.%0AA+-%3E+z.%0AB+-%3E+z.&substs=)

and [LR](http://smlweb.cpsc.ucalgary.ca/lr1.php?grammar=S+-%3E+a+A+c+%7C+a+B+d+%7C+B+c.%0AA+-%3E+z.%0AB+-%3E+z.&substs=):

![LR](http://smlweb.cpsc.ucalgary.ca/lr1-automaton.php?grammar=S+-%3E+a+A+c+%7C+a+B+d+%7C+B+c.%0AA+-%3E+z.%0AB+-%3E+z.&substs=)

### 3. Grammar that is `LR(1)`, but not `LALR(1)`
```
S -> a A c | a B d | b A | b B c.
A -> z.
B -> z.
```
The test string can be `azc`.

[Click for more about the above grammar](http://smlweb.cpsc.ucalgary.ca/vital-stats.php?grammar=S+-%3E+a+A+c+%7C+a+B+d+%7C+B+c.%0D%0AA+-%3E+z.%0D%0AB+-%3E+z.)

If you know the procedure to get LALR. You can see that, in the [DFA](http://smlweb.cpsc.ucalgary.ca/lr1.php?grammar=S+-%3E+a+A+c+%7C+a+B+d+%7C+b+A+%7C+b+B+c.%0AA+-%3E+z.%0AB+-%3E+z.&substs=) of `LR(1)`:

![LR](http://smlweb.cpsc.ucalgary.ca/lr1-automaton.php?grammar=S+-%3E+a+A+c+%7C+a+B+d+%7C+b+A+%7C+b+B+c.%0AA+-%3E+z.%0AB+-%3E+z.&substs=)

state 9 and state 6 can be merged. That's why production `S -> a A c | a B d | b A | b B`  part is introduced (not adding the last `c`).

It leads to a similiar state with same core as in `SLR(1)` DFA. As long as `.A` and `.B` is in the same state, it will lead to state 9 and state 6. After the merge, we got [the DFA of `LALR(1)`](http://smlweb.cpsc.ucalgary.ca/lalr1.php?grammar=S+-%3E+a+A+c+%7C+a+B+d+%7C+b+A+%7C+b+B+c.%0AA+-%3E+z.%0AB+-%3E+z.&substs=):

![LALR](http://smlweb.cpsc.ucalgary.ca/lalr1-automaton.php?grammar=S+-%3E+a+A+c+%7C+a+B+d+%7C+b+A+%7C+b+B+c.%0AA+-%3E+z.%0AB+-%3E+z.&substs=)

Now, we add the trailing c to the production `S -> a A c | a B d | b A | b B c`, after the merge, both the follow set of A_8 and B_8 contains `c`. Thus it has reduce-reduce conflicts.

### 4. Grammar that is `LR(2)`, but not `LR(1)`
```
S -> a A c | a B c d.
A -> z.
B -> z.
```
The test string can be `azc`. This one is trivial.

![LR(2)](http://smlweb.cpsc.ucalgary.ca/lr1-automaton.php?grammar=S+-%3E+a+A+c+%7C+a+B+c+d.%0AA+-%3E+z.%0AB+-%3E+z.&substs=)
