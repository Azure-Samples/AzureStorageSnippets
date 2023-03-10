global using Azure.Core;
using Azure.Identity;
using Azure.Storage.Blobs;

using ManagementTasks;

// <Snippet_CreateClientWithEndpoint>
// Create an instance of DefaultAzureCredential for authorization
TokenCredential credential = new DefaultAzureCredential();

// TODO: replace with your storage account name
string storageAccountName = "<storage-account-name>";

// Call out to our function that retrieves the blob service endpoint for the given storage account
Uri blobURI = await AccountProperties.GetBlobServiceEndpoint(storageAccountName, credential);
Console.WriteLine($"URI: {blobURI}");

// Now that we know the endpoint, create the client object
BlobServiceClient blobServiceClient = new(blobURI, credential);

// Do something with the storage account or its resources ...
// </Snippet_CreateClientWithEndpoint>