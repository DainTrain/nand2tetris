// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/04/Fill.asm

// Runs an infinite loop that listens to the keyboard input.
// When a key is pressed (any key), the program blackens the screen,
// i.e. writes "black" in every pixel;
// the screen should remain fully black as long as the key is pressed. 
// When no key is pressed, the program clears the screen, i.e. writes
// "white" in every pixel;
// the screen should remain fully clear as long as no key is pressed.

// Put your code here.
// Loop through each pixel from screen beginning to end. At each iteration, read keyboard input, and color current pixel according to whether a key is pressed. Once end is reached, loop back to beginning.
@SCREEN
D=A
// Store current pixel address at M[0]
@0
M=D

(LOOP)
@KBD
D=M
// if keyboard has no input (equals 0), jump to whiten, else jump to blacken
@WHITEN
D;JEQ
@BLACKEN
0;JMP

(BLACKEN)
// get current pixel from M[0], blacken it
@1
D=A
@0
M=D
@INCREMENT
0;JMP

(WHITEN)
// get current pixel from M[0], whiten it
@0
D=A
@0
M=D
@INCREMENT
0;JMP

(INCREMENT)
// increment current pixel by one, and reset to screen index if equals keyboard index (keyboard index is end of screen memory segment)
@1
D=A
@0
M=M+D
D=M
@KBD
D=D-A
@RESET
D;JEQ
@LOOP
0;JMP

(RESET)
// reset M[0] to SCREEN
@SCREEN
D=A
@0
M=D
@LOOP
0;JMP
