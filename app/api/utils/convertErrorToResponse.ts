import { isServerError } from '../types'

export const convertErrorToResponse = (error: any): Response => {
  if (isServerError(error)) {
    return new Response(JSON.stringify({ message: error.message, error: error.error }), {
      headers: { 'Content-Type': 'application/json' },
      status: error.statusCode,
    })
  }
  return new Response(JSON.stringify({ message: 'Failed to fetch user', error }), {
    headers: { 'Content-Type': 'application/json' },
    status: 500,
  })
}
