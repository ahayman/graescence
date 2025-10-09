import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextResponse } from 'next/server'
import { isError } from '../../types'

/**
 * Generates a Vercel Blob upload URL and token for the client to use.
 * Used in conjunction with the `upload` function from `@vercel/blob/client` on the client side.
 */
export const POST = async (request: Request): Promise<NextResponse> => {
  const body = (await request.json()) as HandleUploadBody

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'],
      }),
    })
    return NextResponse.json(result)
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: `Upload failed: ${isError(error) ? error.message : error}` }, { status: 500 })
  }
}
