// cmp %eax, %edx
// set %eax
// @R0
// D=M
// @R2
// D=M-D // M&D for test
// @R0
// M=D

// jmp .L1
// @.L1
// ;JMP

// jmp *%eax
// @R0
// 0;JMP

// jmp *(%eax)
// @R0
// A=M
// 0;JMP

// je .L1
// compute things and save result in D
// D is always the result of the most recent operation
// @.L1
// D;JEQ
