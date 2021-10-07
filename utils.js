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

    if(isMobileView()){
        month = month.slice(0,3);
    }

    dateString = day + '. ' + month + ' ' + year;
    return dateString;
}