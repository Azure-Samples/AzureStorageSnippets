// Azure Storage dependency
import {
  BlockBlobClient,
  BlockBlobUploadHeaders,
  BlockBlobUploadResponse,
  StorageSharedKeyCredential
} from '@azure/storage-blob';

// For development environment - include environment variables from .env
import * as dotenv from 'dotenv';
dotenv.config();

// Azure Storage resource name
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME as string;
if (!accountName) throw Error('Azure Storage accountName not found');

// Azure Storage resource key
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY as string;
if (!accountKey) throw Error('Azure Storage accountKey not found');

// Create credential
const sharedKeyCredential: StorageSharedKeyCredential =
  new StorageSharedKeyCredential(accountName, accountKey);

const baseUrl = `https://${accountName}.blob.core.windows.net`;
const containerName = `my-container`;
const blobName = `my-blob`;

const fileContentsAsString = 'Hello there.';

async function main(): Promise<void> {
  try {
    // create blob from BlockBlobClient
    const blockBlobClient = new BlockBlobClient(
      `${baseUrl}/${containerName}/${blobName}`,
      sharedKeyCredential
    );

    // Upload data to the blob
    const blockBlobUploadResponse: BlockBlobUploadHeaders =
      await blockBlobClient.upload(
        fileContentsAsString,
        fileContentsAsString.length
      );
    if (blockBlobUploadResponse.errorCode)
      throw Error(blockBlobUploadResponse.errorCode);
    console.log(`blob ${blockBlobClient.url} created`);
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
