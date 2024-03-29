let formErrorMessage = "";


/**
 * Creates game-JSON
 * @param {event} ev 
 */
function generateGame(ev){
    ev.preventDefault();
    let gameId
    let game = {};
    let players = [];
    let matches = [];
    let numberOfPlayers = $('.new-player').length
    let newGameName = $('#newTournementName').val();
    let gameRounds = parseInt($('#gameRounds').val());
    let playerNamesForValidation = [];

    
    $('.new-player').each(function(index) {
        let player = {
            playerName: $(this).find('input').val(), //used as id. All playerNames in a game must be unique
            matchesPlayed: 0,
            points: 0
        }
        players.push(player);

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

    //add data to game object
    game['gameName'] = newGameName;
    game['createdDate'] = new Date();
    game['rounds'] = gameRounds;
    game['players'] = players;
    game['matches'] = matches;
    let gameNameSlugified = convertToSlug(newGameName);
    gameId = gameNameSlugified + '_' + game['createdDate'].toISOString();
    localStorage.setItem(gameId, JSON.stringify(game));

    generateMatches(gameId, gameRounds);

    updateViewForAllGames();    

    $('#newGameForm')[0].reset();
}


/**
 * Generates all matches consisting off random players selected in each match. Each player will play gameRounds matches.
 * @param {string} gameId 
 * @param {number} gameRounds 
 */
 function generateMatches(gameId, gameRounds) {
    try {
        let parsedGameObj = getParsedGameObj(gameId);
        let matches = [];
        let players = parsedGameObj.players;
        let numberOfPlayers = players.length;
        numberOfMatches = (numberOfPlayers*gameRounds)/4; //each player will have number of matches equal to gameRounds. Number of matches is therefor numberOfPlayers*gameRounds/4, since 4 players play pr match
    
        let playerOverviewObj = {};
    
        //adding playerName[key] and playerNumberOfAssignedMatches[value] to playersOverviewObj
        for (let i=0; i<numberOfPlayers; i++){        
            let playerName = players[i]['playerName'];
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
                if ( playerOverviewObj[randomlySelctedplayerName]<gameRounds) { //checks that player is assigned to less than gameRounds matches
                    if (!(matchPlayersList.includes(randomlySelctedplayerName))){ //checks that player is not already ssigned to this match
                        matchPlayersList.push(randomlySelctedplayerName);
                        playerOverviewObj[randomlySelctedplayerName] += 1;
                        potentialPlayersForNextMatchList.splice(randomInt,1);
                    }
                }            
            }
    
            let newlyGeneratedMatch = {
                matchId: matchNumber,
                players: matchPlayersList,
                result: []
            }

            //add newlyGeneratedMatch to matches (list)
            matches.push(newlyGeneratedMatch);
        }
        
        //add matches to gameObj
        parsedGameObj.matches = matches;
        localStorage.setItem(gameId, JSON.stringify(parsedGameObj));

        updateMatchesList(gameId);
    }
    catch(err) {
        console.log("Error from generateMatches: " + err.message);
    }
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
        updateGameRoundsOptions()
    })

    //update number of players shown 
    updateNumberOfPlayersInCreateGameModal();
    //update gameRounds options
    updateGameRoundsOptions()
}


/**
 * update the number displayed as number of players in createGameModal
 */
function updateNumberOfPlayersInCreateGameModal() {
    try {
        let numberOfPlayers = $('.new-player').length
        $('#numberOfPlayersForNewGame').text(numberOfPlayers.toString());
    }
    catch(err) {
        console.log("Error from updateNumberOfPlayersInCreateGameModal: " + err.message);
    }
}


/**
 * update game rounds options on create game modal
 */
function updateGameRoundsOptions() {
    try {
        $('#gameRounds').children('option:not(:first)').remove();

        let numberOfPlayers = $('.new-player').length
        for (let i=4; i<13; i++){
            if ((numberOfPlayers * i)%4 === 0) {
                $('#gameRounds').append('<option value="'+i+'">'+i+'</option>')
            }        
        }
    }
    catch(err) {
        console.log("Error from updateGameRoundsOptions: " + err.message)
    }    
}


/**
 * create a oveview with all games. Each game should be possible to slideToggle
 */
function createGamesView(){
    try {
        //Removing all existing games, before adding all (existing + new) games
        $('.games-overview').empty();

        let allGamesIds = getAllGameIds();
        if (allGamesIds.length === 0){
            showNoExistingGamesAlert()
            return;
        }

        const positionTableHeader = $(window).width() > 575 ? 'Position' : 'Pos';
        const matchesPlayedTableHeader = $(window).width() > 575 ? 'Matches played' : 'Matches';

        //adding game-content for all games    
        for (let i=0; i<allGamesIds.length; i++){
            let gameId = allGamesIds[i];
            let gameName = getGameName(gameId);
            let gameProgress = getGameProgress(gameId);
            let gameCreatedDate = getCreatedDateToString(gameId);
            let gameNumberOfPlayers = getNumberOfPlayers(gameId);
            let gameRounds = getGameRounds(gameId);

            let gameContentElement = getGameContentElement(gameId, gameCreatedDate, gameName, gameNumberOfPlayers, gameRounds, gameProgress, positionTableHeader, matchesPlayedTableHeader);
            $('.games-overview').append(gameContentElement);
        }
    }
    catch(err) {
        console.log("Error from createGamesView: " + err.message);
    }
}



/**
 * Create gameViews and updates GameTableDisplay and MatchesLists for all games. Triggered when page is loaded/refreshed and at the end of createGame()
 */
function updateViewForAllGames(){
    try {
        createGamesView();

        let allGamesIds = getAllGameIds();
        for (const gameId of allGamesIds){        
            updateGameTableDisplay(gameId);
            updateMatchesList(gameId);
        }
    
        //adding on-click slideToggle for games
        $('.game-header').on('click', function(){
            //adds slideToggle on game-body
            $(this).siblings('.game-body').slideToggle();
            //flips game-header-left icon, arrow down->arrow up, and vice versa
            $(this).find('.game-header-right').find('.fa-chevron-down').toggleClass('flip');
        }).find('#dropdownMenuGameHeader, .dropdown-item').click(function() {
            //prevent slideToggle if menu icon is clicked
            return false;
        });
        $('.game-footer-toggle').on('click', function(){
            //adds slideToggle on game-body
            $(this).closest('.game-body').slideToggle();
        })

        $('[data-toggle="tooltip"]').tooltip();

        $('.export-game').on('click',function(event) {
            exportGameJson(event, this);
        })
        $('.delete-game').on('click',function(event) {
            updateDeleteGameModal(event, this);
        })
    }
    catch(err) {
        console.log("Error from updateViewForAllGames: " + err.message);
    }
}


/**
 * Shows an alert in games-overview (shown if there is no games created in localStorage)
 */
function showNoExistingGamesAlert(){
    let alertContent = '<button class="btn disabled"><i class="fas fa-info-circle"></i></button>You have no existing tournaments. Click the "Create Tournament" button above to create you first Beerio Kart Tournement!';
    $('.games-overview').append(
        `<div class="alert alert-primary" role="alert">${alertContent}</div>`
    );
}


/**
 * Updates gameProgress text value and icon on game-header
 * @param {string} gameId 
 */
 function updateGameProgress(gameId){
    try {
        let gameProgress = getGameProgress(gameId);    
        $('.game-content[id="'+gameId+'"]').find('.game-progress').text(gameProgress);
    }
    catch(err) {
        console.log("Error from updateGameProgress: " + err.message);
    }
}


/**
 * Updates/displays gameTable based on values in game-JSON.
 * Removes all "old" rows inside table body, and then adds new updated table rows
 */
function updateGameTableDisplay(gameId){
    try {
        //removes "old" table rows
        $('div[id="'+ gameId +'"]').find('.game-table-body').empty();

        updatePlayerPointsAndMatchesPlayedFromAllMatchResults(gameId);
        let sortedPlayerList = getSortedPlayerList(gameId);
        let finalLetters = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
        let finalCounter = 0;

        for (let i=0; i<sortedPlayerList.length; i++){
            let position = i +1;
            let trClass = "";
            
            playerNameValue = sortedPlayerList[i];
            matchesPlayedValue = getPlayerMatchesPlayed(gameId, playerNameValue);
            playerPointsValue = getPlayerPoints(gameId, playerNameValue);

            //Set an underline after every 3 players (since they will play in the same final). No underline under last table row. And not under second last either, since then the last player would play in the final above
            if (position%3 === 0 && i !== sortedPlayerList.length-1 && i !== sortedPlayerList.length-2){
                trClass="tr-underline";
            }

            //if the last player is the only player in the lowest final, he will join the 3 players in the final above
            if (i === sortedPlayerList.length-1 && position%3 === 1){
                finalCounter -= 1;
            }

            // newTableRow = '<tr class="'+trClass+'"><td>'+position +'</td><td>' + playerNameValue + '</td><td>' + matchesPlayedValue + '</td><td>' + playerPointsValue + '</td><td class="final-letter-td">'+finalLetters[finalCounter]+'</td></tr>';
            newTableRow = `<tr class="${trClass}"><td>${position}</td><td>${playerNameValue}</td><td>${matchesPlayedValue}</td><td>${playerPointsValue}</td><td class="final-letter-td">${finalLetters[finalCounter]}</td></tr>`;
            $('div[id="'+ gameId +'"]').find('.game-table-body').append(newTableRow);


            //after every 3 players, finalCounter increase with 1. (3 best players are in A final, next 3 are in B final, etc)
            if (position%3 === 0){
                finalCounter += 1;
            }
        } 
    }
    catch(err) {
        console.log("Error from updateGameTableDisplay: " + err.message);
    }    
}


/**
 * Updates player points and matchesPlayed for all players in game-JSON based on match results in matches. Is triggered in updateGameTableDisplay()
 */
 function updatePlayerPointsAndMatchesPlayedFromAllMatchResults(gameId) {
    try {
        let parsedGameObj = getParsedGameObj(gameId);
        let players = parsedGameObj.players;
        let matches = parsedGameObj.matches;
    
        //loop though all players
        for (const player of players){
            let playerName = player.playerName;
            let playerPoints = 0;
            let playerPlayedGames = 0;
    
            //loop though all matches
            for (const match of matches){
                if (match.result.length > 0){ //check that match has been played (then the result list is not empty)
                    if (match.players.includes(playerName)){ //check if player played in this match
                        playerPlayedGames += 1;
    
                        //checking placement, and adding points
                        for (let k=0; k<4; k++) {
                            if (match.result[k] === playerName){
                                playerPoints += (3-k);
                                break;
                            }
                        }
                    } 
                }
            } 
            //after looping through all games for this player, we set points and matchesPlayed
            setPlayerMatchesPlayed(gameId, playerName, playerPlayedGames);
            setPlayerPoints(gameId, playerName, playerPoints);        
        }
    }
    catch(err) {
        console.log("Error from updatePlayerPointsAndMatchesPlayedFromAllMatchResults: " + err.message);
    }    
}


/**
 * Updates/displays list with all matches, by adding list items that include matchId and match players.
 * Removes all "old" match list items, and adds new updated match list items.
 */
function updateMatchesList(gameId) {
    try {
        //removes "old" match list items
        $('div[id="'+ gameId +'"]').find('.matches-list').empty();

        //loop through matches and create new updated match list items
        let gameObj = getParsedGameObj(gameId);
        let matches = gameObj.matches;

        for (const match of matches){
            const matchId = match.matchId;
            const player1 = match.players[0], player2 = match.players[1], player3 = match.players[2], player4 = match.players[3];
            const isMatchPlayedBool = isMatchPlayed(gameId, matchId);

            let matchesListRowElement = getMatchesListRowElement(gameId, matchId, player1, player2, player3, player4, isMatchPlayedBool);
            $('div[id="'+ gameId +'"]').find('.matches-list').append(matchesListRowElement);            
        }

        //adds onClick event on edit buttons again (since all "old" match list items are removed in the beginning of this function)
        $('div[id="'+ gameId +'"]').find('.match-info button').on('click',function(event) {
            updateMatchResultModal(event, this);
        });
    }
    catch(err) {
        console.log("Error from updateMatchesList: " + err.message);
    }    
}


/**
 * Updates values in matchResultModal (matchId, playerNames) that is about to be shown when this button is clicked
 * @param {event} ev 
 * @param {html-element} buttonClicked button from matches list from html
 */
 function updateMatchResultModal(ev, buttonClicked){
    ev.preventDefault();

    //set gameId value to none displayed div in modal (so gameId can be passed on to saveMatchResult)
    let gameId = $(buttonClicked).closest('.game-content').attr('id');
    $('#matchResultModal').find('.game-id').text(gameId);

    //update modal title with matchId, and labels with players
    let matchId = $(buttonClicked).closest('.match-info').find('.match-id').text();    
    let player1 = $(buttonClicked).closest('.match-info').find('.match-player-1').text();
    let player2 = $(buttonClicked).closest('.match-info').find('.match-player-2').text();
    let player3 = $(buttonClicked).closest('.match-info').find('.match-player-3').text();
    let player4 = $(buttonClicked).closest('.match-info').find('.match-player-4').text();

    $('#matchResultModal').find('.modal-title-matchId').text(matchId + ' - Result');
    $('#matchResultModal').find('label[for="player1Placement"]').text(player1);
    $('#matchResultModal').find('label[for="player2Placement"]').text(player2);
    $('#matchResultModal').find('label[for="player3Placement"]').text(player3);
    $('#matchResultModal').find('label[for="player4Placement"]').text(player4);

    if (isMatchPlayed(gameId, parseInt(matchId))){
        $('#matchResultModal').find('input[id="player1Placement"]').val(getPlayerPlacementInMatch(gameId, player1, parseInt(matchId)));
        $('#matchResultModal').find('input[id="player2Placement"]').val(getPlayerPlacementInMatch(gameId, player2, parseInt(matchId)));
        $('#matchResultModal').find('input[id="player3Placement"]').val(getPlayerPlacementInMatch(gameId, player3, parseInt(matchId)));
        $('#matchResultModal').find('input[id="player4Placement"]').val(getPlayerPlacementInMatch(gameId, player4, parseInt(matchId)));
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

    let gameId = $('#matchResultModal').find('.game-id').text();

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

    setMatchResult(gameId, parseInt(matchId), matchResult);

    updateGameTableDisplay(gameId);
    updateMatchesList(gameId);
    updateGameProgress(gameId);
}


/**
 * Converts text to slug
 * @param {string} Text 
 * @returns string
 */
function convertToSlug(text){
    return text
        .toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-');
}


/**
 * Exports game json
 * @param {event} ev 
 * @param {html-element} buttonClicked 
 */
function exportGameJson(ev, buttonClicked) {
    ev.preventDefault();

    let gameId = $(buttonClicked).closest('.game-content').attr('id');
    let parsedGameObj = getParsedGameObj(gameId);
    let gameName = parsedGameObj.gameName;
    let gameNameSlugified = convertToSlug(gameName);

    let data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(parsedGameObj));
    $('<a href="data:' + data + '" download="'+gameNameSlugified+'.json">download JSON</a>')
        .appendTo("body")
        .click(function() {
            $(this).remove()
        })[0].click();
}


/**
 * Imports game from JSON file
 * @param {event} ev 
 */
function importGame(ev){
    ev.preventDefault();
    var reader = new FileReader();
    var fileToRead = $('#selectFile')[0].files[0];

    reader.onload = function() {
        let gameObj = JSON.parse(reader.result);
        let gameName = gameObj['gameName'];
        let gameNameSlugified = convertToSlug(gameName);
        let createdDate = new Date(gameObj['createdDate']);
        gameId = gameNameSlugified + '_' + createdDate.toISOString();

        //Should not be possible to import game if game already exists
        let existingGameIdsList = getAllGameIds();
        if (existingGameIdsList.includes(gameId)){
            alert('Your game was not imported because game "'+ gameName +'" already exists. \nIf you still want to upload this game, you have to delete the existing game first, and then try to import again.');
            return;
        }

        localStorage.setItem(gameId, JSON.stringify(gameObj));
        updateViewForAllGames();
        $('#selectFile').val("");
    };

    reader.readAsText(fileToRead);

}



/**
 * Updates values in deleteGameModal (matchId, playerNames) that is about to be shown when delete button is clicked
 * @param {event} ev 
 * @param {html-element} buttonClicked delete button game settings
 */
 function updateDeleteGameModal(ev, buttonClicked){
    ev.preventDefault();

    //set gameId value to none displayed div in modal (so gameId can be passed on to deleteGame function)
    let gameId = $(buttonClicked).closest('.game-content').attr('id');
    $('#deleteGameModal').find('.game-id').text(gameId);

    let gameName = getGameName(gameId);
    $('#deleteGameModal').find('.modal-body').find('.game-name').text(gameName);

}


/**
 * Delete game. Triggered when clicking delete button in deleteGameModal
 * @param {event} ev
 */
function deleteGameFromDeleteGameModal(ev){
    ev.preventDefault();

    let gameId = $('#deleteGameModal').find('.game-id').text();
    localStorage.removeItem(gameId);
    updateViewForAllGames();
}


///////////////////////////////////////////////////////////////////////////////////// GETTERS AND SETTERS //////////////////////////////////////////////////////////////////////////////////////


/**
 * returns parsed gameObj
 * @returns object
 */
 function getParsedGameObj(gameId) {
    try {
        let gameObj = localStorage.getItem(gameId);
        let parsedGameObj = JSON.parse(gameObj);
        return parsedGameObj;
    }
    catch(err) {
        console.log("Error from getParsedGameObj: " + err.message);
    }
}


/**
 * Returns gameName
 * @param {string} gameId 
 * @returns string
 */
function getGameName(gameId){
    try {
        let parsedGameObj = getParsedGameObj(gameId);
        let gameName = parsedGameObj.gameName;

        return gameName;
    }
    catch(err) {
        console.log("Error from getGameName: " + err.message);
    }
}


/**
 * Return all gameId's in localstorage, sorted by createdDate
 * @returns string[]
 */
function getAllGameIds(){
    //get all keys from localstorage
    let allKeys = Object.keys(localStorage);
    //all gameNames sorted by createdDate
    let allGamesIdsSorted = []

    let unsortedgameObjects = [];

    for (const key of allKeys){
        try {
            let parsedGameObj = getParsedGameObj(key);
            // let gameName = parsedGameObj['gameName'];
            let createdDate = parsedGameObj.createdDate;
            
            let newObject = {
                gameId: key,
                date: new Date(createdDate)
            }  
            unsortedgameObjects.push(newObject);
        }
        catch(err) {
            console.log("Error from getAllGameIds: " + err.message);
        } 

    }

    let sortedgameObjects = unsortedgameObjects.slice().sort((a,b) => b.date - a.date)

    for (const gameObject of sortedgameObjects){
        allGamesIdsSorted.push(gameObject.gameId);
    }

    return allGamesIdsSorted;  
}



function getAllGameNames(){
    try {
        let allGameNames = [];
        let allGameIds = getAllGameIds();

        for (const gameId of allGameIds){
            allGameNames.push(getGameName(gameId));
        }
        return allGameNames;
    }
    catch(err) {
        console.log("Error from getAllGameNames: " + err.message);
    }
}



/**
 * Return total number of matches in a specific game
 * @param {string} gameId
 * @returns number
 */
function getNumberOfMatchesInGame(gameId){
    try {
        let parsedGameObj = getParsedGameObj(gameId);
        let numberOfMatches = parsedGameObj.matches.length;
        return numberOfMatches;
    }
    catch(err) {
        console.log("Error from getNumberOfMatchesInGame: " + err.message);
    }
}


/**
 * Returns a string with game progress in the form "completedMatches/totalMatches"
 * @param {string} gameId
 * @returns string
 */
function getGameProgress(gameId){
    try {
        let gameProgress;
        gameProgress = getNumberOfCompletedMatchesInGame(gameId) + "/" + getNumberOfMatchesInGame(gameId);
        return gameProgress;
    }
    catch(err) {
        console.log("Error from getGameProgress: " + err.message);
    }
}


/**
 * Returns number of rounds in a Game.
 * @param {string} gameId 
 * @returns number
 */
function getGameRounds(gameId){
    try {
        let parsedGameObj = getParsedGameObj(gameId);
        let gameRounds = parsedGameObj.rounds;

        return gameRounds;
    }
    catch(err) {
        console.log("Error from getGameRounds: " + err.message);
    }
}


/**
 * Return number of completed matches in a game
 * @param {string} gameId 
 * @returns number
 */
function getNumberOfCompletedMatchesInGame(gameId){
    try {
        let parsedGameObj = getParsedGameObj(gameId);
        let matches = parsedGameObj.matches;
        let numberOfCompletedMatches = 0;

        for (const match of matches){
            if (isMatchPlayed(gameId, match.matchId)){
                numberOfCompletedMatches += 1;
            }
        }
        return numberOfCompletedMatches
    }
    catch(err) {
        console.log("Error from getNumberOfCompletedMatchesInGame: " + err.message);
    }
}


/**
 * Returns points for player
 * @param {string} gameId
 * @param {string} playerName 
 * @returns number, playerPoints
 */
function getPlayerPoints(gameId, playerName) {
    try {
        let parsedGameObj = getParsedGameObj(gameId);
        let players = parsedGameObj.players;

        for (const player of players) {
            if (player.playerName === playerName) {
                let playerPoints = player.points;
                return playerPoints;           
            }
        }
    }
    catch(err) {
        console.log("Error from getPlayerPoints: " + err.message);
    }   
}


/**
 * Sets paramter playerPoints for given player.
 * @param {string} gameId
 * @param {string} playerName 
 * @param {number} points 
 */
function setPlayerPoints(gameId, playerName, points) {
    try {
        let parsedGameObj = getParsedGameObj(gameId);
        let players = parsedGameObj.players;

        for (const player of players) {
            if (player.playerName === playerName) {
                player.points = points;
                break;
            }
        }
        parsedGameObj.players = players;
        localStorage.setItem(gameId, JSON.stringify(parsedGameObj));
    }
    catch(err) {
        console.log("Error from setPlayerPoints: " + err.message);
    }
}


/**
 * Return matchesPlayed for player
 * @param {string} gameId
 * @param {string} playerName 
 * @returns number
 */
function getPlayerMatchesPlayed(gameId, playerName) {
    try {
        let parsedGameObj = getParsedGameObj(gameId);
        let players = parsedGameObj.players;

        for (const player of players) {
            if (player.playerName === playerName) {
                let matchesPlayed = player.matchesPlayed;
                return matchesPlayed;
            }
        }
    }
    catch(err) {
        console.log("Error from getPlayerMatchesPlayed: " + err.message);
    }
}


/**
 * Sets parameter matchesPlayed for given player.
 * @param {string} gameId
 * @param {string} playerName 
 * @param {number} matchesPlayed 
 */
function setPlayerMatchesPlayed(gameId, playerName, matchesPlayed) {
    try {
        let parsedGameObj = getParsedGameObj(gameId);
        let players = parsedGameObj.players;

        for (const player of players) {
            if (player.playerName === playerName) {
                player.matchesPlayed = matchesPlayed;
                break;
            }
        }

        parsedGameObj.players = players;
        localStorage.setItem(gameId, JSON.stringify(parsedGameObj));
    }
    catch(err) {
        console.log("Error from setPlayerMatchesPlayed: " + err.message);
    }
}


/**
 * Returns number of players in a game
 * @param {string} gameId 
 * @returns number
 */
function getNumberOfPlayers(gameId){
    try {
        let parsedGameObj = getParsedGameObj(gameId);
        let numberOfPlayers = parsedGameObj.players.length;
        return numberOfPlayers;
    }
    catch(err) {
        console.log("Error from getNumberOfPlayers: " + err.message);
    }    
}


/**
 * Returns placement, string value between 1 and 4, for a player in a match.
 * @param {string} gameId
 * @param {string} playerName 
 * @param {number} matchId 
 * @returns Player placement
 */
function getPlayerPlacementInMatch(gameId, playerName, matchId){
    try {
        let parsedGameObj = getParsedGameObj(gameId);
        let matches = parsedGameObj.matches;

        if (isMatchPlayed(gameId, matchId)){
            for (const match of matches) {
                if (match.matchId === matchId) { 
                    if (match.result.includes(playerName)){
                        let playerPlacementIndex = match.result.indexOf(playerName);
                        let playerPlacementInt = 1 + parseInt(playerPlacementIndex);
                        let playerPlacement = playerPlacementInt.toString();
                        return playerPlacement;
                    }
                }
            }
        }

    }
    catch(err) {
      console.log("Error from getPlayerPlacementInMatch: " + err.message);
    }
}


/**
 * Sets match result
 * @param {string} gameId
 * @param {number} matchId 
 * @param {string[]} result 
 */
 function setMatchResult(gameId, matchId, result){
    try {
        let parsedGameObj = getParsedGameObj(gameId);        
        let matches = parsedGameObj.matches;

        for (const match of matches) {
            if (match.matchId === matchId) {
                match.result = result;
                break;
            }
        }

        //Update localstorage with results
        parsedGameObj.matches = matches;
        localStorage.setItem(gameId, JSON.stringify(parsedGameObj));
    }
    catch(err) {
      console.log("Error from setMatchResult: " + err.message);
    }    
}


/**
 * Returns createdDate for game in string format "5. januar 2021"
 * @param {string} gameId 
 * @returns string
 */
function getCreatedDateToString(gameId){
    let day, monthValue, month, year, dateString;
    const parsedGameObj = getParsedGameObj(gameId);
    const createdDate = new Date(parsedGameObj['createdDate']);
    day = createdDate.getDate();
    monthValue = createdDate.getMonth();
    year = createdDate.getFullYear();

    const monthList = ["januar","februar","mars","april","mai","juni","juli","august","september","oktober","november","desember"];
    month = monthList[monthValue];

    if(isMobileView()){
        month = month.slice(0,3);
    }

    dateString = day + '. ' + month + ' ' + year;
    return dateString;
}


/**
 * Returns a sorted list of playerNames base on points
 * @param {string} gameId
 * @returns string[]
 */
 function getSortedPlayerList(gameId){
    try {
        let parsedGameObj = getParsedGameObj(gameId);
        let players = parsedGameObj['players'];
        let sortedPlayerList = [];
    
        for (let j=0; j<players.length; j++){
            sortedPlayerList.push(players[j]['playerName']);
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
                if (getPlayerPoints(gameId, firstPlayerName) < getPlayerPoints(gameId, secondPlayerName)) {
                //if so, mark as a switch and break the loop:
                shouldSwitch = true;
                break;
                }else if((getPlayerPoints(gameId, firstPlayerName) === getPlayerPoints(gameId, secondPlayerName)) && (getPlayerMatchesPlayed(gameId, firstPlayerName) > getPlayerMatchesPlayed(gameId, secondPlayerName)) ){
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
    catch(err) {
        console.log("Error from getSortedPlayerList: " + err.message);
    } 
}



///////////////////////////////////////////////////////////////////////////////////////// CHECKS ///////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Checks if game is complete (all matches are played)
 * @param {string} gameId 
 * @returns boolean
 */
function isGameComplete(gameId) {
    let result = false;

    if (getNumberOfMatchesInGame(gameId)>0 && (getNumberOfCompletedMatchesInGame(gameId) === getNumberOfMatchesInGame(gameId))){
        result = true;
    }
    return result;
}


/**
 * Checks if match is played. Returns boolean.
 * @param {string} gameId
 * @param {number} matchId 
 * @returns boolean
 */
function isMatchPlayed(gameId, matchId) {
    try {
        let parsedGameObj = getParsedGameObj(gameId);   
        let matches = parsedGameObj.matches;
        let isMatchPlayed = false;
    
        for (const match of matches) {
            if (match.matchId === matchId) {
                if (match.result.length > 0){
                    isMatchPlayed = true;
                }            
            }
        }

        return isMatchPlayed;
    }
    catch(err) {
        console.log("Error from isMatchPlayed: " + err.message);        
    }
}


function isMobileView(){
    const screenWidth = 768;
    return $(window).width() < screenWidth 
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
 * Checks if newGameForm is valid. No empty input fields.
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
        updateGameRoundsOptions()
    })
    
    $('#saveMatchResultButton').on('click',function(event) {
        saveMatchResult(event);
    })

    $("#scrollToGamesOverviewButton").click(function() {
        $([document.documentElement, document.body]).animate({
            scrollTop: $("#gamesOverviewHeader").offset().top
        }, 100);
    });

    $('#importGameButton').on('click',function(event) {
        importGame(event);        
    })

    $('#deleteGameButton').on('click',function(event) {
        deleteGameFromDeleteGameModal(event);
    })
    
    //Commented out because this onClick event is added in updateMatchList()
    // $('.match-info button').on('click',function(event) {
    //     updateMatchResultModal(event, this);
    // })

    //running functions when page is entered/refreshed. (Make checks that localStorage is not empty before running, so we avoid error in console)
    updateViewForAllGames();
    
});

