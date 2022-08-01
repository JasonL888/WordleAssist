# WordleAssist
Tool to assist with Wordle

2 versions
* command line version in python
* browser html version in Backbone JS javascript

Motivation
* mainly as programming challenge

# Built With
* [python 3](https://www.python.org/downloads/)
* Word list from /usr/share/dict/words
* [Backbone js](https://backbonejs.org/)

# Getting Started
## Browser Version
Access via [WordleAssist](https://jasonl888.github.io/WordleAssist/)

## Python Command-line Version
### Pre-requisites
* install python

### Usage - Python
`python3 WordleAssist.py`

* You will be
  * prompted for 5-letter word
  * prompted for 5-letter result

| character | meaning |
|-----------|---------|
| use 'm'| Green - match (character+position) |
| use 'p'| Yellow - partial match (character but wrong position)|
| use 'x'| Grey - non match (character)|

* Program will display list of possible words
* Continue with the above prompts word/result

### Sample flow
![Sample Flow](sampleflow.png)

| word | result | meaning |
|------|--------|---------|
| arise | ppxxx | partial match for "a", "r", no match for "i","s","e"|
| buran | xmppx | exact match for "u", partial match for "a", "r", no match for "b", "n" |
| quart | mmmmm | exact match for all chars |

```
python3 WordleAssist.py

Enter 5-char word guess:arise
Enter result (m:positional match, p:partial match, x:no match):ppxxx
abhor, abkar, abord, abort, abura, acara, achar, achor, acorn, acron
...
wrawl, yarak, yaray, yarly, yarth, yurta, zabra, zonar

Enter 5-char word guess:ultra
Enter result (m:positional match, p:partial match, x:no match):xxxmp
abord, acorn, adorn, aggry, ambry, angry, award, awork, barry, board
carry, chard, chark, charm, charr, chary, coarb, dwarf, harry, hoard
hoary, jarry, knark, macro, marry, nacry, orary, ovary, parry, wharf
wharp

Enter 5-char word guess:dwarf
Enter result (m:positional match, p:partial match, x:no match):pxmmx
board, chard, hoard

Enter 5-char word guess:board
Enter result (m:positional match, p:partial match, x:no match):xmmmm
hoard

Enter 5-char word guess:hoard
Enter result (m:positional match, p:partial match, x:no match):mmmmm

Congrats! The word is: hoard
```

# License
Distributed under Apache License - see `LICENSE`
