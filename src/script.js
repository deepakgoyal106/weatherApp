function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success, error);
  } else { 
    x.innerHTML = "Geolocation is not supported by this browser.";
  }
}
// Function to get existing IP from localStorage
function success(position) {
    let location = ['IP', position.coords.latitude, position.coords.longitude];
     // Get existing IP from localStorage
    let IP = getItemLocalStorage();

    // Check if location already exists
    let exists = IP.some(function(loc){
        return loc[1] === position.coords.latitude && loc[2] === position.coords.longitude;
    });

    console.log(exists)
    if(!exists){
        IP.push(location);
        setItemLocalStorage(IP);
    }
    
    alert("Latitude: " + position.coords.latitude + 
        "<br>Longitude: " + position.coords.longitude);
}
//if no position available
function error() {
  alert("Sorry, no position available.");
}

//set local storage
function setItemLocalStorage(IP) {
     localStorage.setItem("IP", JSON.stringify(IP));
}

//get local storage
function getItemLocalStorage() {
    return JSON.parse(localStorage.getItem("IP")) || [];
}

// Function to get existing IP from localStorage
function getIP() {
    let IP = getItemLocalStorage();
    if(IP.length > 0) {
        let select = document.createElement("select");

        select.setAttribute("id", "IPSelect");
        
        IP.forEach(function(location,index){
            let option = document.createElement("option");
            option.text = "Lat: " + location[1] + ", Lon: " + location[2];
            option.value = index;
            select.add(option);
        })
        document.getElementById('form').appendChild(select);  
    }
  
}

getIP();

     

