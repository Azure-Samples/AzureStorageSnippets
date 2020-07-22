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

        private static async Task ReadContainerPropertiesAsync
            (BlobContainerClient container)
        {
            try
            {
                // Fetch some container properties and write out their values.
                var properties = await container.GetPropertiesAsync();
                Console.WriteLine("Properties for container {0}", container.Uri);
                Console.WriteLine("Public access level: {0}", properties.Value.PublicAccess);
                Console.WriteLine("Last modified time in UTC: {0}", properties.Value.LastModified);
            }
            catch (RequestFailedException e)
            {
                Console.WriteLine("HTTP error code {0}: {1}",
                                    e.Status,
                                    e.ErrorCode);
                Console.WriteLine(e.Message);
                Console.ReadLine();
            }
        }

        // </Snippet_ReadContainerProperties>


        //-------------------------------------------------
        // Set metadata on container
        //-------------------------------------------------

        // <Snippet_AddContainerMetadata>
        public static async Task AddContainerMetadataAsync
            (BlobContainerClient container)
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
                Console.WriteLine("HTTP error code {0}: {1}",
                                    e.Status,
                                    e.ErrorCode);
                Console.WriteLine(e.Message);
                Console.ReadLine();
            }
        }
        // </Snippet_AddContainerMetadata>

        //-------------------------------------------------
        // Read metadata on container
        //-------------------------------------------------

        // <Snippet_ReadContainerMetadata>
        public static async Task ReadContainerMetadataAsync
            (BlobContainerClient container)
        {
            try
            {
                var properties = await container.GetPropertiesAsync();

                // Enumerate the container's metadata.
                Console.WriteLine("Container metadata:");
                foreach (var metadataItem in properties.Value.Metadata)
                {
                    Console.WriteLine("\tKey: {0}", metadataItem.Key);
                    Console.WriteLine("\tValue: {0}", metadataItem.Value);
                }
            }
            catch (RequestFailedException e)
            {
                Console.WriteLine("HTTP error code {0}: {1}",
                                    e.Status,
                                    e.ErrorCode);
                Console.WriteLine(e.Message);
                Console.ReadLine();
            }
        }
        // </Snippet_ReadContainerMetadata>

        //-------------------------------------------------
        // Metadata menu
        //-------------------------------------------------

        public async Task<bool> MenuAsync()
        {
            var connectionString = Constants.connectionString;
            BlobServiceClient blobServiceClient = new BlobServiceClient(connectionString);

            Console.Clear();
            Console.WriteLine("Choose a metadata scenario:");
            Console.WriteLine("1) Read container properties");
            Console.WriteLine("2) Set metadata on container");
            Console.WriteLine("3) Read metadata on container");
            Console.WriteLine("X) Exit to main menu");
            Console.Write("\r\nSelect an option: ");
 
            switch (Console.ReadLine())
            {
                case "1":

                   await ReadContainerPropertiesAsync
                        (blobServiceClient.GetBlobContainerClient(Constants.containerName));

                   Console.WriteLine("Press enter to continue");   
                   Console.ReadLine();          
                   return true;
                
                case "2":

                    await AddContainerMetadataAsync
                         (blobServiceClient.GetBlobContainerClient(Constants.containerName));

                    Console.WriteLine("Press enter to continue"); 
                   Console.ReadLine();              
                   return true;

                case "3":

                    await ReadContainerMetadataAsync
                         (blobServiceClient.GetBlobContainerClient(Constants.containerName));

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
