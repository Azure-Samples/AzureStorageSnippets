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
using Azure.Core;
using Azure.Core.Diagnostics;
using Azure.Core.Pipeline;
using Azure.Identity;
using Azure.Storage;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Blobs.Specialized;
using System;
using System.IO;
using System.Net.Http.Headers;
using System.Runtime.CompilerServices;
using System.Security.Cryptography;
using System.Threading;
using System.Threading.Tasks;

// TESTING NOTES
// To simulate a data center failure and test the retry policy, see https://docs.microsoft.com/en-us/azure/storage/blobs/simulate-primary-region-failure.
// Fiddler is recommended. Watching the Fiddler traffic capture window is helpful in understanding how the retry requests are handled.

namespace dotnet_v12
{
    public class Retry
    {
        #region RetryPolicyBlobDownload

        //-------------------------------------------------
        // Configure a retry policy and download a blob
        //-------------------------------------------------

        private BlobServiceClient SetupBasicRetryPolicy(Uri accountUri)
        {
            // <Snippet_RetryOptions>
            // Provide the client configuration options for connecting to Azure Blob Storage
            BlobClientOptions blobOptions = new BlobClientOptions()
            {
                Retry = {
                    Delay = TimeSpan.FromSeconds(2),
                    MaxRetries = 5,
                    Mode = RetryMode.Exponential,
                    MaxDelay = TimeSpan.FromSeconds(10),
                    NetworkTimeout = TimeSpan.FromSeconds(100)
                },
            };

            BlobServiceClient blobServiceClient = new BlobServiceClient(accountUri, new DefaultAzureCredential(), blobOptions);
            // </Snippet_RetryOptions>

            return blobServiceClient;
        }

        private BlobServiceClient SetupGRSRetryPolicy(Uri accountUri)
        {
            const string accountName = Constants.accountName;
            // <Snippet_RetryOptionsGRS>
            Uri secondaryAccountUri = new Uri($"https://{accountName}-secondary.blob.core.windows.net/");

            // Provide the client configuration options for connecting to Azure Blob Storage
            BlobClientOptions blobOptionsGRS = new BlobClientOptions()
            {
                Retry = {
                    Delay = TimeSpan.FromSeconds(2),
                    MaxRetries = 5,
                    Mode = RetryMode.Exponential,
                    MaxDelay = TimeSpan.FromSeconds(10),
                    NetworkTimeout = TimeSpan.FromSeconds(100)
                },

                // If the GeoRedundantSecondaryUri property is set, the secondary Uri will be used for 
                // GET or HEAD requests during retries.
                // If the status of the response from the secondary Uri is a 404, then subsequent retries
                // for the request will not use the secondary Uri again, as this indicates that the resource 
                // may not have propagated there yet.
                // Otherwise, subsequent retries will alternate back and forth between primary and secondary Uri.
                GeoRedundantSecondaryUri = secondaryAccountUri
            };

            BlobServiceClient blobServiceClient = new BlobServiceClient(accountUri, new DefaultAzureCredential(), blobOptionsGRS);
            // </Snippet_RetryOptionsGRS>

            return blobServiceClient;
        }

        async static Task<BlobClient> GetBlobClient(BlobServiceClient blobServiceClient, string containerName, string blobName)
        {
            CancellationTokenSource source = new CancellationTokenSource();
            CancellationToken cancellationToken = source.Token;

            // Create the container and return a container client object
            Console.WriteLine("\nCreating container");
            BlobContainerClient containerClient = await blobServiceClient.CreateBlobContainerAsync(containerName, PublicAccessType.None, null, cancellationToken);

            if (await containerClient.ExistsAsync())
            {
                Console.WriteLine($"Created container {containerClient.Name}\n");
            }

            // Create a new block blob client object
            // The blob client retains the credential and client options
            BlobClient blobClient = containerClient.GetBlobClient(blobName);

            return blobClient;
        }

        async static Task DownloadBlobsWithRetryPolicy(BlobClient blobClient, string blobName)
        {
            try
            {
                // Upload the data
                Console.WriteLine($"\nUploading blob: {blobName}");
                await blobClient.UploadAsync(BinaryData.FromString("If at first you don't succeed, hopefully you have a good retry policy.").ToStream(), overwrite: true);

                // Download the blob
                Console.WriteLine("\nPress any key to download the blob - Esc to exit");

                while (Console.ReadKey().Key != ConsoleKey.Escape)
                {
                    Response<BlobDownloadInfo> response;

                    Console.WriteLine($"\nDownloading blob {blobName}:");

                    response = await blobClient.DownloadAsync();
                    BlobDownloadInfo downloadInfo = response.Value;

                    // Write out the response status
                    Console.WriteLine($"Response status: {response.GetRawResponse().Status} ({response.GetRawResponse().ReasonPhrase})");

                    // Write out the blob data
                    Console.Write("Blob data: ");
                    Console.WriteLine((await BinaryData.FromStreamAsync(downloadInfo.Content)).ToString());

                    Console.WriteLine("\nPress any key to download the blob again - Esc to exit");
                }
            }
            catch (RequestFailedException e)
            {
                Console.WriteLine(e.Message);
                Console.ReadLine();
                throw;
            }
        }

        #endregion

        #region User menu

        //-------------------------------------------------
        // Retry menu (Can call asynchronous and synchronous methods)
        //-------------------------------------------------

        public async Task<bool> MenuAsync()
        {
            Console.Clear();
            Console.WriteLine("Choose a Retry scenario:");
            Console.WriteLine("1) Test a basic retry policy for blob storage");
            Console.WriteLine("2) Test a retry policy with geo-redundancy for blob storage");

            Console.WriteLine("X) Exit to main menu");
            Console.Write("\r\nSelect an option: ");

            const string accountName = Constants.accountName;
            Uri accountUri = new Uri($"https://{accountName}.blob.core.windows.net/");

            BlobServiceClient blobServiceClient = null;

            // Create a unique name for the container
            string containerName = $"container-{Guid.NewGuid()}";
            string blobName = "MyTestBlob";

            switch (Console.ReadLine())
            {
                case "1":
                    blobServiceClient = SetupBasicRetryPolicy(accountUri);
                    break;

                case "2":
                    blobServiceClient = SetupGRSRetryPolicy(accountUri);
                    break;

                case "X":
                    return false;

                default:
                    return true;
            }

            try
            {
                BlobClient blobClient = await GetBlobClient(blobServiceClient, containerName, blobName);
                await DownloadBlobsWithRetryPolicy(blobClient, blobName);

                // Clean up resources
                BlobContainerClient containerClient = blobServiceClient.GetBlobContainerClient(containerName);
                if (containerClient != null)
                {
                    Console.WriteLine($"Deleting the container {containerClient.Name}");
                    await containerClient.DeleteAsync();
                }
            }
            catch (RequestFailedException e)
            {
                Console.WriteLine(e.Message);
                Console.ReadLine();
            }

            Console.WriteLine("Press enter to continue");
            Console.ReadLine();
            return true;
        }
        #endregion

    }

}