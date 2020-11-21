//----------------------------------------------------------------------------------
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

using Azure.Storage;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Blobs.Specialized;
using Azure.Storage.Sas;
using Azure.Storage.Files.DataLake;
using System;
using System.Threading.Tasks;

namespace dotnet_v12
{
    public class Security
    {

        //-------------------------------------------------
        // Set container public access level
        //-------------------------------------------------

        // <Snippet_SetPublicContainerPermissions>
        private static void SetPublicContainerPermissions(BlobContainerClient container)
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


        #region GetServiceSasUriForContainer

        //-------------------------------------------------
        // Get service SAS for blob container
        //-------------------------------------------------

        // <Snippet_GetServiceSasUriForContainer>
        private static Uri GetServiceSasUriForContainer(BlobContainerClient containerClient,
                                                  string storedPolicyName = null)
        {
            // Check whether this BlobContainerClient object has been authorized with Shared Key.
            if (containerClient.CanGenerateSasUri)
            {
                // Create a SAS token that's valid for one hour.
                BlobSasBuilder sasBuilder = new BlobSasBuilder()
                {
                    BlobContainerName = containerClient.Name,
                    Resource = "c"
                };

                if (storedPolicyName == null)
                {
                    sasBuilder.ExpiresOn = DateTimeOffset.UtcNow.AddHours(1);
                    sasBuilder.SetPermissions(BlobContainerSasPermissions.Read);
                }
                else
                {
                    sasBuilder.Identifier = storedPolicyName;
                }

                Uri sasUri = containerClient.GenerateSasUri(sasBuilder);
                Console.WriteLine("SAS URI for blob container is: {0}", sasUri);
                Console.WriteLine();

                return sasUri;
            }
            else
            {
                Console.WriteLine(@"BlobContainerClient must be authorized with Shared Key 
                                  credentials to create a service SAS.");
                return null;
            }
        }
        // </Snippet_GetServiceSasUriForContainer>

        #endregion

        #region GetServiceSasUriForDirectory

        //-------------------------------------------------
        // Get service SAS for directory
        //-------------------------------------------------

        // <Snippet_GetServiceSasUriForDirectory>
        private static Uri GetServiceSasUriForDirectory(DataLakeDirectoryClient directoryClient,
                                                  string storedPolicyName = null)
        {
            if (directoryClient.CanGenerateSasUri)
            {
                // Create a SAS token that's valid for one hour.
                DataLakeSasBuilder sasBuilder = new DataLakeSasBuilder()
                {
                    // Specify the file system name, the path, and indicate that
                    // the client object points to a directory.
                    FileSystemName = directoryClient.FileSystemName,
                    Resource = "d",
                    IsDirectory = true,
                    Path = directoryClient.Path,
                };

                // If no stored access policy is specified, create the policy
                // by specifying expiry and permissions.
                if (storedPolicyName == null)
                {
                    sasBuilder.ExpiresOn = DateTimeOffset.UtcNow.AddHours(1);
                    sasBuilder.SetPermissions(DataLakeSasPermissions.Read |
                        DataLakeSasPermissions.Write |
                        DataLakeSasPermissions.List);
                }
                else
                {
                    sasBuilder.Identifier = storedPolicyName;
                }

                // Get the SAS URI for the specified directory.
                Uri sasUri = directoryClient.GenerateSasUri(sasBuilder);
                Console.WriteLine("SAS URI for ADLS directory is: {0}", sasUri);
                Console.WriteLine();

                return sasUri;
            }
            else
            {
                Console.WriteLine(@"DataLakeDirectoryClient must be authorized with Shared Key 
                                  credentials to create a service SAS.");
                return null;
            }
        }
        // </Snippet_GetServiceSasUriForDirectory>

        #endregion


        #region GetServiceSasUriForBlob

        //-------------------------------------------------
        // Get service SAS for blob
        //-------------------------------------------------

        // <Snippet_GetServiceSasUriForBlob>
        private static Uri GetServiceSasUriForBlob(BlobClient blobClient,
            string storedPolicyName = null)
        {
            // Check whether this BlobClient object has been authorized with Shared Key.
            if (blobClient.CanGenerateSasUri)
            {
                // Create a SAS token that's valid for one hour.
                BlobSasBuilder sasBuilder = new BlobSasBuilder()
                {
                    BlobContainerName = blobClient.GetParentBlobContainerClient().Name,
                    BlobName = blobClient.Name,
                    Resource = "b"
                };

                if (storedPolicyName == null)
                {
                    sasBuilder.ExpiresOn = DateTimeOffset.UtcNow.AddHours(1);
                    sasBuilder.SetPermissions(BlobSasPermissions.Read | 
                        BlobSasPermissions.Write);
                }
                else
                {
                    sasBuilder.Identifier = storedPolicyName;
                }

                Uri sasUri = blobClient.GenerateSasUri(sasBuilder);
                Console.WriteLine("SAS URI for blob is: {0}", sasUri);
                Console.WriteLine();

                return sasUri;
            }
            else
            {
                Console.WriteLine(@"BlobClient must be authorized with Shared Key 
                                  credentials to create a service SAS.");
                return null;
            }
        }
        // </Snippet_GetServiceSasUriForBlob>

        #endregion

        //-------------------------------------------------
        // Get Account SAS Token
        //-------------------------------------------------

        // <Snippet_GetAccountSASToken>

        private static string GetAccountSASToken(StorageSharedKeyCredential key)
        {
            // Create a SAS token that's valid for one hour.
            AccountSasBuilder sasBuilder = new AccountSasBuilder()
            {
                Services = AccountSasServices.Blobs | AccountSasServices.Files,
                ResourceTypes = AccountSasResourceTypes.Service,
                ExpiresOn = DateTimeOffset.UtcNow.AddHours(1),
                Protocol = SasProtocol.Https
            };

            sasBuilder.SetPermissions(AccountSasPermissions.Read |
                AccountSasPermissions.Write);

            // Use the key to get the SAS token.
            string sasToken = sasBuilder.ToSasQueryParameters(key).ToString();

            Console.WriteLine("SAS token for the storage account is: {0}", sasToken);
            Console.WriteLine();

            return sasToken;
        }

        // </Snippet_GetAccountSASToken>

        //-------------------------------------------------
        // Use Account SAS Token
        //-------------------------------------------------

        // <Snippet_UseAccountSAS>

        private static void UseAccountSAS(Uri blobServiceUri, string sasToken)
        {  
            var blobServiceClient = new BlobServiceClient
                (new Uri($"{blobServiceUri}?{sasToken}"), null);

            BlobRetentionPolicy retentionPolicy = new BlobRetentionPolicy();
            retentionPolicy.Enabled = true;
            retentionPolicy.Days = 7;

            blobServiceClient.SetProperties(new BlobServiceProperties()
            {
                HourMetrics = new BlobMetrics()
                {
                    RetentionPolicy = retentionPolicy,
                    Version = "1.0"
                },
                MinuteMetrics = new BlobMetrics()
                {
                    RetentionPolicy = retentionPolicy,
                    Version = "1.0"
                },
                Logging = new BlobAnalyticsLogging()
                {
                    Write = true,
                    Read = true,
                    Delete = true,
                    RetentionPolicy = retentionPolicy,
                    Version = "1.0"
                }
            });

            // The permissions granted by the account SAS also permit you to retrieve service properties.

            BlobServiceProperties serviceProperties = blobServiceClient.GetProperties().Value;
            Console.WriteLine(serviceProperties.HourMetrics.RetentionPolicy);
            Console.WriteLine(serviceProperties.HourMetrics.Version);
        }

        // </Snippet_UseAccountSAS>

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
            Console.WriteLine("5) Create service SAS for a blob container");
            Console.WriteLine("6) Create service SAS for a blob");
            Console.WriteLine("7) Create service SAS for the storage account");
            Console.WriteLine("8) Create a storage account by using a SAS token");
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

                    var connectionString1 = Constants.connectionString;
                    BlobServiceClient blobServiceClient1 = new BlobServiceClient(connectionString1);

                    GetServiceSasUriForContainer(blobServiceClient1.GetBlobContainerClient(Constants.containerName),
                        Constants.accountKey);

                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "6":

                    var connectionString2 = Constants.connectionString;

                    BlobClient blobClient = new BlobClient(connectionString2, Constants.containerName, Constants.blobName);

                    GetServiceSasUriForBlob(blobClient, default);

                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "7":
                    var connectionString3 = Constants.connectionString;
                    BlobServiceClient blobServiceClient3 = new BlobServiceClient(connectionString3);

                    GetAccountSASToken(new StorageSharedKeyCredential(Constants.storageAccountName, Constants.accountKey));

                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "8":
                    var connectionString4 = Constants.connectionString;
                    BlobServiceClient blobServiceClient4 = new BlobServiceClient(connectionString4);

                    string token = GetAccountSASToken(new StorageSharedKeyCredential(Constants.storageAccountName, Constants.accountKey));

                    UseAccountSAS(blobServiceClient4.Uri, token);

                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "9":
                    // Construct the directory endpoint from the account name.
                    string directoryEndpoint = string.Format("https://{0}.dfs.core.windows.net/{1}/{2}", 
                                                             Constants.storageAccountNameAdls,
                                                             Constants.directoryName,
                                                             Constants.subDirectoryName);

                    DataLakeDirectoryClient directoryClient =
                        new DataLakeDirectoryClient(new Uri(directoryEndpoint),
                                                    new StorageSharedKeyCredential(Constants.storageAccountNameAdls, 
                                                                                   Constants.accountKeyAdls));

                    GetServiceSasUriForDirectory(directoryClient, default);

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



