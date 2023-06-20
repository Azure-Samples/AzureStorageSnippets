import { DefaultAzureCredential } from '@azure/identity';
import {
  AnonymousCredential,
  BlobServiceClient,
  BlockBlobClient,
  ContainerClient,
  StoragePipelineOptions,
  StorageSharedKeyCredential
} from '@azure/storage-blob';
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

  const storagePipelineOptions: StoragePipelineOptions = {};

  const client: BlobServiceClient = BlobServiceClient.fromConnectionString(
    connString,
    storagePipelineOptions
  );
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
export function getBlobServiceClientWithAnonymousCredential(): BlobServiceClient {
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME as string;
  if (!accountName) throw Error('Azure Storage accountName not found');

  const blobServiceUri = `https://${accountName}.blob.core.windows.net`;

  const blobServiceClient = new BlobServiceClient(
    blobServiceUri,
    new AnonymousCredential()
  );
  return blobServiceClient;
}
export function getBlobServiceClientWithAccountAndKey(): BlobServiceClient {
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME as string;
  const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY as string;
  if (!accountName) throw Error('Azure Storage accountName not found');
  if (!accountKey) throw Error('Azure Storage accountKey not found');

  const sharedKeyCredential = new StorageSharedKeyCredential(
    accountName,
    accountKey
  );

  const blobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    sharedKeyCredential
  );
  return blobServiceClient;
}
export function getContainerClientFromDefaultAzureCredential(
  containerName: string
): ContainerClient {
  // Azure Storage resource name
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME as string;
  if (!accountName) throw Error('Azure Storage accountName not found');

  const baseUrl = `https://${accountName}.blob.core.windows.net`;

  // Create ContainerClient
  const containerClient: ContainerClient = new ContainerClient(
    `${baseUrl}/${containerName}`,
    new DefaultAzureCredential()
  );

  return containerClient;
}
export function getContainerClientFromSasToken(
  containerName: string,
  sasToken: string
): ContainerClient {
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME as string;

  // Create Url
  // SAS token is the query string with typical `?` delimiter
  const sasUrl = `https://${accountName}.blob.core.windows.net/${containerName}?${sasToken}`;
  console.log(`\nContainerUrl = ${sasUrl}\n`);

  // Create container client from SAS token url
  const containerClient: ContainerClient = new ContainerClient(sasUrl);
  return containerClient;
}
export function getContainerClientFromSharedKeyCredential(
  containerName: string
): ContainerClient {
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME as string;
  if (!accountName) throw Error('Azure Storage accountName not found');

  const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY as string;
  if (!accountKey) throw Error('Azure Storage accountKey not found');

  const sharedKeyCredential = new StorageSharedKeyCredential(
    accountName,
    accountKey
  );

  const baseUrl = `https://${accountName}.blob.core.windows.net`;
  const containerClient: ContainerClient = new ContainerClient(
    `${baseUrl}/${containerName}`,
    sharedKeyCredential
  );
  return containerClient;
}
export function getBlobClientFromAccountAndKey(
  containerName: string,
  blobName: string
): BlockBlobClient {
  // Credential secrets
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME as string;
  if (!accountName) throw Error('AZURE_STORAGE_ACCOUNT_NAME not found');

  const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY as string;
  if (!accountKey) throw Error('AZURE_STORAGE_ACCOUNT_KEY not found');

  // Create credential
  const sharedKeyCredential = new StorageSharedKeyCredential(
    accountName,
    accountKey
  );

  // Set resource names - must already exist

  const baseUrl = `https://${accountName}.blob.core.windows.net`;

  // create blob from BlockBlobClient
  const blockBlobClient = new BlockBlobClient(
    `${baseUrl}/${containerName}/${blobName}`,
    sharedKeyCredential
  );
  return blockBlobClient;
}
export function getBlockBlobClientFromDefaultAzureCredential(
  containerName: string,
  blobName: string
): BlockBlobClient {
  // Credential secrets
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME as string;
  if (!accountName) throw Error('AZURE_STORAGE_ACCOUNT_NAME not found');
  const baseUrl = `https://${accountName}.blob.core.windows.net`;

  const client: BlockBlobClient = new BlockBlobClient(
    `${baseUrl}/${containerName}/${blobName}`,
    new DefaultAzureCredential()
  );

  return client;
}
