import React, { useEffect, useState } from 'react';
import { Form, Input } from 'semantic-ui-react';

import { keccakAsHex } from '@polkadot/util-crypto';


const ConsumerDataForm = ({ setVerificationData }) => {
  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [dob, setDOB] = useState('');
  const [idType, setIDType] = useState('');
  const [idIssuer, setIDIssuer] = useState('');
  const [country, setCountry] = useState('');
  const [randomNumber, setRandomNumber] = useState('');


  useEffect(()=>{
    handleSubmit()
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
    ])

  const handleSubmit = () => {

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

      dnf: function() {
        let rdata = ''
        if (data.fatherName !== '') {
           rdata = data.dob + data.name + data.fatherName
        } 
        // console.log(rdata)
        return rdata
      },

      dnm: function() {
         let rdata = ''
         if (data.motherName !== '') {
            return data.dob + data.name + data.motherName
         } 
        //  console.log(rdata)
         return rdata
      },

      dng: function() {
        let rdata = ''
        if (data.motherName !== '') {
            return data.dob + data.name + data.guardianName
         } 
        // console.log(rdata)
        return rdata
      },

      submissionData: function() {
        const delimiter = '^'
        const combined = [
            this.idIssuer,
            this.idType,
            this.country,
            keccakAsHex(this.dnf()),
            keccakAsHex(this.dnm()),
            keccakAsHex(this.dng())
        ]
        const combinedWithSecret =  combined.join(delimiter) + this.randomNumber
        const hashed = keccakAsHex(combinedWithSecret)

        setVerificationData({consumerData:combined.join(delimiter), hashedConsumerData: hashed,  secret: this.randomNumber})
    },

     
    }

    // console.log(`keccak as hex: ${keccakAsHex(name)}`)


  };

  return (
     <Form >
        <span>Approve the creation of DID</span><div>Fill up the consumer details based on the  uploaded document</div><br/>
      <Form.Group widths="equal">
        <Form.Field>
          <label>Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value.trim().toUpperCase())}
          />
        </Form.Field>
        <Form.Field>
          <label>Father's Name</label>
          <Input
            value={fatherName}
            onChange={(e) => setFatherName(e.target.value.trim().toUpperCase())}
          />
        </Form.Field>
      </Form.Group>
      <Form.Group widths="equal">
        <Form.Field>
          <label>Mother's Name</label>
          <Input
            value={motherName}
            onChange={(e) => setMotherName(e.target.value.trim().toUpperCase())}
          />
        </Form.Field>
        <Form.Field>
          <label>Guardian's Name</label>
          <Input
            value={guardianName}
            onChange={(e) => setGuardianName(e.target.value.trim().toUpperCase())}
          />
        </Form.Field>
      </Form.Group>
      <Form.Group widths="equal">
        <Form.Field>
          <label>Date of Birth</label>
          <Input
            type="date"
            value={dob}
            onChange={(e) => setDOB(e.target.value)}
          />
        </Form.Field>
        <Form.Field>
          <label>Type of ID</label>
          <Input
            value={idType}
            onChange={(e) => setIDType(e.target.value.trim().toUpperCase())}
          />
        </Form.Field>
      </Form.Group>
      <Form.Group widths="equal">
        <Form.Field>
          <label>Issuer of ID</label>
          <Input
            value={idIssuer}
            onChange={(e) => setIDIssuer(e.target.value.trim().toUpperCase())}
          />
        </Form.Field>
        <Form.Field>
          <label>Country</label>
          <Input
            value={country}
            onChange={(e) => setCountry(e.target.value.trim().toUpperCase())}
          />
        </Form.Field>
      </Form.Group>
      <Form.Group widths="equal">
        <Form.Field>
          <label>Random Secret</label>
          <Input

            type="string"
            value={randomNumber}
            onChange={(e) => setRandomNumber(e.target.value)}
            style={{ maxWidth: '200px' }}
          />
        </Form.Field>
      </Form.Group>
    </Form>
  );
};

export default ConsumerDataForm;