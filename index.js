const express = require('express')
const fetch = require('node-fetch');
require('dotenv').config();

const app = express()

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Starting server at ${port}`);
});

app.use(express.static('main'))
app.use(express.json({'limit':'1mb'}))

/* setting up database */
const DataStore = require('nedb')

const database = new DataStore('database.db')
database.loadDatabase();

const dbObj = {
  cityName:'',
  latitude:0,
  longitude:0,
  timeStamp:'',
  temp:'',
  aq:''
}

app.post('/geo',(request , response)=>{
  console.log("City Name POST");
  
  const data = request.body
  const timeStamp = Date.now()
  
  dbObj.timeStamp = timeStamp
  dbObj.cityName = data.cityName
  
  // database.insert(data)
  
  console.log(data);
  response.json(data)
})

app.get('/geo',(request , response)=>{
  database.find({}, (error , data)=>{
    if(error){
      response.json({
        error : "Some error happened!!"
      })
      response.end()
    }
    else{
      response.json(data)
    }
  })
})

app.get('/weather/:city',async (request,response) => {
  console.log(request.params);
  const city = request.params.city
  const api_key = process.env.WEATHER_API_KEY;
  let weather_data=''
  let lat ='' 
  let lon =''

  try{
    const weather_url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${api_key}`;

    const weather_response = await fetch(weather_url);
    weather_data = await weather_response.json();

    lat = weather_data.coord.lat 
    lon = weather_data.coord.lon 
    console.log(lat,lon);

    dbObj.latitude = lat
    dbObj.longitude = lon
    dbObj.temp = weather_data.main.temp
    // database.insert(dbObj)
  }catch(error){
    console.log(error);
    weather_data= null
  }


  try{
    // const aq_url = `http://docs.openaq.org/v2/latest?coordinates=${lat},${lon}`;
    const aq_response = await fetch(`https://docs.openaq.org/v2/latest?coordinates=${lat},${lon}`)
    const aq_data = await aq_response.json()
    const entry = aq_data.results[0].measurements[0]
    dbObj.aq = `${entry.parameter} | ${entry.value} ${entry.unit} `
    const data = {
      weather:weather_data,
      air_quality : aq_data  
    }

    response.json(data)
  
  }catch(error){
    console.log(error)
    aq_data=""
    response.json({
      weather:weather_data,
      air_quality:""
    })
  }
  database.insert(dbObj)

})
