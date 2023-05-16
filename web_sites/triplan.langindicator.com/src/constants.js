const constants = exports;

constants.API_URL = (process.env.NODE_ENV === 'development') 
                    ? "http://triplan.langindicator.com:5000/plan"
                    : "https://triplan.langindicator.com/plan";

constants.FETCH_OPTIONS =
{
    method:  "GET",
    headers: {}
};


