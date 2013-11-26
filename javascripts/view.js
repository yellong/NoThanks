(function (root) {

    var game = root.NoThanks;

    var PlayerView = Backbone.View.extend({
        tagName:'div',
        className:'player',
        template: _.template($('#player-tpl').html()),
        events:{
            'click .accept':'accept',
            'click .pass':'pass',
            'mouseenter .card':function(e){
                var $card = $(e.target);
                var old_z_index = $card.css('z-index');
                $card.css('z-index',999).data('oldzindex',old_z_index);
            },
            'mouseleave .card':function(e){
                var $card = $(e.target);
                var old_z_index = $card.data('oldzindex');
                $card.css('z-index',old_z_index);
            }
        },
        initialize: function() {
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'receiveCard', this.receiveCard);
            this.listenTo(this.model, 'notEnoughBetToPass', this.notEnoughBetToPass);
        },
        receiveCard:function(card){

        },
        accept:function(){
            this.model.accept();
        },
        pass:function(){
            this.model.pass();
        },
        notEnoughBetToPass:function(){

        },
        render:function(){
            var player = this.model.toJSON();
            this.$el.html(this.template(player))
                .attr('id', 'player-' + player.name)
                .find('.group').each(function (i, group) {
                    var h = 10;
                    $(group).find('.card').each(function (i, card) {
                        var z_index = 100 - i;
                        $(card).css({
                            top: i * 18 + "px",
                            left: i * 6 + "px",
                            '-webkit-transform': 'rotate(' + 15 / i + 'deg)',
                            'z-index': z_index
                        });
                        h += $(card).height();
                    });
                    $(group).height(h);
                });
            return this;
        }
    });

    var GameView = Backbone.View.extend({
        el:'.players',
        initialize:function(){
            this.listenTo(this.model,'gameOver',this.gameOver);
            this.listenTo(this.model.players,'receiveCard',this.receiveCard);
            this.listenTo(this.model,'start',this.render);
        }
        ,gameOver:function(){

        }
        ,render:function(){
            this.model.players.each(this.renderPlayer,this);
            return this;
        }
        ,renderPlayer:function(player){
            var playerView = new PlayerView({model:player});
            this.$el.append(playerView.render().el);
        }
        ,receiveCard:function(card){
            this.$('.curr').removeClass('curr').find('.tip').css('opacity','0');
            var $curr = this.$('#player-'+this.model.currPlayer.get('name')).addClass('curr');
                $curr.find('.tip').css('opacity','1')
                $curr.find('.receive').html(card.value);
                $curr.find('.betInCard').html(card.bet);

        }
    });

    game.on('start',function () {
        $('#p1').hide();
    });

    new GameView({model:game});
})(this)