//<Snippet_Dependencies>
import {
  AccountSASPermissions,
  AccountSASResourceTypes,
  AccountSASSignatureValues,
  AccountSASServices,
  BlobServiceClient,
  generateAccountSASQueryParameters,
  SASProtocol,
  SASQueryParameters,
  ServiceGetPropertiesResponse,
  StorageSharedKeyCredential
} from '@azure/storage-blob';
import * as dotenv from 'dotenv';
dotenv.config();
//</Snippet_Dependencies>

//<Snippet_EnvironmentVariables>
const constants = {
  accountName: process.env.AZURE_STORAGE_ACCOUNT_NAME as string,
  accountKey: process.env.AZURE_STORAGE_ACCOUNT_KEY as string
};
const sharedKeyCredential = new StorageSharedKeyCredential(
  constants.accountName,
  constants.accountKey
);
//</Snippet_EnvironmentVariables>

//<Snippet_UseSas>
// example function of using sasToken
// sasToken is prepended with `?`
async function useSasToken(sasToken) {
  // Use SAS token to create authenticated connection to Blob Service
  const blobServiceClient = new BlobServiceClient(
    `https://${constants.accountName}.blob.core.windows.net${sasToken}`
  );

  // Get Blob Service properties
  const blobServicePropertiesResponse: ServiceGetPropertiesResponse =
    await blobServiceClient.getProperties();

  if (blobServicePropertiesResponse.errorCode)
    throw Error(blobServicePropertiesResponse.errorCode);

  // Display BlobServiceProperties
  console.log(
    `Static website enabled: ${blobServicePropertiesResponse?.staticWebsite?.enabled}\n`
  );
}
//</Snippet_UseSas>

//<Snippet_GetSas>
export async function createAccountSas(): Promise<string> {
  const sasOptions: AccountSASSignatureValues = {
    services: AccountSASServices.parse('btqf').toString(), // blobs, tables, queues, files
    resourceTypes: AccountSASResourceTypes.parse('sco').toString(), // service, container, object
    permissions: AccountSASPermissions.parse('rwdlacupi'), // permissions
    protocol: SASProtocol.Https,
    startsOn: new Date(),
    expiresOn: new Date(new Date().valueOf() + 10 * 60 * 1000) // 10 minutes
  };

  const queryParams: SASQueryParameters = generateAccountSASQueryParameters(
    sasOptions,
    sharedKeyCredential
  );
  const sasToken: string = queryParams.toString();

  console.log(`sasToken = '${sasToken}'\n`);

  // prepend sasToken with `?`
  return sasToken[0] === '?' ? sasToken : `?${sasToken}`;
}
//</Snippet_GetSas>

//<Snippet_AsyncBoilerplate>
async function main(): Promise<void> {
  const sasToken = await createAccountSas();

  await useSasToken(sasToken);
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
//</Snippet_AsyncBoilerplate>
