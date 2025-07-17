import { useEffect, useState } from 'react'
import { Storage } from '../lib/globals'
import uuid from 'uuid'

export const useInstallId = () => {
  const [installId, setInstallId] = useState<string>('')

  useEffect(() => {
    const storedInstallId = Storage.get('--installation-id')
    if (storedInstallId) {
      setInstallId(storedInstallId)
    } else {
      const newInstallId = uuid.v4()
      Storage.set('--installation-id', newInstallId)
      setInstallId(newInstallId)
    }
  }, [])

  return installId
}
