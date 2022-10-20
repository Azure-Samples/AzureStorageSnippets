﻿//----------------------------------------------------------------------------------
// Microsoft Developer & Platform Evangelism
//
// Copyright (c) Microsoft Corporation. All rights reserved.
//
// THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, 
// EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES 
// OF MERCHANTABILITY AND/OR FITNESS FOR A PARTICULAR PURPOSE.
//----------------------------------------------------------------------------------
// The example companies, organizations, products, domain names,
// e-mail addresses, logos, people, places, and events depicted
// herein are fictitious.  No association with any real company,
// organization, product, domain name, email address, logo, person,
// places, or events is intended or should be inferred.
//----------------------------------------------------------------------------------

using Azure;
using Azure.Core;
using Azure.Identity;
using Azure.Security.KeyVault.Keys;
using Azure.Security.KeyVault.Keys.Cryptography;
using Azure.Storage;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Blobs.Specialized;
using System;
using System.IO;
using System.Security.Cryptography;
using System.Threading.Tasks;

namespace dotnet_v12
{
    public class Security
    {

        //-------------------------------------------------
        // Set container public access level
        //-------------------------------------------------

        // <Snippet_SetPublicContainerPermissions>
        public static void SetPublicContainerPermissions(BlobContainerClient container)
        {
            container.SetAccessPolicy(PublicAccessType.BlobContainer);
            Console.WriteLine("Container {0} - permissions set to {1}",
                container.Name, container.GetAccessPolicy().Value);
        }
        // </Snippet_SetPublicContainerPermissions>

        //-------------------------------------------------
        // Create an anonymous client object
        //-------------------------------------------------

        // <Snippet_CreateAnonymousBlobClient>
        public static void CreateAnonymousBlobClient()
        {
            // Create the client object using the Blob storage endpoint for your account.
            BlobServiceClient blobServiceClient = new BlobServiceClient
                (new Uri(@"https://storagesamples.blob.core.windows.net/"));

            // Get a reference to a container that's available for anonymous access.
            BlobContainerClient container = blobServiceClient.GetBlobContainerClient("sample-container");

            // Read the container's properties. 
            // Note this is only possible when the container supports full public read access.          
            Console.WriteLine(container.GetProperties().Value.LastModified);
            Console.WriteLine(container.GetProperties().Value.ETag);
        }
        // </Snippet_CreateAnonymousBlobClient>

        //-------------------------------------------------
        // Reference a container anonymously
        //-------------------------------------------------

        // <Snippet_ListBlobsAnonymously>
        public static void ListBlobsAnonymously()
        {
            // Get a reference to a container that's available for anonymous access.
            BlobContainerClient container = new BlobContainerClient
                (new Uri(@"https://storagesamples.blob.core.windows.net/sample-container"));

            // List blobs in the container.
            // Note this is only possible when the container supports full public read access.
            foreach (BlobItem blobItem in container.GetBlobs())
            {
                Console.WriteLine(container.GetBlockBlobClient(blobItem.Name).Uri);
            }
        }
        // </Snippet_ListBlobsAnonymously>

        //-------------------------------------------------
        // Reference a blob anonymously
        //-------------------------------------------------

        // <Snippet_DownloadBlobAnonymously>
        public static void DownloadBlobAnonymously()
        {
            BlockBlobClient blob = new BlockBlobClient
                (new Uri(@"https://storagesamples.blob.core.windows.net/sample-container/logfile.txt"));
            blob.DownloadTo(@"C:\Temp\logfile.txt");
        }
        // </Snippet_DownloadBlobAnonymously>


        #region UploadBlobWithClientKey

        //-------------------------------------------------
        // Upload a blob with an encryption key
        //-------------------------------------------------

        // <Snippet_UploadBlobWithClientKey>
        async static Task UploadBlobWithClientKey(BlobUriBuilder blobUriBuilder,
                                                  Stream data,
                                                  byte[] key)
        {
            try
            {
                // Specify the customer-provided key on the options for the client.
                BlobClientOptions options = new BlobClientOptions()
                {
                    // Key must be AES-256.
                    CustomerProvidedKey = new CustomerProvidedKey(key)
                };

                // Get the blob endpoint.
                BlobUriBuilder blobEndpoint = new BlobUriBuilder(blobUriBuilder.ToUri())
                {
                    BlobContainerName = null,
                    BlobName = null
                };

                // Create a client object for the Blob service, including options.
                BlobServiceClient serviceClient =
                    new BlobServiceClient(blobEndpoint.ToUri(),
                                          new DefaultAzureCredential(),
                                          options);

                // Create a client object for the container.
                // The container client retains the credential and client options.
                BlobContainerClient containerClient =
                    serviceClient.GetBlobContainerClient(blobUriBuilder.BlobContainerName);

                // Create a new block blob client object.
                // The blob client retains the credential and client options.
                BlobClient blobClient = containerClient.GetBlobClient(blobUriBuilder.BlobName);

                // Create the container if it does not exist.
                await containerClient.CreateIfNotExistsAsync();

                // Upload the data using the customer-provided key.
                await blobClient.UploadAsync(data, true);
            }
            catch (RequestFailedException e)
            {
                Console.WriteLine(e.Message);
                Console.ReadLine();
                throw;
            }
        }
        // </Snippet_UploadBlobWithClientKey>

        #endregion

        //-------------------------------------------------
        // Security menu (Can call asynchronous and synchronous methods)
        //-------------------------------------------------

        public async Task<bool> MenuAsync()
        {
            Console.Clear();
            Console.WriteLine("Choose a security scenario:");
            Console.WriteLine("1) Set container public access level");
            Console.WriteLine("2) Create an anonymous client object");
            Console.WriteLine("3) Reference a container anonymously");
            Console.WriteLine("4) Reference a blob anonymously");
            Console.WriteLine("5) Pass an encryption key on the request");
            Console.WriteLine("6) Pass an encryption key from Key Vault on the request");
            Console.WriteLine("X) Exit to main menu");
            Console.Write("\r\nSelect an option: ");

            switch (Console.ReadLine())
            {
                case "1":

                    var connectionString = Constants.connectionString;
                    BlobServiceClient blobServiceClient = new BlobServiceClient(connectionString);

                    SetPublicContainerPermissions(blobServiceClient.GetBlobContainerClient(Constants.containerName));

                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "2":

                    CreateAnonymousBlobClient();

                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "3":

                    ListBlobsAnonymously();

                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "4":

                    DownloadBlobAnonymously();

                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "5":
                    Uri blobUri5 = new Uri(string.Format("https://{0}.blob.core.windows.net/{1}/{2}",
                                                         Constants.storageAccountName,
                                                         Constants.containerName,
                                                         Constants.blobName));

                    AesCryptoServiceProvider keyAes = new AesCryptoServiceProvider();

                    // Create an array of random bytes.
                    byte[] buffer = new byte[1024];
                    Random rnd = new Random();
                    rnd.NextBytes(buffer);

                    await UploadBlobWithClientKey(new BlobUriBuilder(blobUri5),
                                                  new MemoryStream(buffer), 
                                                  keyAes.Key);

                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "6":
                    var accountName = Constants.accountName;

                    var keyName = "TestRSAKey";
                    var keyVaultName = Environment.GetEnvironmentVariable("KEY_VAULT_NAME");

                    // URI for the key vault resource
                    var keyVaultUri = $"https://{keyVaultName}.vault.azure.net";

                    TokenCredential tokenCredential = new DefaultAzureCredential();

                    // Create a KeyClient object
                    var keyVaultClient = new KeyClient(new Uri(keyVaultUri), tokenCredential);

                    // Add a key to the key vault
                    var key = await keyVaultClient.CreateKeyAsync(keyName, KeyType.Rsa);

                    // URI for the key if one already exists
                    //var keyVaultKeyUri = $"https://{keyVaultName}.vault.azure.net/keys/{keyName}";
                    //CryptographyClient cryptoClient = new CryptographyClient(new Uri(keyVaultKeyUri), tokenCredential);

                    // Cryptography client and key resolver instances using Azure Key Vault client library
                    CryptographyClient cryptoClient = keyVaultClient.GetCryptographyClient(key.Value.Name, key.Value.Properties.Version);
                    KeyResolver keyResolver = new KeyResolver(tokenCredential);

                    // Configure the encryption options to be used for upload and download
                    ClientSideEncryptionOptions encryptionOptions = new ClientSideEncryptionOptions(ClientSideEncryptionVersion.V2_0)
                    {
                        KeyEncryptionKey = cryptoClient,
                        KeyResolver = keyResolver,
                        // String value that the client library will use when calling IKeyEncryptionKey.WrapKey()
                        KeyWrapAlgorithm = "RSA-OAEP"
                    };

                    // Set the encryption options on the client options.
                    BlobClientOptions options = new SpecializedBlobClientOptions() { ClientSideEncryption = encryptionOptions };

                    // Create a blob client with client-side encryption enabled.
                    // Client-side encryption options are passed from service clients to container clients, 
                    // and from container clients to blob clients.
                    // Attempting to construct a BlockBlobClient, PageBlobClient, or AppendBlobClient from a BlobContainerClient
                    // with client-side encryption options present will throw, as this functionality is only supported with BlobClient.
                    Uri blobUri = new Uri(string.Format($"https://{accountName}.blob.core.windows.net"));
                    BlobClient blob = new BlobServiceClient(blobUri, tokenCredential, options).GetBlobContainerClient("my-container").GetBlobClient("myBlob");

                    // Upload the encrypted contents to the blob
                    Stream blobContent = BinaryData.FromString("Ready for encryption, Captain.").ToStream();
                    await blob.UploadAsync(blobContent);

                    // Download and decrypt the encrypted contents from the blob
                    Response<BlobDownloadInfo>  response = await blob.DownloadAsync();
                    BlobDownloadInfo downloadInfo = response.Value;

                    Console.WriteLine((await BinaryData.FromStreamAsync(downloadInfo.Content)).ToString());

                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "x":
                case "X":

                    return false;

                default:

                    return true;
            }
        }
    }
}



