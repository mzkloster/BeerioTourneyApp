function getGameContentElement(gameId, gameCreatedDate, gameName, gameNumberOfPlayers, gameRounds, gameProgress, positionTableHeader, matchesPlayedTableHeader) {
    element = 
        `<div class="game-content shadow" id="${gameId}">
            <div class="game-header d-sm-flex justify-content-between">
                <div class="game-header-left">
                    <div class=""><i class="far fa-calendar-alt"></i> ${gameCreatedDate}</div>
                    <div class="ps-4 invisible d-none-on-sm"><i class="fas fa-ellipsis-v"></i></div>
                </div>
                <div class="game-header-middle">
                    <div><h2>${gameName}</h2></div>
                    <div>
                        <span>${gameNumberOfPlayers} <i class="fas fa-users" data-toggle="tooltip" title="Players"></i></span>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        <span>${gameRounds} <i class="fas fa-circle" data-toggle="tooltip" title="Rounds"></i></span>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        <span class="game-progress">${gameProgress}</span> <i class="fas fa-flag-checkered" data-toggle="tooltip" title="Matches, progress"></i>
                    </div>
                </div>
                <div class="game-header-right">
                    <div class="d-inline invisible">${gameCreatedDate}</div>
                    <div class="d-inline"><i class="fas fa-chevron-down"></i></div>
                    <div class="dropdown d-inline ps-3">
                        <a  type="button" id="dropdownMenuGameHeader" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><i class="fas fa-ellipsis-v"></i></a>
                        <div class="dropdown-menu dropdown-primary">
                            <a class="dropdown-item export-game" role="button" tabindex="0"><i class="fas fa-download"></i>&nbsp;&nbsp;Download</a>
                            <a class="dropdown-item delete-game" role="button" tabindex="0" data-bs-toggle="modal" data-bs-target="#deleteGameModal"><i class="fas fa-trash-alt"></i>&nbsp;&nbsp;Delete</a>
                        </div>
                    </div>
                </div>
            </div> 
            <hr class="hr-game-content">
            <div class="game-body">
                <h3 class="table-header">Table</h3>
                <div class="table-responsive">
                    <table class="game-table table table-striped center">
                        <thead>
                            <tr>
                                <th>${positionTableHeader}</th>
                                <th>Name</th>
                                <th>${matchesPlayedTableHeader}</th>
                                <th>Points</th>
                                <th class="final-letter-th">Final</th>
                            </tr>
                        </thead>
                        <tbody class="game-table-body">
                            <!-- table rows are generated here -->
                        </tbody>
                    </table>
                </div>   
                
                <h3 class="matches-header">Matches</h3>
                <ul class="list-group list-group-flush matches-list">
                    <!-- list rows with matches are generated here. Example: -->
                </ul>
                <div class="mobile-game-footer">
                    <hr class="mt-4">
                    <div class="mt-4">
                        <div class="d-inline float-start invisible"><a class="dropdownMenuGameFooter ms-1" type="button" aria-haspopup="true" aria-expanded="false"><i class="fas fa-ellipsis-v"></i></a></div>
                        <div class="d-inline game-footer-toggle"><i class="fas fa-chevron-up"></i></div>
                        <div class="dropdown d-inline float-end">
                        <a class="dropdownMenuGameFooter me-1" type="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><i class="fas fa-ellipsis-v"></i></a>
                        <div class="dropdown-menu dropdown-primary">
                            <a class="dropdown-item delete-game" role="button" tabindex="0" data-bs-toggle="modal" data-bs-target="#deleteGameModal"><i class="fas fa-trash-alt"></i>&nbsp;&nbsp;Delete</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;


    return element;
}

function getMatchesListRowElement(gameId, matchId, player1, player2, player3, player4, isMatchPlayed) {
    const spacingElement = $(window).width() < 768 ? "" : " &nbsp;|&nbsp;&nbsp; ";    
    const player1BagdeValue = isMatchPlayed ? getPlayerPlacementInMatch(gameId, player1, matchId) : "";
    const player2BagdeValue = isMatchPlayed ? getPlayerPlacementInMatch(gameId, player2, matchId) : "";
    const player3BagdeValue = isMatchPlayed ? getPlayerPlacementInMatch(gameId, player3, matchId) : "";
    const player4BagdeValue = isMatchPlayed ? getPlayerPlacementInMatch(gameId, player4, matchId) : "";
    
    const element = 
    `<li class="list-group-item">
        <div class="match-info d-flex justify-content-between">
            <div><b class="match-number">Match <span class="match-id">${matchId}</span></b></div>
            <div>
                <div class="d-md-flex justify-content-center">
                <div><span class="match-player-1">${player1}</span> <span class="match-player-1-bagde badge badge-placement-${player1BagdeValue}">${player1BagdeValue}</span>${spacingElement}</div>
                <div><span class="match-player-2">${player2}</span> <span class="match-player-2-bagde badge badge-placement-${player2BagdeValue}">${player2BagdeValue}</span>${spacingElement}</div>
                <div><span class="match-player-3">${player3}</span> <span class="match-player-3-bagde badge badge-placement-${player3BagdeValue}">${player3BagdeValue}</span>${spacingElement}</div>
                <div><span class="match-player-4">${player4}</span> <span class="match-player-4-bagde badge badge-placement-${player4BagdeValue}">${player4BagdeValue}</span> </div>
                </div>
            </div>
            <div><button type="button" class="btn" data-bs-toggle="modal" data-bs-target="#matchResultModal"><i class="fas fa-edit"></i></button></div>
        </div>
    </li>`;

    return element;
}