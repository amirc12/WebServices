const images = ['li_1.png',
				'li_2.png', 
				'li_3.png', 
				'li_4.png', 
				'li_5.png', 
				'li_6.png', 
				'li_7.png', 
				'li_7.png', 
				'li_8.png', 
				'li_8.png', 
				'li_8.png', 
				'li_8.png'];

const imgElement = document.getElementById("li_image");
let index = 0;

function change()
{
	imgElement.src = images[index];
	index > 10 ? index = 0 : index++;
}

window.onload = function ()
{
    var fileName = window.location.pathname.split('/').pop();

    if(fileName !== 'contact.html')
	    setInterval(change, 400);
};

const API_URL = "https://language-indicator.com/contact";
// const API_URL = "http://127.0.0.1/contact?a=1";
// const API_URL = "http://language-indicator.com:5000/contact";


async function OnSendMessageButtonClick()
{
    const form = document.querySelector('#contact_form');
    const formData = new FormData(form);
    const jsonObject = {};
    
    for (const [key, value] of formData.entries()) 
    {
      jsonObject[key] = value;
    }
    
    const jsonString = JSON.stringify(jsonObject);
    
    console.log(jsonString);

    const options =
    {
        method  : "POST",
        headers : {},
        body    : jsonString
    };

    let response = await fetch (API_URL, options);
    let json     = await response.json();
    if(json.status == 1)
    {
        //dont know why but without timer, server returns 502 Bad Gateway error
        setTimeout(() => {window.location.href = 'contact_ty.html'}, 1000);
    }
}
