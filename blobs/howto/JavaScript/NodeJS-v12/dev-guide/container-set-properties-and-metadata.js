const { BlobServiceClient } = require('@azure/storage-blob');

// Azure authentication for credential dependency
const { DefaultAzureCredential } = require('@azure/identity');

require('dotenv').config()

// TODO: Replace with your actual storage account name
const accountName = '<storage-account-name>';

// <snippet_getContainerProperties>
async function getContainerProperties(containerClient) {
  
  try {
    const containerProperties = await containerClient.getProperties();

    console.log(`Public access type: ${containerProperties.blobPublicAccess}`);
    console.log(`Lease status: ${containerProperties.leaseStatus}`);
    console.log(`Lease state: ${containerProperties.leaseState}`);
    console.log(`Has immutability policy: ${containerProperties.hasImmutabilityPolicy}`);
  } catch (err) {
    // Handle the error
  }
}
// </snippet_getContainerProperties>

// <snippet_setContainerMetadata>
async function setContainerMetadata(containerClient) {
  
  const metadata = {
    docType: "textDocuments",
    docCategory: "testing",
  };
  
  await containerClient.setMetadata(metadata);

}
// </snippet_setContainerMetadata>

async function main() {

  // Create service client from DefaultAzureCredential
  const blobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    new DefaultAzureCredential()
  );

  const containerClient = blobServiceClient.getContainerClient('sample-container');

  await setContainerMetadata(containerClient);

  // properties including metadata
  await getContainerProperties(containerClient);


}

main()
  .then(() => console.log(`done`))
  .catch((ex) => console.log(ex.message));
