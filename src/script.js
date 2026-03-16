const API_KEY = "d01908a858374a0a84c80404261603";

function getLocation() {
  if(navigator.geolocation)navigator.geolocation.getCurrentPosition(success, error);
  else showError("Geolocation is not supported by this browser.");
}

//call function for city
function getCity(){
    document.getElementById("error").innerText = "";
    let city = document.getElementById("city").value;
    if(city === ""){
        showError("Please enter a city name.");
        return;
    }
    pushToLocalStorage("", city);
    getCurrentWeather(city);
    forecastWeather(city);  
}

// Function to get existing IP from localStorage
function success(position) {
   
     // Get existing IP from localStorage
   
    pushToLocalStorage(position);

    let lat = position.coords.latitude;
    let lon = position.coords.longitude;

    getCurrentWeather(`${lat},${lon}`);
    forecastWeather(`${lat},${lon}`);
}

//push to local storage
function pushToLocalStorage(position = "", city = "") {
     let IP = getItemLocalStorage();

    // Check if location already exists
    
    let exists = IP.some(function(loc){
        if(city) return loc[0] === city
        else return loc[1] === position.coords.latitude && loc[2] === position.coords.longitude;
    });

    if(!exists){
        let name = city ? city : "IP";
        let locations
        if(position !== "") {
            locations = [name, position.coords.latitude, position.coords.longitude];
        }
        else{
            locations = [name, "", ""];
        }
        
        IP.push(locations);
        setItemLocalStorage(IP);
        getIP();
    }
}

//if no position available
function error() {
    showError("Unable to retrieve your location. Please allow location access or enter a city name.");
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
     let existing = document.getElementById("IPSelect");
     if(existing) existing.remove();
     let IP = getItemLocalStorage();
    if(IP.length > 0) {
        let select = document.createElement("select");
         let option = document.createElement("option");
         option.text = "Select Location";
         option.value = "";
         select.appendChild(option);

        select.setAttribute("id", "IPSelect");
        select.addEventListener("change", myScript);
        IP.forEach(function(location,index){
            let option = document.createElement("option");
            if(location[0] === "IP") option.text = "Lat: " + location[1] + ", Lon: " + location[2];
            else option.text = location[0];
            option.value = index;
            select.appendChild(option);
        })
        document.getElementById('form').appendChild(select);  
    }
}

getIP();

function myScript() {
    document.getElementById("weather").innerHTML = "";
    document.getElementById("forecast").innerHTML = "";

    let select = document.getElementById("IPSelect");
    let selectedIndex = select.options[select.selectedIndex].value;
    if(selectedIndex === "") return;
    let IP = getItemLocalStorage();

    let lat = IP[selectedIndex][1];
    let lon = IP[selectedIndex][2];
    

    if(lat === "" || lon === "") {
        getCurrentWeather(IP[selectedIndex][0]);
        forecastWeather(IP[selectedIndex][0]);
    }   
    else{
        getCurrentWeather(`${lat},${lon}`);
        forecastWeather(`${lat},${lon}`);
    }
}

//weather api current day
async function getCurrentWeather(city){

    try{

        let url = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${city}`;

        let response = await fetch(url);
        let data = await response.json();

        if(data.error){
            showError(data.error.message);
            return;
        }

        displayWeather(data);

    }catch(error){
        console.log(error);
    }
}

//display weather data
let currentTempC = null;
let isCelsius = true;

function displayWeather(data){

    currentTempC = data.current.temp_c;

    let weatherDiv = document.getElementById("weather");

    weatherDiv.innerHTML = `
        <section class="p-5">
        <h2 class="text-2xl font-bold">${data.location.name}</h2>
        <p id="temp">Temperature: ${currentTempC} °C</p>
        <p>Condition: ${data.current.condition.text}</p>
        <p>Humidity: ${data.current.humidity}%</p>
        <p>Wind: ${data.current.wind_kph} kph</p>
        <img src="${data.current.condition.icon}">
        <button onclick="toggleTemp()" class="bg-gray-700 text-white p-2 mt-3 rounded" id="toggleBtn">
        Toggle °C / °F
        </button>
        </section>
    `;
    updateBackground(data.current.condition.text);
    
}

//5 day forecast
async function forecastWeather(city) {
  try {

    let url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city}&days=5`;

    let response = await fetch(url);
    let data = await response.json();

    if(data.error){
        showError(data.error.message);
        return;
    }

    displayForecast(data);

  } catch(error){
    console.log(error);
  }
}

function displayForecast(data){

    let forecastDiv = document.getElementById("forecast");
    forecastDiv.innerHTML = "";
       
    data.forecast.forecastday.forEach(day => {
        forecastDiv.innerHTML += `
        <div class="bg-white shadow-lg p-6 rounded-lg text-center">
        <p class="font-bold">${day.date.split("-").reverse().join("-")}</p>
        <img src="${day.day.condition.icon}">
        <p>Temp: ${day.day.avgtemp_c} °C</p>
        <p>Humidity: ${day.day.avghumidity}%</p>
        <p>Wind: ${day.day.maxwind_kph} kph</p>
        </div>
        `;
    });
}
//change temp unit
function toggleTemp(){

    let tempElement = document.getElementById("temp");

    if(isCelsius){

        let f = (currentTempC * 9/5) + 32;

        tempElement.innerText = "Temperature: " + f.toFixed(1) + " °F";

        isCelsius = false;

    }else{

        tempElement.innerText = "Temperature: " + currentTempC + " °C";

        isCelsius = true;

    }
}

//display error message
function showError(message){
    
    document.getElementById("error").innerText = message;
    setTimeout(function(){
        document.getElementById("error").innerText = "";
    }, 5000);
}

function updateBackground(condition){

    
    condition = condition.toLowerCase();

    document.body.classList.remove("sunny-bg","cloudy-bg","rainy-bg","snow-bg", "normal-bg");

    if(condition.includes("rain")){
        document.body.classList.add("rainy-bg");
    }
    else if(condition.includes("cloud")){
        document.body.classList.add("cloudy-bg");
    }
    else if(condition.includes("snow")){
        document.body.classList.add("snow-bg");
    }
    else if(condition.includes("sun") || condition.includes("clear")){
        document.body.classList.add("sunny-bg");
    }   
    else{
        document.body.classList.add("normal-bg");
    }

}


     

