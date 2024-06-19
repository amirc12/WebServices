const constants = require("./constants");

class Utils
{
    static async fetchMyWordsData()
    {
        const url      = `${constants.API_URL}/my_words?q=amir`;
        const response = await fetch (url, constants.FETCH_OPTIONS);
        const myWords  = await response.json();
    
        return myWords;
    };

    static async fetchDetailsWordsData()
    {
        const url      = `${constants.API_URL}/details_words?q=amir`;
        const response = await fetch (url, constants.FETCH_OPTIONS);
        const detailsWords  = await response.json();
    
        return detailsWords;
    };
}

export default Utils;
