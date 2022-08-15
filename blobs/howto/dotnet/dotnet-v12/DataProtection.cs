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
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Blobs.Specialized;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace dotnet_v12
{
    public class DataProtection
    {

        //-------------------------------------------------
        // Enable soft delete
        //-------------------------------------------------

        private static void EnableSoftDelete()
        {
            var connectionString = Constants.connectionString;
            BlobServiceClient blobServiceClient = new BlobServiceClient(connectionString);

            // Get the blob client's service property settings
            BlobServiceProperties serviceProperties = blobServiceClient.GetProperties().Value;

            // <Snippet_EnableSoftDelete>

            // Configure soft delete
            serviceProperties.DeleteRetentionPolicy.Enabled = true;
            serviceProperties.DeleteRetentionPolicy.Days = 7;

            // Set the blob client's service property settings
            blobServiceClient.SetProperties(serviceProperties);

            // </Snippet_EnableSoftDelete>

        }

        //-------------------------------------------------
        // Recover blobs
        //-------------------------------------------------

        private static async void RecoverDeletedBlobs()
        {
            var connectionString = Constants.connectionString;
            BlobServiceClient blobServiceClient = new BlobServiceClient(connectionString);

            BlobContainerClient container = blobServiceClient.GetBlobContainerClient(Constants.containerName);

            // <Snippet_RecoverDeletedBlobs>

            foreach (BlobItem blob in container.GetBlobs(BlobTraits.None, BlobStates.Deleted))
            {
                await container.GetBlockBlobClient(blob.Name).UndeleteAsync();
            }

            // </Snippet_RecoverDeletedBlobs>
        }

        //-------------------------------------------------
        // Recover a specific blob snapshot
        //-------------------------------------------------

        private static async Task CopySnapshotToBaseBlob()
        {
            var connectionString = Constants.connectionString;
            BlobServiceClient blobServiceClient = new BlobServiceClient(connectionString);

            BlobContainerClient container =
                blobServiceClient.GetBlobContainerClient(Constants.containerName);

            // Get a specific blob to restore.
            BlobClient blockBlob = container.GetBlobClient("blob1.txt");

            // <Snippet_RecoverSpecificBlobSnapshot>
            // Restore the deleted blob.
            await blockBlob.UndeleteAsync();

            // List blobs in this container that match prefix.
            // Include snapshots in listing.
            Pageable<BlobItem> blobItems = container.GetBlobs
                            (BlobTraits.None, BlobStates.Snapshots, prefix: blockBlob.Name);

            // Get the URI for the most recent snapshot.
            BlobUriBuilder blobSnapshotUri = new BlobUriBuilder(blockBlob.Uri)
            {
                Snapshot = blobItems
                           .OrderByDescending(snapshot => snapshot.Snapshot)
                           .ElementAtOrDefault(0)?.Snapshot
            };

            // Restore the most recent snapshot by copying it to the blob.
            blockBlob.StartCopyFromUri(blobSnapshotUri.ToUri());
            // </Snippet_RecoverSpecificBlobSnapshot>
        }


        //-------------------------------------------------
        // Restore a previous version
        //-------------------------------------------------

        private static void CopyVersionToBaseBlob(string blobName)
        {
            var connectionString = Constants.connectionString;
            BlobServiceClient blobServiceClient = new BlobServiceClient(connectionString);

            BlobContainerClient container =
                blobServiceClient.GetBlobContainerClient(Constants.containerName);

            // Get a specific blob to restore.
            BlobClient blockBlob = container.GetBlobClient(blobName);

            // <Snippet_RestorePreviousVersion>
            // List blobs in this container that match prefix.
            // Include versions in listing.
            Pageable<BlobItem> blobItems = container.GetBlobs
                            (BlobTraits.None, BlobStates.Version, prefix: blockBlob.Name);

            // Get the URI for the most recent version.
            BlobUriBuilder blobVersionUri = new BlobUriBuilder(blockBlob.Uri)
            {
                VersionId = blobItems
                            .OrderByDescending(version => version.VersionId)
                            .ElementAtOrDefault(0)?.VersionId
            };

            // Restore the most recently generated version by copying it to the base blob.
            blockBlob.StartCopyFromUri(blobVersionUri.ToUri());
            // </Snippet_RestorePreviousVersion>
        }



        //-------------------------------------------------
        // Data protection menu (Can call asynchronous and synchronous methods)
        //-------------------------------------------------

        public async Task<bool> MenuAsync()
        {
            Console.Clear();
            Console.WriteLine("Choose a data protection scenario:");
            Console.WriteLine("1) Enable soft delete");
            Console.WriteLine("2) Recover deleted blobs");
            Console.WriteLine("3) Restore a specific blob snapshot");
            Console.WriteLine("4) Restore a specific blob version");
            Console.WriteLine("X) Exit to main menu");
            Console.Write("\r\nSelect an option: ");
 
            switch (Console.ReadLine())
            {
                case "1":

                   EnableSoftDelete();

                   Console.WriteLine("Soft delete is enabled. Press enter to continue");   
                   Console.ReadLine();          
                   return true;
                
                case "2":

                   RecoverDeletedBlobs();

                   Console.WriteLine("Deleted blobs are recovered. Press enter to continue"); 
                   Console.ReadLine();              
                   return true;

                case "3":

                    await CopySnapshotToBaseBlob();

                    Console.WriteLine("Snapshot restored. Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "4":

                    CopyVersionToBaseBlob("blob1.txt");

                    Console.WriteLine("Blob version restored. Press enter to continue");
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
