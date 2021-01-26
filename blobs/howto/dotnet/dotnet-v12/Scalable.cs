/*
 * For these scenarios, create two directories called "upload" and "download" off the current directory.
 * In the "upload" directory place the files to upload by using UploadFilesAsync.
 * The "download" directory is the destination for blobs downloaded by using DownloadFilesAsync.
 */
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Blobs.Specialized;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace dotnet_v12
{
    class Scalable
    {
        //-------------------------------------------------
        // Upload multiple block blobs simultaneously
        //-------------------------------------------------
        // <Snippet_UploadFilesAsync>
        private static async Task UploadFilesAsync(BlobContainerClient container)
        {
            // path to the directory to upload
            string uploadPath = Directory.GetCurrentDirectory() + "\\upload";

            // Start a timer to measure how long it takes to upload all the files.
            Stopwatch timer = Stopwatch.StartNew();

            try
            {
                Console.WriteLine($"Iterating in directory: {uploadPath}");
                int count = 0;
                int max_outstanding = 100;
                int completed_count = 0;

                // Create a new instance of the SemaphoreSlim class to define the number of threads to use in the application.
                SemaphoreSlim sem = new SemaphoreSlim(max_outstanding, max_outstanding);

                List<Task> tasks = new List<Task>();
                Console.WriteLine($"Found {Directory.GetFiles(uploadPath).Length} file(s)");

                // Iterate through the files
                foreach (string path in Directory.GetFiles(uploadPath))
                {
                    string fileName = Path.GetFileName(path);
                    //Uri uri = new Uri(path);
                    FileStream stream = new FileStream(path, FileMode.Open);
                    Console.WriteLine($"Uploading {path} to container {container.Name}.");
                    BlockBlobClient blockBlob = container.GetBlockBlobClient(fileName);

                    await sem.WaitAsync();

                    // Create tasks for each file that is uploaded. This is added to a collection that executes them all asyncronously.  
                    tasks.Add(blockBlob.UploadAsync(stream).ContinueWith((t) =>
                    {
                        // Release the semaphore when the upload has completed.
                        sem.Release();
                        Interlocked.Increment(ref completed_count);
                    }));

                    count++;
                }

                // Creates an asynchronous task that completes when all the uploads complete.
                await Task.WhenAll(tasks);

                timer.Stop();
                Console.WriteLine($"Upload has been completed in {timer.Elapsed.TotalSeconds} seconds.");
            }
            catch (DirectoryNotFoundException ex)
            {
                Console.WriteLine($"Error parsing files in the directory: {ex.Message}");
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }
        // </Snippet_UploadFilesAsync>

        //-------------------------------------------------
        // Download multiple block blobs simultaneously
        //-------------------------------------------------
        // <Snippet_DownloadFilesAsync>
        private static async Task DownloadFilesAsync(BlobContainerClient container)
        {
            // path to the directory to upload
            string downloadPath = Directory.GetCurrentDirectory() + "\\download\\";

            // Start a timer to measure how long it takes to upload all the files.
            Stopwatch timer = Stopwatch.StartNew();

            try
            {
                Console.WriteLine($"Iterating in container: {container.Name}");
                int count = 0;
                int max_outstanding = 100;
                int completed_count = 0;

                // Create a new instance of the SemaphoreSlim class to define the number of threads to use in the application.
                SemaphoreSlim sem = new SemaphoreSlim(max_outstanding, max_outstanding);

                List<Task> tasks = new List<Task>();

                // Iterate through the files
                foreach (BlobItem blobItem in container.GetBlobs())
                {
                    if (blobItem.Properties.BlobType == BlobType.Block)
                    {
                        string fileName = downloadPath + blobItem.Name;
                        FileStream stream = new FileStream(fileName, FileMode.Create);
                        Console.WriteLine($"Downloading {blobItem.Name} to directory {downloadPath}.");

                        BlockBlobClient blockBlob = container.GetBlockBlobClient(blobItem.Name);

                        await sem.WaitAsync();

                        // Create tasks for each file that is uploaded. This is added to a collection that executes them all asyncronously.  
                        tasks.Add(blockBlob.DownloadToAsync(stream).ContinueWith((t) =>
                        {
                            // Close the file stream and release the semaphore when the download has completed.
                            stream.Close();
                            sem.Release();
                            Interlocked.Increment(ref completed_count);
                        }));

                        count++;
                    }
                }

                // Creates an asynchronous task that completes when all the uploads complete.
                await Task.WhenAll(tasks);

                timer.Stop();
                Console.WriteLine($"Download has been completed in {timer.Elapsed.TotalSeconds} seconds.");
            }
            catch (DirectoryNotFoundException ex)
            {
                Console.WriteLine($"Error parsing files in the directory: {ex.Message}");
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }
        // </Snippet_DownloadFilesAsync>

        public async Task<bool> MenuAsync()
        {
            BlobServiceClient blobServiceClient = new BlobServiceClient(Constants.connectionString);
            BlobContainerClient container = blobServiceClient.GetBlobContainerClient(Constants.containerName);

            Console.Clear();
            Console.WriteLine("Choose a copy scenario:");
            Console.WriteLine("1) Upload multiple files simultaneously");
            Console.WriteLine("2) Download multiple files simultaneously");
            Console.WriteLine("X) Exit to main menu");
            Console.Write("\r\nSelect an option: ");

            switch (Console.ReadLine())
            {
                case "1":
                    await UploadFilesAsync(container);
                    Console.Write("Press enter to continue...");
                    Console.ReadLine();
                    return true;

                case "2":
                    await DownloadFilesAsync(container);
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
