import { useState } from 'react';

const FileUpload = () => {
  const [fileInfo, setFileInfo] = useState(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = () => {
        const fileContent = reader.result;
        const fileLocation = file.name;

        setFileInfo({ fileContent, fileLocation });
      };

      reader.readAsText(file);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFile} />
      {fileInfo && (
        <div style={{ marginTop: '20px' }}>
          <p>
            <strong>File Location:</strong> {fileInfo.fileLocation}
          </p>
          <p>
            <strong>File Content:</strong>
          </p>
          <pre>{fileInfo.fileContent}</pre>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
