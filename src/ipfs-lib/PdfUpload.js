import { useState } from 'react';

const PdfUpload = () => {
  const [fileInfo, setFileInfo] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = async () => {
        const fileContent = reader.result;
        const fileLocation = file.name;
        const fileType = file.type;

        setFileInfo({ fileContent, fileLocation, fileType });

        const formData = new FormData();
        formData.append('image', file);

        try {
          const response = await fetch(process.env.REACT_APP_UPLOAD_URL, {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            const data = await response.json();
            setFileInfo((prevFileInfo) => ({ ...prevFileInfo, CID: data.cid }));
            createThumbnail(file);
          } else {
            console.error('Upload failed:', response.statusText);
          }
        } catch (error) {
          console.error('Upload error:', error);
        }
      };

      if (file.type === 'application/pdf' || file.type.startsWith('image/') || file.type.startsWith('audio/') || file.type.startsWith('video/')) {
        reader.readAsDataURL(file);
      }
    }
  };

  const createThumbnail = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      setThumbnail(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div style={{ display: 'flex' }}>
        <input type="file" accept=".pdf,image/jpeg,image/png,audio/*,video/*" onChange={handleFile} />
        {thumbnail && <img src={thumbnail} alt="Thumbnail" style={{ width: '50px', height: '50px', marginLeft: '10px' }} />}
      </div>
      {fileInfo && (
        <div style={{ marginTop: '20px' }}>
          <p>
            <strong>File Location:</strong> {fileInfo.fileLocation}
          </p>
          {fileInfo.CID ? (
            <p>
              <strong>CID:</strong> {fileInfo.CID}
            </p>
          ) : (
            <>
              {fileInfo.fileContent.startsWith('data:application/pdf') ? (
                <iframe src={fileInfo.fileContent} width="100%" height="500px" title="PDF Viewer" />
              ) : fileInfo.fileContent.startsWith('data:image/') ? (
                <img src={fileInfo.fileContent} alt="Image" />
              ) : fileInfo.fileContent.startsWith('data:audio/') ? (
                <audio controls>
                  <source src={fileInfo.fileContent} type={fileInfo.fileType} />
                  Your browser does not support the audio element.
                </audio>
              ) : fileInfo.fileContent.startsWith('data:video/') ? (
                <video controls>
                  <source src={fileInfo.fileContent} type={fileInfo.fileType} />
                  Your browser does not support the video element.
                </video>
              ) : (
                <>
                  <p>
                    <strong>File Content:</strong>
                  </p>
                  <pre>{fileInfo.fileContent}</pre>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PdfUpload;
