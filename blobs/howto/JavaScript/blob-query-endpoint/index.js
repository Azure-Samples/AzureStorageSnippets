const { ResourceManagementClient } = require("@azure/arm-resources");
const { StorageManagementClient } = require("@azure/arm-storage");
const { DefaultAzureCredential } = require("@azure/identity");
const { BlobServiceClient } = require("@azure/storage-blob");

// <Snippet_query_blob_endpoint>
async function getBlobServiceEndpoint(saName, credential) {
  const subscriptionId = "<subscription-id>";
  const rgName = "<resource-group-name>";

  const resourceMgmtClient = new ResourceManagementClient(
    credential,
    subscriptionId
  );

  // Register the Storage resource provider in the subscription
  resourceMgmtClient.providers.register("Microsoft.Storage");

  const storageMgmtClient = new StorageManagementClient(
    credential,
    subscriptionId
  );

  // Get the properties for the specified storage account
  const storageAccount = await storageMgmtClient.storageAccounts.getProperties(
    rgName,
    saName
  );

  // Get the primary endpoint for the blob service
  const endpoint = storageAccount.primaryEndpoints.blob;

  return endpoint;
}
// </Snippet_query_blob_endpoint>

async function main() {
  // <Snippet_create_client_with_endpoint>
  // For client-side applications running in the browser, use InteractiveBrowserCredential instead of DefaultAzureCredential. 
  // See https://aka.ms/azsdk/js/identity/examples for more details.

  const saName = "<storage-account-name>";
  const credential = new DefaultAzureCredential();

  // Call out to our function that retrieves the blob service endpoint for a storage account
  const endpoint = await getBlobServiceEndpoint(saName, credential)
  console.log(endpoint);

  // Now that we know the endpoint, create the client object
  const blobServiceClient = new BlobServiceClient(
    endpoint,
    credential);

  // Do something with the storage account or its resources ...
  // </Snippet_create_client_with_endpoint>
}

main();