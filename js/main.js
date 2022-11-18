function getSettings(params){
    return {
        "async": true,
        "crossDomain": true,
        "url": "https://sportscore1.p.rapidapi.com/" + params,
        "method": "GET",
        "headers": {
            "X-RapidAPI-Key": "0b216e3269msh47c6cc3317a848cp1c77eajsn07e83fd7567b",
            "X-RapidAPI-Host": "sportscore1.p.rapidapi.com"
        }
    }
}
function setMatchItem (elem, item) {
    elem.removeAttr('id');
    elem.find('#itemDate').text(getFormatDate(item.start_at));
    elem.find('#itemHomeName').text(getRuName(item.home_team.name_translations));
    elem.find('#itemAwayName').text(getRuName(item.away_team.name_translations));
    elem.find('#itemHomeImage').attr('style', 'background-image: url('+item.home_team.logo+');');
    elem.find('#itemAwayImage').attr('style', 'background-image: url('+item.away_team.logo+');');

    var scoreText = '-:-';
    if(item.home_score != null){
        if(item.home_score.current > item.away_score.current) scoreText = '<span>'+item.home_score.current+'</span>:'+item.away_score.current;
        else if(item.home_score.current < item.away_score.current) scoreText = item.home_score.current+':<span>'+item.away_score.current+'</span>';
        else scoreText = item.home_score.current+':'+item.away_score.current;
    }
    elem.find('#itemScore').html(scoreText);

    return elem;
}
function getFormatDate (date) {
    if(date.indexOf(' ') !== -1) date = date.split(' ')[0];
    date = date.split('-');
    return date[2]+"."+date[1]+"."+date[0];
}
function getGoalsText (num) {
    if (num === 1) return num+' гол';
    if (num=== 2 || num === 3 || num === 4) return num+' гола';
    return num+' голов';
}
function getWinsText(num) {
    if (num === 1) return num+' победа';
    if (num=== 2 || num === 3 || num === 4) return num+' победы';
    return num+' побед';
}
function getDrawsText(num) {
    if (num === 1) return num+' ничья';
    if (num=== 2 || num === 3 || num === 4) return num+' ничьи';
    return num+' ничьих';
}
function getRuName(data) {
    if(data.ru) return data.ru;
    else return data.en;
}

var homeTeamName = 'Ливерпуль',
    awayTeamName = 'Саутгемптон',
    event_date = '2022-11-12',
    query = 'sports/1/events/date/'+event_date+'?page=1',
    answer = false;

$.ajax(getSettings(query)).done(function (response) {
    response = response.data;
    if(response.length === 0) return;
    for (const key in response) {
        var home_team = response[key].home_team,
            away_team = response[key].away_team;
        if(home_team.name_translations.ru === homeTeamName || home_team.name_translations.ru === awayTeamName || away_team.name_translations.ru === homeTeamName || away_team.name_translations.ru === awayTeamName){
            var homeTeamId = home_team.id,
                awayTeamId = away_team.id;
            $('#HTI').attr('style', 'background-image: url('+home_team.logo+')');
            $('#ATI').attr('style', 'background-image: url('+away_team.logo+')');
            $.ajax(getSettings('teams/'+home_team.id+'/h2h-events/'+away_team.id)).done(function (response) {
                response = response.data; if(response.length === 0) return;
                console.log(response);

                var h2hBlock = $('#h2hStatistic'),
                    homeGoals = 0,
                    awayGoals = 0,
                    homeWins = 0,
                    awayWins = 0,
                    teamsDraws = 0;

                h2hBlock.find('#homeTeamName').text(homeTeamName);
                h2hBlock.find('#awayTeamName').text(awayTeamName);

                for (const item of response) {
                    if(item.status !== 'finished') continue;

                    var h2hItem = setMatchItem(h2hBlock.find('#toClone').clone(), item);

                    if(item.home_team.id === homeTeamId){
                        if(item.home_score.current > item.away_score.current) homeWins += 1;
                        else if(item.home_score.current < item.away_score.current) awayWins += 1;
                        else teamsDraws += 1;
                    }else{
                        if(item.home_score.current > item.away_score.current) awayWins += 1;
                        else if(item.home_score.current < item.away_score.current) homeWins += 1;
                        else teamsDraws += 1;
                    }


                    if(item.home_team.id === homeTeamId){
                        homeGoals += item.home_score.current;
                        awayGoals += item.away_score.current;
                    }else{
                        awayGoals += item.home_score.current;
                        homeGoals += item.away_score.current;
                    }

                    h2hBlock.find('#h2hEventsBody').append(h2hItem);
                }

                h2hBlock.find('#homeTeamGoals').text(getGoalsText(homeGoals));
                h2hBlock.find('#awayTeamGoals').text(getGoalsText(awayGoals));
                h2hBlock.find('#homeTeamWins').text(getWinsText(homeWins));
                h2hBlock.find('#TeamsDraws').text(getDrawsText(teamsDraws));
                h2hBlock.find('#awayTeamWins').text(getWinsText(awayWins));

                h2hBlock.find('#toClone').remove();
                h2hBlock.show();

            }).fail(function (error){
                console.log(error);
            });
        }
    }

}).fail(function (error){
    console.log(error);
});