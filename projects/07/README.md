Project 07 is the first half of a VM translator, a program which takes as input VM files, and produces as output Hack assembly. Built in a later project, the VM files are the result of a Jack compiler (Jack is the high level language of the course).

Included in project 07 is support for translating the arithmetic (add, sub, and, or, neg, not, eq, gt, lt) and memory access (push, pop) commands of the VM language.

The VM translator is later extended in project 08 to include function and program control commands (function, call, return, goto, if-goto). Support for those commands will still be found in this directory, project 07. The VMtranslator project has an executable command, ./VMtranslator/bin/VMtranslator, that can be added to your PATH to invoke it in the project 08 program directories.