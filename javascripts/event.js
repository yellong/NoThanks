(function (root) {

    var game = root.NoThanks;
    var Player = root.Player;
    var players = game.players;

    $('.add_player').on('click', function(){
        add_player();
    });

    $('input.player_name').on('keypress', function (e) {
        if (e.which === 13) {
            add_player();
        }
    });

    $('.player_list').on('mouseenter', 'li',function (e) {
        $(this).find('.del_btn').show();
    }).on('mouseleave', 'li',function () {
        $(this).find('.del_btn').hide();
    }).on('click', '.del_btn', function () {
        $(this).parents('li').remove();
        checkPlayer();
    });

    $('.start_game').on('click', function () {
        if(checkPlayer())game.start();
    });

    function add_player(name) {
        var player_name = name || $('input.player_name').val().replace(/^[\s]*|[\s]*$/g, '');
        if (player_name && !players.findWhere({name:player_name})) {
            players.add(new Player({ name:player_name }));
            $('.player_list').append('<li>' + player_name + '<a href="##" style="display: none" class=del_btn>删除</a></li>');
        }
        $('input.player_name').val('');
        checkPlayer();
    }

    function checkPlayer() {
        if (players.length >= 4) {
            $('.start_game').show();
            return true;
        } else {
            $('.start_game').hide();
            return false;
        }
    }

})(this);