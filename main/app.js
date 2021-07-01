const latEle = document.getElementById("latitude")
const lngEle = document.getElementById("longitude")
const timeEle = document.getElementById("time")
const inputLat = document.getElementById("lat")
const inputLng = document.getElementById("lng")
const inputCountry = document.getElementById("country")
const btn = document.getElementById("submit")
const his = document.getElementById("history")
const tempEle = document.getElementById("temp")
const airEle = document.getElementById("aq")



/*
  Start leaflet.js
*/


//initializing the map and putting it inside ==> div with id = "mapid"
const mymap = L.map('mapid').setView([0, 0], 1);


//boilerplate for openstreetmap

const attribution =
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const tiles = L.tileLayer(tileUrl, { attribution });
tiles.addTo(mymap);



btn.addEventListener('click',()=>{
  if(inputCountry.value === ''){
    alert("Please enter City Name")
    return
  }else{
    MainFn(inputCountry.value)
  }
})

his.addEventListener('click',async ()=>{
  await getAllHistory()
})


/*
Main content display if geolocation avaialble
*/
async function MainFn(cityName){

  btn.disabled = true
  const data = {cityName}
  const options = {
    method:"POST",
    headers:{
      'Content-Type':'application/json'
    },
    
    body:JSON.stringify(data)
    
  }

  const response = await fetch('/geo',options)
  const POSTresponse = await response.json()
  const dateString = new Date(POSTresponse.timeStamp).toLocaleString()

  const WA_response = await fetch(`/weather/${POSTresponse.cityName}`)
  const WA_json = await WA_response.json()
  let temperature = await WA_json.weather.main.temp
  console.log(WA_json);
  try{
  
  latitude = await WA_json.weather.coord.lat
  longitude = await WA_json.weather.coord.lon
  latEle.innerHTML = latitude
  lngEle.innerHTML = longitude


  timeEle.textContent = dateString
  
  tempEle.innerHTML = temperature
}catch(error){
  latEle.innerHTML = "not available"
  lngEle.innerHTML = "not available"
  tempEle.innerHTML = "not available"
  timeEle.textContent = ""

  airEle.innerHTML = "NO available Data"
  return
}

try{
  
  const aq_variable = WA_json.air_quality.results[0].measurements[0]
  airEle.innerHTML = `paramter: ${aq_variable.parameter}  |  value : ${aq_variable.value} ${aq_variable.unit} `
}catch(error){
  // console.log(error);
  airEle.innerHTML = "NO available Data"
  }


  const marker = L.marker([latitude, longitude]).addTo(mymap)

  const txt = `Latitude : ${latitude}&deg
      Longitude : ${longitude}&deg 
      time : ${dateString} 
      temperature : ${temperature}&deg C 
      Air quality : ${airEle.innerText} `
  marker.bindPopup(txt)

  btn.disabled = false

}


async function getAllHistory(){
  const response = await fetch('/geo')
  const data = await response.json()
  for(item of data){
        let theTime = new Date(item.timeStamp).toLocaleString()
        let txt = `Latitude : ${item.latitude}&deg
        Longitude : ${item.longitude}&deg /
        time : ${theTime} 
        temperature : ${item.temp}&deg C 
        Air quality : ${item.aq | "Not available"} `
        const marker = L.marker([item.latitude, item.longitude]).addTo(mymap)
        marker.bindPopup(txt)
  }
}

