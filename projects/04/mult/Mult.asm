// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/04/Mult.asm

// Multiplies R0 and R1 and stores the result in R2.
// (R0, R1, R2 refer to RAM[0], RAM[1], and RAM[2], respectively.)
//
// This program only needs to handle arguments that satisfy
// R0 >= 0, R1 >= 0, and R0*R1 < 32768.

// Put your code here.
// Continually add R1 to R2, decrementing R0 until R0 equals 0
// Ends with R1 being added R0 times, which is R1*R0
// R2 = 0
@0
D=A
@2
M=D

(LOOP)

// if R0 == 0 then jump to END
@0
D=M
@END
D;JEQ

// R2 = R2 + R1
@2
D=M
@1
D=D+M
@2
M=D

// R0 = R0 - 1
@0
D=M
@1
D=D-A
@0
M=D

// loop
@LOOP
0;JMP

(END)
@END
0;JMP
