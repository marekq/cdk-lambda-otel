import axios from 'axios';
const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const AWS = new DynamoDBClient();

exports.handler = async function (event: any) {
    console.log('request:', JSON.stringify(event, undefined, 2));

    const get = await axios.get('https://ipinfo.io/json');

    const PutItem = new PutItemCommand({
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Item: {
            id: { S: Math.floor((Math.random() * 100) + 1).toString() },
        }
    });

    const PutItemResponse = await AWS.send(PutItem);
    console.log(PutItemResponse);

    return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(get.data, undefined, 2)
    };
};