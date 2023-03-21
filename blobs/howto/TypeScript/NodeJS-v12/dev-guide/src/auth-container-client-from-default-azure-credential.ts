// Azure Storage dependency
import { ContainerClient } from '@azure/storage-blob';

// Azure authentication for credential dependency
import { DefaultAzureCredential } from '@azure/identity';

// For development environment - include environment variables from .env
import * as dotenv from 'dotenv';
dotenv.config();

// Azure Storage resource name
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME as string;
if (!accountName) throw Error('Azure Storage accountName not found');

// Azure SDK needs base URL
const baseUrl = `https://${accountName}.blob.core.windows.net`;

// Unique container name
const timeStamp = Date.now();
const containerName = `my-container`;

async function main(): Promise<void> {
  try {
    // create container client from DefaultAzureCredential
    const containerClient = new ContainerClient(
      `${baseUrl}/${containerName}`,
      new DefaultAzureCredential()
    );

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
