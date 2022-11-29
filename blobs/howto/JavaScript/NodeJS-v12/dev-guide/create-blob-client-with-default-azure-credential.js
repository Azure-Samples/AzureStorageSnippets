// Azure Storage dependency
const { BlockBlobClient } = require("@azure/storage-blob");

// Azure authentication for credential dependency
const { DefaultAzureCredential } = require('@azure/identity');

// For development environment - include environment variables from .env
require("dotenv").config();

// Azure Storage resource name
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
if (!accountName) throw Error("Azure Storage accountName not found");

// Azure SDK needs base URL
const baseUrl = `https://${accountName}.blob.core.windows.net`;

// Container must exist prior to running this script
const containerName = `test`;

// Random blob name and contents
const timeStamp = Date.now();
const blobName = `${timeStamp}-my-blob.txt`;
const fileContentsAsString = "Hello there.";

async function main(){

  // Create a client that can authenticate with Azure Active Directory
  const client = new BlockBlobClient(
    `${baseUrl}/${containerName}/${blobName}`,
    new DefaultAzureCredential()
  );

  // Get file url - available before contents are uploaded
  console.log(`blob.url: ${client.url}`);

  // Upload file contents
  const result = await client.upload(fileContentsAsString, fileContentsAsString.length);

  // Get results
  return result;
}

main().then((result) => console.log(result)).catch((ex) => console.log(ex.message));

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