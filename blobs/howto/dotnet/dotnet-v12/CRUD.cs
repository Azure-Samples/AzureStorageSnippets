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
using System.Text;

namespace dotnet_v12
{
    public class CRUD
    {

        #region Blob flat listing

        //-------------------------------------------------
        // ListBlobsFlatListing
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

        #endregion

        #region Blob hierarchical listing

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

                                // Call recursively with the prefix to traverse the virtual directory.
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

        #endregion

        #region Create page blob
        //-------------------------------------------------
        // Create page blob
        //-------------------------------------------------

        private static PageBlobClient CreatePageBlob(string connectionString)
        {
            // <Snippet_CreatePageBlob>
            long OneGigabyteAsBytes = 1024 * 1024 * 1024;

            BlobServiceClient blobServiceClient = new BlobServiceClient(connectionString);

            var blobContainerClient =
                blobServiceClient.GetBlobContainerClient(Constants.containerName);

            var pageBlobClient = blobContainerClient.GetPageBlobClient("0s4.vhd");

            pageBlobClient.Create(16 * OneGigabyteAsBytes);
            // </Snippet_CreatePageBlob>

            return pageBlobClient;
        }

        #endregion

        #region Resize page blob

        //-------------------------------------------------
        // Resize page blob
        //-------------------------------------------------

        private static void ResizePageBlob(PageBlobClient pageBlobClient, 
            long OneGigabyteAsBytes)
        {
            // <Snippet_ResizePageBlob>
            pageBlobClient.Resize(32 * OneGigabyteAsBytes);
            // </Snippet_ResizePageBlob>
        }

        #endregion

        #region Write pages to a page blob

        //-------------------------------------------------
        // Write pages to a page blob
        //-------------------------------------------------

        private static void WriteToPageBlob(PageBlobClient pageBlobClient,
            Stream dataStream)
        {
            long startingOffset = 512;

            // <Snippet_WriteToPageBlob>
            pageBlobClient.UploadPages(dataStream, startingOffset);
            // </Snippet_WriteToPageBlob>
        }

        #endregion

        #region Read pages from a page blob

        //-------------------------------------------------
        // Read pages from a page blob
        //-------------------------------------------------

        private static void ReadFromPageBlob(PageBlobClient pageBlobClient,
            long bufferOffset, long rangeSize)
        {
            // <Snippet_ReadFromPageBlob>
            var pageBlob = pageBlobClient.Download(new HttpRange(bufferOffset, rangeSize));
            // </Snippet_ReadFromPageBlob>
        }

        #endregion

        #region Read valid page regions from a page blob

        //-------------------------------------------------
        // Read valid page regions from a page blob
        //-------------------------------------------------

        private static void ReadValidPageRegionsFromPageBlob(PageBlobClient pageBlobClient,
            long bufferOffset, long rangeSize)
        {
            // <Snippet_ReadValidPageRegionsFromPageBlob>
            IEnumerable<HttpRange> pageRanges = pageBlobClient.GetPageRanges().Value.PageRanges;

            foreach (var range in pageRanges)
            {
                var pageBlob = pageBlobClient.Download(range);
            }
             // </Snippet_ReadValidPageRegionsFromPageBlob>
        }

            #endregion

        #region User menu

            //-------------------------------------------------
            // CRUD menu (Can call asynchronous and synchronous methods)
            //-------------------------------------------------

            public async Task<bool> MenuAsync()
        {
            Console.Clear();
            Console.WriteLine("Choose a Create, Read, Update, or Delete (CRUD) scenario:");
            Console.WriteLine("1) Show a flat listing of blobs");
            Console.WriteLine("2) Show a hierarchical listing of blobs");
            Console.WriteLine("3) Create a page blob");
            Console.WriteLine("4) Resize a page blob");
            Console.WriteLine("5) Write pages to a page blob");
            Console.WriteLine("6) Read pages from a page blob");
            Console.WriteLine("7) Read valid page regions from a page blob");
            Console.WriteLine("8) Return to main menu");
            Console.Write("\r\nSelect an option: ");

            BlobServiceClient blobServiceClient = new BlobServiceClient(Constants.connectionString);
            PageBlobClient pageBlobClient = null;
            
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

                    pageBlobClient = CreatePageBlob(Constants.connectionString);

                    Console.ReadLine();
                    return true;

                case "4":

                    if (pageBlobClient != null)
                    {
                        ResizePageBlob(pageBlobClient, 1024 * 1024 * 1024);
                    }
                    else
                    {
                        Console.WriteLine("Need to create page blob first");
                    }

                    Console.ReadLine();
                    return true;

                case "5":

                    UnicodeEncoding uniEncoding = new UnicodeEncoding();

                    byte[] randomInformation = uniEncoding.GetBytes(
                     "Random information");
                    using (MemoryStream memStream = new MemoryStream(100))
                    {
                        memStream.Write(randomInformation, 0, randomInformation.Length);
                        WriteToPageBlob(pageBlobClient, memStream);
                    }
                    Console.ReadLine();
                    return true;

                case "6":

                    ReadFromPageBlob(pageBlobClient, 512, 200);

                    Console.ReadLine();
                    return true;

                case "7":

                    ReadValidPageRegionsFromPageBlob(pageBlobClient, 512, 200);

                    Console.ReadLine();
                    return true;

                case "8":
                
                   return false;
                
                default:
                
                   return true;
            }
        }
        #endregion

    }

}
