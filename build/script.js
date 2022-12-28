geolocationSupported();

function geolocationSupported() {
  if (navigator.geolocation) {
    console.log("Geolocation is supported by this browser :)");
    getWeatherForecast();
  } else {
    console.log("Error: Geolocation is NOT supported by this browser :(");
  }
}

function gettingCurrentConditions(usingToDet, element) {
  switch (usingToDet) {
    case 0:
      element.innerText = "Clear sky";
      break;
    case 1:
      element.innerText = "Mainly clear";
      break;
    case 2:
      element.innerText = "Partly cloudy";
      break;
    case 3:
      element.innerText = "Overcast";
      break;
    case 45:
      element.innerText = "Fog";
      break;
    case 48:
      element.innerText = "Rime fog";
      break;
    case 51:
      element.innerText = "Drizzle: light";
      break;
    case 53:
      element.innerText = "Drizzle: moderate";
      break;
    case 55:
      element.innerText = "Drizzle: dense";
      break;
    case 56:
      element.innerText = "Freezing drizzle: light";
      break;
    case 57:
      element.innerText = "Freezing drizzle: dense";
      break;
    case 61:
      element.innerText = "Rain: slight";
      break;
    case 63:
      element.innerText = "Rain: moderate";
      break;
    case 65:
      element.innerText = "Rain heavy";
      break;
    case 66:
      element.innerText = "Freezing rain: light";
      break;
    case 67:
      element.innerText = "Freezing rain: heavy";
      break;
    case 71:
      element.innerText = "Snow fall: slight";
      break;
    case 73:
      element.innerText = "Snow fall: moderate";
      break;
    case 75:
      element.innerText = "Snow fall: heavy";
      break;
    case 77:
      element.innerText = "Snow grains";
      break;
    case 80:
      element.innerText = "Rain showers: slight";
      break;
    case 81:
      element.innerText = "Rain showers: moderate";
      break;
    case 82:
      element.innerText = "Rain showers: violent";
      break;
    case 85:
      element.innerText = "Snow showers: slight";
      break;
    case 86:
      element.innerText = "Snow showers: heavy";
      break;
    case 95:
      element.innerText = "Thunderstorm: moderate";
      break;
    case 96:
      element.innerText = "Thunderstorm: slight hail";
      break;
    case 99:
      element.innerText = "Thunderstorm: heavy hail";
      break;

    default:
      element.innerText = "Looks good :)";
      break;
  }
}

function getWeatherForecast() {
  navigator.geolocation.getCurrentPosition((result) => {
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${result.coords.latitude}&longitude=${result.coords.longitude}&hourly=temperature_2m,relativehumidity_2m,apparent_temperature,weathercode,visibility&models=best_match&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset&current_weather=true&timezone=auto`
    )
      .then((resp) => resp.json())
      .then((jsonData) => {
        console.log(jsonData);

        const currentWeather = document.getElementById("currentWeather");
        currentWeather.innerText = jsonData.current_weather.temperature + "°";

        const currentLocation = document.getElementById("currentLocation");
        const timeZone = jsonData.timezone.split("/");
        currentLocation.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${timeZone[1]}`;

        const currentCondition = document.getElementById("currentCondition");
        let weatherCode = jsonData.current_weather.weathercode;
        gettingCurrentConditions(weatherCode, currentCondition);

        const windSpeed = document.getElementById("windSpeed");
        windSpeed.innerText = jsonData.current_weather.windspeed;

        const dayForecasts = document.getElementById("dayForecasts");
        let position = 0;

        const accurateDate = new Date();

        jsonData.daily.time.forEach((element) => {
          let weatherCode = jsonData.daily.weathercode[position];

          let dayForecast = document.createElement("div");
          dayForecast.classList.add("w-full");
          dayForecast.classList.add("h-[20%]");
          dayForecast.classList.add("border-white");
          dayForecast.classList.add("border-t");

          let forecastId = "Forecast" + position;

          let splittedElement = element.split("-");

          if (splittedElement[2] == accurateDate.getDate()) {
            dayForecast.innerHTML = `
                    <div class="flex justify-between items-center h-full">
                        <h1>Today</h1>
                        <h1 id=${forecastId}></h1>
                        <h1>${jsonData.daily.temperature_2m_min[position]} -<span> ${jsonData.daily.temperature_2m_max[position]}</span></h1>
                    </div>
                `;
          } else {
            dayForecast.innerHTML = `
                    <div class="flex justify-between items-center h-full">
                        <h1>${splittedElement[1]} / ${splittedElement[2]}</h1>
                        <h1 id=${forecastId}></h1>
                        <h1>${jsonData.daily.temperature_2m_min[position]} -<span> ${jsonData.daily.temperature_2m_max[position]}</span></h1>
                    </div>
                `;
          }

          dayForecasts.append(dayForecast);

          const forecastResult = document.getElementById(`${forecastId}`);
          gettingCurrentConditions(weatherCode, forecastResult);

          position++;
        });

        jsonData.hourly.time.forEach((element) => {
          let splittedElement = element.split("T");

          let furtherSplitDate = splittedElement[0].split("-");

          let furtherSplitTime = splittedElement[1].split(":");

          if (
            (furtherSplitDate[2] == accurateDate.getDate()) &
            (furtherSplitTime[0] == accurateDate.getHours())
          ) {
            const realFeel = document.getElementById("realFeel");
            const visibility = document.getElementById("visibility");
            const humidity = document.getElementById("humidity");

            const elementIndex = jsonData.hourly.time.indexOf(element);

            realFeel.innerText =
              jsonData.hourly.apparent_temperature[elementIndex] + "°";
            visibility.innerText =
              jsonData.hourly.visibility[elementIndex] / 1000 + " km";
            humidity.innerText =
              jsonData.hourly.relativehumidity_2m[elementIndex] + "%";
          }
        });

        const sunset = document.getElementById("sunset");
        const sunrise = document.getElementById("sunrise");

        jsonData.daily.sunset.forEach((element) => {
          let splittedSunElement = element.split("T");

          let furtherSplitSun = splittedSunElement[0].split("-");

          if (furtherSplitSun[2] == accurateDate.getDate()) {
            sunset.innerHTML =
              splittedSunElement[1] + `<span class="text-2xl">PM</span>`;
          }
        });

        jsonData.daily.sunrise.forEach((element) => {
          let splittedSunElement = element.split("T");

          let furtherSplitSun = splittedSunElement[0].split("-");

          let furtherSplitRise = splittedSunElement[1].split("");

          if (furtherSplitSun[2] == accurateDate.getDate()) {
            sunrise.innerHTML =
              furtherSplitRise[1] + ":" + furtherSplitRise[3] + furtherSplitRise[4] + `<span class="text-2xl">AM</span>`;
          }
        });

        jsonData.hourly.time.filter(element => {
          let splittedElement = element.split("T");
          
          let furtherSplitDate = splittedElement[0].split("-")

          let furtherSplitTime = splittedElement[1].split(":")

          let convertedDate = parseInt(furtherSplitDate[2])

          let convertedTime = parseInt(furtherSplitTime[0]);

          let elementPosition =jsonData.hourly.time.indexOf(element);

          if (convertedDate > (accurateDate.getDate()) + 1 || convertedDate < (accurateDate.getDate())) {
            return false
          } 
          else if ((furtherSplitDate[2] == accurateDate.getDate()) & (convertedTime < accurateDate.getHours())) {
            return false;
          } 
          else {
            const hourlyForecasts = document.getElementById("hourlyForecasts");

            let weatherCode = jsonData.hourly.weathercode[elementPosition];

            let forecastId = "Forecast" + elementPosition;

            let newHour = document.createElement("div");
            newHour.classList.add("w-40");
            newHour.classList.add("h-full");
            newHour.classList.add("border-r");
            newHour.classList.add("border-white");
            if (
              (furtherSplitDate[2] == accurateDate.getDate()) &
              (convertedTime == accurateDate.getHours())
            ) {
              newHour.innerHTML = `
                <div class="h-full flex flex-col justify-between items-center">
                  <h1 class="text-base">Now</h1>
                  <h1 id="${forecastId}" class="text-xl"></h1>
                  <h1 class="text-2xl">${jsonData.hourly.temperature_2m[elementPosition]}</h1>
                </div>
              `;
            } else {
              if (convertedTime > 11) {
                newHour.innerHTML = `
                  <div class="h-full flex flex-col justify-between items-center">
                    <h1 class="text-base">${splittedElement[1]}PM</h1>
                    <h1 id="${forecastId}" class="text-xl"></h1>
                    <h1 class="text-2xl">${jsonData.hourly.temperature_2m[elementPosition]}</h1>
                  </div>
                `;
              } else {
                newHour.innerHTML = `
                  <div class="h-full flex flex-col justify-between items-center">
                    <h1 class="text-base">${splittedElement[1]}AM</h1>
                    <h1 id="${forecastId}" class="text-xl"></h1>
                    <h1 class="text-2xl">${jsonData.hourly.temperature_2m[elementPosition]}</h1>
                  </div>
                `;
              }
            }

            hourlyForecasts.append(newHour);

            const forecastResult = document.getElementById(`${forecastId}`);
            gettingCurrentConditions(weatherCode, forecastResult);
          }
        })
      })
      .catch((err) => console.log("Error: " + err));

    let myHeaders = new Headers();
    myHeaders.append("x-access-token", "openuv-2xtc3tlc6dy4ed-io");
    myHeaders.append("Content-Type", "application/json");

    let requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    /*
    fetch(
      "https://api.openuv.io/api/v1/uv?lat=6.62&lng=3.38&alt=100&dt=",
      requestOptions
    )
      .then((response) => response.json())
      .then((uvData) => {
        console.log(uvData);
        const uvIndex = document.getElementById("uvIndex");
        const exposureLevel = document.getElementById("exposureLevel");

        uvIndex.innerText = Math.round(uvData.result.uv);

        if (Math.round(uvData.result.uv) < 2) {
          exposureLevel.innerText = "Low";
        } else if (
          (Math.round(uvData.result.uv) >= 3) &
          (Math.round(uvData.result.uv) <= 5)
        ) {
          exposureLevel.innerText = "Moderate";
        } else if (
          (Math.round(uvData.result.uv) >= 6) &
          (Math.round(uvData.result.uv) <= 8)
        ) {
          exposureLevel.innerText = "High";
        } else if (
          (Math.round(uvData.result.uv) >= 9) &
          (Math.round(uvData.result.uv) <= 10)
        ) {
          exposureLevel.innerText = "Very High";
        } else if (Math.round(uvData.result.uv) >= 11 ) {
          exposureLevel.innerText = "Extreme";
        }
      })
      .catch((err) => console.log("Error: ", err));
    */
  });
}
