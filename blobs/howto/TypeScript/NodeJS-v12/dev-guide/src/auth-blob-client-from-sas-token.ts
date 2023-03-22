// Azure Storage dependency
import {
  BlobDownloadHeaders,
  BlobDownloadResponseParsed,
  BlockBlobClient
} from '@azure/storage-blob';
import { createAccountSas } from './auth-service-create-account-sas';

// For development environment - include environment variables
import * as dotenv from 'dotenv';
dotenv.config();

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME as string;
if (!accountName) throw Error('Azure Storage accountName not found');

// Container and blob must exist prior to running this script
// SAS token must have READ permissions on blob that haven't expired
const containerName = `my-container`;
const blobName = `my-blob`;

// Create SAS URL
const sasToken = createAccountSas();
const sasUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;

// Utility function to convert a Node.js Readable stream into a Buffer
async function streamToBuffer(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    readableStream.on('data', (data) => {
      const val: Buffer = data instanceof Buffer ? data : Buffer.from(data);
      chunks.push(val);
    });
    readableStream.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    readableStream.on('error', reject);
  });
}

async function main() {
  // Create a blob client from SAS token
  const client: BlockBlobClient = new BlockBlobClient(sasUrl);

  // Get blob url
  console.log(`blob.url: ${client.url}`);

  // Download file contents
  const result: BlobDownloadResponseParsed = await client.download();
  if (!result.readableStreamBody) throw Error('No readableStreamBody found');

  // Get properties from BlobDownloadHeaders
  const lastModifiedData = result.lastModified;
  const contentType = result.contentType;
  const isCurrentVersion = result.isCurrentVersion;

  const content: NodeJS.ReadableStream = (await streamToBuffer(
    result.readableStreamBody
  )) as NodeJS.ReadableStream;

  // Get results
  if (content) {
    console.log(content.toString());
  }
}

main()
  .then(() => console.log(`success`))
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });
