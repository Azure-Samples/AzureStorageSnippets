// <snippet_ImportLibrary>
// index.js
import { BlobServiceClient, ContainerCreateResponse, BlockBlobClient, BlockBlobUploadResponse, ContainerDeleteResponse, BlobDownloadResponseParsed } from '@azure/storage-blob';

import { v4 as uuidv4 } from 'uuid';
import 'dotenv/config'
// </snippet_ImportLibrary>

// <snippet_StorageAcctInfo_without_secrets>
import { DefaultAzureCredential } from '@azure/identity';
// </snippet_StorageAcctInfo_without_secrets>

// <snippet_ConvertStreamToText>
// Convert stream to text
async function streamToText(readable: NodeJS.ReadableStream): Promise<string> {
  readable.setEncoding('utf8');
  let data = '';
  for await (const chunk of readable) {
    data += chunk;
  }
  return data;
}
// </snippet_ConvertStreamToText>

  try {

    // <snippet_StorageAcctInfo_create_client>
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME as string;
    if (!accountName) throw Error('Azure Storage accountName not found');

    // Add `Storage Blob Data Contributor` role assignment to the identity
    const blobServiceClient = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net`,
      new DefaultAzureCredential()
    );
    // </snippet_StorageAcctInfo_create_client>
    

    console.log('Azure Blob storage v12 - TypeScript quickstart sample');

    // <snippet_CreateContainer>
    const containerName = 'quickstart' + uuidv4();
  
    console.log('\nCreating container...');
    console.log('\t', containerName);
  
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const createContainerResponse: ContainerCreateResponse = await containerClient.create();
    console.log(
      `Container was created successfully.\n\trequestId:${createContainerResponse.requestId}\n\tURL: ${containerClient.url}`
    );
    // </snippet_CreateContainer>
  
    // <snippet_UploadBlobs>
    const blobName = 'quickstart' + uuidv4(); + '.txt';
    const blockBlobClient: BlockBlobClient = containerClient.getBlockBlobClient(blobName);
  
    console.log(
      `\nUploading to Azure storage as blob\n\tname: ${blobName}:\n\tURL: ${blockBlobClient.url}`
    );
  
    const data = 'Hello, World!';
    const uploadBlobResponse: BlockBlobUploadResponse = await blockBlobClient.upload(data, data.length);
    console.log(
      `Blob was uploaded successfully. requestId: ${uploadBlobResponse.requestId}`
    );
    // </snippet_UploadBlobs>
  
    // <snippet_ListBlobs>
    console.log('\nListing blobs...');
  
    for await (const blob of containerClient.listBlobsFlat()) {
      const tempBlockBlobClient: BlockBlobClient = containerClient.getBlockBlobClient(blob.name);
  
      console.log(
        `\n\tname: ${blob.name}\n\tURL: ${tempBlockBlobClient.url}\n`
      );
    }
    // </snippet_ListBlobs>
  
    // <snippet_DownloadBlobs>
    const offset = 0;         // start at beginning
    const length = undefined; // read all
  
    const downloadBlockBlobResponse: BlobDownloadResponseParsed = await blockBlobClient.download(offset, length);
    console.log('\nDownloaded blob content...');
    console.log(
      '\t',
      await streamToText(downloadBlockBlobResponse.readableStreamBody as NodeJS.ReadableStream)
    );
    // </snippet_DownloadBlobs>
  
    // <snippet_DeleteContainer>
    console.log('\nDeleting container...');
  
    const deleteContainerResponse: ContainerDeleteResponse = await containerClient.delete();
    console.log(
      'Container was deleted successfully. requestId: ',
      deleteContainerResponse.requestId
    );
    // </snippet_DeleteContainer>
  
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Error: ${message}`);
  }
  
  
  
  