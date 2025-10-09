/* eslint-disable @next/next/no-img-element */
'use client'
import { upload } from '@vercel/blob/client'
import { ChangeEventHandler, FunctionComponent, useContext, useEffect, useState } from 'react'
import utilStyles from '../../../styles/utils.module.scss'
import s from './ImageUploader.module.scss'
import Row from '../../Row'
import Header from '../../Header/Header'
import { PutBlobResult, UploadProgressEvent } from '@vercel/blob'
import { isError, isServerError } from '../../../app/api/types'
import Column from '../../Column'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faCopy, faExclamation, faExclamationCircle, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { PatreonContext } from '../../../providers/Patreon/Provider'

const thumbMaxWidth = 200
const thumbMaxheight = 300

const largeSizeWidth = 1000
const largeSizeHeight = 1000

type ImageBlob = {
  blob: Blob
  src: string
  width: number
  height: number
}

type ImageUploadResult = {
  imageName: string
  blobResult?: PutBlobResult
  progress?: UploadProgressEvent
}

export const ImageUploader: FunctionComponent = () => {
  const user = useContext(PatreonContext).state.user
  const [selectedFile, setSelectedFile] = useState<File>()
  const [fileName, setFileName] = useState<string>()
  const [fileExt, setFileExt] = useState<string>()
  const [preview, setPreview] = useState<string>()
  const [thumbnail, setThumbnail] = useState<ImageBlob>()
  const [large, setLarge] = useState<ImageBlob>()
  const [uploading, setUploading] = useState(0)
  const [errors, setErrors] = useState<string[]>([])
  const [uploads, setUploads] = useState<ImageUploadResult[]>([])

  const onImageSelect: ChangeEventHandler<HTMLInputElement> = event => {
    const file = event.target.files?.[0]
    if (!file) return

    const [fileName, fileExt] = file.name.split('.')

    setSelectedFile(file)
    setPreview(file ? URL.createObjectURL(file) : undefined)
    setFileName(fileName)
    setFileExt(fileExt)

    const image = new Image()
    image.src = URL.createObjectURL(file)

    image.onload = () => {
      resize(image, thumbMaxWidth, thumbMaxheight)
        .then(setThumbnail)
        .catch(err => setErrors(e => [...e, err.message]))
      resize(image, largeSizeWidth, largeSizeHeight)
        .then(setLarge)
        .catch(err => setErrors(e => [...e, err.message]))
    }
  }

  const handleError = (error: unknown) => {
    if (isServerError(error)) setErrors(e => [...e, `${error.statusCode}: ${error.message}`])
    else if (isError(error)) setErrors(e => [...e, error.message])
    else setErrors(e => [...e, `Unknown Error: ${error}`])
  }

  const updateUploads = (imageName: string, value: PutBlobResult | UploadProgressEvent) => {
    const updateValue: Partial<ImageUploadResult> = 'percentage' in value ? { progress: value } : { blobResult: value }
    setUploads(uploads => {
      if (uploads.findIndex(u => u.imageName === imageName) < 0) {
        return [...uploads, { imageName, ...updateValue }]
      }
      return uploads.map(u => (u.imageName === imageName ? { ...u, ...updateValue } : u))
    })
  }

  const uploadFile = () => {
    if (!selectedFile || !thumbnail || !large) return
    const uploads: [string, File | Blob][] = [
      [`${fileName}.${fileExt}`, selectedFile],
      [`${fileName}-lg.${fileExt}`, large.blob],
      [`${fileName}-th.${fileExt}`, thumbnail.blob],
    ]

    setUploading(u => u + uploads.length)

    for (const [fileName, data] of uploads) {
      upload(fileName, data, {
        access: 'public',
        handleUploadUrl: '/api/image/upload',
        onUploadProgress: progress => updateUploads(fileName, progress),
      })
        .then(result => updateUploads(fileName, result))
        .finally(() => setUploading(u => u - 1))
    }
  }

  const uploadDisabled = () => {
    if (!selectedFile || !thumbnail || !large) return true
    if (uploading > 0) return true
    return false
  }

  if (process.env.NODE_ENV !== 'development' && user?.email !== 'apoetsanon@gmail.com') {
    return (
      <div className={utilStyles.pageMain}>
        <Header type="Primary" title="Unauthorized" />
      </div>
    )
  }

  return (
    <div className={utilStyles.pageMain}>
      <Header type="Primary" title="Image Uploader" />
      <form
        onSubmit={event => {
          event.preventDefault()
          uploadFile()
        }}>
        <Column gap={10}>
          <input type="file" accept="image/png" onChange={onImageSelect} />
          <Row>
            <button className={s.uploadButton} disabled={uploadDisabled()} type="submit">
              Upload
            </button>
            {uploading > 0 && <FontAwesomeIcon className={s.spinner} icon={faSpinner} />}
          </Row>
        </Column>
      </form>
      {errors.length > 0 && (
        <Column gap={5}>
          {errors.map((e, idx) => (
            <span key={`error-${idx}`} className={s.errorText}>
              {e}
            </span>
          ))}
        </Column>
      )}
      {uploads.map(result => (
        <UploadResult key={result.imageName} {...result} />
      ))}
      <Header type="Secondary" title="Previews" />
      {selectedFile && (
        <Row className={s.textInput}>
          <input type="text" value={fileName} onChange={e => setFileName(e.target.value)} />
          <span>&nbsp;({fileExt})</span>
        </Row>
      )}
      <div className={s.imageList}>
        {thumbnail && (
          <>
            <img
              src={thumbnail.src}
              style={{ maxWidth: thumbnail.width / 2, maxHeight: thumbnail.height / 2 }}
              alt="thumbnail"
            />
            <span>{fileName}-th</span>
          </>
        )}
        {large && (
          <>
            <img src={large.src} style={{ maxWidth: large.width / 2, maxHeight: large.height / 2 }} alt="large" />
            <span>{fileName}-lg</span>
          </>
        )}

        {preview && <img src={preview} alt="selected image" />}
      </div>
    </div>
  )
}

const UploadResult: FunctionComponent<ImageUploadResult> = ({ imageName, progress, blobResult }) => {
  const [copied, setCopied] = useState(false)

  const copyUrlToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
  }

  useEffect(() => {
    if (copied)
      setTimeout(() => {
        setCopied(false)
      }, 3000)
  }, [copied])

  return (
    <Column className={s.resultContainer}>
      <Header type="Tertiary" title={imageName} />
      {progress && (
        <Column className={s.progressContainer}>
          <div className={s.progressIndicator} style={{ width: `${progress.percentage}%` }} />
          <span className={s.progressValues}>{`${progress.loaded} / ${progress.total}`}</span>
        </Column>
      )}
      {blobResult && (
        <Row className={s.resultRow} horizontal="space-between" gap={10}>
          <span className={s.resultUrl}>{blobResult.url}</span>
          <FontAwesomeIcon icon={copied ? faCheckCircle : faCopy} onClick={() => copyUrlToClipboard(blobResult.url)} />
        </Row>
      )}
    </Column>
  )
}

/**
 * Take an image element (one that was picked in the file picker) and resize it
 * using to the max width/height provided while maintaining the image's aspect ratio.
 */
const resize = async (image: HTMLImageElement, maxWidth: number, maxHeight: number): Promise<ImageBlob> => {
  return new Promise((resolve, reject) => {
    let width = image.width
    let height = image.height

    // Calculate new dimensions while maintaining aspect ratio
    if (width > height) {
      if (width > maxWidth) {
        height *= maxWidth / width
        width = maxWidth
      }
    } else {
      if (height > maxHeight) {
        width *= maxHeight / height
        height = maxHeight
      }
    }

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return reject(new Error('Unable to retrieve context from canvas.'))

    ctx.drawImage(image, 0, 0, width, height)

    canvas.toBlob(
      blob => {
        if (!blob) return reject(new Error('Unable to retrieve blob from canvas.'))
        resolve({ blob, src: URL.createObjectURL(blob), width, height })
      },
      'image/png',
      1,
    )
  })
}
