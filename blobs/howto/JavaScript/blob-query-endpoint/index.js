const { ResourceManagementClient } = require("@azure/arm-resources");
const { StorageManagementClient } = require("@azure/arm-storage");
const { DefaultAzureCredential } = require("@azure/identity");
const { BlobServiceClient } = require("@azure/storage-blob");

// <Snippet_query_blob_endpoint>
async function getBlobServiceEndpoint(saName, credential) {
  const subscriptionId = "<subscription-id>";
  const rgName = "<resource-group-name>";

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

// <Snippet_register_srp>
async function registerSRPInSubscription(resourceMgmtClient /*: ResourceManagementClient*/) {
  // Check the registration state of the resource provider and register, if needed
  if (resourceMgmtClient.providers.get("Microsoft.Storage").registrationState == "NotRegistered")
    resourceMgmtClient.providers.register("Microsoft.Storage");
}
// </Snippet_register_srp>

async function main() {
  // Client for resource provider registration
  //const resourceMgmtClient = new ResourceManagementClient(
  //  credential,
  //  subscriptionId
  //);

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