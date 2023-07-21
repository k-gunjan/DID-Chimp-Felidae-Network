import React, { useEffect, useState } from 'react'
import { Form, Input, Grid, Card, Button } from 'semantic-ui-react'
import { useSubstrateState } from './substrate-lib'
import { TxButton } from './substrate-lib/components'
import { ReactComponent as LOADING_ICON } from '../public/assets/loading_icon.svg'

function Main(props) {
  const { api, currentAccount } = useSubstrateState()

  // The transaction submission status
  const [status, setStatus] = useState(null)

  const handleResetTx = () => setStatus(null)

  // The did creation status
  const [creationStatus, setCreationStatus] = useState(null)
  // The status of verification process
  const [requestStatus, setRequestStatus] = useState('No records Available')
  // Document URL
  const [docUrl, setDocUrl] = useState(0)

  const [fileInfo, setFileInfo] = useState(null)
  const [maybeError, setMaybeError] = useState(null)
  const [fileLoadState, setFileLoadState] = useState(false)

  useEffect(() => {
    let unsubscribe
    api.query.verificationProtocol &&
      api.query.verificationProtocol
        .verificationRequests(
          currentAccount && currentAccount.address,
          result => {
            // console.log(`attribute value:
            //   ${result ? result.toHuman()? JSON.stringify(result.toHuman()):
            //     'null' : 'none'}`)
            if (result.isSome) {
              let jsonResult = result.toHuman()
              setRequestStatus(jsonResult)
              setCreationStatus(jsonResult.didCreationStatus)
              console.log('creationStatus', creationStatus)
            } else {
              setCreationStatus(null)
              setRequestStatus(null)
            }
          }
        )
        .then(unsub => {
          unsubscribe = unsub
        })
        .catch(console.error)

    return () => unsubscribe && unsubscribe()
  }, [api.query.verificationProtocol, currentAccount])

  const handleFile = async e => {
    const file = e.target.files[0]
    setFileInfo(null)
    setMaybeError(null)
    setFileLoadState(true)
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
            setFileInfo(prevFileInfo => ({
              ...prevFileInfo,
              CID: data.data[0].cid,
            }))
            setDocUrl(process.env.REACT_APP_VIEW_URL + data.data[0].cid)
            setFileLoadState(false)
            console.log('ipfs data:', JSON.stringify(data.data[0].cid))
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
    }
  }

  return (
    <Grid.Column width={16}>
      <Card
        centered
        fluid
        style={{
          minHeight: '24em',
          padding: '10px',
          border: 'none',
          boxShadow: 'none',
        }}
      >
        <div
          style={{ position: 'absolute', top: '0', left: '0', padding: '10px' }}
        >
          {/* Top-left div */}
          <div>
            DID Creation status:&nbsp;&nbsp;
            <span
              style={{
                color:
                  creationStatus &&
                  creationStatus.trim().toLowerCase() === 'created'
                    ? 'green'
                    : 'red',
              }}
            >
              {creationStatus ? creationStatus : 'Not Created'}
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'flex-start',
            height: '100%',
          }}
        >
          {/* Top-right div */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <div style={{ overflowWrap: 'break-word' }}>
              Address: &nbsp;
              <span style={{ color: 'black' }}>
                {currentAccount &&
                  `${currentAccount.address.slice(
                    0,
                    7
                  )}...${currentAccount.address.slice(-7)}`}
              </span>
            </div>
          </div>
        </div>
        <Card.Content
          textAlign="center"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '5px',
          }}
        >
          {creationStatus &&
            creationStatus.trim().toLowerCase() === 'pending' && (
              <div>Sit Back!! your ID's verification is in process !</div>
            )}
          {creationStatus &&
            creationStatus.trim().toLowerCase() === 'created' && (
              <div>
                Congratulations !! your ID's been verified! You can ENJOY
                following .....
              </div>
            )}
          {creationStatus &&
            creationStatus.trim().toLowerCase() === 'rejected' && (
              <div>
                Sorry about it !! your ID's verification completed and it's been
                rejected! Here's what do can do about it....
                <br />
                You can apply again after some time amd make sure to upload
                valid document .. Good luck !
              </div>
            )}
          {creationStatus === null && (
            <Input
              label="Select Document"
              state="newValue"
              type="file"
              accept=".pdf,image/jpeg,image/png"
              onChange={handleFile}
              style={{ maxWidth: '400px' }}
              disabled={requestStatus !== null}
            />
          )}
          {maybeError && creationStatus === null && (
            <div>
              <p>
                <strong>{maybeError.error}</strong>
              </p>
            </div>
          )}
          {fileInfo && fileInfo.CID && creationStatus === null && (
            <div>
              {requestStatus ? (
                <span style={{ color: 'gray' }}>{fileInfo.fileLocation}</span>
              ) : (
                <a href={docUrl} target="_blank" rel="noopener noreferrer">
                  {fileInfo.fileLocation}
                </a>
              )}
            </div>
          )}
          {fileLoadState && (
            <div>
              <LOADING_ICON />
            </div>
          )}
          {creationStatus === null && (
            <Form>
              <Form.Field style={{ textAlign: 'center' }}>
                <TxButton
                  label="Submit DID verification request"
                  type="SIGNED-TX"
                  setStatus={setStatus}
                  attrs={{
                    palletRpc: 'verificationProtocol',
                    callable: 'submitDidCreationRequest',
                    inputParams: [docUrl],
                    paramFields: [true],
                  }}
                  disabled={requestStatus !== null}
                />
              </Form.Field>
            </Form>
          )}
        </Card.Content>
        <div
          style={{
            position: 'absolute',
            bottom: '0',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '10px',
          }}
        >
          {status && (
            <div
              style={{
                overflowWrap: 'break-word',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {status}
              <Button
                size="mini"
                variant="contained"
                onClick={handleResetTx}
                style={{ cursor: 'pointer' }}
              >
                X
              </Button>
            </div>
          )}
        </div>
      </Card>
    </Grid.Column>
  )
}

const Na = () => {
  return (
    <Grid.Column width={8}>
      <Card centered fluid style={{ minHeight: '24em' }}>
        <Card.Content textAlign="center">
          <h2 style={{ color: 'red' }}>
            DID verification and Creation feature not available on this chain
          </h2>
        </Card.Content>
      </Card>
    </Grid.Column>
  )
}

export default function IdChimpUserModule(props) {
  const { api } = useSubstrateState()
  return api.query.verificationProtocol ? <Main {...props} /> : Na()
}
