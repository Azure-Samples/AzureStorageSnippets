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
using System.Threading.Tasks;
using Azure;
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
        // <snippet_CreateShare>
        //-------------------------------------------------
        // Create a file share
        //-------------------------------------------------
        public async Task CreateShareAsync(string shareName)
        {
            // <snippet_CreateShareClient>
            // Get the connection string from app settings
            string connectionString = ConfigurationManager.AppSettings["StorageConnectionString"];

            // Instantiate a ShareClient which will be used to create and manipulate the file share
            ShareClient share = new ShareClient(connectionString, shareName);
            // </snippet_CreateShareClient>

            // Create the share if it doesn't already exist
            await share.CreateIfNotExistsAsync();

            // Ensure that the share exists
            if (await share.ExistsAsync())
            {
                Console.WriteLine($"Share created: {share.Name}");

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
            else
            {
                Console.WriteLine($"CreateShareAsync failed");
            }
        }
        // </snippet_CreateShare>

        // <snippet_GetFileSasUri>
        //-------------------------------------------------
        // Create a SAS URI for a file
        //-------------------------------------------------
        public Uri GetFileSasUri(string shareName, string filePath, DateTime expiration, ShareFileSasPermissions permissions)
        {
            // Get the account details from app settings
            string accountName = ConfigurationManager.AppSettings["StorageAccountName"];
            string accountKey = ConfigurationManager.AppSettings["StorageAccountKey"];

            ShareSasBuilder fileSAS = new ShareSasBuilder()
            {
                ShareName = shareName,
                FilePath = filePath,

                // Specify an Azure file resource
                Resource = "f",

                // Expires in 24 hours
                ExpiresOn = expiration
            };

            // Set the permissions for the SAS
            fileSAS.SetPermissions(permissions);

            // Create a SharedKeyCredential that we can use to sign the SAS token
            StorageSharedKeyCredential credential = new StorageSharedKeyCredential(accountName, accountKey);

            // Build a SAS URI
            UriBuilder fileSasUri = new UriBuilder($"https://{accountName}.file.core.windows.net/{fileSAS.ShareName}/{fileSAS.FilePath}");
            fileSasUri.Query = fileSAS.ToSasQueryParameters(credential).ToString();

            // Return the URI
            return fileSasUri.Uri;
        }
        // </snippet_GetFileSasUri>

        // <snippet_UploadFileWithSas>
        //-------------------------------------------------
        // Upload a file using a SAS
        //-------------------------------------------------
        public async Task UploadFileWithSasAsync()
        {
            Uri fileSasUri = GetFileSasUri("logs", "CustomLogs/Log1.txt", DateTime.UtcNow.AddHours(24),
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

        // <snippet_SetMaxShareSize>
        //-------------------------------------------------
        // Set the maximum size of a share
        //-------------------------------------------------
        public async Task SetMaxShareSizeAsync(string shareName, int increaseSizeInGiB)
        {
            const long ONE_GIBIBYTE = 10737420000; // Number of bytes in 1 gibibyte

            // Get the connection string from app settings
            string connectionString = ConfigurationManager.AppSettings["StorageConnectionString"];

            // Instantiate a ShareClient which will be used to access the file share
            ShareClient share = new ShareClient(connectionString, shareName);

            // Create the share if it doesn't already exist
            await share.CreateIfNotExistsAsync();

            // Ensure that the share exists
            if (await share.ExistsAsync())
            {
                // Get and display current share quota
                ShareProperties properties = await share.GetPropertiesAsync();
                Console.WriteLine($"Current share quota: {properties.QuotaInGB} GiB");

                // Get and display current usage stats for the share
                ShareStatistics stats = await share.GetStatisticsAsync();
                Console.WriteLine($"Current share usage: {stats.ShareUsageInBytes} bytes");

                // Convert current usage from bytes into GiB
                int currentGiB = (int)(stats.ShareUsageInBytes / ONE_GIBIBYTE);

                // This line sets the quota to be the current 
                // usage of the share plus the increase amount
                await share.SetQuotaAsync(currentGiB + increaseSizeInGiB);

                // Get the new quota and display it
                properties = await share.GetPropertiesAsync();
                Console.WriteLine($"New share quota: {properties.QuotaInGB} GiB");
            }
        }
        // </snippet_SetMaxShareSize>

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

        // <snippet_CopyFileToBlob>
        //-------------------------------------------------
        // Copy a file from a share to a blob
        //-------------------------------------------------
        public async Task CopyFileToBlobAsync(string shareName, string sourceFilePath, string containerName, string blobName)
        {
            // Get a file SAS from the method created ealier
            Uri fileSasUri = GetFileSasUri(shareName, sourceFilePath, DateTime.UtcNow.AddHours(24), ShareFileSasPermissions.Read);

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
        }
        // </snippet_CopyFileToBlob>

        // <snippet_CreateShareSnapshot>
        //-------------------------------------------------
        // Create a share snapshot
        //-------------------------------------------------
        public async Task CreateShareSnapshotAsync(string shareName)
        {
            // Get the connection string from app settings
            string connectionString = ConfigurationManager.AppSettings["StorageConnectionString"];

            // Instatiate a ShareServiceClient
            ShareServiceClient shareServiceClient = new ShareServiceClient(connectionString);

            // Instantiate a ShareClient which will be used to access the file share
            ShareClient share = shareServiceClient.GetShareClient(shareName);

            // Ensure that the share exists
            if (await share.ExistsAsync())
            {
                // Create a snapshot
                ShareSnapshotInfo snapshotInfo = await share.CreateSnapshotAsync();
                Console.WriteLine($"Snapshot created: {snapshotInfo.Snapshot}");
            }
        }
        // </snippet_CreateShareSnapshot>

        // <snippet_ListShareSnapshots>
        //-------------------------------------------------
        // List the snapshots on a share
        //-------------------------------------------------
        public void ListShareSnapshots()
        {
            // Get the connection string from app settings
            string connectionString = ConfigurationManager.AppSettings["StorageConnectionString"];

            // Instatiate a ShareServiceClient
            ShareServiceClient shareServiceClient = new ShareServiceClient(connectionString);

            // Display each share and the snapshots on each share
            foreach (ShareItem item in shareServiceClient.GetShares(ShareTraits.All, ShareStates.Snapshots))
            {
                if (null != item.Snapshot)
                {
                    Console.WriteLine($"Share: {item.Name}\tSnapshot: {item.Snapshot}");
                }
            }
        }
        // </snippet_ListShareSnapshots>

        public ShareItem GetSnapshotItem()
        {
            ShareItem result = null;

            // Get the connection string from app settings
            string connectionString = ConfigurationManager.AppSettings["StorageConnectionString"];

            // Instatiate a ShareServiceClient
            ShareServiceClient shareServiceClient = new ShareServiceClient(connectionString);

            foreach (ShareItem item in shareServiceClient.GetShares(ShareTraits.All, ShareStates.Snapshots))
            {
                if (null != item.Snapshot)
                {
                    // Return the first share with a snapshot
                    return item;
                }
            }

            return result;
        }


        // <snippet_ListSnapshotContents>
        //-------------------------------------------------
        // List the snapshots on a share
        //-------------------------------------------------
        public void ListSnapshotContents(string shareName, string snapshotTime)
        {
            // Get the connection string from app settings
            string connectionString = ConfigurationManager.AppSettings["StorageConnectionString"];

            // Instatiate a ShareServiceClient
            ShareServiceClient shareService = new ShareServiceClient(connectionString);

            // Get a ShareClient
            ShareClient share = shareService.GetShareClient(shareName);

            Console.WriteLine($"Share: {share.Name}");

            // Get as ShareClient that points to a snapshot
            ShareClient snapshot = share.WithSnapshot(snapshotTime);

            // Get the root directory in the snapshot share
            ShareDirectoryClient rootDir = snapshot.GetRootDirectoryClient();

            // Recursively list the directory tree
            ListDirTree(rootDir);
        }

        //-------------------------------------------------
        // Recursively list a directory tree
        //-------------------------------------------------
        public void ListDirTree(ShareDirectoryClient dir)
        {
            // List the files and directories in the snapshot
            foreach (ShareFileItem item in dir.GetFilesAndDirectories())
            {
                if (item.IsDirectory)
                {
                    Console.WriteLine($"Directory: {item.Name}");
                    ShareDirectoryClient subDir = dir.GetSubdirectoryClient(item.Name);
                    ListDirTree(subDir);
                }
                else
                {
                    Console.WriteLine($"File: {dir.Name}\\{item.Name}");
                }
            }
        }
        // </snippet_ListSnapshotContents>

        // <snippet_RestoreFileFromSnapshot>
        //-------------------------------------------------
        // Restore file from snapshot
        //-------------------------------------------------
        public async Task RestoreFileFromSnapshot(string shareName, string directoryName, string fileName, string snapshotTime)
        {
            // Get the connection string from app settings
            string connectionString = ConfigurationManager.AppSettings["StorageConnectionString"];

            // Instatiate a ShareServiceClient
            ShareServiceClient shareService = new ShareServiceClient(connectionString);

            // Get a ShareClient
            ShareClient share = shareService.GetShareClient(shareName);

            // Get as ShareClient that points to a snapshot
            ShareClient snapshot = share.WithSnapshot(snapshotTime);

            // Get a ShareDirectoryClient, then a ShareFileClient to the snapshot file
            ShareDirectoryClient snapshotDir = snapshot.GetDirectoryClient(directoryName);
            ShareFileClient snapshotFile = snapshotDir.GetFileClient(fileName);

            // Get a ShareDirectoryClient, then a ShareFileClient to the live file
            ShareDirectoryClient liveDir = share.GetDirectoryClient(directoryName);
            ShareFileClient liveFile = liveDir.GetFileClient(fileName);

            // Restore the file from the snapshot
            ShareFileCopyInfo copyInfo = await liveFile.StartCopyAsync(snapshotFile.Uri);

            // Display the status of the operation
            Console.WriteLine($"Restore status: {copyInfo.CopyStatus}");
        }
        // </snippet_RestoreFileFromSnapshot>

        // <snippet_DeleteSnapshot>
        //-------------------------------------------------
        // Delete a snapshot
        //-------------------------------------------------
        public async Task DeleteSnapshotAsync(string shareName, string snapshotTime)
        {
            // Get the connection string from app settings
            string connectionString = ConfigurationManager.AppSettings["StorageConnectionString"];

            // Instatiate a ShareServiceClient
            ShareServiceClient shareService = new ShareServiceClient(connectionString);

            // Get a ShareClient
            ShareClient share = shareService.GetShareClient(shareName);

            // Get a ShareClient that points to a snapshot
            ShareClient snapshotShare = share.WithSnapshot(snapshotTime);

            try
            {
                // Delete the snapshot
                await snapshotShare.DeleteIfExistsAsync();
            }
            catch (RequestFailedException ex)
            {
                Console.WriteLine($"Exception: {ex.Message}");
                Console.WriteLine($"Error code: {ex.Status}\t{ex.ErrorCode}");
            }
        }
        // </snippet_DeleteSnapshot>

        // <snippet_UseMetrics>
        //-------------------------------------------------
        // Use metrics
        //-------------------------------------------------
        public async Task UseMetricsAsync()
        {
            // Get the connection string from app settings
            string connectionString = ConfigurationManager.AppSettings["StorageConnectionString"];

            // Instatiate a ShareServiceClient
            ShareServiceClient shareService = new ShareServiceClient(connectionString);

            // Set metrics properties for File service
            await shareService.SetPropertiesAsync(new ShareServiceProperties()
            {
                // Set hour metrics
                HourMetrics = new ShareMetrics()
                {
                    Enabled = true,
                    IncludeApis = true,
                    Version = "1.0",

                    RetentionPolicy = new ShareRetentionPolicy()
                    {
                        Enabled = true,
                        Days = 14
                    }
                },

                // Set minute metrics
                MinuteMetrics = new ShareMetrics()
                {
                    Enabled = true,
                    IncludeApis = true,
                    Version = "1.0",

                    RetentionPolicy = new ShareRetentionPolicy()
                    {
                        Enabled = true,
                        Days = 7
                    }
                }
            });

            // Read the metrics properties we just set
            ShareServiceProperties serviceProperties = await shareService.GetPropertiesAsync();

            // Display the properties
            Console.WriteLine();
            Console.WriteLine($"HourMetrics.InludeApis: {serviceProperties.HourMetrics.IncludeApis}");
            Console.WriteLine($"HourMetrics.RetentionPolicy.Days: {serviceProperties.HourMetrics.RetentionPolicy.Days}");
            Console.WriteLine($"HourMetrics.Version: {serviceProperties.HourMetrics.Version}");
            Console.WriteLine();
            Console.WriteLine($"MinuteMetrics.InludeApis: {serviceProperties.MinuteMetrics.IncludeApis}");
            Console.WriteLine($"MinuteMetrics.RetentionPolicy.Days: {serviceProperties.MinuteMetrics.RetentionPolicy.Days}");
            Console.WriteLine($"MinuteMetrics.Version: {serviceProperties.MinuteMetrics.Version}");
            Console.WriteLine();
        }
        // </snippet_UseMetrics>

        //-------------------------------------------------
        // Basic file operations menu
        //-------------------------------------------------
        public async Task<bool> Menu()
        {
            Console.Clear();
            Console.WriteLine("Choose a file share scenario:");
            Console.WriteLine("1) Create share");
            Console.WriteLine("2) Upload file using SAS");
            Console.WriteLine("3) Set maximum share size");
            Console.WriteLine("4) Copy file");
            Console.WriteLine("5) Copy file to a blob");
            Console.WriteLine("6) Create snapshot");
            Console.WriteLine("7) List snapshots");
            Console.WriteLine("8) List snapshot contents");
            Console.WriteLine("9) Restore file from snapshot");
            Console.WriteLine("10) Delete snapshot");
            Console.WriteLine("11) Metrics");
            Console.WriteLine("X) Exit");
            Console.Write("\r\nSelect an option: ");

            switch (Console.ReadLine())
            {
                // Create a share
                case "1":
                    Console.WriteLine($"Calling: CreateShareAsync(\"logs\");");
                    await CreateShareAsync("logs");
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                // Upload a file using a SAS
                case "2":
                    Console.WriteLine($"Calling: UploadFileWithSasAsync();");
                    await UploadFileWithSasAsync();
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                // Set the maximum size on a share
                case "3":
                    Console.WriteLine($"Calling: SetMaxShareSizeAsync(\"logs\", 10);");
                    await SetMaxShareSizeAsync("logs", 10);
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                // Copy a file
                case "4":
                    Console.WriteLine($"Calling: CopyFileAsync(\"logs\", \"CustomLogs/Log1.txt\", \"CustomLogs/Log1Copy.txt\");");
                    await CopyFileAsync("logs", "CustomLogs/Log1.txt", "CustomLogs/Log1Copy.txt");
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                // Copy a file to a blob
                case "5":
                    Console.WriteLine($"Calling: CopyFileToBlobAsync(\"logs\", \"CustomLogs/Log1.txt\", \"sample-container\", \"sample-blob.txt\");");
                    await CopyFileToBlobAsync("logs", "CustomLogs/Log1.txt", "sample-container", "sample-blob.txt");
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                // Create snapshot
                case "6":
                    Console.WriteLine($"Calling: CreateShareSnapshotAsync(\"logs\");");
                    await CreateShareSnapshotAsync("logs");
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "7":
                    // List snapshots
                    Console.WriteLine($"Calling: ListShareSnapshots();");
                    ListShareSnapshots();
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "8":
                    // List snapshot contents
                    ShareItem snapshotItem = GetSnapshotItem();
                    Console.WriteLine($"Calling ListSnapshotContents(\"{snapshotItem.Name}\", \"{snapshotItem.Snapshot}\");");
                    ListSnapshotContents(snapshotItem.Name, snapshotItem.Snapshot);
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "9":
                    // Restore a file from a snapshot
                    ShareItem snapshot = GetSnapshotItem();
                    Console.WriteLine($"Calling RestoreFileFromSnapshot(\"{snapshot.Name}\", \"CustomLogs\", \"Log1Copy.txt\", \"{snapshot.Snapshot}\");");
                    await RestoreFileFromSnapshot(snapshot.Name, "CustomLogs", "Log1Copy.txt", snapshot.Snapshot);
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "10":
                    // Delete a snapshot
                    ShareItem shareSnapshotItem = GetSnapshotItem();
                    Console.WriteLine($"Calling DeleteSnapshotAsync(\"{shareSnapshotItem.Name}\", \"{shareSnapshotItem.Snapshot}\");");
                    await DeleteSnapshotAsync(shareSnapshotItem.Name, shareSnapshotItem.Snapshot);
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                // Use metrics
                case "11":
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
