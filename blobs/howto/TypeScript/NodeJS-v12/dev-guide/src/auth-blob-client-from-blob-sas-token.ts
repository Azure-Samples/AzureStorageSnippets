/**
 * Best practice - use managed identity to avoid keys & connection strings
 * managed identity is implemented with @azure/identity's DefaultAzureCredential
 *
 * The identity that the managed identity chain selects must have the
 * correct roles applied in order to work correctly.
 *
 * For local development: add your personal identity on your resource group
 * az role assignment create --assignee "<your-username>" \
 *   --role "Blob Data Contributor" \
 *   --resource-group "<your-resource-group-name>"
 **/

//const logger = require('@azure/logger');
//logger.setLogLevel('info');

//<Snippet_Dependencies>
import {
  BlobSASPermissions,
  BlobSASSignatureValues,
  BlobServiceClient,
  BlockBlobClient,
  BlockBlobUploadHeaders,
  BlockBlobUploadResponse,
  generateBlobSASQueryParameters,
  SASProtocol,
  SASQueryParameters,
  ServiceGetUserDelegationKeyResponse
} from '@azure/storage-blob';

// used for local environment variables
import * as dotenv from 'dotenv';
dotenv.config();

// Get BlobServiceClient
import { getBlobServiceClientFromDefaultAzureCredential } from './auth-get-client';
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME as string;
const blobServiceClient: BlobServiceClient =
  getBlobServiceClientFromDefaultAzureCredential();

//</Snippet_Dependencies>

//<Snippet_CreateBlobSas>
// Server creates User Delegation SAS Token for blob
async function createBlobSas(
  blobServiceClient: BlobServiceClient,
  blobName: string
): Promise<string> {
  const containerName = 'my-container';

  // Best practice: create time limits
  const TEN_MINUTES = 10 * 60 * 1000;
  const NOW = new Date();

  // Best practice: set start time a little before current time to
  // make sure any clock issues are avoided
  const TEN_MINUTES_BEFORE_NOW = new Date(NOW.valueOf() - TEN_MINUTES);
  const TEN_MINUTES_AFTER_NOW = new Date(NOW.valueOf() + TEN_MINUTES);

  // Best practice: delegation key is time-limited
  // When using a user delegation key, container must already exist
  const userDelegationKey: ServiceGetUserDelegationKeyResponse =
    await blobServiceClient.getUserDelegationKey(
      TEN_MINUTES_BEFORE_NOW,
      TEN_MINUTES_AFTER_NOW
    );

  if (userDelegationKey.errorCode) throw Error(userDelegationKey.errorCode);

  // Need only create/write permission to upload file
  const blobPermissionsForAnonymousUser = 'cw';

  // Best practice: SAS options are time-limited
  const sasOptions: BlobSASSignatureValues = {
    blobName,
    containerName,
    permissions: BlobSASPermissions.parse(blobPermissionsForAnonymousUser),
    protocol: SASProtocol.HttpsAndHttp,
    startsOn: TEN_MINUTES_BEFORE_NOW,
    expiresOn: TEN_MINUTES_AFTER_NOW
  };

  const sasQueryParameters: SASQueryParameters = generateBlobSASQueryParameters(
    sasOptions,
    userDelegationKey,
    accountName
  );

  const sasToken: string = sasQueryParameters.toString();

  return sasToken;
}
//</Snippet_CreateBlobSas>

//<Snippet_UploadToBlob>
// Client or another process uses SAS token to upload content to blob
async function uploadStringToBlob(
  blobName: string,
  sasToken,
  textAsString: string
): Promise<BlockBlobUploadHeaders> {
  // Get environment variables
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME as string;
  const containerName = 'my-container';

  // Create Url SAS token as query string with typical `?` delimiter
  const sasUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;
  console.log(`\nBlobUrl = ${sasUrl}\n`);

  // Create blob client from SAS token url
  const blockBlobClient = new BlockBlobClient(sasUrl);

  // Upload string
  const blockBlobUploadResponse: BlockBlobUploadHeaders =
    await blockBlobClient.upload(textAsString, textAsString.length, undefined);

  if (blockBlobUploadResponse.errorCode)
    throw Error(blockBlobUploadResponse.errorCode);

  return blockBlobUploadResponse;
}
//</Snippet_UploadToBlob>

//<Snippet_Main>
async function main(blobServiceClient: BlobServiceClient) {
  // Create random blob name for text file
  const blobName = `${(0 | (Math.random() * 9e6)).toString(36)}.txt`;

  // Server creates SAS Token
  const userDelegationSasForBlob: string = await createBlobSas(
    blobServiceClient,
    blobName
  );

  // Server hands off SAS Token & blobName to client to
  // Upload content
  const result: BlockBlobUploadHeaders = await uploadStringToBlob(
    blobName,
    userDelegationSasForBlob,
    'Hello Blob World'
  );

  if (result.errorCode) throw Error(result.errorCode);
  console.log(`\n${blobName} uploaded successfully ${result.lastModified}\n`);
}

main(blobServiceClient)
  .then(() => {
    console.log(`success`);
  })
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });
//</Snippet_Main>
