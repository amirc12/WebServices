const constants = exports;

constants.API_URL = (process.env.NODE_ENV === 'development') 
                    ? "http://options.langindicator.com:5000/finance"
                    : "https://options.langindicator.com/finance";

// constants.API_URL = (process.env.NODE_ENV === 'development') 
//                     ? "http://options.webiserve.com:5000/finance"
//                     : "https://options.webiserve.com/finance";

constants.FETCH_OPTIONS =
{
    method:  "GET",
    headers: {}
};
