import { APIGatewayEventRequestContext, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export async function handler(
  event: APIGatewayProxyEvent,
  context: APIGatewayEventRequestContext
): Promise<APIGatewayProxyResult> {
  return {
    statusCode: 200,
    headers: event.headers,
    body: JSON.stringify({
      method: event.httpMethod,
      query: event.queryStringParameters,
    })
  }
}