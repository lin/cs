int m1[5][7]; // m1[M][N]
int m2[7][5];

int sum_elemnt(int i, int j) {
  return m1[i][j] + m2[j][i];
}

// m1[i][j] means m1_bp + (i * 7 + j ) * 4
// => m1_bp + 4 * (i * N + j)
// => m1_bp + 4 * N * i + 4 * j
// => m1_bp + 4 * ( N * i ) + 4 * j

// _sum_elemnt:
// 	movq	_m2(%rip), %rax     // rax holds the m2
// 	movq	_m1(%rip), %rcx     // rcx holds the m1
// 	movl	%edi, -4(%rbp)      // local[0] holds the i, so it can be used later
// 	movl	%esi, -8(%rbp)      // local[1] holds the j, so it can be used later
// 	movslq	-4(%rbp), %rdx    // i to rdx
// 	imulq	$28, %rdx, %rdx     // rdx = 28 * i = 4 * 7i
// 	addq	%rdx, %rcx          // rcx = m1 + 4 * 7i
// 	movslq	-8(%rbp), %rdx    // j to rdx
// 	movl	(%rcx,%rdx,4), %esi // esi = m1 + 4 * 7i + 4 * j => mi + 4 * ( 7i + j )
// 	movslq	-8(%rbp), %rcx    // rcx = j
// 	imulq	$20, %rcx, %rcx     // rcx = 4 * 5j
// 	addq	%rcx, %rax          // rax = m2 + 4 * 5j
// 	movslq	-4(%rbp), %rcx    // rcx = i
// 	addl	(%rax,%rcx,4), %esi // esi += m2 + 4 * 5j + 4 * i => m2 + 4 * ( 5j + i )
// 	movl	%esi, %eax          // eax is used for return value
