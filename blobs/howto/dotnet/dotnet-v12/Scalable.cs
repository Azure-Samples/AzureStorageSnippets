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

/*
 * For these scenarios, create a directory called "upload" off the current directory.
 * In the "upload" directory, place the files to upload by using UploadFilesAsync.
 * A "download" directory is created by the app as the destination for blobs downloaded by using DownloadFilesAsync.
 * The "download" directory is removed by the DeleteDownloadDirectory method on menu choice 4.
 */
using Azure;
using Azure.Storage;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Threading.Tasks;

namespace dotnet_v12
{
    class Scalable
    {
        //-------------------------------------------------
        // Utility function used by UploadFilesAsync
        //-------------------------------------------------
        private static async Task<BlobContainerClient[]> GetRandomContainersAsync()
        {
            BlobServiceClient blobServiceClient = new BlobServiceClient(Constants.connectionString);
            BlobContainerClient[] containers = new BlobContainerClient[5];

            for (int i = 0; i < 5; i++)
            {
                containers[i] = await blobServiceClient.CreateBlobContainerAsync(Guid.NewGuid().ToString());
                Console.WriteLine($"Created container {containers[i].Name}");
            }

            return containers;
        }

        //-----------------------------------------
        // Upload multiple blobs simultaneously
        //-----------------------------------------
        // <Snippet_UploadFilesAsync>
        private static async Task UploadFilesAsync()
        {
            // Create five randomly named containers to store the uploaded files.
            BlobContainerClient[] containers = await GetRandomContainersAsync();

            // Path to the directory to upload
            string uploadPath = Directory.GetCurrentDirectory() + "\\upload";

            // Start a timer to measure how long it takes to upload all the files.
            Stopwatch timer = Stopwatch.StartNew();

            try
            {
                Console.WriteLine($"Iterating in directory: {uploadPath}");
                int count = 0;

                Console.WriteLine($"Found {Directory.GetFiles(uploadPath).Length} file(s)");

                // Specify the StorageTransferOptions
                BlobUploadOptions options = new BlobUploadOptions
                {
                    TransferOptions = new StorageTransferOptions
                    {
                        // Set the maximum number of workers that 
                        // may be used in a parallel transfer.
                        MaximumConcurrency = 8,

                        // Set the maximum length of a transfer to 50MB.
                        MaximumTransferSize = 50 * 1024 * 1024
                    }
                };

                // Create a queue of tasks that will each upload one file.
                var tasks = new Queue<Task<Response<BlobContentInfo>>>();

                // Iterate through the files
                foreach (string filePath in Directory.GetFiles(uploadPath))
                {
                    BlobContainerClient container = containers[count % 5];
                    string fileName = Path.GetFileName(filePath);
                    Console.WriteLine($"Uploading {fileName} to container {container.Name}");
                    BlobClient blob = container.GetBlobClient(fileName);

                    // Add the upload task to the queue
                    tasks.Enqueue(blob.UploadAsync(filePath, options));
                    count++;
                }

                // Run all the tasks asynchronously.
                await Task.WhenAll(tasks);

                timer.Stop();
                Console.WriteLine($"Uploaded {count} files in {timer.Elapsed.TotalSeconds} seconds");
            }
            catch (RequestFailedException ex)
            {
                Console.WriteLine($"Azure request failed: {ex.Message}");
            }
            catch (DirectoryNotFoundException ex)
            {
                Console.WriteLine($"Error parsing files in the directory: {ex.Message}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception: {ex.Message}");
            }
        }
        // </Snippet_UploadFilesAsync>

        //-------------------------------------------------
        // Utility function used by DownloadFilesAsync
        //-------------------------------------------------
        private static BlobServiceClient GetBlobServiceClient()
        {
            return new BlobServiceClient(Constants.connectionString);
        }

        //------------------------------------------
        // Download multiple blobs simultaneously
        //------------------------------------------
        // <Snippet_DownloadFilesAsync>
        private static async Task DownloadFilesAsync()
        {
            BlobServiceClient blobServiceClient = GetBlobServiceClient();

            // Path to the directory to upload
            string downloadPath = Directory.GetCurrentDirectory() + "\\download\\";
            Directory.CreateDirectory(downloadPath);
            Console.WriteLine($"Created directory {downloadPath}");

            // Specify the StorageTransferOptions
            var options = new StorageTransferOptions
            {
                // Set the maximum number of workers that 
                // may be used in a parallel transfer.
                MaximumConcurrency = 8,

                // Set the maximum length of a transfer to 50MB.
                MaximumTransferSize = 50 * 1024 * 1024
            };

            List<BlobContainerClient> containers = new List<BlobContainerClient>();

            foreach (BlobContainerItem container in blobServiceClient.GetBlobContainers())
            {
                containers.Add(blobServiceClient.GetBlobContainerClient(container.Name));
            }

            // Start a timer to measure how long it takes to download all the files.
            Stopwatch timer = Stopwatch.StartNew();

            // Download the blobs
            try
            {
                int count = 0;

                // Create a queue of tasks that will each upload one file.
                var tasks = new Queue<Task<Response>>();

                foreach (BlobContainerClient container in containers)
                {                     
                    // Iterate through the files
                    foreach (BlobItem blobItem in container.GetBlobs())
                    {
                        string fileName = downloadPath + blobItem.Name;
                        Console.WriteLine($"Downloading {blobItem.Name} to {downloadPath}");

                        BlobClient blob = container.GetBlobClient(blobItem.Name);

                        // Add the download task to the queue
                        tasks.Enqueue(blob.DownloadToAsync(fileName, default, options));
                        count++;
                    }
                }

                // Run all the tasks asynchronously.
                await Task.WhenAll(tasks);

                // Report the elapsed time.
                timer.Stop();
                Console.WriteLine($"Downloaded {count} files in {timer.Elapsed.TotalSeconds} seconds");
            }
            catch (RequestFailedException ex)
            {
                Console.WriteLine($"Azure request failed: {ex.Message}");
            }
            catch (DirectoryNotFoundException ex)
            {
                Console.WriteLine($"Error parsing files in the directory: {ex.Message}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception: {ex.Message}");
            }
        }
        // </Snippet_DownloadFilesAsync>

        //---------------------------------------------------
        // Clean up containers created by UploadFilesAsync
        //---------------------------------------------------
        private static async Task DeleteExistingContainersAsync()
        {
            BlobServiceClient blobServiceClient = GetBlobServiceClient();

            try
            {
                foreach (BlobContainerItem container in blobServiceClient.GetBlobContainers())
                {
                    await blobServiceClient.DeleteBlobContainerAsync(container.Name);
                    Console.WriteLine($"Deleted container {container.Name}");
                }
            }
            catch (RequestFailedException ex)
            {
                Console.WriteLine($"Container delete request failed: {ex.Message}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception: {ex.Message}");
            }
        }

        //--------------------------------------------------------------
        // Clean up files and directory created by DownloadFilesAsync
        //--------------------------------------------------------------
        private static void DeleteDownloadDirectory()
        {
            string downloadDir = Directory.GetCurrentDirectory() + "\\download\\";

            try
            {
                // Delete the files
                foreach (string filePath in Directory.GetFiles(downloadDir))
                {
                    File.Delete(filePath);
                    Console.WriteLine($"Deleted file {filePath}");
                }

                Directory.Delete(downloadDir);
                Console.WriteLine($"Deleted directory {downloadDir}");
            }
            catch (DirectoryNotFoundException ex)
            {
                Console.WriteLine($"Directory not found exception: {ex.Message}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception: {ex.Message}");
            }
        }

        public async Task<bool> MenuAsync()
        {
            Console.Clear();
            Console.WriteLine("Choose a copy scenario:");
            Console.WriteLine("1) Upload multiple files simultaneously");
            Console.WriteLine("2) Download multiple files simultaneously");
            Console.WriteLine("3) Delete existing containers");
            Console.WriteLine("4) Delete download directory");
            Console.WriteLine("X) Exit to main menu");
            Console.Write("\r\nSelect an option: ");

            switch (Console.ReadLine())
            {
                case "1":
                    await UploadFilesAsync();
                    Console.Write("Press enter to continue...");
                    Console.ReadLine();
                    return true;

                case "2":
                    await DownloadFilesAsync();
                    Console.Write("Press enter to continue...");
                    Console.ReadLine();
                    return true;

                case "3":
                    await DeleteExistingContainersAsync();
                    Console.Write("Press enter to continue...");
                    Console.ReadLine();
                    return true;

                case "4":
                    DeleteDownloadDirectory();
                    Console.Write("Press enter to continue...");
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
