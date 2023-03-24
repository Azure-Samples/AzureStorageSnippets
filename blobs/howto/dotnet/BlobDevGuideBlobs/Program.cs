using Azure.Identity;
using Azure.Storage;
using Azure.Storage.Blobs;

using BlobDevGuide;

#region Copy blob within a storage account
/*
var blobServiceClient = new BlobServiceClient(
        new Uri("https://<storage-account-name>.blob.core.windows.net"),
        new DefaultAzureCredential());

// Instantiate BlobClient for the source blob and destination blob
BlobClient sourceBlob = blobServiceClient
    .GetBlobContainerClient("source-container")
    .GetBlobClient("sample-blob.txt");
BlobClient destinationBlob = blobServiceClient
    .GetBlobContainerClient("destination-container")
    .GetBlobClient("sample-blob.txt");

await CopyBlob.CopyBlobWithinAccountAsync(sourceBlob, destinationBlob);
*/
#endregion

#region Copy blob across storage accounts
/*
string srcAccountName = "<source-account-name";
string srcAccountKey = "<account-key>";
BlobServiceClient blobServiceClientSrc = new(
        new Uri($"https://{srcAccountName}.blob.core.windows.net"),
        new StorageSharedKeyCredential(srcAccountName, srcAccountKey));

BlobServiceClient blobServiceClientDest = new(
        new Uri("https://<destination-account-name>.blob.core.windows.net"),
        new DefaultAzureCredential());

BlobClient srcBlob = blobServiceClientSrc
    .GetBlobContainerClient("source-container")
    .GetBlobClient("sample-blob.txt");

BlobClient destBlob = blobServiceClientDest
    .GetBlobContainerClient("destination-container")
    .GetBlobClient("sample-blob.txt");

await CopyBlob.CopyBlobAcrossAccountsAsync(srcBlob, destBlob);
*/
#endregion
