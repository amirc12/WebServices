const constants = exports;

constants.API_URL = (process.env.NODE_ENV === 'development') 
                    ? "http://shirco-studio.com:5000/studio"
                    : "https://shirco-studio.com/studio";

constants.FETCH_OPTIONS =
{
    method:  "GET",
    headers: {}
};


