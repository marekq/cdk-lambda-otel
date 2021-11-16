import axios from 'axios';

exports.handler = async function (event) {
    console.log('request:', JSON.stringify(event, undefined, 2));

    const get = await axios.get('https://ipinfo.io/json');

    return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(get.data, undefined, 2)
    };
};