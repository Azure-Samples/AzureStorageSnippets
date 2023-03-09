const { StorageManagementClient } = require("@azure/arm-storage");
const { DefaultAzureCredential } = require("@azure/identity");
const { BlobServiceClient } = require("@azure/storage-blob");

// <Snippet_query_blob_endpoint>
async function getBlobServiceEndpoint(saName, credential) {
  const subscriptionId = "<subscription-id>";
  const rgName = "<resource-group-name>";

  const client = new StorageManagementClient(
    credential,
    subscriptionId
  );

  const storageAccount = await client.storageAccounts.getProperties(
    rgName,
    saName
  );

  const endpoint = storageAccount.primaryEndpoints.blob;

  return endpoint;
}
// </Snippet_query_blob_endpoint>

async function main() {
  // <Snippet_create_client_with_endpoint>
  // For client-side applications running in the browser, use InteractiveBrowserCredential instead of DefaultAzureCredential. See https://aka.ms/azsdk/js/identity/examples for more details.

  const saName = "<storage-account-name>";
  const credential = new DefaultAzureCredential();

  const endpoint = await getBlobServiceEndpoint(saName, credential)
  console.log(endpoint);

  const blobServiceClient = new BlobServiceClient(
    endpoint,
    credential);

  // Do something with the storage account or its resources ...
  // </Snippet_create_client_with_endpoint>
}

main();