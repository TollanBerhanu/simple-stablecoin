import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:8080/api' // Base URL for all requests
axios.defaults.headers.post['Content-Type'] = 'application/json' // Used for all POST requests

axios.interceptors.request.use( requestConfig => {
  // console.log('Interceptor Request: ')
  // console.log(requestConfig)
  return requestConfig // Return the request configuration otherwise it will block the request
}, error => {
  console.log('Interceptor Request Error: ')
  console.log(error) // Handle errors globally (Only request setting errors, bad urls won't be caught)
  return Promise.reject(error) // To forward the error to every request to be handled again with .catch
})

axios.interceptors.response.use( responseConfig => {
  // console.log('Interceptor Response: ')
  // console.log(responseConfig)
  return responseConfig
}, error => {
  console.log('Interceptor Response Error: ')
  console.log(error)
  return Promise.reject(error)
})

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
