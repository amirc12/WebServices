
const API_URL = "https://hamadaf-hakatan.com/contact";
// const API_URL = "http://127.0.0.1/contact?a=1";
// const API_URL = "http://hamadaf-hakatan.com:5000/contact";


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
