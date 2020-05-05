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
using System.Reflection.Metadata;
using System.Threading.Tasks;

namespace dotnet_v12
{
    public class Security
    {

        //-------------------------------------------------
        // Set container public access level
        //-------------------------------------------------

        // <Snippet_SetPublicContainerPermissions>
        private static void SetPublicContainerPermissions(BlobContainerClient container)
        {
            container.SetAccessPolicy(PublicAccessType.BlobContainer);
            Console.WriteLine("Container {0} - permissions set to {1}", 
                container.Name, container.GetAccessPolicy().Value);
        }
        // </Snippet_SetPublicContainerPermissions>

        //-------------------------------------------------
        // Create an anonymous client object
        //-------------------------------------------------

        // <Snippet_CreateAnonymousBlobClient>
        private static void CreateAnonymousBlobClient()
        {
            // Create the client object using the Blob storage endpoint for your account.
            BlobServiceClient blobServiceClient = new BlobServiceClient
                (new Uri(@"https://storagesamples.blob.core.windows.net/"));

            // Get a reference to a container that's available for anonymous access.
            BlobContainerClient container = blobServiceClient.GetBlobContainerClient("sample-container");

            // Read the container's properties. 
            // Note this is only possible when the container supports full public read access.          
            Console.WriteLine(container.GetProperties().Value.LastModified);
            Console.WriteLine(container.GetProperties().Value.ETag);
        }
        // </Snippet_CreateAnonymousBlobClient>

        //-------------------------------------------------
        // Reference a container anonymously
        //-------------------------------------------------

        // <Snippet_ListBlobsAnonymously>
        private static void ListBlobsAnonymously()
        {
            // Get a reference to a container that's available for anonymous access.
            BlobContainerClient container = new BlobContainerClient
                (new Uri(@"https://storagesamples.blob.core.windows.net/sample-container"));

            // List blobs in the container.
            // Note this is only possible when the container supports full public read access.
               foreach (BlobItem blobItem in container.GetBlobs())
                {
                    Console.WriteLine(container.GetBlockBlobClient(blobItem.Name).Uri);
                }
        }
        // </Snippet_ListBlobsAnonymously>

        //-------------------------------------------------
        // Reference a blob anonymously
        //-------------------------------------------------

        // <Snippet_DownloadBlobAnonymously>
        private static void DownloadBlobAnonymously()
        {
            BlockBlobClient blob = new BlockBlobClient
                (new Uri(@"https://storagesamples.blob.core.windows.net/sample-container/logfile.txt"));
            blob.DownloadTo(@"C:\Temp\logfile.txt");
        }
        // </Snippet_DownloadBlobAnonymously>

        //-------------------------------------------------
        // Security menu (Can call asynchronous and synchronous methods)
        //-------------------------------------------------

        public async Task<bool> MenuAsync()
        {
            Console.Clear();
            Console.WriteLine("Choose a security scenario:");
            Console.WriteLine("1) Set container public access level");
            Console.WriteLine("2) Create an anonymous client object");
            Console.WriteLine("3) Reference a container anonymously");
            Console.WriteLine("4) Reference a blob anonymously");
            Console.WriteLine("5) Return to main menu");
            Console.Write("\r\nSelect an option: ");
 
            switch (Console.ReadLine())
            {
                case "1":

                    var connectionString = Constants.connectionString;
                    BlobServiceClient blobServiceClient = new BlobServiceClient(connectionString);
                    
                    SetPublicContainerPermissions(blobServiceClient.GetBlobContainerClient(Constants.containerName));

                   Console.WriteLine("Press enter to continue");   
                   Console.ReadLine();          
                   return true;
                
                case "2":

                   CreateAnonymousBlobClient();

                   Console.WriteLine("Press enter to continue"); 
                   Console.ReadLine();              
                   return true;

                case "3":

                    ListBlobsAnonymously();

                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "4":

                    DownloadBlobAnonymously();

                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "5":
                
                   return false;
                
                default:
                
                   return true;
            }
        }
        
    }

    


    
}
