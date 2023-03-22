// Azure Storage dependency
import { ContainerClient } from '@azure/storage-blob';

// For development environment - include environment variables
import * as dotenv from 'dotenv';
dotenv.config();

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME as string;
if (!accountName) throw Error('Azure Storage accountName not found');

// Container must exist prior to running this script
const containerName = `my-container`;

// SAS token must have LIST permissions on container that haven't expired
const sasToken = process.env.AZURE_STORAGE_SAS_TOKEN as string;

// Create SAS URL
const sasUrl = `https://${accountName}.blob.core.windows.net/${containerName}?${sasToken}`;

async function main(): Promise<void> {
  try {
    // create container client from SAS token
    const containerClient = new ContainerClient(sasUrl);

    // do something with containerClient...
    let i = 1;

    // List blobs in container
    for await (const blob of containerClient.listBlobsFlat({
      includeMetadata: true,
      includeSnapshots: false,
      includeTags: true,
      includeVersions: false,
      prefix: ''
    })) {
      console.log(`Blob ${i++}: ${blob.name}`);
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
}

main()
  .then(() => console.log(`success`))
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });
