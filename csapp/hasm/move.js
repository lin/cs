// REGISTERS:
// ==========
// %eax => R0
// %ecx => R1
// %edx => R2
// %ebx => R3
// %esi => R4
// %edi => R5
// %ebp => R6
// %esp => R7
// R8   => temp1
// R9   => temp2
// R10  => temp3

// D should be reserved

// OPERAND:
// =======
// $imm
// @imm
// D=A

// %eax
// @R0
// D=M

// imm
// @imm
// D=M

// (%eax)
// @R0
// A=M
// D=M

// imm(%eax)
// @imm
// D=M
// @R8
// M=D
// @R0
// D=M
// @R8
// D=D+M

// (%eax, %ecx)
// @R0
// D=M
// @R8
// M=D
// @R1
// D=D+M

// imm(%eax, %ecx)
// (%eax, %ecx)
// @R0
// D=M
// @R8
// M=D
// @R1
// D=D+M
// @imm
// D=D+A

// (,%eax, s)
// @R0
// D=M
// @s
// D=D*A // not implemented multiplication

// imm(,%eax, s)
// @R0
// D=M
// @s
// D=D*A // not implemented multiplication
// @imm
// D=D+A

// (%ecx, %eax, s)
// @R0
// D=M
// @s
// D=D*A // not implemented multiplication
// @imm
// D=D+A
// @R1
// D=D+M

// imm(%ecx, %eax, s)
// @R1
// D=M
// @R8
// M=D
// @R0
// D=M
// @s
// D=D*A // not implemented multiplication
// @imm
// D=D+A
// @R8
// D=D+M

// MOV:
// =======
// mov $0x4050, %eax
// @16464
// D=A
// @R0
// M=D


// mov $0x4050, (%eax)
// @16464
// D=A
// @R0
// A=M
// M=D

// mov %eax, -12(%ebp)
// @R0
// D=M
// @R9
// M=D
// @-12
// D=M
// @R8
// M=D
// @R6
// D=M
// @R9
// D=D+M

// POP / PUSH
// =======
// push %eax
// @R0
// D=M
// @R6
// M=D
// @-4
// D=A
// @R6
// M=M-D

// pop %edi
// @R7
// A=M
// D=M
// @R5
// M=D
// @4
// D=A
// @R7
// M=D+M
