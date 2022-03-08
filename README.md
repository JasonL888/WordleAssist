# WordleAssist
Command line tool to assist with Wordle

Motivation
* mainly as programming challenge

# Built With
* [python 3](https://www.python.org/downloads/)
* Word list from /usr/share/dict/words

# Getting Started
## Pre-requisites
* install python

## Usage
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

## Sample flow
![Sample Flow](sampleflow.png)

| word | result | meaning |
|------|--------|---------|
| arise | ppxxx | partial match for "a", "r", no match for "i","s","e"|
| ultra | xxxmp | exact match for "r", partial match for "a", no match for "u", "l", "t" |
| dwarf | pxmmx | partial match for "d", exact match for "a","r", no match for "w","f" |
| board | xmmmm | no match for "b", exact match for "o", "a", "r", "d" |
| hoard | mmmmm | exact match for all chars |

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
