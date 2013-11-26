(function(root){
    var Player = root.Player = Backbone.Model.extend({
        defaults:{
            bet:11,
            score:0,
            cards:[],
            name:'',
            groups:'',
            currCard:null
        },
        randomPic:function(){
            return 'images/'+ _.random(1,17) +'.png';
        },
        initialize:function(){
            this.set('pic',this.randomPic());
            this.set('id',this.get('name'));
        },
        reScore:function(){

            //对收下的card升序排列
            var cards = _.sortBy(this.get('cards').slice(0),function(a){return a}),
                score = 0,
                groups = [];

            //如果下一张card是连续的，就不统计进得分,并且添加进分组
            for(var i = 0;i<cards.length;i++){
                var group = [ cards[i] ];
                score -= cards[i];
                while(cards[i+1]-cards[i]==1){
                    group.push(cards[++i]);
                }
                groups.push(group);
            }

            //最终得分还得加上筹码数量
            score += this.get('bet');

            this.set('groups',groups);
            this.set('score',score);
            return score;
        },
        receiveCard:function(card){
            console.log('%s receive a card[%d,%d]',this.get('name'),card.value,card.bet);
            this.set('currCard',card);
            this.trigger('receiveCard',card);
        },
        accept:function(card){

            //确定是不是轮到自己
            if(!card){
              if(this.get('currCard')){
                  card = this.get('currCard');
              }else{
                  console.log('It\'s not %s\'s trun.',this.get('name'));
                  return;
              }
            }

            var bet = card.bet || 0;

            //接牌时也会得到筹码
            var cards = this.get('cards').slice(0)
                cards.push(card.value);
            this.set('cards',cards);
            this.set('bet',this.get('bet')+bet||0);
            this.reScore();
            
            console.log('%s accept card[%d,%d],now he has %d bet and %d score.',
                this.get('name'),card.value,card.bet,this.get('bet'),this.get('score'));

            this.set('currCard',null);

            //触发accept事件
            return this.trigger('accept',this);
        },
        pass:function(card,additionalBet){

            //确定是不是轮到自己
            if(!card){
                if(this.get('currCard')){
                    card = this.get('currCard');
                }else{
                    console.log('It\'s not %s\'s trun.',this.get('name'));
                    return;
                }
            }

            this.set('currCard',null);

            //pass使用筹码默认为1，如果筹码不够，触发“筹码不够事件”
            var playerBet = this.get('bet');
            additionalBet = additionalBet || 1;
            if(playerBet<additionalBet){
                console.log("%s has not enough bets[%d] to pass card[%d,%d]",
                this.get('name'),additionalBet,card.value,card.bet);
                return this.trigger('notEnoughBetToPass',card);
            }

            this.set('bet',playerBet-additionalBet);
            card.bet = card.bet+additionalBet;

            console.log("%s pass card[%d,%d] with added %d bets.",
                this.get('name'),card.value,card.bet,additionalBet);

            return this.trigger('pass',card);
        }
    });

    var Players = root.Players = Backbone.Collection.extend({
        model:Player
    });

    var NoThanks = Backbone.Model.extend({
        initialize:function(){
            this.curr = 0;
            this.cards = _.shuffle(_.range(3, 36));
            this.players = new Players();
        },
        //打散数组
        shuffle: function () {
            return this.cards = _.shuffle(this.cards);
        },
        //发牌给某个玩家
        dealTo: function (player,card) {

            if(!player){
                console.log('which player to deal to?');
                return;
            }

            //牌组发完了就over了
            if(_.isEmpty(this.cards)){
                console.log('Card is clean out!');
                return this.gameOver();
            }

            //打乱洗牌，并发一张牌
            this.shuffle();
            card = card || {value:this.cards.shift(),bet:0};
            if (_.isFunction(player.receiveCard)) {
                console.log('Send a card[%d,%d] to %s!',card.value,card.bet,player.get('name'));
                this.currPlayer = root.currPlayer = player;
                player.receiveCard(card);
            }
            return card;
        },
        //下一个玩家
        next: function (card) {
            if (!card)return;
            var curr = this.get('curr');
            this.set('curr',(curr+1)%this.players.size());
            this.dealTo(this.players.at(this.get('curr')),card);
        },
        //游戏开始
        start: function (players) {
            console.log('NoThanks game started!');
            if(players && !_.isEmpty(players))this.players = players;
            console.log('Players:',JSON.stringify(this.players.map(function(player){
                return player.get('name');
            })));
            this.listenTo(this.players, 'pass', this.next);
            this.listenTo(this.players, 'accept', this.dealTo);

            this.trigger('start',this.players);

            //给第一位玩家发牌
            this.set('curr',0);
            this.dealTo(this.players.at(0));
        },
        gameOver:function(){
            console.log('Game over!');
            this.trigger('gameOver',this.players);
        }

    });

    root.NoThanks = new NoThanks();
})(this)
