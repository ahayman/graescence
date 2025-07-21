import { isServerError } from '../types'

export const convertErrorToResponse = (error: any): Response => {
  console.error('API Error:', error)
  if (isServerError(error)) {
    return new Response(JSON.stringify({ message: error.message, error: error.error }), {
      headers: { 'Content-Type': 'application/json' },
      status: error.statusCode,
    })
  }
  return new Response(JSON.stringify({ message: error.message || 'An error occurred', error }), {
    headers: { 'Content-Type': 'application/json' },
    status: 500,
  })
}
