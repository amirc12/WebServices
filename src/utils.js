const path = require("path");

const utils = exports;

utils.getCurrentDomainFilePath = function (req, fileName)
{
    fileName = (fileName[0] == "/") ? fileName.slice(1) : fileName;

    const webSitesDir = __dirname.replace("src", "web_sites");
    let filePath = path.join(webSitesDir + "/" + req.hostname.replace('www.', '') + "/" + fileName);

    return filePath;
}

utils.getCurrentDomainDir = function (req)
{
    let webSitesDir = __dirname.replace("src", "web_sites");
    webSitesDir = path.join(webSitesDir + "/" + req.hostname.replace('www.', ''));

    return webSitesDir;
}
