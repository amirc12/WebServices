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
}

export default Utils;
