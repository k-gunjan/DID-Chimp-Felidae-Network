import React, { createRef, useState } from 'react'
import {
  Container,
  Dimmer,
  Loader,
  Grid,
  Sticky,
  Message,
  Button,
} from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css'

import { SubstrateContextProvider, useSubstrateState } from './substrate-lib'
import { DeveloperConsole } from './substrate-lib/components'

import AccountSelector from './AccountSelector'
import IdChimpUserModule from './IDChimpUserCenter'
import IdChimpVerifierModule from './IDChimpVerifierCenter'

function Main() {
  const { apiState, apiError, keyringState } = useSubstrateState()

  const [role, setRole] = useState('Consumer')
  const toggleRole = () =>
    setRole(current => (current === 'Consumer' ? 'Verifier' : 'Consumer'))

  const loader = text => (
    <Dimmer active>
      <Loader size="small">{text}</Loader>
    </Dimmer>
  )

  const message = errObj => (
    <Grid centered columns={2} padded>
      <Grid.Column>
        <Message
          negative
          compact
          floating
          header="Error Connecting to Substrate"
          content={`Connection to websocket '${errObj.target.url}' failed.`}
        />
      </Grid.Column>
    </Grid>
  )

  if (apiState === 'ERROR') return message(apiError)
  else if (apiState !== 'READY') return loader('Connecting to Substrate')

  if (keyringState !== 'READY') {
    return loader(
      "Loading accounts (please review any extension's authorization)"
    )
  }

  const contextRef = createRef()

  return (
    <div ref={contextRef}>
      <Sticky context={contextRef}>
        <AccountSelector />
      </Sticky>
      <Container>
        <Grid stackable columns="equal">
          <h1>Welcome to Felidae Network</h1>
          <Grid.Row>
            <div
              style={{
                display: 'inline-block',
                marginBottom: '5px',
              }}
            >
              <Button
                disabled={role === 'Consumer'}
                onClick={toggleRole}
                style={{
                  border: '1px solid gray',
                  transform: role === 'Consumer' ? 'scale(1.2)' : 'none',
                  marginRight: role === 'Consumer' ? '22px' : '10px',
                  transformOrigin: 'left',
                }}
              >
                Consumer
              </Button>
              {/* </div> */}
              <Button
                disabled={role === 'Verifier'}
                onClick={toggleRole}
                style={{
                  border: '1px solid gray',
                  transform: role === 'Verifier' ? 'scale(1.2)' : 'none',
                }}
              >
                Verifier
              </Button>
            </div>
          </Grid.Row>
          <Grid.Row>
            <div
              style={{
                minHeight: '75vh',
                width: '100%',
                border: '1px solid gray',
              }}
            >
              {role === 'Consumer' && <IdChimpUserModule />}
              {role === 'Verifier' && <IdChimpVerifierModule />}
            </div>
          </Grid.Row>
        </Grid>
      </Container>
      <DeveloperConsole />
    </div>
  )
}

export default function App() {
  return (
    <SubstrateContextProvider>
      <Main />
    </SubstrateContextProvider>
  )
}
