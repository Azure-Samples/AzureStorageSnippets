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

            if (await share.ExistsAsync())
            {
                Console.WriteLine($"Created file share client: {share.Name}");
            }
        }

        //-------------------------------------------------
        // Access a file share programmatically
        //-------------------------------------------------
        public async Task AccessFileShareAsync()
        {
            // <snippet_CreateFileShare>
            // Get the connection string from app settings
            string connectionString = ConfigurationManager.AppSettings["StorageConnectionString"];

            // Instantiate a ShareClient which will be used to create and manipulate the file share
            ShareClient share = new ShareClient(connectionString, "logs");

            // Ensure that the share exists
            if (await share.ExistsAsync())
            {
                Console.WriteLine($"Share exists: {share.Name}");

                // Get a reference to the sample directory
                ShareDirectoryClient sampleDir = share.GetDirectoryClient("CustomLogs");

                // Ensure that the directory exists
                if (await sampleDir.ExistsAsync())
                {
                    // Get a reference to a file object
                    ShareFileClient file = sampleDir.GetFileClient("Log1.txt");

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
            // </snippet_CreateFileShare>
            else
            {
                Console.WriteLine($"CreateFileShareAsync failed");
            }
        }

        //-------------------------------------------------
        // Set the maximum size of a file share
        //-------------------------------------------------
        public async Task SetMaxFileShareSizeAsync()
        {
            // <snippet_SetMaxFileShareSize>
            const long ONE_GIBIBYTE = 10737420000; // Number of bytes in 1 gibibyte

            // Get the connection string from app settings
            string connectionString = ConfigurationManager.AppSettings["StorageConnectionString"];

            // Instantiate a ShareClient which will be used to access the file share
            ShareClient share = new ShareClient(connectionString, "logs");

            // Ensure that the share exists
            if (await share.ExistsAsync())
            {
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
            // </snippet_SetMaxFileShareSize>
        }

        //-------------------------------------------------
        // Generate a SAS for a file or file share
        //-------------------------------------------------
        public async Task GenerateSASAsync()
        {
            // <snippet_GenerateSAS>
            // Get the account details from app settings
            string accountName = ConfigurationManager.AppSettings["StorageAccountName"];
            string accountKey = ConfigurationManager.AppSettings["StorageAccountKey"];

            // Create a new shared access signature and define its constraints.
            ShareSasBuilder shareSAS = new ShareSasBuilder()
            {
                // Access the logs share
                ShareName = "logs",

                // Specify an Azure Storage share resource
                Resource = "s",

                // Expires in 24 hours
                ExpiresOn = DateTime.UtcNow.AddHours(24)
            };

            // Allow read-write access
            shareSAS.SetPermissions(ShareSasPermissions.Read | ShareSasPermissions.Write);

            // Create a SharedKeyCredential that we can use to sign the SAS token
            StorageSharedKeyCredential credential = new StorageSharedKeyCredential(accountName, accountKey);

            // Build a SAS URI
            UriBuilder sasUri = new UriBuilder($"https://{accountName}.file.core.windows.net");
            sasUri.Query = shareSAS.ToSasQueryParameters(credential).ToString();

            // Create a ShareServiceClient which will be used to get a ShareClient
            ShareServiceClient service = new ShareServiceClient(sasUri.Uri);

            // Create a client that can authenticate with the SAS URI
            ShareClient share = service.GetShareClient("logs");
            Console.WriteLine($"Share client: {share.Name}");

            // Get a reference to the sample directory
            ShareDirectoryClient directory = share.GetDirectoryClient("CustomLogs");
            Console.WriteLine($"Directory client: {directory.Name}");

            // Get a reference to a file and upload it
            using (FileStream stream = File.OpenRead("downloadedLog1.txt"))
            {
                ShareFileClient file = await directory.CreateFileAsync("Log2.txt", stream.Length);
                await file.UploadAsync(stream);
                Console.WriteLine($"File uploaded: {file.Name}");
            }
            // </snippet_GenerateSAS>
        }

        //-------------------------------------------------
        // Copy files programmatically
        //-------------------------------------------------
        public async Task CopyFilesAsync()
        {
            // <snippet_CopyFiles>

            // </snippet_CopyFiles>
        }

        //-------------------------------------------------
        // Share snapshots
        //-------------------------------------------------
        public async Task ShareSnapshotsAsync()
        {
            // <snippet_ShareSnapshots>

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
            Console.WriteLine("1) Create file share client");
            Console.WriteLine("2) Access a file share programmatically");
            Console.WriteLine("3) Set the maximum size for a file share");
            Console.WriteLine("4) Generate a SAS for a file or file share");
            Console.WriteLine("5) Copy files");
            Console.WriteLine("6) Share snapshots");
            Console.WriteLine("7) Use metrics");
            Console.WriteLine("X) Exit to main menu");
            Console.Write("\r\nSelect an option: ");

            switch (Console.ReadLine())
            {
                // Create a file share client
                case "1":
                    await CreateShareClientAsync();
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                // Access a file share programmatically
                case "2":
                    await AccessFileShareAsync();
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                // Set the max file share size
                case "3":
                    await SetMaxFileShareSizeAsync();
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                // Set the max file share size
                case "4":
                    await GenerateSASAsync();
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                // Copy files
                case "5":
                    await CopyFilesAsync();
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                // Share snapshots
                case "6":
                    await ShareSnapshotsAsync();
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                // Use metrics
                case "7":
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
