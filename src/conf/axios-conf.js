// import axios from 'axios';

// export const baseUrl = 'http://imfood-core.local';

// const axios2 = axios.create({
//   baseURL: baseUrl
// })

// axios2.interceptors.request.use(function (request) {
//   if(request.url !== `/api/login_check`){
//     request.headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`
//   }
//   return request;
// }, function (error) {
//   return Promise.reject(error);

// });

// axios2.interceptors.response.use(function (response) {
//   return response;
// }, function (error) {
//   if(error.response && error.response.status == 401 && error.config.url !== `${baseUrl}/api/login_check`){
//       localStorage.removeItem('token');
//       window.location.reload();
//       return Promise.reject(error);
//   }
//   return Promise.reject(error);
// });

// export default axios2;
