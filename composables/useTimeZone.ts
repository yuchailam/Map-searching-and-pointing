import axios, { AxiosRequestConfig } from 'axios';

export const useTimeZoneAPI = (point: LocationPoint) => {
  let date = new Date();
  let timestamp = date.getTime() / 1000 + date.getTimezoneOffset() * 60;
  let config: AxiosRequestConfig = {
    method: 'get',
    url: `https://maps.googleapis.com/maps/api/timezone/json?location=${point.lat},${point.lng}&timestamp=${timestamp}&key=${
      useRuntimeConfig().GeoAPIKey
    }`,
    headers: {},
  };

  // res.data : {
  // dstOffset: 0
  // rawOffset: 28800
  // status: "OK"
  // timeZoneId: "Asia/Hong_Kong"
  // timeZoneName: "Hong Kong Standard Time"
  //   }

  return axios(config)
    .then((res) => {
      let result = res.data;
      if (result.status === 'OK') {
        return {
          timeZoneId: result.timeZoneId,
          timeZoneName: result.timeZoneName,
          localTime: new Date((timestamp + result.dstOffset + result.rawOffset) * 1000).toLocaleString(),
        };
      }
      return null;
    })
    .catch((error) => {
      console.log('Internal Error', error);
      return null;
    });
};
