import logging
import re

def logSetup(logger):
    logger.setLevel(logging.DEBUG)
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(funcName)s - %(levelname)s - %(message)s')
    #streamHandler = logging.StreamHandler()
    #streamHandler.setFormatter(formatter)
    #logger.addHandler(streamHandler)
    fileHandler = logging.FileHandler("debug.log", mode='w')
    fileHandler.setFormatter(formatter)
    logger.addHandler(fileHandler)

logger = logging.getLogger(__name__)
logSetup(logger)

class WordleAssist:
    def __init__(self, src_file):
        self.includeChars = []
        self.excludeChars = []
        self.positionMatch = []
        self.positionMisMatch = []
        self.shortlistWords= []
        with open(src_file, mode='r') as in_file:
            for line in in_file:
                self.shortlistWords.append(line.strip())

    def addIncludeChars(self, includeCharArray):
        logger.debug(includeCharArray)
        for includeChar in includeCharArray:
            if includeChar in self.excludeChars:
                raise ValueException
            if includeChar not in self.includeChars:
                self.includeChars.append(includeChar)

    def addExcludeChars(self, excludeCharArray):
        logger.debug(excludeCharArray)
        for excludeChar in excludeCharArray:
            if excludeChar in self.includeChars:
                raise ValueException
            if excludeChar not in self.excludeChars:
                self.excludeChars.append(excludeChar)

    def addPositionMatch(self, positionMatchArray):
        logger.debug(positionMatchArray)
        for positionMatch in positionMatchArray:
            if positionMatch in self.positionMisMatch:
                raise ValueException
            if positionMatch not in self.positionMatch:
                self.positionMatch.append(positionMatch)

    def addPositionMisMatch(self, positionMisMatchArray):
        logger.debug(positionMisMatchArray)
        for positionMisMatch in positionMisMatchArray:
            if positionMisMatch in self.positionMatch:
                raise ValueException
            if positionMisMatch not in self.positionMisMatch:
                self.positionMisMatch.append(positionMisMatch)

    def get5LetterWords(self, dst_file):
        with open('/usr/share/dict/words', mode='r') as in_file, \
            open(dst_file, mode='w') as out_file:
            for line in in_file:
                # remove acronymns - words with Upper Case
                if len(line.strip()) == 5 and not any(alphabet.isupper() for alphabet in line):
                    out_file.write(line)

    # if guess=arise, result=MMXXX, then pattern ar[a-z][a-z][a-z]
    def getPositionPattern(self, guess, result):
        logger.debug("guess:%s" % guess)
        logger.debug("result:%s" % result)
        pattern = ""
        foundCharArray = []
        for i in range(0,5):
            if result[i] == 'M':
                pattern = pattern + guess[i]
                foundCharArray.append(guess[i])
            else:
                pattern = pattern + "[a-z]"
                if result[i] == 'X' and guess[i] not in foundCharArray:
                    self.addExcludeChars([guess[i]])
        logger.debug("pattern:%s" % pattern)
        return([pattern])

    # if guess=arise, result=PPXXX, then pattern ["a[a-z][a-z][a-z][a-z]","[a-z]r[a-z][a-z][a-z]"]
    def getPositionMisPattern(self, guess, result):
        logger.debug("guess:%s" % guess)
        logger.debug("result:%s" % result)
        patternArray = []
        for i in range(0,5):
            pattern = ""
            if result[i] == 'P':
                pattern = ("[a-z]" * i) + guess[i] + ("[a-z]" * (4-i))
                patternArray.append(pattern)
                self.addIncludeChars([guess[i]])
        logger.debug("pattern:%s" % patternArray)
        return(patternArray)

    def getShortList(self, guess, result):
        logger.debug("guess:%s" % guess)
        logger.debug("result:%s" % result)
        result = result.upper()
        # if there's a match, create pattern and add to positionMatch
        if re.search('M', result):
            self.addPositionMatch(self.getPositionPattern(guess, result))
        if re.search('P', result):
            self.addPositionMisMatch(self.getPositionMisPattern(guess, result))

        if result == 'XXXXX':
            for i in range(0,5):
                self.addExcludeChars([guess[i]])

        out_array = []
        for word in self.shortlistWords:
            if not any(excludeChar in word for excludeChar in self.excludeChars) and \
               all(includeChar in word for includeChar in self.includeChars):
                if len(self.positionMatch) == 0 and len(self.positionMisMatch) == 0:
                    logger.debug("no position nor mismatch pattern - added word:%s" % word)
                    out_array.append(word)
                elif len(self.positionMatch) == 0 and len(self.positionMisMatch) > 0:
                    if not any( re.search(mispositionpattern, word) for mispositionpattern in self.positionMisMatch ):
                        logger.debug("no position but there's a mismatch pattern - added word:%s" % word)
                        out_array.append(word)
                else:
                    if all( re.search(positionpattern, word) for positionpattern in self.positionMatch) and \
                       not any( re.search(mispositionpattern, word) for mispositionpattern in self.positionMisMatch ):
                        logger.debug("there's position and mismatch pattern - added word:%s" % word)
                        out_array.append(word)
        self.shortlistWords = out_array
        return( self.shortlistWords )

    def promptLoop(self):
        complete = False
        while( not complete ):
            guess_complete = False
            while( not guess_complete ):
                guess = input("\nEnter 5-char word guess:").lower()
                if ( len(guess) != 5 and not re.search("[a-z][a-z][a-z][a-z][a-z]", guess) ):
                    print("must enter 5 alphabet chars")
                else:
                    guess_complete = True
            result_complete = False
            while( not result_complete ):
                result = input("Enter result (m:positional match, p:partial match, x:no match):").lower()
                if (len(result) != 5 or not re.search("[mpx]{5,5}",result)):
                    print("must have 5 characters m/p/x")
                else:
                    result_complete = True
                    if re.search("mmmmm", result):
                        print("\nCongrats! The word is:", end=' ')
                        complete = True
            shortList = wordleAssist.getShortList(guess, result)
            lastIndex = len(shortList)
            if lastIndex > 0:
                for i in range(0, lastIndex):
                    if ((i!=0) and (i % 10 == 9)) or (i == (lastIndex - 1)):
                        print(shortList[i])
                    else:
                        print(shortList[i], end=', ')
            else:
                print("no words found")



if __name__ == "__main__":

    #get5LetterWords('/usr/share/dict/words', '5letterwords.txt')
    wordleAssist = WordleAssist('/users/jasonlau/Software/WordleAssist/5letterwords.txt')
    wordleAssist.promptLoop()
