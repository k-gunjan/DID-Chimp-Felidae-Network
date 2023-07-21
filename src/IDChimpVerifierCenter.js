import React, { useEffect, useState } from 'react'
import { Form, Input, Grid, Card, Button } from 'semantic-ui-react'

import { useSubstrateState } from './substrate-lib'
import { TxButton } from './substrate-lib/components'

import { FaPlus } from 'react-icons/fa'
import EventsData from './EventsData'
// import ContentDisplay from './ContentDisplay'

function Main(props) {
  const { api, currentAccount } = useSubstrateState()

  // The transaction submission status
  const [status, setStatus] = useState(null)
  const handleResetTx = () => setStatus(null)
  // Verifier account data
  const [verifierStatus, setVerifierStatus] = useState(null)
  // Deposit amount
  const [depositAmount, setDepositAmount] = useState(0)
  // show deposit upon add click
  const [showDeposit, setShowDeposit] = useState(false)

  const handleButtonClick = () => {
    setShowDeposit(!showDeposit)
    setStatus('')
  }

  // handle verifier account data changes
  useEffect(() => {
    let unsubscribe
    api.query.verifiers &&
      api.query.verifiers
        .verifiers(currentAccount && currentAccount.address, result => {
          // console.log(`attribute value:
          //   ${result ? result.toHuman()? JSON.stringify(result.toHuman()):
          //     'null' : 'none'}`)
          if (result.isSome) {
            let jsonResult = result.toHuman()
            setVerifierStatus(jsonResult)
          } else {
            setVerifierStatus(null)
          }
          setShowDeposit(false)
        })
        .then(unsub => {
          unsubscribe = unsub
        })
        .catch(console.error)

    return () => unsubscribe && unsubscribe()
  }, [api.query.verifiers, currentAccount])

  return (
    <Grid.Column width={16}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          flexDirection: 'row',
        }}
      >
        <div
          style={{
            alignSelf: 'flex-start',
            marginTop: '10px',
            marginLeft: '10px',
          }}
        >
          {/* Top-left div */}
          <div style={{ textAlign: 'left' }}>
            {verifierStatus && verifierStatus.balance && (
              <div>
                Deposited Amount :&nbsp;
                <span style={{ color: 'black' }}>
                  {parseInt(verifierStatus.balance).toFixed(12) || 0} PAN
                  &nbsp;&nbsp;
                  <Button circular size="mini" onClick={handleButtonClick}>
                    <FaPlus />
                  </Button>
                </span>
              </div>
            )}
            <div>
              Account Status:&nbsp;&nbsp;
              <span style={{ color: 'black' }}>
                {(verifierStatus && verifierStatus.state) || 'Not Registered'}
              </span>
            </div>
          </div>
        </div>

        <div
          style={{
            alignSelf: 'flex-start',
            marginTop: '10px',
            marginRight: '10px',
            marginLeft: '10px',
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
      </div>
      <div style={{ marginTop: '10px', marginLeft: '10px' }}>
        <Form>
          {(showDeposit || verifierStatus === null) && (
            <Form.Field
              style={{
                maxWidth: '300px',
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Input
                label="Deposite Amount"
                state="depositAmount"
                type="number"
                onChange={(_, { value }) => setDepositAmount(value)}
              />
            </Form.Field>
          )}
          <Grid columns={16} centered>
            <Grid.Row>
              {verifierStatus === null ? (
                <Grid.Column width={8}>
                  <Form.Field style={{ textAlign: 'center' }}>
                    <TxButton
                      label="Register Verifier"
                      type="SIGNED-TX"
                      setStatus={setStatus}
                      attrs={{
                        palletRpc: 'verifiers',
                        callable: 'registerVerifier',
                        inputParams: [depositAmount],
                        paramFields: [true],
                      }}
                    />
                  </Form.Field>
                </Grid.Column>
              ) : showDeposit ? (
                <Grid.Column>
                  <Form.Field style={{ textAlign: 'center' }}>
                    <TxButton
                      label="Deposit"
                      type="SIGNED-TX"
                      setStatus={setStatus}
                      attrs={{
                        palletRpc: 'verifiers',
                        callable: 'verifierDeposit',
                        inputParams: [depositAmount],
                        paramFields: [true],
                      }}
                    />
                  </Form.Field>
                </Grid.Column>
              ) : (
                <>
                  <Grid.Column width={16}>
                    <Grid.Row>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <EventsData />

                        <div style={{ margin: '5px' }}>
                          {/* <ContentDisplay url={'https://publiish.io/ipfs/QmUqLfidH6PnCkpAhAEKD5zYq5wFVko4wHqnffSZA9f1No'} /> */}
                        </div>
                      </div>
                    </Grid.Row>
                  </Grid.Column>
                </>
              )}
            </Grid.Row>
          </Grid>
        </Form>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: '0',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '10px',
          marginBottom: '5px',
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

export default function IdChimpVerifierModule(props) {
  const { api } = useSubstrateState()
  return api.query.verificationProtocol ? <Main {...props} /> : Na()
}
