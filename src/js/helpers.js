import { async } from 'regenerator-runtime';
import { TIMEOUT_SEC } from './config';

//error handling and get json
const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};
export const AJAX = async function (url, uploadData = undefined) {
  try {
    const fetchPro = uploadData
      ? fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(uploadData),
        })
      : fetch(url);
    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
    // 'https://forkify-api.herokuapp.com/api/v2/recipes/5ed6604591c37cdc054bc886'
    //fetch returns promise, so await promise, but async func so does not block thread of execution, //fetch returns response object
    const data = await res.json(); //res.json() returns another promise have to wait for, then get data
    if (!res.ok) throw new Error(`${data.message} (${res.status})`); //from response of serverapi, res.
    return data;
  } catch (err) {
    throw err;
  }
};
