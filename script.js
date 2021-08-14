let formErrorMessage = "";


/**
 * Creates game-JSON with all players that were added in createGameModal.
 * Also creates a match-JSON with an empty [] as value. This [] will be populated with generateMatches().
 * @param {event} ev 
 */
function generateGame(ev){
    ev.preventDefault();
    let game = [];
    let matches = [];
    let numberOfPlayers = $('.new-player').length
    let newGameName = $('#newTournementName').val();
    let playerNamesForValidation = [];

    
    $('.new-player').each(function(index) {
        //for game-json
        let player = {
            playerId: index+1, //can probably remove this, it is not used. Player names are unique, and is used as id.
            playerName: $(this).find('input').val(),
            gamesPlayed: 0,
            points: 0
        }
        game.push(player);

        //for newGameFormValidation
        playerNamesForValidation.push($(this).find('input').val());
    });

    //validate if newGameForm is valid
    if (!(isNewGameFormValid(playerNamesForValidation, numberOfPlayers, newGameName))){
        alert("New game form is invalid, new game was not created!\nError message: " + formErrorMessage);
        //Resetting formErrorMessage after displaying it in alert.
        formErrorMessage = "";
        return;
    }

    //generate JSON-fiiles in localStorage: game-json, matches-json, createdDate-json    
    localStorage.setItem(newGameName, JSON.stringify(game));
    localStorage.setItem(newGameName + '-matches', JSON.stringify(matches));
    localStorage.setItem(newGameName + '-createdDate', new Date());

    generateMatches(newGameName);

    updateViewForAllGames();    

    $('#newGameForm')[0].reset();
}


/**
 * Generates all matches consisting off random players selected in each match. Each player will play 8 matches. 
 * Updates matches-JSON.
 * @param {event} ev 
 */
 function generateMatches(gameName) {
    let parsedGameObj = getParsedGameObj(gameName);
    let matchesKey = gameName + '-matches';

    let numberOfPlayers = parsedGameObj.length;
    numberOfMatches = (numberOfPlayers*8)/4; //each player will have 8 matches. Number of matches is therefor numberOfPlayers*8/4 since 4 players play pr match

    let playerOverviewObj = {};

    //adding playerName[key] and playerNumberOfAssignedMatches[value] to playersObj
    for (let i=0; i<numberOfPlayers; i++){        
        let playerName = parsedGameObj[i]['playerName'];
        playerOverviewObj[playerName] = 0;
    }

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
        let parsedMatchesObj = getParsedMatchesObj(gameName);

        let newlyGeneratedMatch = {
            matchId: matchNumber,
            players: matchPlayersList,
            result: []
        }
        parsedMatchesObj.push(newlyGeneratedMatch);
        localStorage.setItem(matchesKey, JSON.stringify(parsedMatchesObj)); //change to work dynamically!!
    }

    updateMatchesList(gameName);
}


/**
 * Creates a new inputField for adding player to createGameModal
 * @param {event} ev 
 */
function addPlayerInputField(ev) {
    ev.preventDefault();
    $('.add-players').append('<div class="new-player"><label for="">Player name: </label> <input type="text" id="playerName" name="playerName" maxlength="20"> <i class="far fa-times-circle delete-player"></i><br><br></div>');

    //add eventListener for new delete icon
    $('.delete-player').on('click', function(event) {
        $(this).parent('div').remove();
        updateNumberOfPlayersInCreateGameModal();
    })

    //update number of players shown 
    updateNumberOfPlayersInCreateGameModal();
}


/**
 * update the number displayed as number of players in createGameModal
 */
function updateNumberOfPlayersInCreateGameModal() {
    let numberOfPlayers = $('.new-player').length
    $('#numberOfPlayersForNewGame').text(numberOfPlayers.toString());
}


/**
 * create a oveview with all games. Each game should be possible to slideToggle
 */
function createGamesView(){
    //Removing all existing games, before adding all (existing + new) games
    $('.games-overview').empty();

    //adding game-content for all games
    let allGamesNames = getAllGameNames();
    for (let i=0; i<allGamesNames.length; i++){  
        let gameName = allGamesNames[i];
        let gameProgress = getGameProgress(gameName);
        let gameProgressIconClass = "fas fa-star-half-alt";
        let gameCreatedDate = getCreatedDate(gameName);
        let gameNumberOfPlayers = getNumberOfPlayers(gameName);

        if(isGameComplete(gameName)) {
            gameProgressIconClass = "fas fa-star";
        }

        $('.games-overview').append(
            '<div class="game-content shadow" name="' + gameName + '">' + 
                '<div class="game-header d-flex justify-content-between">' +
                    '<div class="game-header-left"><i class="far fa-calendar-alt"></i> '+ gameCreatedDate +'</div>' +
                    '<div class="game-header-middle">' +
                        '<div><h2>'+ gameName +'</h2></div>' +
                        '<div>'+
                            '<span>'+ gameNumberOfPlayers +' <i class="fas fa-users"></i></span>'+
                            '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+
                            '<span class="game-progress">'+ gameProgress +'</span> <i class="fas fa-flag-checkered"></i>'+
                        '</div>' +
                        '<div class="d-none"><span class="game-progress">Progress: '+ gameProgress +'</span> <span class="game-progress-icon"><i class="'+ gameProgressIconClass +'"></i></span></div>' + //display:none, but leaves it in case I want to use progress text plus icon later (half star turn into full star when all games are completed)
                    '</div>' +
                    '<div class="game-header-right"><span class="invisible">'+ gameCreatedDate +' </span><i class="fas fa-chevron-down"></i></div>' +
                '</div>' + 
                '<hr class="hr-game-content">'+
                '<div class="game-body">' +
                    '<h3 ="table-header">Table</h3>' +
                    '<table class="game-table table table-striped center">' +
                        '<thead>' +
                            '<tr>' +
                                '<th>Position</th>' +
                                '<th>Name</th>' +
                                '<th>Games played</th>' +
                                '<th>Points</th>' +
                                '<th>Final</th>' +
                            '</tr>' +
                        '</thead>' +
                        '<tbody class="game-table-body">' +
                            '<!-- table rows are generated here -->' +
                        '</tbody>' +
                    '</table>' +
            
                    '<h3 class="matches-header">Matches</h3>' +
                    '<ul class="list-group list-group-flush matches-list">' +
                        '<!-- list rows with matches are generated here. Example: -->' +
                    '</ul>' +
                '</div>' +
            '</div>');
    }
}



/**
 * Create gameViews and updates GameTableDisplay and MatchesLists for all games. Triggered when page is loaded/refreshed and at the end of createGame()
 */
function updateViewForAllGames(){
    createGamesView();

    let allGamesNames = getAllGameNames();
    for (let i=0; i<allGamesNames.length; i++){        
        updateGameTableDisplay(allGamesNames[i]);
        updateMatchesList(allGamesNames[i]);
    }

    //adding on-click slideToggle for games
    $('.game-header').on('click', function(){
        //adds slideToggle on game-body
        $(this).siblings('.game-body').slideToggle();
        //flips game-header-left icon, arrow down->arrow up, and vice versa
        $(this).find('.game-header-right').find('i').toggleClass('flip');
    });
}


/**
 * Updates gameProgress text value and icon on game-header
 * @param {string} gameName 
 */
 function updateGameProgress(gameName){
    let gameProgress = getGameProgress(gameName);
    let gameProgressIconClass = "fas fa-star-half-alt";

    $('.game-content[name="'+gameName+'"]').find('.game-progress').text(gameProgress);

    if(isGameComplete(gameName)) {
        gameProgressIconClass = "fas fa-star";        
    }
    $('.game-content[name="'+gameName+'"]').find('.game-progress-icon').find('i').removeClass().addClass(gameProgressIconClass);
}


/**
 * Updates/displays gameTable based on values in game-JSON.
 * Removes all "old" rows inside table body, and then adds new updated table rows
 */
function updateGameTableDisplay(gameName){
    //removes "old" table rows
    $('div[name="'+ gameName +'"]').find('.game-table-body').empty();

    updatePlayerPointsAndGamesPlayedFromAllMatchResults(gameName);
    let sortedPlayerList = getSortedPlayerList(gameName);
    let finalLetters = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
    let finalCounter = 0;

    for (let i=0; i<sortedPlayerList.length; i++){
        let position = i +1;
        let trClass = "";
        
        playerNameValue = sortedPlayerList[i];
        gamesPlayedValue = getPlayerGamesPlayed(gameName, playerNameValue);
        playerPointsValue = getPlayerPoints(gameName, playerNameValue);

        //Set an underline after every 3 players (since they will play in the same final). No underline under last table row. And not under second last either, since then the last player would play in the final above
        if (position%3 === 0 && i !== sortedPlayerList.length-1 && i !== sortedPlayerList.length-2){
            trClass="tr-underline";
        }

        //if the last player is the only player in the lowest final, he will join the 3 players in the final above
        if (i === sortedPlayerList.length-1 && position%3 === 1){
            finalCounter -= 1;
        }

        newTableRow = '<tr class="'+trClass+'"><td>'+position +'</td><td>' + playerNameValue + '</td><td>' + gamesPlayedValue + '</td><td>' + playerPointsValue + '</td><td>'+finalLetters[finalCounter]+'</td></tr>';
        $('div[name="'+ gameName +'"]').find('.game-table-body').append(newTableRow);


        //after every 3 players, finalCounter increase with 1. (3 best players are in A final, next 3 are in B final, etc)
        if (position%3 === 0){
            finalCounter += 1;
        }
    } 
}


/**
 * Updates player points and gamesPlayed for all players in game-JSON based on match results in matches-JSON. Is triggered in updateGameTableDisplay()
 */
 function updatePlayerPointsAndGamesPlayedFromAllMatchResults(gameName) {
    let parsedGameObj = getParsedGameObj(gameName);
    let parsedMatchesObj = getParsedMatchesObj(gameName);

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
        setPlayerGamesPlayed(gameName, playerName, playerPlayedGames);
        setPlayerPoints(gameName, playerName, playerPoints);
        
    }
}


/**
 * Updates/displays list with all matches, by adding list items that include matchId and match players.
 * Removes all "old" match list items, and adds new updated match list items.
 */
function updateMatchesList(gameName) {
    //removes "old" match list items
    $('div[name="'+ gameName +'"]').find('.matches-list').empty();

    //loop through matches JSON and create new updated match list items
    parsedMatchesObj = getParsedMatchesObj(gameName);

    for (let i=0; i<parsedMatchesObj.length; i++){
        player1BagdeValue = "";
        player2BagdeValue = "";
        player3BagdeValue = "";
        player4BagdeValue = "";
        
        //if match is played: loop through players in that match, find player placement, and set bagdeValue
        if (isMatchPlayed(gameName, parsedMatchesObj[i]['matchId'])){            
            for (let j=0; j<4; j++){
                let playerName = parsedMatchesObj[i]['players'][j];
                let playerPlacement = getPlayerPlacementInMatch(gameName, playerName, parsedMatchesObj[i]['matchId']);

                switch(j) {
                    case 0:
                        player1BagdeValue = playerPlacement;
                        break;
                    case 1:
                        player2BagdeValue = playerPlacement;
                        break;
                    case 2:
                        player3BagdeValue = playerPlacement;
                        break;
                    case 3:
                        player4BagdeValue = playerPlacement;
                        break;                      
                }
            }
        }
        
        newListRow = 
            '<li class="list-group-item">' +
                '<div class="match-info">' + 
                    '<b class="match-number">Match <span class="match-id">' + parsedMatchesObj[i]['matchId'] + '</span></b>' + 
                    '<span class="match-player-1">' + parsedMatchesObj[i]['players'][0] + '</span> <span class="match-player-1-bagde badge badge-placement-'+player1BagdeValue+'">' + player1BagdeValue + '</span> &nbsp;|&nbsp; ' + 
                    '<span class="match-player-2">' + parsedMatchesObj[i]['players'][1] + '</span> <span class="match-player-2-bagde badge badge-placement-'+player2BagdeValue+'">' + player2BagdeValue + '</span> &nbsp;|&nbsp; ' + 
                    '<span class="match-player-3">' + parsedMatchesObj[i]['players'][2] + '</span> <span class="match-player-3-bagde badge badge-placement-'+player3BagdeValue+'">' + player3BagdeValue + '</span> &nbsp;|&nbsp; ' + 
                    '<span class="match-player-4">' + parsedMatchesObj[i]['players'][3] + '</span> <span class="match-player-4-bagde badge badge-placement-'+player4BagdeValue+'">' + player4BagdeValue + '</span> ' + 
                    '<button type="button" class="btn" data-bs-toggle="modal" data-bs-target="#matchResultModal"><i class="fas fa-edit"></i></button>' + 
                '</div>' +
            '</li>'
        $('div[name="'+ gameName +'"]').find('.list-group').append(newListRow);
    }

    //adds onClick event on edit buttons again (since all "old" match list items are removed in the beginning of this function)
    $('div[name="'+ gameName +'"]').find('.match-info button').on('click',function(event) {
        updateMatchResultModal(event, this);
    })
}


/**
 * Updates values in matchResultModal (matchId, playerNames) that is about to be shown when this button is clicked
 * @param {event} ev 
 * @param {html-element} buttonClicked button from matches list from html
 */
 function updateMatchResultModal(ev, buttonClicked){
    ev.preventDefault();

    //set gameName value to none displayed div in modal (so gameName can be passed on to saveMatchResult)
    let gameName = $(buttonClicked).closest('.game-content').attr('name');
    $('#matchResultModal').find('.game-name').text(gameName);

    //update modal title with matchId, and labels with players
    let matchId = $(buttonClicked).parent().find('.match-id').text();    
    let player1 = $(buttonClicked).parent().find('.match-player-1').text();
    let player2 = $(buttonClicked).parent().find('.match-player-2').text();
    let player3 = $(buttonClicked).parent().find('.match-player-3').text();
    let player4 = $(buttonClicked).parent().find('.match-player-4').text();

    $('#matchResultModal').find('.modal-title-matchId').text(matchId + ' - Result');
    $('#matchResultModal').find('label[for="player1Placement"]').text(player1);
    $('#matchResultModal').find('label[for="player2Placement"]').text(player2);
    $('#matchResultModal').find('label[for="player3Placement"]').text(player3);
    $('#matchResultModal').find('label[for="player4Placement"]').text(player4);

    if (isMatchPlayed(gameName, parseInt(matchId))){
        $('#matchResultModal').find('input[id="player1Placement"]').val(getPlayerPlacementInMatch(gameName, player1, parseInt(matchId)));
        $('#matchResultModal').find('input[id="player2Placement"]').val(getPlayerPlacementInMatch(gameName, player2, parseInt(matchId)));
        $('#matchResultModal').find('input[id="player3Placement"]').val(getPlayerPlacementInMatch(gameName, player3, parseInt(matchId)));
        $('#matchResultModal').find('input[id="player4Placement"]').val(getPlayerPlacementInMatch(gameName, player4, parseInt(matchId)));
    }else {
        $('#matchResultModal').find('input[id="player1Placement"]').val('');
        $('#matchResultModal').find('input[id="player2Placement"]').val('');
        $('#matchResultModal').find('input[id="player3Placement"]').val('');
        $('#matchResultModal').find('input[id="player4Placement"]').val('');
    }
}


/**
 * Saves match result to matches-json. Triggered after hitting save-button on matchResultModal
 * @param {event} ev 
 */
function saveMatchResult(ev) {
    ev.preventDefault();

    let gameName = $('#matchResultModal').find('.game-name').text();

    let matchId = $('#matchResultModal').find('.modal-title-matchId').text(); //matchId as string
    let player1 = $('#matchResultModal').find('label[for="player1Placement"]').text();
    let player2 = $('#matchResultModal').find('label[for="player2Placement"]').text();
    let player3 = $('#matchResultModal').find('label[for="player3Placement"]').text();
    let player4 = $('#matchResultModal').find('label[for="player4Placement"]').text();

    let player1Placement = $('#matchResultModal').find('#player1Placement').val();
    let player2Placement = $('#matchResultModal').find('#player2Placement').val();
    let player3Placement = $('#matchResultModal').find('#player3Placement').val();
    let player4Placement = $('#matchResultModal').find('#player4Placement').val();

    // Create list with player placements that will be used for validation. Filter out elemtents with value ""
    let playerPlacements = [];
    playerPlacements.push(player1Placement);
    playerPlacements.push(player2Placement);
    playerPlacements.push(player3Placement);
    playerPlacements.push(player4Placement);

    let filteredPlayerPlacements = playerPlacements.filter(function(x) {
        return x !== "";
    });

    // Checks that player placements/match result form is valid before updating match results
    if (!(isMatchResultFormValid(filteredPlayerPlacements))){
        alert('Match result form is invalid, match result was not saved!\nError message: ' + formErrorMessage);
        //Resetting formErrorMessage after displaying it in alert.
        formErrorMessage = "";
        return;
    }

    // sets match result
    let matchResult = [];    
    matchResult[player1Placement-1] = player1;
    matchResult[player2Placement-1] = player2;
    matchResult[player3Placement-1] = player3;
    matchResult[player4Placement-1] = player4;        

    setMatchResult(gameName, parseInt(matchId), matchResult);

    updateGameTableDisplay(gameName);
    updateMatchesList(gameName);
    updateGameProgress(gameName);
}



///////////////////////////////////////////////////////////////////////////////////// GETTERS AND SETTERS //////////////////////////////////////////////////////////////////////////////////////

/**
 * Return all gameNames in localstorage, sorted by createdDate
 * @returns string[]
 */
function getAllGameNames(){
    //get all keys from localstorage, both gameName(game-obj) and gameName-matches(matches-obj)
    let allKeys = Object.keys(localStorage);
    //all gameNames sorted by createdDate(only game-obj, filtered out matches-obj (keyes without '-matches') and createdDate-obj (keyes without '-createdDate'))
    let allGamesNamesSorted = []

    unsortedgameObjects = [];
    for (let i=0; i<allKeys.length; i++){
        if (!(allKeys[i].includes("-matches"))){
            if (!(allKeys[i].includes("-createdDate"))){            
                let newObject = {
                    gameName: allKeys[i],
                    date: new Date(localStorage.getItem(allKeys[i] + '-createdDate'))
                }  
                unsortedgameObjects.push(newObject);          
            }
        }
    }

    let sortedgameObjects = unsortedgameObjects.slice().sort((a,b) => b.date - a.date)

    for (let i=0; i<sortedgameObjects.length; i++){
        allGamesNamesSorted.push(sortedgameObjects[i].gameName);
    }

    return allGamesNamesSorted;
}


/**
 * returns parsed gameObj
 * @returns object
 */
 function getParsedGameObj(gameName) {
    let gameObj = localStorage.getItem(gameName);
    let parsedGameObj = JSON.parse(gameObj);
    return parsedGameObj;
}


/**
 * Returns parsed matchesObj
 * @returns object
 */
function getParsedMatchesObj(gameName) {
    let matchesKey = gameName + '-matches';
    let matchesObj = localStorage.getItem(matchesKey);
    let parsedMatchesObj = JSON.parse(matchesObj);
    return parsedMatchesObj;
}


/**
 * Return total number of matches in a specific game
 * @param {string} gameName 
 * @returns number
 */
function getNumberOfMatchesInGame(gameName){
    let parsedMatchesObj = getParsedMatchesObj(gameName);
    let numberOfMatches = parsedMatchesObj.length;
    return numberOfMatches;
}


/**
 * Returns a string with game progress in the form "completedMatches/totalMatches"
 * @param {string} gameName 
 * @returns string
 */
function getGameProgress(gameName){
    let gameProgress;
    gameProgress = getNumberOfCompletedMatchesInGame(gameName) + "/" + getNumberOfMatchesInGame(gameName);
    return gameProgress;
}


/**
 * Return number of completed matches in a game
 * @param {string} gameName 
 * @returns number
 */
function getNumberOfCompletedMatchesInGame(gameName){
    let parsedMatchesObj = getParsedMatchesObj(gameName);
    let numberOfCompletedMatches = 0;
    for (let i=0; i<parsedMatchesObj.length; i++){
        if (isMatchPlayed(gameName, parsedMatchesObj[i].matchId)){
            numberOfCompletedMatches += 1;
        }
    }
    return numberOfCompletedMatches
}


/**
 * Returns points for player
 * @param {string} playerName 
 * @returns number, playerPoints
 */
function getPlayerPoints(gameName, playerName) {
    let parsedGameObj = getParsedGameObj(gameName);

    for (let i=0; i<parsedGameObj.length; i++) {
        if (parsedGameObj[i].playerName === playerName) {
            let playerPoints = parsedGameObj[i].points;
            return playerPoints;           
        }
    }    
}


/**
 * Sets paramter playerPoints for given player.
 * @param {string} playerName 
 * @param {number} points 
 */
function setPlayerPoints(gameName, playerName, points) {
    let parsedGameObj = getParsedGameObj(gameName);

    for (let i=0; i<parsedGameObj.length; i++) {
        if (parsedGameObj[i].playerName === playerName) {
            parsedGameObj[i].points = points;
            break;
        }
    }
    localStorage.setItem(gameName, JSON.stringify(parsedGameObj));
}


/**
 * Return gamesPlayed for player
 * @param {string} playerName 
 * @returns number
 */
function getPlayerGamesPlayed(gameName, playerName) {
    let parsedGameObj = getParsedGameObj(gameName);

    for (let i=0; i<parsedGameObj.length; i++) {
        if (parsedGameObj[i].playerName === playerName) {
            let gamesPlayed = parsedGameObj[i].gamesPlayed;
            return gamesPlayed;
        }
    }
}


/**
 * Sets parameter gamesPlayed for given player.
 * @param {string} playerName 
 * @param {number} gamesPlayed 
 */
function setPlayerGamesPlayed(gameName, playerName, gamesPlayed) {
    let parsedGameObj = getParsedGameObj(gameName);

    for (let i=0; i<parsedGameObj.length; i++) {
        if (parsedGameObj[i].playerName === playerName) {
            parsedGameObj[i].gamesPlayed = gamesPlayed;
            break;
        }
    }
    localStorage.setItem(gameName, JSON.stringify(parsedGameObj));
}


/**
 * Returns number of players in a game
 * @param {string} gameName 
 * @returns number
 */
function getNumberOfPlayers(gameName){
    let parsedGameObj = getParsedGameObj(gameName);
    let numberOfPlayers = parsedGameObj.length;

    return numberOfPlayers;
}


/**
 * Returns placement, string value between 1 and 4, for a player in a match.
 * @param {string} playerName 
 * @param {number} matchId 
 * @returns Player placement
 */
function getPlayerPlacementInMatch(gameName, playerName, matchId){
    let parsedMatchesObj = getParsedMatchesObj(gameName);

    if (isMatchPlayed(gameName, matchId)){
        for (let i=0; i<parsedMatchesObj.length; i++) {
            if (parsedMatchesObj[i].matchId === matchId) { 
                if (parsedMatchesObj[i]['result'].includes(playerName)){
                    let playerPlacementIndex = parsedMatchesObj[i]['result'].indexOf(playerName);
                    let playerPlacementInt = 1 + parseInt(playerPlacementIndex);
                    let playerPlacement = playerPlacementInt.toString();
                    return playerPlacement;
                }
            }
        }
    }
}


/**
 * 
 * @param {number} matchId 
 * @param {string[]} result 
 */
 function setMatchResult(gameName, matchId, result){
    let parsedMatchesObj = getParsedMatchesObj(gameName);        

    for (let i=0; i<parsedMatchesObj.length; i++) {
        if (parsedMatchesObj[i].matchId === matchId) {
            parsedMatchesObj[i].result = result;
            break;
        }
    }

    //Update localstorage with results
    let matchesKey = gameName + '-matches';
    localStorage.setItem(matchesKey, JSON.stringify(parsedMatchesObj));
}


/**
 * Returns createdDate for game in string format "5. januar 2021"
 * @param {string} gameName 
 * @returns string
 */
function getCreatedDate(gameName){
    let day, monthValue, month, year, dateString;
    let createdDate = new Date(localStorage.getItem(gameName + '-createdDate'));
    day = createdDate.getDate();
    monthValue = createdDate.getMonth();
    year = createdDate.getFullYear();

    switch (monthValue) {
        case 0:
            month = "januar";
            break;
        case 1:
            month = "februar";
            break;
        case 2:
            month = "mars";
            break;
        case 3:
            month = "april";
            break;
        case 4:
            month = "mai";
            break;
        case 5:
            month = "juni";
            break;
        case 6:
            month = "juli";
            break;
        case 7:
            month = "august";
            break;
        case 8:
            month = "september";
            break;
        case 9:
            month = "oktober";
            break;
        case 10:
            month = "november";
            break;
        case 11:
            month = "desember";
    }

    dateString = day + '. ' + month + ' ' + year;
    return dateString;
}


/**
 * Returns a sorted list of playerNames base on points
 * @returns string[]
 */
 function getSortedPlayerList(gameName){
    let parsedGameObj = getParsedGameObj(gameName);
    let sortedPlayerList = [];

    for (let j=0; j<parsedGameObj.length; j++){
        sortedPlayerList.push(parsedGameObj[j]['playerName']);
    }

    //sort list of players
    let switching, i, firstPlayerName, secondPlayerName, shouldSwitch;
    switching = true;
    /*Make a loop that will continue until
    no switching has been done:*/
    while (switching) {
        //start by saying: no switching is done:
        switching = false;
        /*Loop through all table rows (except the
        first, which contains table headers):*/
        for (i = 0; i <(sortedPlayerList.length-1); i++) {
            //start by saying there should be no switching:
            shouldSwitch = false;
            /*Get the two elements you want to compare,
            one from current row and one from the next:*/
            firstPlayerName = sortedPlayerList[i];
            secondPlayerName = sortedPlayerList[i+1]
            //check if the two rows should switch place:
            if (getPlayerPoints(gameName, firstPlayerName) < getPlayerPoints(gameName, secondPlayerName)) {
            //if so, mark as a switch and break the loop:
            shouldSwitch = true;
            break;
            }else if((getPlayerPoints(gameName, firstPlayerName) === getPlayerPoints(gameName, secondPlayerName)) && (getPlayerGamesPlayed(gameName, firstPlayerName) > getPlayerGamesPlayed(gameName, secondPlayerName)) ){
                //if so, mark as a switch and break the loop:
                shouldSwitch = true;
                break;
            }
        }
        if (shouldSwitch) {
        /*If a switch has been marked, make the switch
        and mark that a switch has been done:*/
        sortedPlayerList[i] = secondPlayerName;
        sortedPlayerList[i+1] = firstPlayerName;

        switching = true;
        }
    }
    
    return sortedPlayerList;
}



///////////////////////////////////////////////////////////////////////////////////////// CHECKS ///////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Checks if game is complete (all matches are played)
 * @param {string} gameName 
 * @returns boolean
 */
function isGameComplete(gameName) {
    let result = false;

    if (getNumberOfMatchesInGame(gameName)>0 && (getNumberOfCompletedMatchesInGame(gameName) === getNumberOfMatchesInGame(gameName))){
        result = true;
    }
    return result;
}


/**
 * Checks if match is played. Returns boolean.
 * @param {number} matchId 
 * @returns boolean
 */
function isMatchPlayed(gameName, matchId) {
    let parsedMatchesObj = getParsedMatchesObj(gameName);     
    let isMatchPlayed = false;

    for (let i=0; i<parsedMatchesObj.length; i++) {
        if (parsedMatchesObj[i].matchId === matchId) {
            if (parsedMatchesObj[i].result.length > 0){
                isMatchPlayed = true;
            }            
        }
    }

    return isMatchPlayed;
}


/**
 * Checks if matchResultForm in matchResultModal is valid. Used in saveMatchResult(). No duplicates values. Either all(4) or none(0) of input should have values.
 * @param {string[]} playerPlacements
 * @returns boolean
 */
function isMatchResultFormValid(playerPlacements){        
    // check: matchResult length should be either 4, or 0. (4: placements for all players. 0: Match is not played)
    if (!(playerPlacements.length === 0 || playerPlacements.length === 4)) {
        console.log("Match result form not valid: must fill out all or none of the placements!");
        formErrorMessage = "All or none of the placements must have values.";
        return false;
    } 

    // check: all elements in matchResult should be unique. 2 players can't get 1st place etc.
    if (playerPlacements.length > 0){
        if (new Set(playerPlacements).size !== playerPlacements.length){
            console.log("Match result form not valid: match result contains duplicates placement values!");
            formErrorMessage = "All placement values must be unique. Two players can't place 1st, for example.";
            return false;
        }
    }

    // check: each placement value should be either 1,2,3 or 4
    if (playerPlacements.length > 0){
        for (let i=0; i<playerPlacements.length; i++){
            if (parseInt(playerPlacements[i]) < 1 || parseInt(playerPlacements[i]) > 4){
                console.log("All placement values must be either 1, 2, 3 or 4!");
                formErrorMessage = "All placement values must be either 1, 2, 3 or 4!";
                return false;
            }
        }
    }

    return true;
}


/**
 * TODO!! Check is form is valid. No empty input fields. No duplicate names. For later: tournementname should not be equal to an existing tournement
 * @param {string[]} playerNameList 
 * @param {number} numberOfNewPlayerInputFields 
 * @param {string} newGameName 
 * @returns 
 */
function isNewGameFormValid(playerNameList, numberOfNewPlayerInputFields, newGameName){
    //create a new playerNameList and filter empty("") elements    
    let filteredPlayerNameList = playerNameList.filter(function(x) {
        return x !== "";
    });

    //Check: Tournement input field should not be empty.
    if (newGameName.length === 0){
        console.log("New game form is invalid: Tournement name can not be empty");
        formErrorMessage = "Tournement name can not be empty.";
        return false;
    }

    //Check: Should not be possible to create a new game with the same name as one of the existing games as this would overwrite existing game.
    let existingGamesNames = getAllGameNames();
    if (existingGamesNames.includes(newGameName)){
        console.log("New game form is invalid: A game with the name " + newGameName + " already exists!");
        formErrorMessage = "A game with the name " + newGameName + " already exists!";
        return false;
    }

    //Check: Should not be possible to create a new game with a name that includes "-matches". This would cause trouble since matches-json keys are gameName + "-matches".
    if (newGameName.includes("-matches")){
        console.log("New game form is invalid: '-matches' can not be included in the game name.");
        formErrorMessage = "The game name can not include substring '-matches'.";
        return false;
    }

    //Check: Should not be possible to create a new game with a name that includes "-createdDate". This would cause trouble since date-json keys are gameName + "-createdDate".
    if (newGameName.includes("-createdDate")){
        console.log("New game form is invalid: '-createdDate' can not be included in the game name.");
        formErrorMessage = "The game name can not include substring '-createdDate'.";
        return false;
    }

    //Check: None of the player input fields should be empty
    if (filteredPlayerNameList.length !== numberOfNewPlayerInputFields){
        console.log("New game form is invalid: none of the player name input fields can be empty.");
        formErrorMessage = "None of the player input fields can be empty.";
        return false;
    }

    //Check: number of players should be at least 4
    if (filteredPlayerNameList.length < 4){
        console.log("New game form is invalid: minimum 4 players are needed to play Beerio Kart.");
        formErrorMessage = "Minimum 4 players are needed to play Beerio Kart.";
        return false;
    }

    //Check: all names should be unique
    if (new Set(filteredPlayerNameList).size !== filteredPlayerNameList.length){
        console.log("New game form is invalid: all names must be unique!");
        formErrorMessage = "All player names must be unique";
        return false;
    }

    return true;
}


///////////////////////////////////////////////////////////////////////////////// WHEN PAGE IS LOADED/REFRESHED ///////////////////////////////////////////////////////////////////////////////
$(document).ready(function(){
    
    //adding onClick-functions to buttons
    $('#generateGameButton').on('click', function(event) {
        generateGame(event);
    });

    $('#addPlayerInput').on('click',function(event) {
        addPlayerInputField(event);
    })

    $('.delete-player').on('click', function(event) {
        $(this).parent('div').remove();
        updateNumberOfPlayersInCreateGameModal();
    })
    
    $('#saveMatchResultbutton').on('click',function(event) {
        saveMatchResult(event);
    })

    //Commented out because this onClick event is added in updateMatchList()
    // $('.match-info button').on('click',function(event) {
    //     updateMatchResultModal(event, this);
    // })


    //running functions when page is entered/refreshed. (Make checks that localStorage is not empty before running, so we avoid error in console)
    updateViewForAllGames();
    
});

