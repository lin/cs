# Self-Taughting CS

- - -
 
 :books: Books, :mortar_board: Online Courses, :tv: YouTube Videos, :male_detective: Cracking Source Codes

- - -

## Stage I: System

### Circuit Logic

The computer is a hardware implementation of Turing Machine.

The information is encoded by high and low voltage of transistors. 

The elementaty of information transformation is presented by And Or Not gates, alternatively the three gates (NAND) can be made through Nand gates. By using these primative gates all transformation of f(\vec{a}) = \vec{b} can be realize, in the symbol set of {0, 1}. This is the combinatory logic part.

Then, by introducing flip flop(DFF), we could store and retrieve data at will. Not only a single bit of data, but a sequence of bits can be saved and accessed using flip flop techniques.

To make computer Turing Complete, jump is needed. That's what program counter does. Program counter can be made using combinatory logic and store/write data using flip-flop based register.

The ALU is to compute combinatory logic (with helper funcitons like add, inc, multi, xor, shift etc.), and CPU is for reading / writing data (DFF), calling ALU (NAND)to compute and controling (NAND & DFF) commands.

To access the memory, we need a register to store the address of memory (Memory Register). 

To distinguish one command from another, we need a register to access the command address (Instruction Register).

Other registers are used to save temporary information, notably A (often accumulation is stored in A) register and B register for ALU, and D register for saving intermedia data. Others might saved on a short stack (local), memory(long) or files.

1.  :exclamation: :mortar_board: [The Elements of Computing Systems](https://www.coursera.org/learn/build-a-computer) (Project 1 - 5), Feb 18-20 2019

    :man_technologist: [Combinatory Logic](https://github.com/lin/nand2tetris-gates/); [ALU](https://github.com/lin/nand2tetris-alu/); [Register & Memory](https://github.com/lin/nand2tetris-memory/); [CPU](https://github.com/lin/nand2tetris-cpu/)
    
1.  :exclamation: :books:  _[Computer Systems: A Programmer's Perspective](https://www.amazon.com/Computer-Systems-Programmers-Perspective-Engineering/dp/0134123832/)_ (Chapter 4), Jul 2019

1.  :exclamation: :books: _[Code: The Hidden Language of Computer Hardware and Software](https://www.amazon.com/Code-Language-Computer-Hardware-Software/dp/0735611319)_, Nov. 2017

1. :tv: [Build an 8-bit computer from scratch](https://www.youtube.com/watch?v=HyznrdDSSGM&list=PLowKtXNTBypGqImE405J2565dvjafglHU), Spring Festival Holidays, 2019

1. :books: _[Feynman Lectures On Computation](https://www.amazon.com/Feynman-Lectures-Computation-Frontiers-Physics/dp/0738202967)_ Feb 2019

### Assembly and Virtual Machine

1.  :exclamation: :books:  _[Computer Systems: A Programmer's Perspective](https://www.amazon.com/Computer-Systems-Programmers-Perspective-Engineering/dp/0134123832/)_ (Chapter 2 - 3), Mar 2019

    :man_technologist: [Selected Implementation](https://github.com/lin/csapp)
    
    Chapter 3: Machine-Level Representation of Programs is the core learning material to study assembly.

1.  :exclamation: :mortar_board: [The Elements of Computing Systems](https://www.coursera.org/learn/nand2tetris2) (Project 6 - 8), Jun 2019

    :man_technologist: Codes: [Project 6 (Assembly Compiler)](https://github.com/lin/nand2tetris-assembly), May 22 2019,  [Project 7-8 (Virtual Machine Compiler)](https://github.com/lin/nand2tetris-vm), Jun 14 2019

### Compiler (Lexer, Parser & Generator)

1.  :exclamation: :books: _[Introduction to the Theory of Computation](https://www.amazon.com/Introduction-Theory-Computation-Michael-Sipser/dp/113318779X)_, Feb 2019

1.  :exclamation::mortar_board: [Stanford CS143: Introduction to Compiler](https://lagunita.stanford.edu/courses/Engineering/Compilers/Fall2014/course/) (Week 2 - 4), Feb 2019

1.  :exclamation: :mortar_board: [The Elements of Computing Systems](https://www.coursera.org/learn/nand2tetris2) (Project 10 - 11), Jun 2019
   
    :man_technologist: Codes: [Project 10 (Parser)](https://github.com/lin/nand2tetris-parser), Jun 21 2019, [Project 11 (Generator)](https://github.com/lin/nand2tetris-generator), Jun 26-27 2019

1. :male_detective: **JISON:** [Generating Parser using LL LR SLR LALR](https://github.com/zaach/jison) used in Jison, May 2019

    By far, parsing techniques is the hardest part of this learning journey, the main reason might be the lack of ideal learning materials. Things are taught too formal and too little examples are presented.

    :notebook: [How to distinguish LL LR SLR LALR?](https://gist.github.com/lin/dc83bb38eb458ded3ff01aec4a327d54)

1. :male_detective: **Babel:** [Babel Parser](https://github.com/babel/babel/tree/master/packages/babel-parser), [Babel Traverse](https://github.com/babel/babel/tree/master/packages/babel-traverse), [Babel Generator](https://github.com/babel/babel/tree/master/packages/babel-generator), Jun 2019
 
    Babel Parser is for parsing JavaScript, using Recursive Descent Algorithm.
     
1. :male_detective: **Vue.js:** [Parser for HTML](https://github.com/vuejs/vue/) used in Vue.js, Jun 2019
   
    :man_technologist: Codes: [Rewrite](https://github.com/lin/html-parser-lite)

1. :male_detective: **KaTex:** [Parser for LaTex](https://github.com/KaTeX/KaTeX) used in KaTex, Jun 2019

1. :male_detective: **Math.js:** [Parser for Mathematical Expression](https://github.com/josdejong/mathjs) used in Math.js, Jun 2019
   
### Mathematical Logic

1. :books: _[The Annotated Turing](https://www.amazon.com/Annotated-Turing-Through-Historic-Computability/dp/0470229055/)_, Nov 2017

1. :books: _[Gödel's Proof](https://www.amazon.com/Gödels-Proof-Ernest-Nagel/dp/0814758371/)_, Nov 2017

1. :tv: [Fundamentals of Lambda Calculus & Functional Programming in JavaScript](https://www.youtube.com/watch?v=3VQ382QG-y4), Feb 2019

1. :books: [A New Kind of Science](https://www.amazon.com/New-Kind-Science-Stephen-Wolfram/dp/1579550088), Nov 2017
