// Azure Storage dependency
import {
  BlockBlobClient,
  BlockBlobUploadHeaders,
  BlockBlobUploadResponse
} from '@azure/storage-blob';
import { getBlockBlobClientFromDefaultAzureCredential } from './auth-get-client';

// For development environment - include environment variables from .env
import * as dotenv from 'dotenv';
dotenv.config();

// Container must exist prior to running this script
const containerName = `my-container`;

// Random blob name and contents
const timeStamp = Date.now();
const blobName = `${timeStamp}-my-blob.txt`;
const fileContentsAsString = 'Hello there.';

const blockBlobClient: BlockBlobClient =
  getBlockBlobClientFromDefaultAzureCredential(containerName, blobName);

async function main(
  blockBlobClient: BlockBlobClient
): Promise<BlockBlobUploadHeaders> {
  // Get file url - available before contents are uploaded
  console.log(`blob.url: ${blockBlobClient.url}`);

  // Upload file contents
  const result: BlockBlobUploadHeaders = await blockBlobClient.upload(
    fileContentsAsString,
    fileContentsAsString.length
  );

  if (result.errorCode) throw Error(result.errorCode);

  // Get results
  return result;
}

main(blockBlobClient)
  .then((result) => {
    console.log(result);
    console.log(`success`);
  })
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });

/*

Response looks like this:

{
  etag: '"0x8DAD247F1F4896E"',
  lastModified: 2022-11-29T20:26:07.000Z,
  contentMD5: <Buffer 9d 6a 29 63 87 20 77 db 67 4a 27 a3 9c 49 2e 61>,
  clientRequestId: 'a07fdd1f-5937-44c7-984f-0699a48a05c0',
  requestId: '3580e726-201e-0045-1a30-0474f6000000',
  version: '2021-04-10',
  date: 2022-11-29T20:26:06.000Z,
  isServerEncrypted: true,
  'content-length': '0',
  server: 'Windows-Azure-Blob/1.0 Microsoft-HTTPAPI/2.0',
  'x-ms-content-crc64': 'BLv7vb1ONT8=',
  body: undefined
}
*/
