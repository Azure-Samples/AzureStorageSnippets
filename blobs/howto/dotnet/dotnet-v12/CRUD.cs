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
using Azure;

namespace dotnet_v12
{
    public class CRUD
    {

        //-------------------------------------------------
        // Snippet1
        //-------------------------------------------------

        // <Snippet_ListBlobsFlatListing>
        private static void ListBlobsFlatListing(BlobContainerClient container, int? segmentSize)
        {
            string continuationToken = null;

            try
            {
                // Call the listing operation and enumerate the result segment.
                // When the continuation token is empty, the last segment has been returned
                // and execution can exit the loop.
                do
                {
                    var resultSegment = container.GetBlobs(prefix:"TestFolder")
                        .AsPages(continuationToken, segmentSize);

                    foreach (Azure.Page<BlobItem> blobPage in resultSegment)
                    {
                        foreach (BlobItem blobItem in blobPage.Values)
                        {
                            Console.WriteLine("Blob name: {0}", blobItem.Name);
                        }

                        // Get the continuation token and loop until it is empty.
                        continuationToken = blobPage.ContinuationToken;

                        Console.WriteLine();
                    }

                } while (continuationToken != "");

            }
            catch (RequestFailedException e)
            {
                Console.WriteLine(e.Message);
                Console.ReadLine();
                throw;
            }
        }
        // </Snippet_ListBlobsFlatListing>



        //-------------------------------------------------
        // ListBlobsHierarchicalListing
        //-------------------------------------------------

        // <Snippet_ListBlobsHierarchicalListing>
        private static void ListBlobsHierarchicalListing(BlobContainerClient container, 
            string? prefix, int? segmentSize)
        {
            string continuationToken = null;
            
            try
            {
                // Call the listing operation and enumerate the result segment.
                // When the continuation token is empty, the last segment has been returned and
                // execution can exit the loop.
                do
                {
                    var resultSegment = container.GetBlobsByHierarchy(prefix:prefix, delimiter:"/")
                        .AsPages(continuationToken, segmentSize);

                    foreach (Azure.Page<BlobHierarchyItem> blobPage in resultSegment)
                    {
                        // A flat listing operation returns only blobs, not virtual directories.    
                        foreach (BlobHierarchyItem blobhierarchyItem in blobPage.Values)
                        {
                            if (blobhierarchyItem.IsPrefix)
                            {
                                // Write out the prefix of the virtual directory.
                                Console.WriteLine("Virtual directory prefix: {0}", blobhierarchyItem.Prefix);
  
                                ListBlobsHierarchicalListing(container, blobhierarchyItem.Prefix, null);
                            }
                            else
                            {
                                // Write out the name of the blob.
                                Console.WriteLine("Blob name: {0}", blobhierarchyItem.Blob.Name);
                            }
                        }

                        Console.WriteLine();

                        // Get the continuation token and loop until it is empty.
                        continuationToken = blobPage.ContinuationToken;
                    }
 

                } while (continuationToken != "");
            }
            catch (RequestFailedException e)
            {
                Console.WriteLine(e.Message);
                Console.ReadLine();
                throw;
            }
        }
        // </Snippet_ListBlobsHierarchicalListing>

        //-------------------------------------------------
        // CRUD menu (Can call asynchronous and synchronous methods)
        //-------------------------------------------------

        public async Task<bool> MenuAsync()
        {
            Console.Clear();
            Console.WriteLine("Choose a Create, Read, Update, or Delete (CRUD) scenario:");
            Console.WriteLine("1) Show a flat listing of blobs");
            Console.WriteLine("2) Show a hierarchical listing of blobs");
            Console.WriteLine("3) Return to main menu");
            Console.Write("\r\nSelect an option: ");

            var connectionString = Constants.connectionString;
            BlobServiceClient blobServiceClient = new BlobServiceClient(connectionString);
            
            switch (Console.ReadLine())
            {
                case "1":

                    ListBlobsFlatListing(blobServiceClient.GetBlobContainerClient(Constants.containerName), null);

                    Console.WriteLine("Press enter to continue");   
                    Console.ReadLine();          
                    return true;
                
                case "2":

                    ListBlobsHierarchicalListing(blobServiceClient.GetBlobContainerClient(Constants.containerName), null, null);

                    Console.ReadLine();              
                    return true;

                case "3":
                
                   return false;
                
                default:
                
                   return true;
            }
        }
        
    }

    


    
}
