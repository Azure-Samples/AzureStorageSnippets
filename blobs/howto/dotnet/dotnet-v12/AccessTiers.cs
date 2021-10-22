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
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Blobs.Specialized;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace dotnet_v12
{
    class AccessTiers
    {

        // <Snippet_BulkArchiveContainerContents>
        static async Task BulkArchiveContainerContents(string accountName, string containerName)
        {
            string containerUri = string.Format("https://{0}.blob.core.windows.net/{1}",
                                            accountName,
                                            containerName);

            // Get container client, using Azure AD credentials.
            BlobUriBuilder containerUriBuilder = new BlobUriBuilder(new Uri(containerUri));
            BlobContainerClient blobContainerClient = new BlobContainerClient(containerUriBuilder.ToUri(), 
                                                                              new DefaultAzureCredential());

            // Get URIs for blobs in this container and add to stack.
            var uris = new Stack<Uri>();
            await foreach (var item in blobContainerClient.GetBlobsAsync())
            {
                uris.Push(blobContainerClient.GetBlobClient(item.Name).Uri);
            }

            // Get the blob batch client.
            BlobBatchClient blobBatchClient = blobContainerClient.GetBlobBatchClient();

            try
            {
                // Perform the bulk operation to archive blobs.
                await blobBatchClient.SetBlobsAccessTierAsync(blobUris: uris, accessTier: AccessTier.Archive);
            }
            catch (RequestFailedException e)
            {
                Console.WriteLine(e.Message);
            }
        }
        // </Snippet_BulkArchiveContainerContents>


        public async Task<bool> MenuAsync()
        {
            Console.Clear();
            Console.WriteLine("Choose a scenario for managing access tiers:");
            Console.WriteLine("1) Bulk archive blobs in container");
            Console.WriteLine("X) Exit to main menu");
            Console.Write("\r\nSelect an option: ");

            switch (Console.ReadLine())
            {
                case "1":

                    await BulkArchiveContainerContents(Constants.storageAccountName, Constants.containerName);

                    return true;

                case "2":

                    return true;

                case "3":

                    return true;

                case "4":

                    return true;

                case "5":
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
