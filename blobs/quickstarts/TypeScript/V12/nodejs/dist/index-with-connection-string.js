// <snippet_ImportLibrary>
// index.ts
import { BlobServiceClient } from '@azure/storage-blob';
import { v4 as uuidv4 } from 'uuid';
import 'dotenv/config';
// </snippet_ImportLibrary>
console.log(process.env);
// <snippet_ConvertStreamToText>
async function streamToText(readable) {
    readable.setEncoding('utf8');
    let data = '';
    for await (const chunk of readable) {
        data += chunk;
    }
    return data;
}
// </snippet_ConvertStreamToText>
try {
    // <snippet_StorageAcctInfo_without_secrets>
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    if (!accountName)
        throw Error('Azure Storage accountName not found');
    // </snippet_StorageAcctInfo_without_secrets>
    // <snippet_StorageAcctInfo_create_client>
    const blobServiceClient = BlobServiceClient.fromConnectionString(accountName);
    // </snippet_StorageAcctInfo_create_client>
    console.log('Azure Blob storage v12 - TypeScript quickstart sample');
    // <snippet_CreateContainer>
    const containerName = 'quickstart' + uuidv4();
    console.log('\nCreating container...');
    console.log('\t', containerName);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const createContainerResponse = await containerClient.create();
    console.log(JSON.stringify(createContainerResponse, null, 2));
    console.log(`Container was created successfully.\n\trequestId:${createContainerResponse.requestId}\n\tURL: ${containerClient.url}`);
    // </snippet_CreateContainer>
    // <snippet_UploadBlobs>
    const blobName = 'quickstart' + uuidv4();
    +'.txt';
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    console.log(`\nUploading to Azure storage as blob\n\tname: ${blobName}:\n\tURL: ${blockBlobClient.url}`);
    const data = 'Hello, World!';
    const uploadBlobResponse = await blockBlobClient.upload(data, data.length);
    console.log(`Blob was uploaded successfully. requestId: ${uploadBlobResponse.requestId}`);
    // </snippet_UploadBlobs>
    // <snippet_ListBlobs>
    console.log('\nListing blobs...');
    for await (const blob of containerClient.listBlobsFlat()) {
        const tempBlockBlobClient = containerClient.getBlockBlobClient(blob.name);
        console.log(`\n\tname: ${blob.name}\n\tURL: ${tempBlockBlobClient.url}\n`);
    }
    // </snippet_ListBlobs>
    // <snippet_DownloadBlobs>
    const downloadBlockBlobResponse = await blockBlobClient.download(0);
    console.log('\nDownloaded blob content...');
    console.log('\t', await streamToText(downloadBlockBlobResponse.readableStreamBody));
    // </snippet_DownloadBlobs>
    // <snippet_DeleteContainer>
    console.log('\nDeleting container...');
    const deleteContainerResponse = await containerClient.delete();
    console.log('Container was deleted successfully. requestId: ', deleteContainerResponse.requestId);
    // </snippet_DeleteContainer>
}
catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Error: ${message}`);
}
