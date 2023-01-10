const generateDpopKeyPair = require('@inrupt/solid-client-authn-core').generateDpopKeyPair
const createDpopHeader = require('@inrupt/solid-client-authn-core').createDpopHeader
const buildAuthenticatedFetch = require('@inrupt/solid-client-authn-core').buildAuthenticatedFetch
const fetch = require('node-fetch')

async function getAuth(id, secret) {

    // A key pair is needed for encryption.
    // This function from `solid-client-authn` generates such a pair for you.
    const dpopKey = await generateDpopKeyPair()

    // These are the ID and secret generated in the previous step.
    // Both the ID and the secret need to be form-encoded.
    const authString = `${encodeURIComponent(id)}:${encodeURIComponent(secret)}`
    // This URL can be found by looking at the 'token_endpoint' field at
    // http://localhost:3000/.well-known/openid-configuration
    // if your server is hosted at http://localhost:3000/.
    const tokenUrl = 'http://localhost:3000/.oidc/token'
    const first_response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
            // The header needs to be in base64 encoding.
            authorization: `Basic ${Buffer.from(authString).toString('base64')}`,
            'content-type': 'application/x-www-form-urlencoded',
            dpop: await createDpopHeader(tokenUrl, 'POST', dpopKey),
        },
        body: 'grant_type=client_credentials&scope=webid',
    })

    // This is the Access token that will be used to do an authenticated request to the server.
    // The JSON also contains an 'expires_in' field in seconds,
    // which you can use to know when you need request a new Access token.
    const { access_token: accessToken } = await first_response.json()
    // The DPoP key needs to be the same key as the one used in the previous step.
    // The Access token is the one generated in the previous step.
    const authFetch = await buildAuthenticatedFetch(fetch, accessToken, { dpopKey })
    // authFetch can now be used as a standard fetch function that will authenticate as your WebID.
    // This request will do a simple GET for example.
    const second_response = await authFetch('http://localhost:3000/fandroide/README')
    return second_response
}

exports.getAuth = getAuth

