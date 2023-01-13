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
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace dotnet_v12
{
    public class CRUD
    {

        #region Blob flat listing

        //-------------------------------------------------
        // ListBlobsFlatListing
        //-------------------------------------------------

        // <Snippet_ListBlobsFlatListing>
        private static async Task ListBlobsFlatListing(BlobContainerClient blobContainerClient, 
                                                       int? segmentSize)
        {
            try
            {
                // Call the listing operation and return pages of the specified size.
                var resultSegment = blobContainerClient.GetBlobsAsync()
                    .AsPages(default, segmentSize);

                // Enumerate the blobs returned for each page.
                await foreach (Page<BlobItem> blobPage in resultSegment)
                {
                    foreach (BlobItem blobItem in blobPage.Values)
                    {
                        Console.WriteLine("Blob name: {0}", blobItem.Name);
                    }

                    Console.WriteLine();
                }
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
        private static async Task ListBlobsHierarchicalListing(BlobContainerClient container, 
                                                               string prefix, 
                                                               int? segmentSize)
        {
            try
            {
                // Call the listing operation and return pages of the specified size.
                var resultSegment = container.GetBlobsByHierarchyAsync(prefix:prefix, delimiter:"/")
                    .AsPages(default, segmentSize);

                // Enumerate the blobs returned for each page.
                await foreach (Page<BlobHierarchyItem> blobPage in resultSegment)
                {
                    // A hierarchical listing may return both virtual directories and blobs.
                    foreach (BlobHierarchyItem blobhierarchyItem in blobPage.Values)
                    {
                        if (blobhierarchyItem.IsPrefix)
                        {
                            // Write out the prefix of the virtual directory.
                            Console.WriteLine("Virtual directory prefix: {0}", blobhierarchyItem.Prefix);

                            // Call recursively with the prefix to traverse the virtual directory.
                            await ListBlobsHierarchicalListing(container, blobhierarchyItem.Prefix, null);
                        }
                        else
                        {
                            // Write out the name of the blob.
                            Console.WriteLine("Blob name: {0}", blobhierarchyItem.Blob.Name);
                        }
                    }

                    Console.WriteLine();
                }
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

        #region UpdateVersionedBlobMetadata
        //-------------------------------------------------
        // UpdateVersionedBlobMetadata
        //-------------------------------------------------

        // <Snippet_UpdateVersionedBlobMetadata>
        public static async Task UpdateVersionedBlobMetadata(BlobContainerClient blobContainerClient, 
                                                             string blobName)
        {
            try
            {
                // Create the container.
                await blobContainerClient.CreateIfNotExistsAsync();

                // Upload a block blob.
                BlockBlobClient blockBlobClient = blobContainerClient.GetBlockBlobClient(blobName);

                string blobContents = string.Format("Block blob created at {0}.", DateTime.Now);
                byte[] byteArray = Encoding.ASCII.GetBytes(blobContents);

                string initalVersionId;
                using (MemoryStream stream = new MemoryStream(byteArray))
                {
                    Response<BlobContentInfo> uploadResponse = 
                        await blockBlobClient.UploadAsync(stream, null, default);

                    // Get the version ID for the current version.
                    initalVersionId = uploadResponse.Value.VersionId;
                }

                // Update the blob's metadata to trigger the creation of a new version.
                Dictionary<string, string> metadata = new Dictionary<string, string>
                {
                    { "key", "value" },
                    { "key1", "value1" }
                };

                Response<BlobInfo> metadataResponse = 
                    await blockBlobClient.SetMetadataAsync(metadata);

                // Get the version ID for the new current version.
                string newVersionId = metadataResponse.Value.VersionId;

                // Request metadata on the previous version.
                BlockBlobClient initalVersionBlob = blockBlobClient.WithVersion(initalVersionId);
                Response<BlobProperties> propertiesResponse = await initalVersionBlob.GetPropertiesAsync();
                PrintMetadata(propertiesResponse);

                // Request metadata on the current version.
                BlockBlobClient newVersionBlob = blockBlobClient.WithVersion(newVersionId);
                Response<BlobProperties> newPropertiesResponse = await newVersionBlob.GetPropertiesAsync();
                PrintMetadata(newPropertiesResponse);
            }
            catch (RequestFailedException e)
            {
                Console.WriteLine(e.Message);
                Console.ReadLine();
                throw;
            }
        }

        static void PrintMetadata(Response<BlobProperties> propertiesResponse)
        {
            if (propertiesResponse.Value.Metadata.Count > 0)
            {
                Console.WriteLine("Metadata values for version {0}:", propertiesResponse.Value.VersionId);
                foreach (var item in propertiesResponse.Value.Metadata)
                {
                    Console.WriteLine("Key:{0}  Value:{1}", item.Key, item.Value);
                }
            }
            else
            {
                Console.WriteLine("Version {0} has no metadata.", propertiesResponse.Value.VersionId);
            }
        }

        // </Snippet_UpdateVersionedBlobMetadata>
        #endregion

        #region List blob versions
        //-------------------------------------------------
        // ListBlobVersions
        //-------------------------------------------------

        // <Snippet_ListBlobVersions>
        private static void ListBlobVersions(BlobContainerClient blobContainerClient, 
                                                   string blobName)
        {
            try
            {
                // Call the listing operation, specifying that blob versions are returned.
                // Use the blob name as the prefix. 
                var blobVersions = blobContainerClient.GetBlobs
                    (BlobTraits.None, BlobStates.Version, prefix: blobName)
                    .OrderByDescending(version => version.VersionId).Where(blob => blob.Name == blobName);

                // Construct the URI for each blob version.
                foreach (var version in blobVersions)
                {
                    BlobUriBuilder blobUriBuilder = new BlobUriBuilder(blobContainerClient.Uri)
                    {
                        BlobName = version.Name,
                        VersionId = version.VersionId
                    };

                    if ((bool)version.IsLatestVersion.GetValueOrDefault())
                    {
                        Console.WriteLine("Current version: {0}", blobUriBuilder);
                    }
                    else
                    {
                        Console.WriteLine("Previous version: {0}", blobUriBuilder);
                    }
                }
            }
            catch (RequestFailedException e)
            {
                Console.WriteLine(e.Message);
                Console.ReadLine();
                throw;
            }
        }
        // </Snippet_ListBlobVersions>

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
            Console.WriteLine("8) Modify a blob to create a new version. Make sure blob versioning is enabled for the storage account.");
            Console.WriteLine("9) List blob versions. Make sure blob versioning is enabled for the storage account.");
            Console.WriteLine("X) Exit to main menu");
            Console.Write("\r\nSelect an option: ");

            BlobServiceClient blobServiceClient = new BlobServiceClient(Constants.connectionString);
            PageBlobClient pageBlobClient = null;
            
            switch (Console.ReadLine())
            {
                case "1":

                    await ListBlobsFlatListing(blobServiceClient.GetBlobContainerClient(Constants.containerName), null);

                    Console.WriteLine("Press enter to continue");   
                    Console.ReadLine();          
                    return true;
                
                case "2":

                    await ListBlobsHierarchicalListing(blobServiceClient.GetBlobContainerClient(Constants.containerName), null, null);

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

                    await UpdateVersionedBlobMetadata(blobServiceClient.GetBlobContainerClient(Constants.containerName), "blob1.txt");

                    Console.ReadLine();
                    return true;

                case "9":

                    ListBlobVersions(blobServiceClient.GetBlobContainerClient(Constants.containerName), Constants.blobName);

                    Console.ReadLine();
                    return true;

                case "X":
                
                   return false;
                
                default:
                
                   return true;
            }
        }
        #endregion

    }

}
