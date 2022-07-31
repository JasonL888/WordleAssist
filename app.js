$(function(){
  console.log('enter ready')
  var Guess = Backbone.Model.extend({
    defaults: function() {
      return {
        guess: "arise",
        result: "mxpxx",
        order: Guesses.nextOrder()
      };
    }
  });

  var GuessList = Backbone.Collection.extend({
    model: Guess,
    localStorage: new Backbone.LocalStorage("wordle-assist"),
    nextOrder: function() {
      if (!this.length) return 1;
      return this.last().get('order') + 1;
    },
    comparator: 'order'
  });

  var Guesses = new GuessList;

  var GuessView = Backbone.View.extend({
    tagName: "li",
    template: _.template($('#item-template').html()),
    events: {},
    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
    },
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    }
  });

  var ShortList = Backbone.Model.extend({
    defaults: function() {
      return{
        words: shortlistWords
      };
    }
  });

  var ShortListView = Backbone.View.extend({

  });

  var AppView = Backbone.View.extend({
    el: $("#app_container"),

    events: {
      "keypress #new-guess": "createOnEnter"
    },

    initialize: function() {
      this.guess = this.$("#guess");
      this.result = this.$("#result");

      this.listenTo(Guesses, 'add', this.addOne);
      this.listenTo(Guesses, 'reset', this.addAll);
      this.listenTo(Guesses, 'all', this.render);

      Guesses.fetch();
    },

    render: function() {},

    addOne: function(Guess) {
      var view = new GuessView({model:Guess});
      this.$("#guess-list").append(view.render().el);
    },

    addAll: function() {
      Guesses.each(this.addOne, this);
    },

    createOnEnter: function(e) {
      var ENTER_KEY = 13
      console.log('received:' + e);
      //if not Enter keyCode 13
      if (e.keyCode != ENTER_KEY)
        return;
      if (!this.guess.val() && !this.result.val() )
        return;
      Guesses.create(
      {
        guess:this.guess.val(),
        result:this.result.val()
      });
      this.guess.val('');
      this.result.val('');
    }
  });

  var App = new AppView;
  console.log('exit ready')
});
