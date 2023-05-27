const constants = exports;

constants.API_URL = (process.env.NODE_ENV === 'development') 
                    ? "http://mywords.langindicator.com:5000/translate"
                    : "https://mywords.langindicator.com/translate";

constants.FETCH_OPTIONS =
{
    method:  "GET",
    headers: {}
};


