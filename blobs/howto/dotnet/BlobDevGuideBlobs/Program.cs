using Azure.Identity;
using Azure.Storage.Blobs;

using BlobDevGuide;

// TODO: Replace <storage-account-name> with your actual storage account name
var blobServiceClient = new BlobServiceClient(
        new Uri("<storage-account-name>"),
        new DefaultAzureCredential());

await CopyBlob.CopyBlobAsync(blobServiceClient);
