const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config()

const connString = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!connString) throw Error('Azure Storage Connection string not found');

const blobServiceClient = BlobServiceClient.fromConnectionString(connString);

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
    // values must be strings
    lastFileReview: "currentDate",
    reviewer: "reviewerName"
  };
  
  await containerClient.setMetadata(metadata);

}
// </snippet_setContainerMetadata>

async function main(blobServiceClient) {

  // create container
  const timestamp = Date.now();
  const containerName = `container-set-properties-and-metadata-${timestamp}`;
  console.log(`creating container ${containerName}`);

  const containerOptions = {
    access: 'container'
  };
  const { containerClient } = await blobServiceClient.createContainer(containerName, containerOptions);

  console.log('container creation succeeded');

  await setContainerMetadata(containerClient);

  // properties including metadata
  await getContainerProperties(containerClient);


}

main(blobServiceClient)
  .then(() => console.log(`done`))
  .catch((ex) => console.log(ex.message));
