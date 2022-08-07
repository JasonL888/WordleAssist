$(function(){
  var Guess = Backbone.Model.extend({
    defaults: function() {
      return {
        guess: "arise",
        result: "mxpxx",
        order: Guesses.nextOrder()
      };
    },
    validate: function(attrs, options) {
      if (!/^[a-zA-Z]{5,5}$/.test(attrs.guess)) {
        return "guess[" + attrs.guess + "] must be 5 characters";
      }
      else if (!/^[mxpMXP]{5,5}$/.test(attrs.result)) {
        return "result[" + attrs.result + "] must be 5 characters of m:match,p:partial,x:no match";
      }
    }
  });

  var GuessList = Backbone.Collection.extend({
    model: Guess,
    localStorage: new Backbone.LocalStorage("guest-result"),
    nextOrder: function() {
      if (!this.length) return 1;
      return this.last().get('order') + 1;
    },
    comparator: 'order'
  });

  var Guesses = new GuessList;

  var GuessView = Backbone.View.extend({
    tagName: "li",
    template: _.template($('#guess-item-template').html()),
    events: {
      "click a.destroy": "clear"
    },
    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'destroy', this.remove);
    },
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    },

    clear: function() {
      this.model.destroy();
    }
  });

  var AppView = Backbone.View.extend({
    el: $("#app_container"),

    events: {
      "keypress #new-guess": "createGuessOnEnter",
      "keyup #guess": "autoTab"
    },

    initialize: function() {
      this.guess = this.$("#guess");
      this.result = this.$("#result");
      this.errorMsg = this.$("#error-msg");
      this.errorMsg.hide();
      this.shortlist = shortlistWords.slice();
      this.wordlist = this.$("#word-list");

      this.listenTo(Guesses, 'add', this.addOneGuess);
      this.listenTo(Guesses, 'reset', this.addAllGuess);
      this.listenTo(Guesses, 'all', this.render);
      this.listenTo(Guesses, 'invalid', function(model, error, options){
        this.errorMsg.show();
        this.errorMsg.empty().append(error);
        console.log('error:' + error );
      });
      this.listenTo(Guesses, 'remove', function(model, error, options) {
        console.log('received REMOVE event!')
        // re-add the entire word list as we need to re-filter
        this.shortlist = shortlistWords.slice();
      });

      Guesses.fetch();
    },

    render: function() {
      var includeChars = [];
      var excludeChars = [];
      var excludeMultiChars = [];
      var positionMatch = [];
      var partialPositionMatch = [];

      // obtain all the models from collection
      // for each model,
      //    look at guess and result char by char
      //    if a character is 'x' - add to excludeChar list
      //    if a character is either 'p' or 'm' - add to includeChar list
      //    if a character is 'm' - create position match regex
      Guesses.each(function(model) {
        console.log('guess:' + model.get("guess"));
        var guess = model.get("guess");
        var result = model.get("result");
        for (var i=0; i < result.length; i++) {
          if ( result.charAt(i) == 'x' ) {
            if (!excludeChars.includes(guess.charAt(i)))
            {
              if (!includeChars.includes(guess.charAt(i)))
              {
                console.log('add excludeChars[' + guess.charAt(i) + ']');
                excludeChars.push(guess.charAt(i));
              }
              else
              {
                // case of double char in guess word,
                // eg. colon but actual word only has 1 O
                // => need to exclude any word with 2 Os
                console.log('add excludeMultiChars[' + guess.charAt(i)+ ']')
                excludeMultiChars.push(guess.charAt(i));

              }
            }
          }
          else if ( result.charAt(i) == 'm' || result.charAt(i) == 'p')
          {
            console.log('found m or p in result')
            if (!includeChars.includes(guess.charAt(i)))
            {
              console.log('add includeChars[' + guess.charAt(i) + ']')
              includeChars.push(guess.charAt(i))
            }
            // check and remove if same char in excludeChar - happens when word has double letters
            if (excludeChars.includes(guess.charAt(i))){
              for( var j=0; j < excludeChars.length; j++ ){
                if ( excludeChars[j] == guess.charAt(j) ) {
                  excludeChars.splice(j,1);
                }
              }
            }

            // form the regex for m and p
            pattern = ""
            for( var k=0; k<5; k++) {
              if (k == i) {
                pattern += guess.charAt(i)
              }
              else {
                pattern += "[a-z]"
              }
            }
            console.log('pattern:' + pattern)
            if ( result.charAt(i) == 'm') {
              positionMatch.push(new RegExp(pattern))
              console.log('positionMatch:' + positionMatch)
            }
            else {
              // ie. 'p'
              partialPositionMatch.push(new RegExp(pattern))
              console.log('partialPositionMatch:' + partialPositionMatch)
            }
          }
        }
      });
      // for each shortlist word,
      //    check if
      //    - it has includeChar and
      //    - does not have excludeChar
      //    - match the regex
      //    if so, add to temp array
      //  set shortlist to temp
      let candidateWords = []
      this.shortlist.forEach(function(item,index) {
        var containIncludes = includeChars.every((element) => item.indexOf(element) != -1);
        var containExcludes = excludeChars.some((element)=> item.indexOf(element) != -1);
        var containMultiChars = excludeMultiChars.some((element) => (item.split(element).length - 1) > 1);

        if (containExcludes || containMultiChars ) {
          console.log('skip word[' + item + ']')          // skip word
        }
        else {
          var toAddFlag = false;
          if (includeChars.length == 0) {
            //console.log('no include chars')
            toAddFlag = true;
          }
          else {
            if (containIncludes) {
              console.log('found include char - add ['+ item + ']')
              toAddFlag = true;
            }
          }
          if (toAddFlag){
            // check with regex
            if (positionMatch.length == 0 && partialPositionMatch.length == 0) {
              console.log('since no patterns - just add')
              candidateWords.push(item)
            }
            else
            {
              // if patterns exist,
              //     add only f all patterns match
              //     reject if at least one pattern don't match
              // if partial pattern exist,
              //     add only if word does not match all patterns
              //     reject if at least one pattern match
              var patNoMatch = positionMatch.some((patItem) => patItem.test(item) == false);
              if ( positionMatch.length > 0 && patNoMatch ) {
                console.log('pattern exists and at least one not matching so skip:' + item)
                return;
              }

              var partPatMatch = partialPositionMatch.some((patItem) => patItem.test(item) == true);
              if ( partialPositionMatch.length > 0 && partPatMatch ) {
                console.log('partial pattern exist and at least one matching so skip:' + item)
                return;
              }

              console.log('either pattern match or all partial pattern not matching, so add:' + item)
              candidateWords.push(item)

            }
          }
        }
      });

      console.log('this.shortlist before len:' + this.shortlist.length)
      this.shortlist = candidateWords.slice()
      console.log('this.shortlist after len:' + this.shortlist.length)

      if (this.shortlist.length > 2000)
      {
        console.log('too many words to display')
        this.$("#word-list").hide()
      }
      else
      {
        console.log('display what we have')
        this.$("#word-list").show()
        this.$("#word-list").empty()
        var lastIndex = this.shortlist.length - 1;
        this.shortlist.forEach(function(item,index){
          this.$("#word-list").append(item);
          if (index != lastIndex)
              this.$("#word-list").append(", ");
        });
      }

    },

    addOneGuess: function(Guess) {
      var guessview = new GuessView({model:Guess});
      this.$("#guess-list").prepend(guessview.render().el);
    },

    addAllGuess: function() {
      Guesses.each(this.addOneGuess, this);
    },

    createGuessOnEnter: function(e) {
      var ENTER_KEY = 13
      //console.log('createGuessOnEnter:' + JSON.stringify(e));
      //if not Enter keyCode 13
      if (e.keyCode != ENTER_KEY)
        return;
      if (!this.guess.val() && !this.result.val() )
        return;
      if (Guesses.create(
        {
          guess:this.guess.val().toLowerCase(),
          result:this.result.val().toLowerCase()
        },
        { validate: true }
      ) != false ) {
        this.guess.val('');
        this.guess.focus();
        this.result.val('');
        this.errorMsg.hide();
      }
    },

    autoTab: function(e) {
        //console.log('autotab:' + JSON.stringify(e))
        if (this.guess.val().length == 5) {
          this.result.focus()
        }
    }
  });

  var App = new AppView;
});
