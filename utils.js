function isMobileView(){
    const screenWidth = 768;
    return $(window).width() < screenWidth 
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