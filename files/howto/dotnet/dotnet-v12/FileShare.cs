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
using System.Threading.Tasks; // Namespace for async support
//using Azure.Storage.Files; // Namespace for Files storage types
using Azure.Storage.Files.Shares; // Namespace for File shares
// </snippet_UsingStatements>

namespace dotnet_v12
{
    public class FileShare
    {
        //-------------------------------------------------
        // Create the file share client
        //-------------------------------------------------
        public void CreateShareClient()
        {
            // <snippet_CreateShareClient>
            // Get the connection string from app settings
            string connectionString = ConfigurationManager.AppSettings["storageConnectionString"];

            // Instantiate a ShareClient which will be used to create and manipulate the file share
            ShareClient share = new ShareClient(connectionString, "logs");
            // </snippet_CreateShareClient>
        }

        //-------------------------------------------------
        // Create the file share programmatically
        //-------------------------------------------------
        public async Task<bool> CreateFileShareAsync()
        {
            // <snippet_CreateFileShare>
            // Get the connection string from app settings
            string connectionString = ConfigurationManager.AppSettings["storageConnectionString"];

            // Instantiate a ShareClient which will be used to create and manipulate the file share
            ShareClient share = new ShareClient(connectionString, "logs");

            await share.CreateIfNotExistsAsync();

            // Ensure that the share exists.
            if (await share.ExistsAsync())
            {
                Console.WriteLine($"Share exists: {share.Name}");
            }
            else
            {
                Console.WriteLine($"CreateFileShare failed");
            }
            // </snippet_CreateFileShare>

            return true;
        }

        //-------------------------------------------------
        // Create the file share programmatically
        //-------------------------------------------------
        public async Task<bool> SetMaxFileShareSizeAsync()
        {
            // <snippet_SetMaxFileShareSize>
            const int MAX_SHARE_SIZE = 128; // Maximum share size in GB

            // Get the connection string from app settings
            string connectionString = ConfigurationManager.AppSettings["storageConnectionString"];

            // Instantiate a ShareClient which will be used to create and manipulate the file share
            ShareClient share = new ShareClient(connectionString, "logs");

            await share.CreateIfNotExistsAsync();

            // Ensure that the share exists.
            if (await share.ExistsAsync())
            {
                await share.SetQuotaAsync(MAX_SHARE_SIZE);
                Console.WriteLine($"Max share size set");
            }
            else
            {
                Console.WriteLine($"CreateFileShare failed");
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
                    CreateShareClient();
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                // Create a file share
                case "2":
                    await CreateFileShareAsync();
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
