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
mockData.vpVerifiableCredential = {
  "@context": "https://www.w3.org/2018/credentials/v1",
  "type": "VerifiablePresentation",
  "verifiableCredential": {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://w3id.org/age/v1",
      "https://w3id.org/security/suites/ed25519-2020/v1"
    ],
    "credentialSubject": {
      "concealedIdToken": "z6CUSkPdGvT6AtkHCBDPkAXCPoALA4qionKUv7YufEo6pEDxJP8ArXng7Y9BgUVy7kVkAi6DDei1oUE8kPL4ZUXULyiNY5UZEYKEkA58KjQ85YNQUokqmLo",
      "overAge": 21
    },
    "expirationDate": "2026-02-13T18:50:35Z",
    "id": "urn:uuid:4fbf60d8-9e3e-444a-abf7-306f6b7473e8",
    "issuanceDate": "2025-06-18T18:50:37Z",
    "issuer": "did:key:z6MkufoZ9wqtydKCPiZ5PAZ1MhLgmvXnjGUwbhhzQdAfnysc",
    "proof": {
      "created": "2025-06-18T18:50:37Z",
      "proofPurpose": "assertionMethod",
      "proofValue": "z5yNuK7U17XYzMpGCZ9bJEnLjShjSMXjWrnSSE76ZbrTBFrqBBva9TCaUgouC1NRbDB6f3MnsNoLSyFupPXt4T9Kv",
      "type": "Ed25519Signature2020",
      "verificationMethod": "did:key:z6MkufoZ9wqtydKCPiZ5PAZ1MhLgmvXnjGUwbhhzQdAfnysc#z6MkufoZ9wqtydKCPiZ5PAZ1MhLgmvXnjGUwbhhzQdAfnysc"
    },
    "type": [
      "VerifiableCredential",
      "OverAgeTokenCredential"
    ]
  }
}
/* eslint-enable */

/* eslint-disable */
mockData.vcbCredential = 'VC1-RSJRPWCR803A3P0098G3A3-B02-J743853U53KGK0XJ6MKJ1OI0M.FO053.33963DN04$RAQS+4SMC8C3KM7VX4VAPL9%EILI:I1O$D:23%GJ0OUCPS0H8D2FB9D5G00U39.PXG49%SOGGB*K$Z6%GUSCLWEJ8%B95MOD0P NG-I:V8N63K53';
mockData.vcbPresentation = 'VP1-B3ECQDIYACEMHIGDODB6KQAMDCELBIGDQQIBVAT57MDMJ4PSEJKV7OMDPNN2HH2AYOKSRQ5AYSYMLMGTIKMFH2GF6DDCBRQCYIF5PRL4X7BIPBQTGZUOA5CAWLYBDF7VTOUFVFDNGK4VV3LER2EJLADP3NAP4UO2UKXF7AZXOLTQEXWDVULNBINFQ3XFVJGN6AD5CK5RNBEMMFAYZAQAVQIXNAHRBLZWZVHXBYO6AKQARBE6FTCCQBZEZIQ67FYTDR4OJFBCHEMBN6WBC5UA6EFPG3GU64HB3YBKACEETYWMIKAHETFCD34XCMOHRZEUEI4RQFXYYOWBBQ3AYQIMJ5IQYRJMFO6WZAUA2IAAVDBVBQZAYNRFHVWIFAGRAAFQYPQKRQ3SYHN5AAAP4BEMLBA33N6DJ5MRISQMHMGMOPI4LNWVDNP7TIW3OJVTV5LA2N7MZOHUGANJVTARXWUR6A5FRNOH7HVCLEEINJD64DCKBKGFCDJUY64T3DCSBU2CTBJ6RRKECDECACWBC5UA6EFPG3GU64HB3YBKACEETYWMIKAHETFCD34XCMOHRZEUEI4RQFXY';
/* eslint-enable */
