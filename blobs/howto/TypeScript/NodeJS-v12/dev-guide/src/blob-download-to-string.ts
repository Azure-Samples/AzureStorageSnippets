import {
  BlobClient,
  BlobDownloadResponseParsed,
  BlobServiceClient,
  ContainerClient
} from '@azure/storage-blob';
import * as dotenv from 'dotenv';
dotenv.config();

// Get BlobServiceClient
import { getBlobServiceClientFromDefaultAzureCredential } from './auth-get-client';
const blobServiceClient: BlobServiceClient =
  getBlobServiceClientFromDefaultAzureCredential();

// <snippet_downloadBlobToString>
async function downloadBlobToString(
  containerClient: ContainerClient,
  blobName: string
): Promise<void> {
  const blobClient: BlobClient = await containerClient.getBlobClient(blobName);

  const downloadResponse: BlobDownloadResponseParsed =
    await blobClient.download();

  if (!downloadResponse.errorCode && downloadResponse.readableStreamBody) {
    const downloaded = await streamToBuffer(
      downloadResponse.readableStreamBody
    );
    if (downloaded) {
      console.log('Downloaded blob content:', downloaded.toString());
    }
  }
}

async function streamToBuffer(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    readableStream.on('data', (data) => {
      const content: Buffer = data instanceof Buffer ? data : Buffer.from(data);
      chunks.push(content);
    });
    readableStream.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    readableStream.on('error', reject);
  });
}
// </snippet_downloadBlobToString>

async function main(blobServiceClient: BlobServiceClient): Promise<void> {
  const containerClient = blobServiceClient.getContainerClient('sample-container');
  const blobName = 'sample-blob.txt';

  // download blob to string
  await downloadBlobToString(containerClient, blobName);
}
main(blobServiceClient)
  .then(() => console.log('success'))
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });
