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

using Azure;
using Azure.Identity;
using Azure.Storage;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Blobs.Specialized;
using Azure.Storage.Sas;
using Azure.Storage.Files.DataLake;
using Azure.Storage.Files.DataLake.Models;
using System;
using System.Threading.Tasks;
using System.IO;

namespace dotnet_v12
{
    class Sas
    {

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


        #region GetUserDelegationSasBlob

        // <Snippet_GetUserDelegationSasBlob>
        async static Task<Uri> GetUserDelegationSasBlob(BlobClient blobClient)
        {
            BlobServiceClient blobServiceClient =
                blobClient.GetParentBlobContainerClient().GetParentBlobServiceClient();

            // Get a user delegation key for the Blob service that's valid for 7 days.
            // You can use the key to generate any number of shared access signatures 
            // over the lifetime of the key.
            Azure.Storage.Blobs.Models.UserDelegationKey userDelegationKey =
                await blobServiceClient.GetUserDelegationKeyAsync(DateTimeOffset.UtcNow,
                                                                  DateTimeOffset.UtcNow.AddDays(7));

            // Create a SAS token that's also valid for 7 days.
            BlobSasBuilder sasBuilder = new BlobSasBuilder()
            {
                BlobContainerName = blobClient.BlobContainerName,
                BlobName = blobClient.Name,
                Resource = "b",
                StartsOn = DateTimeOffset.UtcNow,
                ExpiresOn = DateTimeOffset.UtcNow.AddDays(7)
            };

            // Specify read and write permissions for the SAS.
            sasBuilder.SetPermissions(BlobSasPermissions.Read |
                                      BlobSasPermissions.Write);

            // Add the SAS token to the blob URI.
            BlobUriBuilder blobUriBuilder = new BlobUriBuilder(blobClient.Uri)
            {
                // Specify the user delegation key.
                Sas = sasBuilder.ToSasQueryParameters(userDelegationKey, 
                                                      blobServiceClient.AccountName)
            };

            Console.WriteLine("Blob user delegation SAS URI: {0}", blobUriBuilder);
            Console.WriteLine();
            return blobUriBuilder.ToUri();
        }
        // </Snippet_GetUserDelegationSasBlob>

        #endregion


        #region ReadBlobWithSasAsync

        // <Snippet_ReadBlobWithSasAsync>
        static async Task ReadBlobWithSasAsync(Uri sasUri)
        {
            // Try performing a read operation using the blob SAS provided.

            // Create a blob client object for blob operations.
            BlobClient blobClient = new BlobClient(sasUri, null);

            // Download and read the contents of the blob.
            try
            {
                Console.WriteLine("Blob contents:");

                // Download blob contents to a stream and read the stream.
                BlobDownloadInfo blobDownloadInfo = await blobClient.DownloadAsync();
                using (StreamReader reader = new StreamReader(blobDownloadInfo.Content, true))
                {
                    string line;
                    while ((line = reader.ReadLine()) != null)
                    {
                        Console.WriteLine(line);
                    }
                }

                Console.WriteLine();
                Console.WriteLine("Read operation succeeded for SAS {0}", sasUri);
                Console.WriteLine();
            }
            catch (RequestFailedException e)
            {
                // Check for a 403 (Forbidden) error. If the SAS is invalid, 
                // Azure Storage returns this error.
                if (e.Status == 403)
                {
                    Console.WriteLine("Read operation failed for SAS {0}", sasUri);
                    Console.WriteLine("Additional error information: " + e.Message);
                    Console.WriteLine();
                }
                else
                {
                    Console.WriteLine(e.Message);
                    Console.ReadLine();
                    throw;
                }
            }
        }
        // </Snippet_ReadBlobWithSasAsync>

        #endregion

        #region

        // <Snippet_GetUserDelegationSasContainer>
        async static Task<Uri> GetUserDelegationSasContainer(BlobContainerClient blobContainerClient)
        {
            BlobServiceClient blobServiceClient = blobContainerClient.GetParentBlobServiceClient();

            // Get a user delegation key for the Blob service that's valid for seven days.
            // You can use the key to generate any number of shared access signatures 
            // over the lifetime of the key.
            Azure.Storage.Blobs.Models.UserDelegationKey userDelegationKey =
                await blobServiceClient.GetUserDelegationKeyAsync(DateTimeOffset.UtcNow,
                                                                  DateTimeOffset.UtcNow.AddDays(7));

            // Create a SAS token that's also valid for seven days.
            BlobSasBuilder sasBuilder = new BlobSasBuilder()
            {
                BlobContainerName = blobContainerClient.Name,
                Resource = "c",
                StartsOn = DateTimeOffset.UtcNow,
                ExpiresOn = DateTimeOffset.UtcNow.AddDays(7)
            };

            // Specify racwl permissions for the SAS.
            sasBuilder.SetPermissions(
                BlobContainerSasPermissions.Read |
                BlobContainerSasPermissions.Add |
                BlobContainerSasPermissions.Create |
                BlobContainerSasPermissions.Write |
                BlobContainerSasPermissions.List
                );

            // Add the SAS token to the container URI.
            BlobUriBuilder blobUriBuilder = new BlobUriBuilder(blobContainerClient.Uri)
            {
                // Specify the user delegation key.
                Sas = sasBuilder.ToSasQueryParameters(userDelegationKey,
                                                      blobServiceClient.AccountName)
            };

            Console.WriteLine("Container user delegation SAS URI: {0}", blobUriBuilder);
            Console.WriteLine();
            return blobUriBuilder.ToUri();
        }
        // </Snippet_GetUserDelegationSasContainer>

        #endregion


        #region

        // <Snippet_ListBlobsWithSasAsync>
        private static async Task ListBlobsWithSasAsync(Uri sasUri)
        {
            // Try performing a listing operation using the container SAS provided.

            // Create a container client object for blob operations.
            BlobContainerClient blobContainerClient = new BlobContainerClient(sasUri, null);

            // List blobs in the container.
            try
            {
                // Call the listing operation and return pages of the specified size.
                var resultSegment = blobContainerClient.GetBlobsAsync().AsPages();

                // Enumerate the blobs returned for each page.
                await foreach (Azure.Page<BlobItem> blobPage in resultSegment)
                {
                    foreach (BlobItem blobItem in blobPage.Values)
                    {
                        Console.WriteLine("Blob name: {0}", blobItem.Name);
                    }
                    Console.WriteLine();
                }

                Console.WriteLine();
                Console.WriteLine("Blob listing operation succeeded for SAS {0}", sasUri);
            }
            catch (RequestFailedException e)
            {
                // Check for a 403 (Forbidden) error. If the SAS is invalid, 
                // Azure Storage returns this error.
                if (e.Status == 403)
                {
                    Console.WriteLine("Blob listing operation failed for SAS {0}", sasUri);
                    Console.WriteLine("Additional error information: " + e.Message);
                    Console.WriteLine();
                }
                else
                {
                    Console.WriteLine(e.Message);
                    Console.ReadLine();
                    throw;
                }
            }
        }
        // </Snippet_ListBlobsWithSasAsync>

        #endregion

        #region

        // <Snippet_GetUserDelegationSasDirectory>
        async static Task<Uri> GetUserDelegationSasDirectory(DataLakeDirectoryClient directoryClient)
        {
            try
            {
                // Get service endpoint from the directory URI.
                DataLakeUriBuilder dataLakeServiceUri = new DataLakeUriBuilder(directoryClient.Uri)
                {
                    FileSystemName = null,
                    DirectoryOrFilePath = null
                };

                // Get service client.
                DataLakeServiceClient dataLakeServiceClient =
                    new DataLakeServiceClient(dataLakeServiceUri.ToUri(),
                                              new DefaultAzureCredential());

                // Get a user delegation key that's valid for seven days.
                // You can use the key to generate any number of shared access signatures 
                // over the lifetime of the key.
                Azure.Storage.Files.DataLake.Models.UserDelegationKey userDelegationKey =
                    await dataLakeServiceClient.GetUserDelegationKeyAsync(DateTimeOffset.UtcNow,
                                                                          DateTimeOffset.UtcNow.AddDays(7));

                // Create a SAS token that's valid for seven days.
                DataLakeSasBuilder sasBuilder = new DataLakeSasBuilder()
                {
                    // Specify the file system name and path, and indicate that
                    // the client object points to a directory.
                    FileSystemName = directoryClient.FileSystemName,
                    Resource = "d",
                    IsDirectory = true,
                    Path = directoryClient.Path,
                    ExpiresOn = DateTimeOffset.UtcNow.AddDays(7)
                };

                // Specify racwl permissions for the SAS.
                sasBuilder.SetPermissions(
                    DataLakeSasPermissions.Read |
                    DataLakeSasPermissions.Add |
                    DataLakeSasPermissions.Create |
                    DataLakeSasPermissions.Write |
                    DataLakeSasPermissions.List
                    );

                // Construct the full URI, including the SAS token.
                DataLakeUriBuilder fullUri = new DataLakeUriBuilder(directoryClient.Uri)
                {
                    Sas = sasBuilder.ToSasQueryParameters(userDelegationKey,
                                                          dataLakeServiceClient.AccountName)
                };

                Console.WriteLine("Directory user delegation SAS URI: {0}", fullUri);
                Console.WriteLine();
                return fullUri.ToUri();
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message);
                throw;
            }
        }
        // </Snippet_GetUserDelegationSasDirectory>

        #endregion

        #region

        // <Snippet_ListFilePathsWithDirectorySasAsync>
        private static async Task ListFilesPathsWithDirectorySasAsync(Uri sasUri)
        {
            // Try performing an operation using the directory SAS provided.

            // Create a directory client object for listing operations.
            DataLakeDirectoryClient dataLakeDirectoryClient = new DataLakeDirectoryClient(sasUri);

            // List file paths in the directory.
            try
            {
                // Call the listing operation and return pages of the specified size.
                var resultSegment = dataLakeDirectoryClient.GetPathsAsync(false, false).AsPages();

                // Enumerate the file paths returned with each page.
                await foreach (Page<PathItem> pathPage in resultSegment)
                {
                    foreach (PathItem pathItem in pathPage.Values)
                    {
                        Console.WriteLine("File name: {0}", pathItem.Name);
                    }
                    Console.WriteLine();
                }

                Console.WriteLine();
                Console.WriteLine("Directory listing operation succeeded for SAS {0}", sasUri);
            }
            catch (RequestFailedException e)
            {
                // Check for a 403 (Forbidden) error. If the SAS is invalid, 
                // Azure Storage returns this error.
                if (e.Status == 403)
                {
                    Console.WriteLine("Directory listing operation failed for SAS {0}", sasUri);
                    Console.WriteLine("Additional error information: " + e.Message);
                    Console.WriteLine();
                }
                else
                {
                    Console.WriteLine(e.Message);
                    Console.ReadLine();
                    throw;
                }
            }
        }
        // </Snippet_ListFilePathsWithDirectorySasAsync>

        #endregion

        //-------------------------------------------------
        // Security menu (Can call asynchronous and synchronous methods)
        //-------------------------------------------------

        public async Task<bool> MenuAsync()
        {
            Console.Clear();
            Console.WriteLine("Choose a SAS scenario:");
            Console.WriteLine("1) Create service SAS for a blob container");
            Console.WriteLine("2) Create service SAS for a blob");
            Console.WriteLine("3) Create service SAS for the storage account");
            Console.WriteLine("4) Create a storage account by using a SAS token");
            Console.WriteLine("5) Create service SAS for an ADLS directory");
            Console.WriteLine("6) Create user delegation SAS for a blob and read blob with SAS");
            Console.WriteLine("7) Create user delegation SAS for a container and list blobs with SAS");
            Console.WriteLine("8) Create user delegation SAS for a directory and list paths with SAS");
            Console.WriteLine("X) Exit to main menu");
            Console.Write("\r\nSelect an option: ");

            switch (Console.ReadLine())
            {
                case "1":

                    var connectionString1 = Constants.connectionString;
                    BlobServiceClient blobServiceClient1 = new BlobServiceClient(connectionString1);

                    GetServiceSasUriForContainer(blobServiceClient1.GetBlobContainerClient(Constants.containerName),
                        Constants.accountKey);

                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "2":

                    var connectionString2 = Constants.connectionString;

                    BlobClient blobClient2 = new BlobClient(connectionString2, Constants.containerName, Constants.blobName);

                    GetServiceSasUriForBlob(blobClient2, default);

                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "3":
                    var connectionString3 = Constants.connectionString;
                    BlobServiceClient blobServiceClient3 = new BlobServiceClient(connectionString3);

                    GetAccountSASToken(new StorageSharedKeyCredential(Constants.storageAccountName, Constants.accountKey));

                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "4":
                    var connectionString4 = Constants.connectionString;
                    BlobServiceClient blobServiceClient4 = new BlobServiceClient(connectionString4);

                    string token = GetAccountSASToken(new StorageSharedKeyCredential(Constants.storageAccountName, Constants.accountKey));

                    UseAccountSAS(blobServiceClient4.Uri, token);

                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "5":
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

                case "6":
                    Uri blobUri6 = new Uri(string.Format("https://{0}.blob.core.windows.net/{1}/{2}",
                                                             Constants.storageAccountName,
                                                             Constants.containerName,
                                                             Constants.blobName));

                    BlobClient blobClient6 = new BlobClient(blobUri6, new DefaultAzureCredential());

                    Uri blobSasUri = GetUserDelegationSasBlob(blobClient6).Result;
                    ReadBlobWithSasAsync(blobSasUri).Wait();

                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "7":
                    Uri blobUri7 = new Uri(string.Format("https://{0}.blob.core.windows.net/{1}/{2}",
                                                             Constants.storageAccountName,
                                                             Constants.containerName,
                                                             Constants.blobName));

                    BlobClient blobClient7 = new BlobClient(blobUri7, new DefaultAzureCredential());

                    Uri containerSasUri7 = GetUserDelegationSasContainer(blobClient7.GetParentBlobContainerClient()).Result;
                    ListBlobsWithSasAsync(containerSasUri7).Wait();

                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "8":
                    // Construct the directory endpoint from the account name.
                    Uri dataLakeEndpoint = new Uri(string.Format("https://{0}.dfs.core.windows.net", Constants.storageAccountNameAdls));

                    DataLakeServiceClient dataLakeServiceClient = 
                        new DataLakeServiceClient(dataLakeEndpoint, new DefaultAzureCredential());

                    DataLakeFileSystemClient dataLakeFileSystemClient =
                        dataLakeServiceClient.GetFileSystemClient(Constants.containerName);

                    DataLakeDirectoryClient directoryClient8 = 
                        dataLakeFileSystemClient.GetDirectoryClient(Constants.directoryName);

                    Uri directorySasUri = GetUserDelegationSasDirectory(directoryClient8).Result;

                    ListFilesPathsWithDirectorySasAsync(directorySasUri).Wait();


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
