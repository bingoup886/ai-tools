export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export function createResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}

export function createErrorResponse(message, status = 500) {
  return createResponse({ error: message }, status);
}

export async function handleRequest(handler) {
  try {
    return await handler();
  } catch (error) {
    console.error('API Error:', error);
    return createErrorResponse(error.message || 'Internal Server Error', 500);
  }
}

