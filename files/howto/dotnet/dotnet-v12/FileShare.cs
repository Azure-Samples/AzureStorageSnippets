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

// <snippet_UsingStatements>
using System;
using System.Configuration;
using System.IO;
using System.Reflection.Metadata;
using System.Threading.Tasks;
using Azure.Storage;
using Azure.Storage.Blobs;
using Azure.Storage.Files.Shares;
using Azure.Storage.Files.Shares.Models;
using Azure.Storage.Sas;
// </snippet_UsingStatements>

namespace dotnet_v12
{
    public class FileShare
    {
        //-------------------------------------------------
        // Create file share client
        //-------------------------------------------------
        public async Task CreateShareClientAsync()
        {
            // <snippet_CreateShareClient>
            // Get the connection string from app settings
            string connectionString = ConfigurationManager.AppSettings["StorageConnectionString"];

            // Instantiate a ShareClient which will be used to create and manipulate the file share
            ShareClient share = new ShareClient(connectionString, "logs");
            // </snippet_CreateShareClient>

            // Create the share if it doesn't already exist
            await share.CreateIfNotExistsAsync();

            if (await share.ExistsAsync())
            {
                Console.WriteLine($"Created file share client: {share.Name}");
            }
        }

        //-------------------------------------------------
        // Create a file share
        //-------------------------------------------------
        public async Task CreateShareAsync()
        {
            // <snippet_CreateShare>
            // Get the connection string from app settings
            string connectionString = ConfigurationManager.AppSettings["StorageConnectionString"];

            // Instantiate a ShareClient which will be used to create and manipulate the file share
            ShareClient share = new ShareClient(connectionString, "logs");

            // Create the share if it doesn't already exist
            await share.CreateIfNotExistsAsync();

            // Ensure that the share exists
            if (await share.ExistsAsync())
            {
                Console.WriteLine($"Share exists: {share.Name}");

                // Get a reference to the sample directory
                ShareDirectoryClient directory = share.GetDirectoryClient("CustomLogs");

                // Create the directory if it doesn't already exist
                await directory.CreateIfNotExistsAsync();

                // Ensure that the directory exists
                if (await directory.ExistsAsync())
                {
                    // Get a reference to a file object
                    ShareFileClient file = directory.GetFileClient("Log1.txt");

                    // Ensure that the file exists
                    if (await file.ExistsAsync())
                    {
                        Console.WriteLine($"File exists: {file.Name}");

                        // Download the file
                        ShareFileDownloadInfo download = await file.DownloadAsync();

                        // Save the data to a local file, overwrite if the file already exists
                        using (FileStream stream = File.OpenWrite(@"downloadedLog1.txt"))
                        {
                            await download.Content.CopyToAsync(stream);
                            await stream.FlushAsync();
                            stream.Close();

                            // Display where the file was saved
                            Console.WriteLine($"File downloaded: {stream.Name}");
                        }
                    }
                }
            }
            // </snippet_CreateShare>
            else
            {
                Console.WriteLine($"CreateFileShareAsync failed");
            }
        }

        //-------------------------------------------------
        // Set the maximum size of a share
        //-------------------------------------------------
        public async Task SetMaxShareSizeAsync()
        {
            // <snippet_SetMaxShareSize>
            const long ONE_GIBIBYTE = 10737420000; // Number of bytes in 1 gibibyte

            // Get the connection string from app settings
            string connectionString = ConfigurationManager.AppSettings["StorageConnectionString"];

            // Instantiate a ShareClient which will be used to access the file share
            ShareClient share = new ShareClient(connectionString, "logs");

            // Create the share if it doesn't already exist
            await share.CreateIfNotExistsAsync();

            // Ensure that the share exists
            if (await share.ExistsAsync())
            {
                Console.WriteLine($"Share exists: {share.Uri}");

                // Get and display current usage stats for the share
                ShareStatistics stats = await share.GetStatisticsAsync();
                Console.WriteLine($"Current share usage: {stats.ShareUsageInBytes} bytes");

                // Convert current usage from bytes into GiB
                int currentGiB = (int)(stats.ShareUsageInBytes / ONE_GIBIBYTE);

                // This line sets the quota to be 10 GB greater than the current usage of the share
                await share.SetQuotaAsync(currentGiB + 10);

                // Get the new quota and display it
                ShareProperties props = await share.GetPropertiesAsync();
                Console.WriteLine($"Current share quota: {props.QuotaInGB} GiB");
            }
            // </snippet_SetMaxShareSize>
        }

        //-------------------------------------------------
        // Upload a file using a SAS
        //-------------------------------------------------
        // <snippet_UploadFileWithSas>
        public async Task UploadFileWithSasAsync()
        {
            Uri fileSasUri = GetFileSasUri("logs", "CustomLogs/Log1.txt",
                ShareFileSasPermissions.Read | ShareFileSasPermissions.Write
                );

            // Get a reference to a local file and upload it
            using (FileStream stream = File.OpenRead("Log1.txt"))
            {
                ShareFileClient file = new ShareFileClient(fileSasUri);
                await file.CreateAsync(stream.Length);
                await file.UploadAsync(stream);
                Console.WriteLine($"File uploaded: {file.Uri}");
            }
        }
        // <snippet_UploadFileWithSas>

        // <snippet_GetFileSasUri>
        //-------------------------------------------------
        // Create a SAS URI for a file
        //-------------------------------------------------
        public Uri GetFileSasUri(string shareName, string filePath, ShareFileSasPermissions permissions)
        {
            // Get the account details from app settings
            string accountName = ConfigurationManager.AppSettings["StorageAccountName"];
            string accountKey = ConfigurationManager.AppSettings["StorageAccountKey"];

            ShareSasBuilder fileSAS = new ShareSasBuilder()
            {
                // Access the logs share
                ShareName = shareName,

                FilePath = filePath,

                // Specify an Azure Storage share resource
                Resource = "f",

                // Expires in 24 hours
                ExpiresOn = DateTime.UtcNow.AddHours(24)
            };

            fileSAS.SetPermissions(permissions);

            // Create a SharedKeyCredential that we can use to sign the SAS token
            StorageSharedKeyCredential credential = new StorageSharedKeyCredential(accountName, accountKey);

            // Build a SAS URI
            UriBuilder fileSasUri = new UriBuilder($"https://{accountName}.file.core.windows.net/{fileSAS.ShareName}/{fileSAS.FilePath}");
            fileSasUri.Query = fileSAS.ToSasQueryParameters(credential).ToString();

            // Return the account SAS URI
            return fileSasUri.Uri;
        }
        // </snippet_GetFileSasUri>

        // <snippet_CopyFile>
        //-------------------------------------------------
        // Copy file within a directory
        //-------------------------------------------------
        public async Task CopyFileAsync(string shareName, string sourceFilePath, string destFilePath)
        {
            // Get the connection string from app settings
            string connectionString = ConfigurationManager.AppSettings["StorageConnectionString"];

            // Get a reference to the file we created previously
            ShareFileClient sourceFile = new ShareFileClient(connectionString, shareName, sourceFilePath);

            // Ensure that the source file exists
            if (await sourceFile.ExistsAsync())
            {
                // Get a reference to the destination file
                ShareFileClient destFile = new ShareFileClient(connectionString, shareName, destFilePath);

                // Start the copy operation
                await destFile.StartCopyAsync(sourceFile.Uri);

                if (await destFile.ExistsAsync())
                {
                    Console.WriteLine($"{sourceFile.Uri} copied to {destFile.Uri}");
                }
            }
        }
        // </snippet_CopyFile>

        //-------------------------------------------------
        // Copy a file from a share to a blob
        //-------------------------------------------------
        public async Task CopyFileToBlobAsync(string shareName, string sourceFilePath, string containerName, string blobName)
        {
            // <snippet_CopyFileToBlob>
            Uri fileSasUri = GetFileSasUri(shareName, sourceFilePath, ShareFileSasPermissions.Read);

            // Get a reference to the file we created previously
            ShareFileClient sourceFile = new ShareFileClient(fileSasUri);

            // Ensure that the source file exists
            if (await sourceFile.ExistsAsync())
            {
                // Get the connection string from app settings
                string connectionString = ConfigurationManager.AppSettings["StorageConnectionString"];

                // Get a reference to the destination container
                BlobContainerClient container = new BlobContainerClient(connectionString, containerName);

                // Create the container if it doesn't already exist
                await container.CreateIfNotExistsAsync();

                BlobClient destBlob = container.GetBlobClient(blobName);

                await destBlob.StartCopyFromUriAsync(sourceFile.Uri);

                if (await destBlob.ExistsAsync())
                {
                    Console.WriteLine($"File {sourceFile.Name} copied to blob {destBlob.Name}");
                }
            }
            // </snippet_CopyFileToBlob>
        }

        //-------------------------------------------------
        // Share snapshots
        //-------------------------------------------------
        public async Task CreateShareSnapshotAsync(string shareName)
        {
            // <snippet_ShareSnapshots>
            // Get the connection string from app settings
            string connectionString = ConfigurationManager.AppSettings["StorageConnectionString"];

            // Instatiate a ShareServiceClient
            ShareServiceClient shareServiceClient = new ShareServiceClient(connectionString);

            // Instantiate a ShareClient which will be used to access the file share
            ShareClient share = shareServiceClient.GetShareClient(shareName);

            // Ensure that the share exists
            if (await share.ExistsAsync())
            {
                Console.WriteLine($"Share exists: {share.Uri}");

                // Create a snapshot
                ShareSnapshotInfo snapshot = await share.CreateSnapshotAsync();

                // List snapshots
                ShareClient mySnapshot = share.WithSnapshot(snapshot.Snapshot);
                ShareDirectoryClient rootDirectory = mySnapshot.GetRootDirectoryClient();

                foreach (ShareFileItem item in rootDirectory.GetFilesAndDirectories())
                {
                    if (item.IsDirectory)
                    {
                        Console.WriteLine($"Directory: {item.Name}");
                    }
                    else
                    {
                        Console.WriteLine($"File: {item.Name}");
                    }
                }
            }
            // </snippet_ShareSnapshots>
        }
        //-------------------------------------------------
        // Use metrics
        //-------------------------------------------------
        public async Task UseMetricsAsync()
        {
            // <snippet_UseMetrics>

            // </snippet_UseMetrics>
        }

        //-------------------------------------------------
        // Basic file operations menu
        //-------------------------------------------------
        public async Task<bool> Menu()
        {
            Console.Clear();
            Console.WriteLine("Choose a file share scenario:");
            Console.WriteLine("1) Create share client");
            Console.WriteLine("2) Create a share");
            Console.WriteLine("3) Set the maximum size for a share");
            Console.WriteLine("4) Upload file using SAS");
            Console.WriteLine("5) Copy a file");
            Console.WriteLine("6) Copy a file to a blob");
            Console.WriteLine("7) Share snapshots");
            Console.WriteLine("8) Use metrics");
            Console.WriteLine("X) Exit to main menu");
            Console.Write("\r\nSelect an option: ");

            switch (Console.ReadLine())
            {
                // Create a share client
                case "1":
                    await CreateShareClientAsync();
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                // Create a share
                case "2":
                    await CreateShareAsync();
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                // Set the maximum size on a share
                case "3":
                    await SetMaxShareSizeAsync();
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                // Upload a file using a SAS
                case "4":
                    await UploadFileWithSasAsync();
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                // Copy a file
                case "5":
                    await CopyFileAsync("logs", "CustomLogs/Log1.txt", "CustomLogs/Log1Copy.txt");
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                // Copy a file to a blob
                case "6":
                    await CopyFileToBlobAsync("logs", "CustomLogs/Log1.txt", "sample-container", "sample-blob.txt");
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                // Share snapshots
                case "7":
                    await CreateShareSnapshotAsync("logs");
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                // Use metrics
                case "8":
                    await UseMetricsAsync();
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                // Exit to the main menu
                case "X":
                case "x":
                    return false;

                default:
                    return true;
            }
        }
    }
}
