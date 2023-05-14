class Utils
{
    static extractTradeFromDataRecord(record)
    {
        const strikeChange  = (record.strike / record.price * 100 - 100).toFixed(2);
        const premiumChange = (record.premium / record.price * 100).toFixed(2);
        const otm           = ((record.premium + record.dividend) / record.price * 100).toFixed(2);
        const itm           = ((record.strike - record.price + record.premium + record.dividend) / record.price * 100).toFixed(2);
        const datesDif      = (new Date(record.exp_date) - new Date(record.date)) / (1000 * 60 * 60 * 24);
        const otmYearly     = (otm / datesDif * 365).toFixed(2);
        const itmYearly     = (itm / datesDif * 365).toFixed(2);
        const cost          = (record.price * record.shares).toLocaleString();
    
        return( 
        {
            date          : record.date,
            symbol        : record.symbol,
            price         : record.price,
            shares        : record.shares,
            cost          : cost,
            strike        : record.strike,
            strikeChange  : strikeChange,
            premium       : record.premium,
            premiumChange : premiumChange,
            dividend      : record.dividend,
            otm           : otm,
            otmYearly     : otmYearly,
            itm           : itm,
            itmYearly     : itmYearly,
            expDate       : record.exp_date
        });
    };
}

export default Utils;
