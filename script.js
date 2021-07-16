let newGameName; //not sure if this is actually used yet

/**
 * Creates game-JSON with all players that were added in createGameModal.
 * Also creates a match-JSON with an empty [] as value. This [] will be populated with generateMatches().
 * @param {event} ev 
 */
function generateGame(ev){
    ev.preventDefault();
    game = [];
    matches = [];
    let numberOfPlayers = $('.new-player').length
    console.log("Number of players:");
    console.log(numberOfPlayers);

    $('.new-player').each(function(index) {        
        let player = {
            playerId: index+1,
            playerName: $(this).find('input').val(),
            gamesPlayed: 0,
            points: 0
        }
        game.push(player);
      });

    //save to localStorage: both json for players and score(game) and matches(list of all matches for this game)
    newGameName = $('#newTournementName').val();
    localStorage.setItem(newGameName, JSON.stringify(game));
    localStorage.setItem(newGameName + '-matches', JSON.stringify(matches));

    $('#newGameForm')[0].reset();
    console.log("game created!");
}

/**
 * Creates a new inputField for adding player to createGameModal
 * @param {event} ev 
 */
function addPlayerInputField(ev) {
    ev.preventDefault();
    $('.add-players').append('<div class="new-player"><label for="lname">Player name: </label><input type="text" id="playerName" name="playerName"><i class="far fa-times-circle delete-player"></i><br><br></div>');

    //add eventListener for new delete icon
    $('.delete-player').on('click', function(event) {
        $(this).parent('div').remove();
    })
}

/**
 * Updates/displays gameTable based on values in game-JSON.
 * Removes all "old" rows inside table body, and then adds new updated table rows
 */
function updateGameTableDisplay(){
    //removes "old" table rows
    $('tbody').empty();

    //adds new and updated table rows 
    let gameObj = localStorage.getItem('Beerio 2021'); //change to work dynamically!!
    parsedGameObj = JSON.parse(gameObj);
    for (let i=0; i<parsedGameObj.length; i++){
        playerNameValue = parsedGameObj[i]['playerName'];
        gamesPlayedValue = parsedGameObj[i]['gamesPlayed'];
        playerPointsValue = parsedGameObj[i]['points'];
        newTableRow = '<tr><td>' + playerNameValue + '</td><td>' + gamesPlayedValue + '</td><td>' + playerPointsValue + '</td></tr>';
        $('tbody').append(newTableRow);
    }    
}

/**
 * Generates all matches consisting off random players selected in each match. Each player will play 8 matches. 
 * Updates matches-JSON.
 * @param {event} ev 
 */
function generateMatches(ev) {
    ev.preventDefault();
    let gameObj = localStorage.getItem('Beerio 2021'); //change to work dynamically!!
    parsedGameObj = JSON.parse(gameObj);

    let numberOfPlayers = parsedGameObj.length;
    numberOfMatches = (numberOfPlayers*8)/4; //each player will have 8 matches. Number of matches is therefor numberOfPlayers*8/4 since 4 players play pr match

    let playerOverviewObj = {};
    let matchesObj = {};
    
    console.log('numberOfmatches: ' + numberOfMatches);

    //adding playerName[key] and playerNumberOfAssignedMatches[value] to playersObj
    for (let i=0; i<numberOfPlayers; i++){        
        let playerName = parsedGameObj[i]['playerName'];
        playerOverviewObj[playerName] = 0;
    }

    let playerNamesList = Object.keys(playerOverviewObj);
    let potentialPlayersForNextMatchList = Object.keys(playerOverviewObj);

    for (let i=0; i<numberOfMatches; i++){
        let matchNumber = i + 1;
        let matchPlayersList = [];
        while (matchPlayersList.length<4){
            //If there are no potential players for next match left, refill list with all player names
            if (potentialPlayersForNextMatchList.length === 0){
                potentialPlayersForNextMatchList = Object.keys(playerOverviewObj);
            }

            let randomInt = Math.floor(Math.random() * potentialPlayersForNextMatchList.length);
            let randomlySelctedplayerName = potentialPlayersForNextMatchList[randomInt];
            if ( playerOverviewObj[randomlySelctedplayerName]<8) { //checks that player is assigned to less than 8 matches
                if (!(matchPlayersList.includes(randomlySelctedplayerName))){ //checks that player is not already ssigned to this match
                    matchPlayersList.push(randomlySelctedplayerName);
                    playerOverviewObj[randomlySelctedplayerName] += 1;
                    potentialPlayersForNextMatchList.splice(randomInt,1);
                }
            }            
        }

        //update matches in localstorage
        let matchesObj = localStorage.getItem('Beerio 2021-matches'); //change to work dynamically!!
        parsedMatchesObj = JSON.parse(matchesObj);
        let newlyGeneratedMatch = {
            matchId: matchNumber,
            players: matchPlayersList,
            result: []
        }
        parsedMatchesObj.push(newlyGeneratedMatch);
        localStorage.setItem('Beerio 2021-matches', JSON.stringify(parsedMatchesObj)); //change to work dynamically!!
    }

    updateMatchesList();
}

/**
 * Updates/displays list with all matches, by adding list items that include matchId and match players.
 * Removes all "old" match list items, and adds new updated match list items.
 */
function updateMatchesList() {
    //removes "old" match list item
    $('.matches-list').empty();

    //loop through matches JSON and create new updated match list items
    let matchesObj = localStorage.getItem('Beerio 2021-matches'); //change to work dynamically!!
    parsedMatchesObj = JSON.parse(matchesObj);

    for (let i=0; i<parsedMatchesObj.length; i++){
        newListRow = 
            '<li class="list-group-item">' +
                '<div class="match-info">' + 
                    'Match <span class="match-id">' + parsedMatchesObj[i]['matchId'] + '</span>: ' + 
                    '<span class="match-player-1">' + parsedMatchesObj[i]['players'][0] + '</span>, ' + 
                    '<span class="match-player-2">' + parsedMatchesObj[i]['players'][1] + '</span>, ' + 
                    '<span class="match-player-3">' + parsedMatchesObj[i]['players'][2] + '</span>, ' + 
                    '<span class="match-player-4">' + parsedMatchesObj[i]['players'][3] + '</span> ' + 
                    '<button type="button" class="btn" data-bs-toggle="modal" data-bs-target="#updateMatchResultModal"><i class="fas fa-edit"></i></button>' + 
                '</div>' +
            '</li>'
        $('.list-group').append(newListRow);
    }
}

/**
 * THIS FUNCTION SHOULD NOT BE USED
 * @param {string} playerName name of the player
 * @param {number} placement placement in a match
 */
function updatePlayerPoints(playerName, placement) {
    //update players points based on placement, and increases playedGames with 1
    let gameObj = localStorage.getItem('Beerio 2021'); //change to work dynamically!!
    let parsedGameObj = JSON.parse(gameObj);
    let newPoints = 4-placement;

    for (let i=0; i<parsedGameObj.length; i++) {
        if (parsedGameObj[i].playerName === playerName) {
            parsedGameObj[i].points += newPoints;
            parsedGameObj[i].gamesPlayed += 1;
           break;
        }
    }
    localStorage.setItem('Beerio 2021', JSON.stringify(parsedGameObj)); //change to work dynamically!!
}

/**
 * Sets paramter playerPoints for given player.
 * @param {string} playerName 
 * @param {number} points 
 */
function setPlayerPoints(playerName, points) {
    let gameObj = localStorage.getItem('Beerio 2021'); //change to work dynamically!!
    let parsedGameObj = JSON.parse(gameObj);

    for (let i=0; i<parsedGameObj.length; i++) {
        if (parsedGameObj[i].playerName === playerName) {
            parsedGameObj[i].points = points;
           break;
        }
    }
    localStorage.setItem('Beerio 2021', JSON.stringify(parsedGameObj)); //change to work dynamically!!
}

/**
 * Sets parameter gamesPlayed for given player.
 * @param {string} playerName 
 * @param {number} gamesPlayed 
 */
function setPlayerGamesPlayed(playerName, gamesPlayed) {
    let gameObj = localStorage.getItem('Beerio 2021'); //change to work dynamically!!
    let parsedGameObj = JSON.parse(gameObj);

    for (let i=0; i<parsedGameObj.length; i++) {
        if (parsedGameObj[i].playerName === playerName) {
            parsedGameObj[i].gamesPlayed = gamesPlayed;
           break;
        }
    }
    localStorage.setItem('Beerio 2021', JSON.stringify(parsedGameObj)); //change to work dynamically!!
}

/**
 * Updates values in matchResultModal (matchId, playerNames) that is about to be shown when this button is clicked
 * @param {event} ev 
 * @param {html-element} buttonClicked button from matches list from html
 */
function updateMatchResultModal(ev, buttonClicked){
    ev.preventDefault();

    //craete if statement checking if match is playes (result is not empty). If match is not played input value should be null

    //update modal title with matchId, and labels with players
    let matchId = $(buttonClicked).parent().find('.match-id').text();    
    let player1 = $(buttonClicked).parent().find('.match-player-1').text();
    let player2 = $(buttonClicked).parent().find('.match-player-2').text();
    let player3 = $(buttonClicked).parent().find('.match-player-3').text();
    let player4 = $(buttonClicked).parent().find('.match-player-4').text();


    $('#updateMatchResultModal').find('.modal-title-matchId').text(matchId);
    $('#updateMatchResultModal').find('label[for="player1Placement"]').text(player1);
    $('#updateMatchResultModal').find('label[for="player2Placement"]').text(player2);
    $('#updateMatchResultModal').find('label[for="player3Placement"]').text(player3);
    $('#updateMatchResultModal').find('label[for="player4Placement"]').text(player4);
}


/**
 * Saves/Updates match result. Triggered after hitting save-button on updateMatchResultModal
 * @param {event} ev 
 */
function updateMatchResult(ev) {
    ev.preventDefault();

    let matchId = $('#updateMatchResultModal').find('.modal-title-matchId').text(); //matchId as string
    let player1 = $('#updateMatchResultModal').find('label[for="player1Placement"]').text();
    let player2 = $('#updateMatchResultModal').find('label[for="player2Placement"]').text();
    let player3 = $('#updateMatchResultModal').find('label[for="player3Placement"]').text();
    let player4 = $('#updateMatchResultModal').find('label[for="player4Placement"]').text();

    let player1Placement = $('#updateMatchResultModal').find('#player1Placement').val();
    let player2Placement = $('#updateMatchResultModal').find('#player2Placement').val();
    let player3Placement = $('#updateMatchResultModal').find('#player3Placement').val();
    let player4Placement = $('#updateMatchResultModal').find('#player4Placement').val();

    let matchResult = [];
    matchResult[player1Placement-1] = player1;
    matchResult[player2Placement-1] = player2;
    matchResult[player3Placement-1] = player3;
    matchResult[player4Placement-1] = player4;

    setMatchResult(parseInt(matchId), matchResult);
    updatePlayerPointsAndGamesPlayedFromAllMatchResults()
    updateGameTableDisplay();
}

/**
 * 
 * @param {number} matchId 
 * @param {string[]} result 
 */
function setMatchResult(matchId, result) {
        //get data from localstorage
        let matchesObj = localStorage.getItem('Beerio 2021-matches'); //change to work dynamically!!
        let parsedMatchesObj = JSON.parse(matchesObj);        
    
        for (let i=0; i<parsedMatchesObj.length; i++) {
            if (parsedMatchesObj[i].matchId === matchId) {
                parsedMatchesObj[i].result = result;
               break;
            }
        }
    
        //Update localstorage with results
        localStorage.setItem('Beerio 2021-matches', JSON.stringify(parsedMatchesObj)); //change to work dynamically!!
}

/**
 * Updates player points and gamesPlayed for all players in game-JSON based on match results in matches-JSON
 */
function updatePlayerPointsAndGamesPlayedFromAllMatchResults() {
    let gameObj = localStorage.getItem('Beerio 2021'); //change to work dynamically!!
    let parsedGameObj = JSON.parse(gameObj);

    let matchesObj = localStorage.getItem('Beerio 2021-matches'); //change to work dynamically!!
    let parsedMatchesObj = JSON.parse(matchesObj);

    //loop though all players
    for (let i=0; i<parsedGameObj.length; i++){
        let playerName = parsedGameObj[i].playerName;
        let playerPoints = 0;
        let playerPlayedGames = 0;

        //loop though all games
        for (let j=0; j<parsedMatchesObj.length; j++){
            if (parsedMatchesObj[j].result.length > 0){ //check that match has been played (then the result list is not empty)
                if (parsedMatchesObj[j].players.includes(playerName)){ //check if player played in this match
                    playerPlayedGames += 1;

                    //checking placement, and adding points
                    for (let k=0; k<4; k++) {
                        if (parsedMatchesObj[j].result[k] === playerName){
                            playerPoints += (3-k);
                            break;
                        }
                    }
                } 
            }
        } 
        //after looping through all games for this player, we set points and gamesPlayed
        setPlayerGamesPlayed(playerName, playerPlayedGames);
        setPlayerPoints(playerName, playerPoints);
        
    }
}


$(document).ready(function(){

    //running functions when page is entered/refreshed
    updatePlayerPointsAndGamesPlayedFromAllMatchResults()
    updateGameTableDisplay();
    updateMatchesList();

    
    //adding onClick-functions to buttons
    $('#generateGameButton').on('click', function(event) {
        generateGame(event);
    });

    $('#addPlayerInput').on('click',function(event) {
        addPlayerInputField(event);
    })

    $('.delete-player').on('click', function(event) {
        $(this).parent('div').remove();
    })

    $('#generateMatchesButton').on('click',function(event) {
        generateMatches(event);
    })

    $('button[data-bs-target="#updateMatchResultModal"]').on('click',function(event) {
        updateMatchResultModal(event, this);
    })

    $('#updateMatchResultbutton').on('click',function(event) {
        updateMatchResult(event);
    })
});

