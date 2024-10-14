import {
  BlobServiceClient,
  ContainerClient,
  ContainerCreateOptions,
  ContainerCreateResponse,
  ContainerGetPropertiesResponse,
  Metadata
} from '@azure/storage-blob';
import * as dotenv from 'dotenv';
dotenv.config();

// Get BlobServiceClient
import { getBlobServiceClientFromDefaultAzureCredential } from './auth-get-client';
const blobServiceClient: BlobServiceClient =
  getBlobServiceClientFromDefaultAzureCredential();

// <snippet_getContainerProperties>
async function getContainerProperties(
  containerClient: ContainerClient
): Promise<void> {
  try {
    const containerProperties: ContainerGetPropertiesResponse =
      await containerClient.getProperties();

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
async function setContainerMetadata(
  containerClient: ContainerClient,
) {
  try {
    const metadata: Metadata = {
      // values must be strings
      docType: "textDocuments",
      docCategory: "testing"
    };
    await containerClient.setMetadata(metadata);
  }
  catch (err) {
    // Handle the error
  }
}
// </snippet_setContainerMetadata>

async function main(blobServiceClient: BlobServiceClient) {
  const containerClient: ContainerClient = blobServiceClient.getContainerClient('sample-container');

  await setContainerMetadata(containerClient);

  // properties including metadata
  await getContainerProperties(containerClient);
}

main(blobServiceClient)
  .then(() => console.log(`success`))
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });
