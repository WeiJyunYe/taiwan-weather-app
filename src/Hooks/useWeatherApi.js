import { useState, useEffect, useCallback } from "react"

const fetchCurrentWeather = (locationName) => {
  return fetch(
    `https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=${process.env.REACT_APP_API_KEY}&locationName=${locationName}`
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error(response.statusText)
      }
      return response.json()
    })
    .then((data) => {
      //console.log(data)
      const locationData = data.records.location[0]
      const neededData = ["WDSD", "TEMP", "HUMD"]
      const weatherElements = locationData.weatherElement.reduce(
        (neededElements, currentElement) => {
          if (neededData.includes(currentElement.elementName)) {
            neededElements[currentElement.elementName] = currentElement.elementValue
          }
          return neededElements
        },
        {}
      )

      return ({
        temperature: weatherElements.TEMP,
        windSpeed: weatherElements.WDSD,
        humid: weatherElements.HUMD,
      })
    })
    .catch((error) => {
      console.log(error)
      alert("系統發生錯誤，請您重新整理。若仍跳出此訊息，很抱歉，因無法取得您所在縣市氣象資料，暫時無法提供服務。")
    })
}

const fetchWeatherForecast = (cityName) => {
  return fetch(
    `https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${process.env.REACT_APP_API_KEY}&locationName=${cityName}`
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error(response.statusText)
      }
      return response.json()
    })
    .then((data) => {
      //console.log(data)
      const locationData = data.records.location[0]
      const neededData = ["Wx", "PoP"]
      const weatherElements = locationData.weatherElement.reduce(
        (neededElements, currentElement) => {
          if (neededData.includes(currentElement.elementName)) {
            neededElements[currentElement.elementName] = currentElement.time[0].parameter
          }
          return neededElements
        },
        {}
      )

      return ({
        locationName: locationData.locationName,
        description: weatherElements.Wx.parameterName,
        weatherCode: weatherElements.Wx.parameterValue,
        probabilityOfPrecipitation: weatherElements.PoP.parameterName,
      })
    })
    .catch((error) => {
      console.log(error)
      alert("系統發生錯誤，請您重新整理。若仍跳出此訊息，很抱歉，因無法取得您所在縣市氣象資料，暫時無法提供服務。")
    })
}

export default function useWeatherApi(currentLocation) {
  const { locationName, cityName } = currentLocation
  const [currentWeather, setCurrentWeather] = useState({
    isLoading: true,
    locationName: "",
    description: "",
    temperature: 0,
    windSpeed: 0,
    humid: 0,
    weatherCode: 0,
  })

  const fetchData = useCallback(() => {
    const fetchingData = async () => {
      const [currentWeatherData, weatherForecastData] = await Promise.all([
        fetchCurrentWeather(locationName),
        fetchWeatherForecast(cityName),
      ])
      setCurrentWeather({
        ...currentWeatherData,
        ...weatherForecastData,
        isLoading: false,
      })
    }

    setCurrentWeather((prevState) => ({
      ...prevState,
      isLoading: true,
    }))

    fetchingData()
  }, [locationName, cityName])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return [currentWeather, fetchData]
}