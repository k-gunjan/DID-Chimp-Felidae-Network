import React, { useEffect, useState } from 'react'
import { Form, Input, Button } from 'semantic-ui-react'

import { keccakAsHex, keccak256AsU8a } from '@polkadot/util-crypto'

function toHexString(byteArray) {
  return (
    '0x' +
    Array.from(byteArray, function (byte) {
      return ('0' + (byte & 0xff).toString(16)).slice(-2)
    }).join('')
  )
}

const ConsumerDataForm = ({ setVerificationData }) => {
  const [name, setName] = useState('')
  const [fatherName, setFatherName] = useState('')
  const [motherName, setMotherName] = useState('')
  const [guardianName, setGuardianName] = useState('')
  const [dob, setDOB] = useState('')
  const [idType, setIDType] = useState('')
  const [idIssuer, setIDIssuer] = useState('')
  const [country, setCountry] = useState('')
  const [randomNumber, setRandomNumber] = useState('')
  // submit REJECT or Approve with user details
  const [approve, setApprove] = useState(true)

  const [mandatoryFieldsFilled, setMandatoryFieldsFilled] = useState(false)

  const toggleApprove = e => {
    e.preventDefault()
    setApprove(!approve)
  }

  const clearFormData = e => {
    e.preventDefault()
    setName('')
    setFatherName('')
    setMotherName('')
    setGuardianName('')
    setDOB('')
    setIDIssuer('')
    setIDType('')
    setCountry('')
    setRandomNumber('')
  }

  useEffect(() => {
    const isMandatoryFieldsFilled =
      (
        (fatherName.trim() !== '' ||
        motherName.trim() !== '' ||
        guardianName.trim() !== '') &&
        name.trim() !== '' &&
        dob.trim() !== '' &&
        idIssuer.trim() !== '' &&
        idType.trim() !== '' &&
        country.trim() !== '' &&
        randomNumber.trim() !== '' &&
        approve
        ) ||
        (
          randomNumber.trim() !== '' &&
          !approve
        )

    setMandatoryFieldsFilled(isMandatoryFieldsFilled)
  }, [
    name,
    fatherName,
    motherName,
    guardianName,
    dob,
    idType,
    idIssuer,
    country,
    randomNumber,
    approve,
    setVerificationData,
  ])

  useEffect(() => {
    let encoder = new TextEncoder()
    const data = {
      name,
      fatherName,
      motherName,
      guardianName,
      dob,
      idType,
      idIssuer,
      country,
      randomNumber,
      mandatoryFieldsFilled,

      dnf: function () {
        let rdata = ''
        if (data.fatherName !== '') {
          rdata = data.dob + data.name + data.fatherName
        }
        // console.log(rdata)
        return keccak256AsU8a(rdata)
      },

      dnm: function () {
        let rdata = ''
        if (data.motherName !== '') {
          return data.dob + data.name + data.motherName
        }
        //  console.log(rdata)
        return keccak256AsU8a(rdata)
      },

      dng: function () {
        let rdata = ''
        if (data.motherName !== '') {
          return data.dob + data.name + data.guardianName
        }
        // console.log(rdata)
        return keccak256AsU8a(rdata)
      },

      submissionData: function () {
        const delimiterString = '^'
        const delimiter = encoder.encode(delimiterString)
        let combinedBytes
        if (approve) {
          const part1 = encoder.encode(
            [this.country, this.idIssuer, this.idType].join(delimiterString)
          )
          // console.log([this.idIssuer, this.idType, this.country, ].join(delimiterString) )
          // console.log(part1.length)
          const partLength = part1.length
          // each keccak hash  is 32 bytes long and each delimiter is 1 byte long
          const totalLength = partLength + 3 + 3 * 32
          combinedBytes = new Uint8Array(totalLength)
          combinedBytes.set(part1)
          combinedBytes.set(delimiter, part1.length)
          combinedBytes.set(this.dnf(), part1.length + 1)
          combinedBytes.set(delimiter, part1.length + 1 + 32)
          combinedBytes.set(this.dnm(), part1.length + 1 + 32 + 1)
          combinedBytes.set(delimiter, part1.length + 1 + 32 + 1 + 32)
          combinedBytes.set(this.dnm(), part1.length + 1 + 32 + 1 + 32 + 1)
        } else {
          combinedBytes = encoder.encode('REJECT')
        }

        const combinedBytesWithSecret = [
          ...combinedBytes,
          ...encoder.encode(this.randomNumber),
        ]
        const hashed = keccakAsHex(combinedBytesWithSecret)
        console.log(`combinedData=${toHexString(combinedBytes)}`)
        console.log(`hash of combinedDataWithSecret=${hashed}`)
        return {
          consumerData: toHexString(combinedBytes),
          hashedConsumerData: hashed,
          secret: this.randomNumber,
          isInputComplete: mandatoryFieldsFilled,
        }
      },
    }

    setVerificationData({ ...data.submissionData() })
    // console.log(`keccak as hex: ${keccakAsHex(name)}`)
  }, [
    name,
    fatherName,
    motherName,
    guardianName,
    dob,
    idType,
    idIssuer,
    country,
    randomNumber,
    approve,
    setVerificationData,
    mandatoryFieldsFilled,
  ])

  return (
    <Form>
      <Form.Field>
        <Button disabled={approve} onClick={toggleApprove}>
          Approve with Data
        </Button>
        <Button disabled={!approve} onClick={toggleApprove}>
          Submit REJECT
        </Button>
      </Form.Field>
      {!approve ? (
        <span>Reject the Creation of DID</span>
      ) : (
        <div>
          <span>Approve the creation of DID</span>
          <br />
          Fill up the consumer details based on the uploaded document
          <br />
          {!mandatoryFieldsFilled && (
            <span style={{ color: 'red' }}>
              * Required fields, &nbsp;# Atleast one required
            </span>
          )}
          <Form.Group widths="equal">
            <Form.Field required error={name.trim() === ''}>
              <label>Name</label>
              <Input
                value={name}
                onChange={e => setName(e.target.value.trim().toUpperCase())}
              />
            </Form.Field>
            <Form.Field
              required
              error={
                !(
                  fatherName.trim() !== '' ||
                  motherName.trim() !== '' ||
                  guardianName.trim() !== ''
                )
              }
            >
              <label>
                Father's Name <span style={{ color: 'red' }}>#</span>
              </label>
              <Input
                value={fatherName}
                onChange={e =>
                  setFatherName(e.target.value.trim().toUpperCase())
                }
              />
            </Form.Field>
          </Form.Group>
          <Form.Group widths="equal">
            <Form.Field
              required
              error={
                !(
                  fatherName.trim() !== '' ||
                  motherName.trim() !== '' ||
                  guardianName.trim() !== ''
                )
              }
            >
              <label>
                Mother's Name <span style={{ color: 'red' }}>#</span>
              </label>
              <Input
                value={motherName}
                onChange={e =>
                  setMotherName(e.target.value.trim().toUpperCase())
                }
              />
            </Form.Field>
            <Form.Field
              required
              error={
                !(
                  fatherName.trim() !== '' ||
                  motherName.trim() !== '' ||
                  guardianName.trim() !== ''
                )
              }
            >
              <label>
                Guardian's Name <span style={{ color: 'red' }}>#</span>
              </label>
              <Input
                value={guardianName}
                onChange={e =>
                  setGuardianName(e.target.value.trim().toUpperCase())
                }
              />
            </Form.Field>
          </Form.Group>
          <Form.Group widths="equal">
            <Form.Field required error={dob.trim() === ''}>
              <label>Date of Birth</label>
              <Input
                type="date"
                value={dob}
                onChange={e => setDOB(e.target.value)}
              />
            </Form.Field>
            <Form.Field required error={idType.trim() === ''}>
              <label>Type of ID</label>
              <Input
                value={idType}
                onChange={e => setIDType(e.target.value.trim().toUpperCase())}
              />
            </Form.Field>
          </Form.Group>
          <Form.Group widths="equal">
            <Form.Field required error={idIssuer.trim() === ''}>
              <label>Issuer of ID</label>
              <Input
                value={idIssuer}
                onChange={e => setIDIssuer(e.target.value.trim().toUpperCase())}
              />
            </Form.Field>
            <Form.Field required error={country.trim() === ''}>
              <label>Country</label>
              <Input
                value={country}
                onChange={e => setCountry(e.target.value.trim().toUpperCase())}
              />
            </Form.Field>
          </Form.Group>
        </div>
      )}
      <Form.Group widths="equal">
        <Form.Field required error={randomNumber.trim() === ''}>
          <label>Random Secret</label>
          <Input
            type="password"
            value={randomNumber}
            onChange={e => setRandomNumber(e.target.value)}
            style={{ maxWidth: '200px' }}
          />
        </Form.Field>
        <Form.Field>
          <label>&nbsp; &nbsp;</label>
          <Button
            label="Clear Data"
            icon="close"
            onClick={e => clearFormData(e)}
            // style={{ maxWidth: '200px' }}
          />
        </Form.Field>
      </Form.Group>
    </Form>
  )
}

export default ConsumerDataForm
