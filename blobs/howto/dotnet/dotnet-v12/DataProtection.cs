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

using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Blobs.Specialized;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection.Metadata;
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
        // Recover a specific blob version
        //-------------------------------------------------

        private static async void RecoverSpecificBlobVersion()
        {
            var connectionString = Constants.connectionString;
            BlobServiceClient blobServiceClient = new BlobServiceClient(connectionString);

            BlobContainerClient container =
                blobServiceClient.GetBlobContainerClient(Constants.containerName);

            // Get a specific blob to undelete.
                  BlobClient blockBlob = container.GetBlobClient("logfile.txt");

            // <Snippet_RecoverSpecificBlobVersion>

            // undelete
            await blockBlob.UndeleteAsync();

            // List all blobs and snapshots in the container prefixed by the blob name
            IEnumerable<BlobItem> allBlobVersions =  container.GetBlobs
                (BlobTraits.None, BlobStates.Snapshots, prefix: blockBlob.Name);

            // Restore the most recently generated snapshot to the active blob    
            BlobItem copySource = allBlobVersions.First(version => ((BlobItem)version).Snapshot.Length > 0 
            && ((BlobItem)version).Name == blockBlob.Name) as BlobItem;
            
            blockBlob.StartCopyFromUri(container.GetBlockBlobClient(copySource.Name).Uri);

            // </Snippet_RecoverSpecificBlobVersion>

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
            Console.WriteLine("3) Recover a specific blob version");
            Console.WriteLine("4) Return to main menu");
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

                    RecoverSpecificBlobVersion();

                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "4":
                
                   return false;
                
                default:
                
                   return true;
            }
        }
        
    }

    


    
}
