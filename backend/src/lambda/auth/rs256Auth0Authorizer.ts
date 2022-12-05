
import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { JwtPayload } from '../../auth/JwtPayload'

const cert = `-----BEGIN CERTIFICATE-----
MIIDHTCCAgWgAwIBAgIJPzKNn83jQTYzMA0GCSqGSIb3DQEBCwUAMCwxKjAoBgNV
BAMTIWRldi1zbDB2czNrdDFocjQydGRmLnVzLmF1dGgwLmNvbTAeFw0yMjExMTcx
NTI4MTNaFw0zNjA3MjYxNTI4MTNaMCwxKjAoBgNVBAMTIWRldi1zbDB2czNrdDFo
cjQydGRmLnVzLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
ggEBAKrSXwZFM5k551WG3yFPpQ+FBVBlCamiezF0tVH0NyNg3jgZPFDRyX4uOXnr
CW/f6xguqwnpp0b9jeHcNreYk35CzmDdQ6fU91iXfo3fJdAFj6nrmkgqCCFCvaCr
N8rLjwoa2NvsYW9zcPDpD5hLV+9evF099/MNXGbZxwWnATfheGwsmIeZcvLJfGJf
yYIIWhROyZbWvZMYQE6C3qTFPTG/orq+2JMy61OJ+RJp5GU97uzM9Sd/YTDEn4YU
5yBIaRrlu+bsaFp1GCGEvfWxL2uDnDhR/AKsORGsV7ukACIKUmJY8QMcRRYd17W1
ToX11elbM75a6qvm6KQQ11vNXOUCAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAd
BgNVHQ4EFgQUWJvPu2fGjIt0R7JZRU0y8eJCzgkwDgYDVR0PAQH/BAQDAgKEMA0G
CSqGSIb3DQEBCwUAA4IBAQBJgNzQm+XUeRIflu2rWByp0ZCiLlRVFReJtciDeyth
YQUsnkl997YtUKUn8o0NkfFqLfI4CQwYCOOeMv0XU/xZ1Wn3KlwWRNuRaXBijt6b
TInmM12+YJoQDY4o2EGoCdUjdassleUi3i6c7Tt7LJWFa42qE7TEozOu3ZKejnKi
0ZZyPGRc/wfAhAS5+Mo2jIlGQJAWbVbpbUVHOnxvk4epr189+lJshtJPIgvLX/t5
KeLdHBfztSIHE6pIz+SMONAjRnT+lO0LtjNi2tRZPH0jv38rXcqc6puKQn2oqwPM
IXm4tkI3IPxJNl2uGNHaE0hBPa23ZQiDU2EpnEyK1YWC
-----END CERTIFICATE-----`

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  try {
    const jwtToken = verifyToken(event.authorizationToken)
    console.log('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    console.log('User authorized', e.message)

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

function verifyToken(authHeader: string): JwtPayload {
  if (!authHeader)
    throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}
