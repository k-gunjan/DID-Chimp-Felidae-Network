import { useState } from 'react'

const DocUpload = ({ setFormValue }) => {
  const [fileInfo, setFileInfo] = useState(null)
  const [maybeError, setMaybeError] = useState(null)

  const handleFile = async e => {
    const file = e.target.files[0]
    setFileInfo(null)
    setMaybeError(null)
    if (file) {
      const reader = new FileReader()

      reader.onload = async () => {
        const fileContent = reader.result
        const fileLocation = file.name
        const fileType = file.type

        setFileInfo({ fileContent, fileLocation, fileType })

        const formData = new FormData()
        formData.append('image', file)
        try {
          const response = await fetch(process.env.REACT_APP_UPLOAD_URL, {
            method: 'POST',
            body: formData,
          })

          if (response.ok) {
            const data = await response.json()
            setFileInfo(prevFileInfo => ({ ...prevFileInfo, CID: data.cid }))
            setFormValue(fileInfo.CID)
            // console.log('ipfs data:', fileInfo)
          } else {
            setMaybeError({
              error: 'Document upload failed. Contact Support !',
            })
            console.error('Upload failed:', response.statusText)
          }
        } catch (error) {
          setMaybeError({ error: 'Upload error !' })
          console.error('Upload error:', error)
        }
      }

      if (
        file &&
        (file.type === 'application/pdf' || file.type.startsWith('image/'))
      ) {
        reader.readAsDataURL(file)
      } else {
        setMaybeError({ error: 'Only PDF and Images can be uploaded !' })
        console.log('Only PDF and Images can be uploaded.')
      }
      // console.log(fileInfo)
    }
  }

  return (
    <div>
      <label for="afile">Select a file:</label>
      <input
        type="file"
        id="afile"
        accept=".pdf,image/jpeg,image/png"
        onChange={handleFile}
      />

      {maybeError && (
        <p>
          <strong>{maybeError.error}</strong>
        </p>
      )}
    </div>
  )
}

export default DocUpload
