import React, { useState, useEffect } from 'react'
import { Grid } from 'semantic-ui-react'
import { Document, Page } from 'react-pdf'

const ContentDisplay = ({ url }) => {
  const [contentType, setContentType] = useState(null)
  const [isPdfLoaded, setIsPdfLoaded] = useState(false)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(url)
        const contentTypeHeader = response.headers.get('Content-Type')
        setContentType(contentTypeHeader)
      } catch (error) {
        console.error('Error fetching content:', error)
      }
    }

    if (url) {
      fetchContent()
    }
  }, [url])

  const handlePdfLoadSuccess = () => {
    setIsPdfLoaded(true)
  }

  return (
    <Grid.Column width={8}>
      {contentType && (
        <div
          style={{
            border: '1px solid gray',
            backgroundColor: '#f0f8ff',
            minHeight: '100vh',
          }}
        >
          {contentType.startsWith('image/') ? (
            <img
              src={url}
              alt="Content"
              style={{ width: '100%', height: 'auto' }}
            />
          ) : contentType === 'application/pdf' ? (
            <Document
              file={url}
              loading="Loading PDF..."
              noData="PDF not available"
              onLoadSuccess={handlePdfLoadSuccess}
            >
              {isPdfLoaded && <Page pageNumber={1} scale={0.8} />}
            </Document>
          ) : contentType.startsWith('audio/') ? (
            <audio controls>
              <source src={url} type={contentType} />
              Your browser does not support the audio element.
            </audio>
          ) : contentType.startsWith('video/') ? (
            <video controls style={{ width: '100%' }}>
              <source src={url} type={contentType} />
              Your browser does not support the video element.
            </video>
          ) : (
            <p>Unsupported content type: {contentType}</p>
          )}
        </div>
      )}
    </Grid.Column>
  )
}

export default ContentDisplay
