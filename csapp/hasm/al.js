// Arithmetic and Logic
// ====================

// Load Effective Address
// ----------------------
// lea 6(%eax), %edx
// @6
// D=A
// @R0
// D=D+M
// @R2
// M=D

// lea (%eax, %ecx), %edx
// @R0
// D=M
// @R1
// D=D+M
// @R2
// M=D

// Unary
// -----
// inc 8(%eax)
// @8
// D=A
// @R0
// D=D+M
// A=D
// M=D+1

// dec %ecx
// @R1
// D=M
// D=D-1
// M=D

// add %ecx, (%eax)
// @R1
// D=M
// @R0
// A=M
// M=D+M

// hard to implemented
// sub %edx, 4(%eax)
// @R2
// D=M
// @R8
// M=D
// @4
// D=A
// @R0
// D=D+M
// @R11
// M=D
// @R8
// D=M
// @R11
// A=M
// M=M-D
