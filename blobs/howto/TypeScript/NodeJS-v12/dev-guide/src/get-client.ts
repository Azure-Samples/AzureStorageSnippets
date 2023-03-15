import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { DefaultAzureCredential } from '@azure/identity';
import * as dotenv from 'dotenv';
dotenv.config();

/*

    Client objects include BlobServiceClient, ContainerClient, and BlobClient

    Client objects can be create with, in order of most secure to least secure

    . managed identity using DefaultAzureCredential
    . SAS token
    . account name and key
    . connection string

*/

export function getBlobServiceClientFromConnectionString(): BlobServiceClient {
  const connString = process.env.AZURE_STORAGE_CONNECTION_STRING as string;
  if (!connString) throw Error('Azure Storage Connection string not found');
  const client: BlobServiceClient =
    BlobServiceClient.fromConnectionString(connString);
  return client;
}

export function getBlobServiceClientFromDefaultAzureCredential(): BlobServiceClient {
  // Connect without secrets to Azure
  // Learn more: https://www.npmjs.com/package/@azure/identity#DefaultAzureCredential

  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME as string;
  if (!accountName) throw Error('Azure Storage accountName not found');

  const client: BlobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    new DefaultAzureCredential()
  );
  return client;
}
