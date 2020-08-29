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
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace dotnet_v12
{
    public class Metadata
    {

        //-------------------------------------------------
        // Read container properties
        //-------------------------------------------------
        // <Snippet_ReadContainerProperties>
        private static async Task ReadContainerPropertiesAsync(BlobContainerClient container)
        {
            try
            {
                // Fetch some container properties and write out their values.
                var properties = await container.GetPropertiesAsync();
                Console.WriteLine($"Properties for container {container.Uri}");
                Console.WriteLine($"Public access level: {properties.Value.PublicAccess}");
                Console.WriteLine($"Last modified time in UTC: {properties.Value.LastModified}");
            }
            catch (RequestFailedException e)
            {
                Console.WriteLine($"HTTP error code {e.Status}: {e.ErrorCode}");
                Console.WriteLine(e.Message);
                Console.ReadLine();
            }
        }
        // </Snippet_ReadContainerProperties>


        //-------------------------------------------------
        // Set metadata on container
        //-------------------------------------------------
        // <Snippet_AddContainerMetadata>
        public static async Task AddContainerMetadataAsync(BlobContainerClient container)
        {
            try
            {
                IDictionary<string, string> metadata =
                   new Dictionary<string, string>();

                // Add some metadata to the container.
                metadata.Add("docType", "textDocuments");
                metadata.Add("category", "guidance");

                // Set the container's metadata.
                await container.SetMetadataAsync(metadata);
            }
            catch (RequestFailedException e)
            {
                Console.WriteLine($"HTTP error code {e.Status}: {e.ErrorCode}");
                Console.WriteLine(e.Message);
                Console.ReadLine();
            }
        }
        // </Snippet_AddContainerMetadata>

        //-------------------------------------------------
        // Read metadata on container
        //-------------------------------------------------
        // <Snippet_ReadContainerMetadata>
        public static async Task ReadContainerMetadataAsync(BlobContainerClient container)
        {
            try
            {
                var properties = await container.GetPropertiesAsync();

                // Enumerate the container's metadata.
                Console.WriteLine("Container metadata:");
                foreach (var metadataItem in properties.Value.Metadata)
                {
                    Console.WriteLine($"\tKey: {metadataItem.Key}");
                    Console.WriteLine($"\tValue: {metadataItem.Value}");
                }
            }
            catch (RequestFailedException e)
            {
                Console.WriteLine($"HTTP error code {e.Status}: {e.ErrorCode}");
                Console.WriteLine(e.Message);
                Console.ReadLine();
            }
        }
        // </Snippet_ReadContainerMetadata>

        //-------------------------------------------------
        // Set blob properties
        //-------------------------------------------------
        // <Snippet_SetBlobProperties>
        public static async Task SetBlobPropertiesAsync(BlobClient blob)
        {
            Console.WriteLine("Setting blob properties...");

            try
            {
                // Get the existing properties
                BlobProperties properties = await blob.GetPropertiesAsync();

                BlobHttpHeaders headers = new BlobHttpHeaders
                {
                    // Set the MIME ContentType every time the properties 
                    // are updated or the field will be cleared
                    ContentType = "text/plain",
                    ContentLanguage = "en-us",

                    // Populate remaining headers with 
                    // the pre-existing properties
                    CacheControl = properties.CacheControl,
                    ContentDisposition = properties.ContentDisposition,
                    ContentEncoding = properties.ContentEncoding,
                    ContentHash = properties.ContentHash
                };

                // Set the blob's properties.
                await blob.SetHttpHeadersAsync(headers);
            }
            catch (RequestFailedException e)
            {
                Console.WriteLine($"HTTP error code {e.Status}: {e.ErrorCode}");
                Console.WriteLine(e.Message);
                Console.ReadLine();
            }
        }
        // </Snippet_SetBlobProperties>

        //-------------------------------------------------
        // Read blob properties
        //-------------------------------------------------
        // <Snippet_ReadBlobProperties>
        private static async Task GetBlobPropertiesAsync(BlobClient blob)
        {
            try
            {
                // Get the blob properties
                BlobProperties properties = await blob.GetPropertiesAsync();

                // Display some of the blob's property values
                Console.WriteLine($" ContentLanguage: {properties.ContentLanguage}");
                Console.WriteLine($" ContentType: {properties.ContentType}");
                Console.WriteLine($" CreatedOn: {properties.CreatedOn}");
                Console.WriteLine($" LastModified: {properties.LastModified}");
            }
            catch (RequestFailedException e)
            {
                Console.WriteLine($"HTTP error code {e.Status}: {e.ErrorCode}");
                Console.WriteLine(e.Message);
                Console.ReadLine();
            }
        }
        // </Snippet_ReadBlobProperties>

        //-------------------------------------------------
        // Add blob metadata
        //-------------------------------------------------
        // <Snippet_AddBlobMetadata>
        public static async Task AddBlobMetadataAsync(BlobClient blob)
        {
            Console.WriteLine("Adding blob metadata...");

            try
            {
                IDictionary<string, string> metadata =
                   new Dictionary<string, string>();

                // Add metadata to the dictionary by calling the Add method
                metadata.Add("docType", "textDocuments");

                // Add metadata to the dictionary by using key/value syntax
                metadata["category"] = "guidance";

                // Set the blob's metadata.
                await blob.SetMetadataAsync(metadata);
            }
            catch (RequestFailedException e)
            {
                Console.WriteLine($"HTTP error code {e.Status}: {e.ErrorCode}");
                Console.WriteLine(e.Message);
                Console.ReadLine();
            }
        }
        // </Snippet_AddBlobMetadata>

        //-------------------------------------------------
        // Read blob metadata
        //-------------------------------------------------
        // <Snippet_ReadBlobMetadata>
        public static async Task ReadBlobMetadataAsync(BlobClient blob)
        {
            try
            {
                // Get the blob's properties and metadata.
                BlobProperties properties = await blob.GetPropertiesAsync();

                Console.WriteLine("Blob metadata:");

                // Enumerate the blob's metadata.
                foreach (var metadataItem in properties.Metadata)
                {
                    Console.WriteLine($"\tKey: {metadataItem.Key}");
                    Console.WriteLine($"\tValue: {metadataItem.Value}");
                }
            }
            catch (RequestFailedException e)
            {
                Console.WriteLine($"HTTP error code {e.Status}: {e.ErrorCode}");
                Console.WriteLine(e.Message);
                Console.ReadLine();
            }
        }
        // </Snippet_ReadBlobMetadata>

        //-------------------------------------------------
        // Metadata menu
        //-------------------------------------------------
        public async Task<bool> MenuAsync()
        {
            var connectionString = Constants.connectionString;
            BlobServiceClient blobServiceClient = new BlobServiceClient(connectionString);
            BlobContainerClient container = blobServiceClient.GetBlobContainerClient(Constants.containerName);
            BlobClient blob = container.GetBlobClient(Constants.blobName);

            Console.Clear();
            Console.WriteLine("Choose a properties or metadata scenario:");
            Console.WriteLine("1) Read container properties");
            Console.WriteLine("2) Set metadata on container");
            Console.WriteLine("3) Read metadata on container");
            Console.WriteLine("4) Set blob properties");
            Console.WriteLine("5) Read blob properties");
            Console.WriteLine("6) Add metadata on blob");
            Console.WriteLine("7) Read blob metadata");
            Console.WriteLine("X) Exit to main menu");
            Console.Write("\r\nSelect an option: ");

            switch (Console.ReadLine())
            {
                case "1":
                    await ReadContainerPropertiesAsync(container);
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "2":
                    await AddContainerMetadataAsync(container);
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "3":
                    await ReadContainerMetadataAsync(container);
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "4":
                    await SetBlobPropertiesAsync(blob);
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "5":
                    await GetBlobPropertiesAsync(blob);
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "6":
                    await AddBlobMetadataAsync(blob);
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "7":
                    await ReadBlobMetadataAsync(blob);
                    Console.WriteLine("Press enter to continue");
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
