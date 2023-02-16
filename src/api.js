import axios from 'axios';

export default axios.create({
    baseURL: 'https://whowhatwhere.azurewebsites.net/api/'
});