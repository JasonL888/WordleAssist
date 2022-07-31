with open('5letterwords.txt', mode='r') as in_file:
    print("let shortlistWords=", end="[")
    for line in in_file:
        print('"%s"' % line.strip(), end=",")
    print("]")
