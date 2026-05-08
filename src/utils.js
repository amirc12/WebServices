const path = require("path");

const utils = exports;

utils.getCurrentDomainFilePath = function (req, fileName)
{
    fileName = (fileName[0] == "/") ? fileName.slice(1) : fileName;

    const webSitesDir = __dirname.replace("src", "web_sites");
    
    const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(req.hostname);
    const hostName = isIpAddress ? "language-indicator.com" : req.hostname.replace('www.', '');
    
    let filePath = path.join(webSitesDir, hostName, fileName);

    return filePath;
}

utils.getCurrentDomainDir = function (req)
{
    let webSitesDir = __dirname.replace("src", "web_sites");
    webSitesDir = path.join(webSitesDir + "/" + req.hostname.replace('www.', ''));

    return webSitesDir;
}
