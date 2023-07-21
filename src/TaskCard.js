import React, { useState } from 'react'
import { Card, Button, Icon, Input, Grid } from 'semantic-ui-react'
import { TxButton } from './substrate-lib/components'
import ConsumerDataForm from './ConsumerDataForm'

function TaskCard({ entry }) {
  const [typedNumber, setTypedNumber] = useState('')
  const [showDiv, setShowDiv] = useState({
    acceptTask: false,
    sendToTeam: false,
  })
  const [txState, setTxState] = useState(null)
  const handleResetTx = () => setTxState(null)
  const [verificationData, setVerificationData] = useState('')

  const handleToggleDiv = iconName => {
    setShowDiv(prevState => ({
      ...Object.keys(prevState).reduce((acc, key) => {
        acc[key] = key === iconName ? !prevState[key] : false
        return acc
      }, {}),
    }))
  }

  return (
    <div key={entry.id} style={{ flex: '0 0 50%', marginBottom: '10px' }}>
      <Card
        fluid
        style={{ minWidth: '1em', maxWidth: '40em', marginBottom: '10px' }}
      >
        <Card.Content>
          <div style={{ overflowWrap: 'break-word' }}>
            <strong>Consumer:&nbsp;&nbsp;</strong> {entry.consumer}
          </div>
          <div>
            <strong>Document: &nbsp;&nbsp;</strong>
            <a href={entry.url} target="_blank" rel="noopener noreferrer">
              link
            </a>
          </div>
        </Card.Content>
        <Card.Content
          extra
          style={{ display: 'flex', justifyContent: 'space-evenly' }}
        >
          <Button
            // basic
            circular
            size="mini"
            floated="left"
            onClick={() => handleToggleDiv('acceptTask')}
            style={{ cursor: 'pointer', marginRight: '10px' }}
          >
            <Icon name="check" />
            Accept Task
          </Button>
          <Button
            // basic
            circular
            size="mini"
            variant="contained"
            floated="left"
            onClick={() => handleToggleDiv('sendToTeam')}
            style={{ cursor: 'pointer', marginRight: '10px' }}
          >
            <Icon name="eye slash" />
            Submit Data
          </Button>
          <Button
            // basic
            circular
            size="mini"
            variant="contained"
            floated="left"
            onClick={() => handleToggleDiv('sendToTeam')}
            style={{ cursor: 'pointer', marginRight: '10px' }}
          >
            <Icon name="eye" />
            Reveal Data
          </Button>
        </Card.Content>
      </Card>
      <Card
        fluid
        style={{
          minWidth: '1em',
          maxWidth: '40em',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div>
          {showDiv.acceptTask && (
            <Card.Content>
              <Input
                type="number"
                min={1}
                max={10}
                value={typedNumber}
                onChange={e => setTypedNumber(e.target.value)}
              />

              <TxButton
                label="Submit"
                type="SIGNED-TX"
                setStatus={setTxState}
                attrs={{
                  palletRpc: 'verificationProtocol',
                  callable: 'acceptVerificationTask',
                  inputParams: [entry.consumer, typedNumber],
                  paramFields: [true, true],
                }}
              />
            </Card.Content>
          )}
          {showDiv.sendToTeam && (
            <Card.Content>
              <div style={{ margin: '5px' }}>
                <Grid.Row>
                  <ConsumerDataForm setVerificationData={setVerificationData} />
                </Grid.Row>
                <Grid.Row>
                  <TxButton
                    label="Submit Verification Data"
                    type="SIGNED-TX"
                    setStatus={setTxState}
                    attrs={{
                      palletRpc: 'verificationProtocol',
                      callable: 'submitVerificationData',
                      inputParams: [
                        entry.consumer,
                        verificationData.hashedConsumerData,
                      ],
                      paramFields: [true, true],
                    }}
                  />
                  <TxButton
                    label="Reval Data"
                    type="SIGNED-TX"
                    setStatus={setTxState}
                    attrs={{
                      palletRpc: 'verificationProtocol',
                      callable: 'revealData',
                      inputParams: [
                        entry.consumer,
                        verificationData.consumerData,
                        verificationData.secret,
                      ],
                      paramFields: [true, true, true],
                    }}
                  />
                </Grid.Row>
              </div>
            </Card.Content>
          )}
          {txState && (
            <Card.Content>
              {txState && (
                <div style={{ padding: '5px' }}>
                  {txState}
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
            </Card.Content>
          )}
        </div>
      </Card>
    </div>
  )
}

export default TaskCard
