The computer is a hardware implementation of Turing Machine.

The information is encoded by high and low voltage of transistors.

The elementaty of information transformation is presented by And Or Not gates, alternatively the three gates (NAND) can be made through Nand gates. By using these primative gates all transformation of f(\vec{a}) = \vec{b} can be realize, in the symbol set of {0, 1}. This is the combinatory logic part.

Then, by introducing flip flop(DFF), we could store and retrieve data at will. Not only a single bit of data, but a sequence of bits can be saved and accessed using flip flop techniques.

To make computer Turing Complete, jump is needed. That's what program counter does. Program counter can be made using combinatory logic and store/write data using flip-flop based register.

The ALU is to compute combinatory logic (with helper funcitons like add, inc, multi, xor, shift etc.), and CPU is for reading / writing data (DFF), calling ALU (NAND)to compute and controling (NAND & DFF) commands.

To access the memory, we need a register to store the address of memory (Memory Register).

To distinguish one command from another, we need a register to access the command address (Instruction Register).

Other registers are used to save temporary information, notably A (often accumulation is stored in A) register and B register for ALU, and D register for saving intermedia data. Others might saved on a short stack (local), memory(long) or files.
