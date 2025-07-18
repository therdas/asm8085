# neutrino - an 8085 emulator/assembler

⚠️ This version is technically no longer supported. Once I get around to building v2, the website and this repo will be migrated to that ⚠️
If you spot any wierd issues or bugs feel free to either open an issue or submit a PR - I'll get around to it when I can

## Plans for v2
### Runtime
- [ ] To be fully typed and written in TypeScript
- [ ] To be fully end-to-end tested
- [ ] Have the legacy interface along with a more intuitive interface
- [ ] Have support for 8086 (if possible)
- [ ] Have display and IO modules that can be simulated. Planned:
  - A UART display
  - Traditional 7-segment displays along with decoders and encoders
  - Pushable buttons/pins
- [ ] Be accurate timings-wise (on hardware that can support it)

### Assembler
- [ ] Allow output in Intel formats
- [ ] Improve macro engine (current engine is a simple block-substitution engine)
- [ ] Allow import/export from traditional macro languages
- [ ] Catch recursive macros instead of crashing :) 

If you want to follow the development of v2, check out this repository (enough of the code and coding style will change that I would rather it be a different repo instead of it being a branch, this code will always be available though): [TBC](TBC)

### Suggestions for v2
If you have any suggestions for v2, please open an issue and give a brief overview on what you'd be looking for!

## V1
This is a comprehensive emulator and assembler for the 8085 microprocessor.
