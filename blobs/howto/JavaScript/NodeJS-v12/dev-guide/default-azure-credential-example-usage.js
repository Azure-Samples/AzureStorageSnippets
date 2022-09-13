require('dotenv').config()

// Get BlobServiceClient without secrets
const { getBlobServiceClient } = require(`default-azure-credential`);

async function main(){

  // get client
  const client = getBlobServiceClient();

  // use client
  const serviceGetPropertiesResponse = await client.getProperties();
  console.log(`${JSON.stringify(serviceGetPropertiesResponse)}`);
}

main()
  .then(() => console.log(`done`))
  .catch((ex) => console.log(`error: ${ex.message}`));