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
using System; // Namespace for Console output
using System.Configuration; // Namespace for ConfigurationManager
using System.IO;
using System.Threading.Tasks; // Namespace for async support
//using Azure.Storage.Files; // Namespace for Files storage types
using Azure.Storage.Files.Shares; // Namespace for File shares
using Azure.Storage.Files.Shares.Models;
// </snippet_UsingStatements>

namespace dotnet_v12
{
    public class FileShare
    {
        //-------------------------------------------------
        // Create file share client
        //-------------------------------------------------
        public async Task<bool> CreateShareClientAsync()
        {
            // <snippet_CreateShareClient>
            // Get the connection string from app settings
            string connectionString = ConfigurationManager.AppSettings["storageConnectionString"];

            // Instantiate a ShareClient which will be used to create and manipulate the file share
            ShareClient share = new ShareClient(connectionString, "logs");
            // </snippet_CreateShareClient>

            if (await share.ExistsAsync())
            {
                Console.WriteLine($"Created file share client: {share.Name}");
            }

            return true;
        }

        //-------------------------------------------------
        // Access the file share programmatically
        //-------------------------------------------------
        public async Task<bool> AccessFileShareAsync()
        {
            // <snippet_CreateFileShare>
            // Get the connection string from app settings
            string connectionString = ConfigurationManager.AppSettings["storageConnectionString"];

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
                        // Write the download status to the console window
                        Console.WriteLine($"Download result: {file.DownloadAsync().Result}");
                    }

                    return true;
                }
            }
            // </snippet_CreateFileShare>

            Console.WriteLine($"CreateFileShareAsync failed");
            return false;
        }

        //-------------------------------------------------
        // Set the maximum size of a file share
        //-------------------------------------------------
        public async Task<bool> SetMaxFileShareSizeAsync()
        {
            // <snippet_SetMaxFileShareSize>
            const long ONE_GIBIBYTE = 10737420000; // Number of bytes in 1 gibibyte

            // Get the connection string from app settings
            string connectionString = ConfigurationManager.AppSettings["storageConnectionString"];

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

            return true;
        }

        //-------------------------------------------------
        // Copy files programmatically
        //-------------------------------------------------
        public async Task<bool> CopyFilesAsync()
        {
            // <snippet_CopyFiles>

            // </snippet_CopyFiles>

            return true;
        }

        //-------------------------------------------------
        // Share snapshots
        //-------------------------------------------------
        public async Task<bool> ShareSnapshotsAsync()
        {
            // <snippet_ShareSnapshots>

            // </snippet_ShareSnapshots>

            return true;
        }

        //-------------------------------------------------
        // Use metrics
        //-------------------------------------------------
        public async Task<bool> UseMetricsAsync()
        {
            // <snippet_UseMetrics>

            // </snippet_UseMetrics>

            return true;
        }

        //-------------------------------------------------
        // Basic file operations menu
        //-------------------------------------------------
        public async Task<bool> Menu()
        {
            Console.Clear();
            Console.WriteLine("Choose a file share scenario:");
            Console.WriteLine("1) Create file share client");
            Console.WriteLine("2) Create a file share programmatically");
            Console.WriteLine("3) Set the maximum size for a file share");
            Console.WriteLine("4) Copy files");
            Console.WriteLine("5) Share snapshots");
            Console.WriteLine("6) Use metrics");
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

                // Copy files
                case "4":
                    await CopyFilesAsync();
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                // Share snapshots
                case "5":
                    await ShareSnapshotsAsync();
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                // Use metrics
                case "6":
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
