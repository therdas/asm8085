The Neutrino 8085 assembler
===

Neutrino is a simple 8085 assembler written in plain ol' JavaScript. The goal while creating neutrino was to provide high level functionality but in a simple to use format, so that almost anyone can use it, while still allowing advanced use cases. Since the 8085 does not support any native support for relocatable code, neither does neutrino. However it does have other features to make up for it:
+ Symbols, in the form of EQUs
+ Multiple ways to EQU
+ Full parsing and expression solving, even at instruction level
+ 
+ A fully featured Macro system, with proper name mangling and recursion.