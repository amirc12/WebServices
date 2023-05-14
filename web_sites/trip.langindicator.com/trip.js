
// window.onload = function ()
// {
// };

let titles = document.getElementsByClassName("title");

for(let title of titles)
{
    const img = document.createElement("img");
    img.src = "./images/expand_more.png";

    title.appendChild(img);

    title.addEventListener("click", function() 
    {
        let content = title.nextElementSibling;

        let img = title.getElementsByTagName("img")[0];
        img.src = (content.style.display === "block") ? "./images/expand_more.png" : "./images/expand_less.png";

        content.style.display = (content.style.display === "block") ? "none" : "block";
    });
}

let addresses = document.getElementsByClassName("address");

for(let item of addresses)
{
    item.style = "margin-top: 5px;"
    const address =  item.getAttribute("dest");
    
    item.innerHTML = "<u>כתובת</u>&nbsp;&nbsp;";

    // <a href="https://waze.com/ul?q=Roekelseweg 44-48 6733 BP Wekerom Netherlands"><img src="waze.png" /></a><br>
    let a = document.createElement("a");
    a.href = "https://waze.com/ul?q=" + address;

    // a.append("(Open Waze)");
    let img = document.createElement("img");
    img.src = "./images/waze.png";
    img.className = "waze_img";
    a.appendChild(img);

    item.appendChild(a);

    //https://www.google.com/maps/search/?api=1&query=
    a = document.createElement("a");
    a.href = "https://www.google.com/maps/search/?api=1&query=" + address;

    // a.append("(Google Maps)");
    img = document.createElement("img");
    img.src = "./images/google_maps.png";
    img.className = "google_img";
    a.appendChild(img);

    item.appendChild(a);

    const div = document.createElement("div");
    div.innerHTML = address;
    // item.parentNode.appendChild(div);
    item.parentNode.insertBefore(div, item.nextSibling);
}    
// for(let item of addresses)
// {
//     const address =  item.getAttribute("dest");
//     item.innerHTML = "כתובת - " + address + " " + item.innerHTML + "&nbsp;";

//     // <a href="https://waze.com/ul?q=Roekelseweg 44-48 6733 BP Wekerom Netherlands"><img src="waze.png" /></a><br>
//     const a = document.createElement("a");
//     a.href = "https://waze.com/ul?q=" + address;

//     const img = document.createElement("img");
//     img.src = "waze.png";
//     img.className = "waze_img";

//     a.appendChild(img);

//     item.appendChild(a);

//     //https://www.google.com/maps/search/?api=1&query=
//     const aG = document.createElement("a");
//     aG.href = "https://www.google.com/maps/search/?api=1&query=" + address;

//     const imgG = document.createElement("img");
//     imgG.src = "google_maps.png";
//     imgG.className = "google_img";

//     aG.appendChild(imgG);

//     item.appendChild(aG);
// }    

function OnClickExpand()
{
    let titles = document.getElementsByClassName("title");
    for(let title of titles)
    {
        let img = title.getElementsByTagName("img")[0];
        img.src = "./images/expand_less.png";
    }
    
    let contents = document.getElementsByClassName("content");
    for(let content of contents)
    {
        content.style.display = "block"; 
    }    
}

function OnClickCollapse()
{
    let titles = document.getElementsByClassName("title");
    for(let title of titles)
    {
        let img = title.getElementsByTagName("img")[0];
        img.src = "./images/expand_more.png";
    }

    let contents = document.getElementsByClassName("content");
    for(let content of contents)
    {
        content.style.display = "none"; 
    }    
}

function OnClickWeather()
{
    const button = document.getElementById("weather_button");
    const weather = document.getElementById("weatherwidget");

    if(weather.style.display === "block")
    {
        weather.style.display = "none";
        button.innerHTML = "Show Weather";
    }
    else
    {
        weather.style.display = "block";
        button.innerHTML = "Hide Weather";
    }
}

!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src='https://weatherwidget.io/js/widget.min.js';fjs.parentNode.insertBefore(js,fjs);}}(document,'script','weatherwidget-io-js');
