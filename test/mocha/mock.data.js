/*!
* Copyright (c) 2024-2025 Digital Bazaar, Inc. All rights reserved.
*/
export const mockData = {};

/* eslint-disable */
mockData.verifiableCredential = {
  "@context": [
    "https://www.w3.org/ns/credentials/v2",
    "https://w3id.org/vc-barcodes/v1",
    "https://w3id.org/utopia/v2"
  ],
  "type": [
    "VerifiableCredential",
    "OpticalBarcodeCredential"
  ],
  "credentialSubject": {
    "type": "MachineReadableZone"
  },
  "issuer": "did:key:zDnaeZSD9XcuULaS8qmgDUa6TMg2QjF9xABnZK42awDH3BEzj",
  "proof": {
    "type": "DataIntegrityProof",
    "verificationMethod": "did:key:zDnaeZSD9XcuULaS8qmgDUa6TMg2QjF9xABnZK42awDH3BEzj#zDnaeZSD9XcuULaS8qmgDUa6TMg2QjF9xABnZK42awDH3BEzj",
    "cryptosuite": "ecdsa-xi-2023",
    "proofPurpose": "assertionMethod",
    "proofValue": "z4B8AQgjwgsEdcPEZkrkK2mTVKn7qufoDgDkv9Qitf9tjxQPMoJaGdXwDrThjp7LUdvzsDJ7UwYu6Xpm9fjbo6QnJ"
  }
};
/* eslint-enable */

/* eslint-disable */
//mockData.vcbText = 'VC1-RSJRPWCR803A3P0098G3A3-B02-J743853U53KGK0XJ6MKJ1OI0M.FO053.33963DN04$RAQS+4SMC8C3KM7VX4VAPL9%EILI:I1O$D:23%GJ0OUCPS0H8D2FB9D5G00U39.PXG49%SOGGB*K$Z6%GUSCLWEJ8%B95MOD0P NG-I:V8N63K53';
mockData.vcbText = 'VC1-RRJRG90R80C23G8FA9DIWENPEJ/553FPED7*5$KE0069OCUJCXKEV3E6$C006JB6AF3MWEW9E0G7106LM6-TC04E02D8%E/3EMED006:E62-J74398F-1ABWEGPC*UDGECUPC6VCVN8  C1$CBWEAECK53KGK1ZJ9Z9NPCZEDI CX C2VC-JCQ C-3E5ZCOYMNXK24N053.33:53DN09PQFER0%QMC8C3KM7VX4VAPL9%EILI:I1O$D:23%GJ0OUCPS0H8D2FB9D5G00U39.PXG49%SOGGB*K$Z6%GUSCLWEJ8%B95MOD0P NG-I:V8D63A53';
/* eslint-enable */
