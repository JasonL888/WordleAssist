$(function(){
  console.log('enter ready')
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

  var Word = Backbone.Model.extend({
    defaults: function() {
      return {
        word: "arise",
        order: Words.nextOrder()
      };
    }
  });

  var WordList = Backbone.Collection.extend({
    model: Word,
    localStorage: new Backbone.LocalStorage("word-list"),
    nextOrder: function() {
      if (!this.length) return 1;
      return this.last().get('order') + 1;
    },
    comparator: 'order'
  });

  var Words = new WordList

  var WordView = Backbone.View.extend({
    tagName: "div",
    template: _.template($('#word-item-template').html()),
    events: {},
    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
    },
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    }
  });

  var AppView = Backbone.View.extend({
    el: $("#app_container"),

    events: {
      "keypress #result": "createGuessOnEnter"
    },

    initialize: function() {
      this.guess = this.$("#guess");
      this.result = this.$("#result");
      this.errorMsg = this.$("#error-msg")

      this.listenTo(Guesses, 'add', this.addOneGuess);
      this.listenTo(Guesses, 'reset', this.addAllGuess);
      this.listenTo(Guesses, 'all', this.render);
      this.listenTo(Guesses, 'invalid', function(model, error, options){
        this.errorMsg.empty().append(error)
        console.log('error:' + error )
      });

      Guesses.fetch();

      this.wordlist = this.$("#word-list")

      this.listenTo(Words, 'add', this.addOneWord);
      this.listenTo(Words, 'reset', this.addAllWords);
      this.listenTo(Words, 'all', this.render);

      //shortlistWords.forEach(function(item,index){
      //  Words.create({word:item});
      //});
    },

    render: function() {

    },

    addOneGuess: function(Guess) {
      var guessview = new GuessView({model:Guess});
      this.$("#guess-list").append(guessview.render().el);
    },

    addAllGuess: function() {
      Guesses.each(this.addOneGuess, this);
    },

    createGuessOnEnter: function(e) {
      var ENTER_KEY = 13
      console.log('received:' + e);
      //if not Enter keyCode 13
      if (e.keyCode != ENTER_KEY)
        return;
      if (!this.guess.val() && !this.result.val() )
        return;
      Guesses.create(
        {
          guess:this.guess.val().toLowerCase(),
          result:this.result.val().toLowerCase()
        },
        { validate: true }
      );
      this.guess.val('');
      this.result.val('');
    },

    addOneWord: function(Word) {
      var wordview = new WordView({model:Word});
      this.$("#word-list").append(wordview.render().el);
    },

    addAllWords: function() {
      Words.each(this.addOneWord, this);
    }
  });

  var App = new AppView;
  console.log('exit ready')
});
