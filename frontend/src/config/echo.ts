import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;
console.log(localStorage.getItem('token'));


const echo = new Echo({
  broadcaster: 'pusher',
  key: '5a1bb5be631d41bed26a',
  cluster: 'ap1',
  forceTLS: true,
  authEndpoint: 'http://localhost:8000/broadcasting/auth',
  auth: {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  },
});

echo.connector.pusher.connection.bind('error', (error) => {
  console.error('WebSocket Error:', error);
});

echo.connector.pusher.connection.bind('connected', () => {
  console.log('WebSocket connected');
});

export default echo;
