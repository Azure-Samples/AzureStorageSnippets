/**
 * Best practice - use managed identity to avoid keys & connection strings
 * managed identity is implemented with @azure/identity's DefaultAzureCredential
 *
 * The identity that the managed identity chain selects must have the
 * correct roles applied in order to work correctly.
 *
 * For local development: add your personal identity on your resource group
 * az role assignment create --assignee "<your-username>" \
 *   --role "Storage Blob Data Contributor" \
 *   --resource-group "<your-resource-group-name>"
 **/

//const logger = require('@azure/logger');
//logger.setLogLevel('info');

//<Snippet_Dependencies>
import { DefaultAzureCredential } from '@azure/identity';
import {
  BlobSASSignatureValues,
  BlobServiceClient,
  ContainerClient,
  ContainerSASPermissions,
  generateBlobSASQueryParameters,
  SASProtocol,
  UserDelegationKey
} from '@azure/storage-blob';

// used for local environment variables
import * as dotenv from 'dotenv';
dotenv.config();
//</Snippet_Dependencies>

//<Snippet_CreateContainerSas>
// Server creates User Delegation SAS Token for container
async function createContainerSas() {
  // Get environment variables
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME as string;
  const containerName = 'my-container';

  // Best practice: create time limits
  const TEN_MINUTES = 10 * 60 * 1000;
  const NOW = new Date();

  // Best practice: set start time a little before current time to
  // make sure any clock issues are avoided
  const TEN_MINUTES_BEFORE_NOW = new Date(NOW.valueOf() - TEN_MINUTES);
  const TEN_MINUTES_AFTER_NOW = new Date(NOW.valueOf() + TEN_MINUTES);

  // Best practice: use managed identity - DefaultAzureCredential
  const blobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    new DefaultAzureCredential()
  );

  // Best practice: delegation key is time-limited
  // When using a user delegation key, container must already exist
  const userDelegationKey: UserDelegationKey =
    await blobServiceClient.getUserDelegationKey(
      TEN_MINUTES_BEFORE_NOW,
      TEN_MINUTES_AFTER_NOW
    );

  // Need only list permission to list blobs
  const containerPermissionsForAnonymousUser = 'l';
  const permissions: ContainerSASPermissions = ContainerSASPermissions.parse(
    containerPermissionsForAnonymousUser
  );

  // Best practice: SAS options are time-limited
  const sasOptions: BlobSASSignatureValues = {
    containerName,
    permissions,
    protocol: SASProtocol.HttpsAndHttp,
    startsOn: TEN_MINUTES_BEFORE_NOW,
    expiresOn: TEN_MINUTES_AFTER_NOW
  };

  const sasToken = generateBlobSASQueryParameters(
    sasOptions,
    userDelegationKey,
    accountName
  ).toString();

  return sasToken;
}
//</Snippet_CreateContainerSas>

//<Snippet_ListBlobs>
// Client or another process uses SAS token to use container
async function listBlobs(sasToken: string): Promise<void> {
  // Get environment variables
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME as string;
  const containerName = 'my-container';

  // Create Url
  // SAS token is the query string with typical `?` delimiter
  const sasUrl = `https://${accountName}.blob.core.windows.net/${containerName}?${sasToken}`;
  console.log(`\nContainerUrl = ${sasUrl}\n`);

  // Create container client from SAS token url
  const containerClient = new ContainerClient(sasUrl);

  let i = 1;

  // List blobs in container
  for await (const blob of containerClient.listBlobsFlat({
    includeMetadata: true,
    includeSnapshots: false,
    includeTags: true,
    includeVersions: false,
    prefix: ''
  })) {
    console.log(`Blob ${i++}: ${blob.name}`);
  }
}
//</Snippet_ListBlobs>

//<Snippet_Main>
async function main() {
  // Server creates SAS Token
  const userDelegationSasForContainer = await createContainerSas();

  // Server hands off SAS Token to client to
  // List blobs
  await listBlobs(userDelegationSasForContainer);
}

main()
  .then(() => {
    console.log(`success`);
  })
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });
//</Snippet_Main>
