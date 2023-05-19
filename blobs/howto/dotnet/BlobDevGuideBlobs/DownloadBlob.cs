using System.Diagnostics;
using Azure.Storage;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace BlobDevGuideBlobs
{
    class DownloadBlob
    {
        public static async Task DownloadBlobSamples(BlobServiceClient blobServiceClient)
        {
            BlobClient blobClient = blobServiceClient
                .GetBlobContainerClient("sample-container")
                .GetBlobClient("sample-blob.txt");
            string localFilePath = @"<local-file-path>";

            //await DownloadBlobToFileAsync(blobClient, filePath);
            //await DownloadBlobWithChecksumAsync(blobClient, localFilePath);
            //await DownloadBlobWithTransferOptionsAsync(blobClient, localFilePath);
        }

        // <Snippet_DownloadBlobToFile>
        public static async Task DownloadBlobToFileAsync(
            BlobClient blobClient,
            string localFilePath)
        {
            await blobClient.DownloadToAsync(localFilePath);
        }
        // </Snippet_DownloadBlobToFile>

        // <Snippet_DownloadBlobToStream>
        public static async Task DownloadBlobToStreamAsync(
            BlobClient blobClient,
            string localFilePath)
        {
            FileStream fileStream = File.OpenWrite(localFilePath);

            await blobClient.DownloadToAsync(fileStream);

            fileStream.Close();
        }
        // </Snippet_DownloadBlobToStream>

        // <Snippet_DownloadBlobToString>
        public static async Task DownloadBlobToStringAsync(BlobClient blobClient)
        {
            BlobDownloadResult downloadResult = await blobClient.DownloadContentAsync();
            string blobContents = downloadResult.Content.ToString();
        }
        // </Snippet_DownloadBlobToString>

        // <Snippet_DownloadBlobFromStream>
        public static async Task DownloadBlobFromStreamAsync(
            BlobClient blobClient,
            string localFilePath)
        {
            using (var stream = await blobClient.OpenReadAsync())
            {
                FileStream fileStream = File.OpenWrite(localFilePath);
                await stream.CopyToAsync(fileStream);
            }
        }
        // </Snippet_DownloadBlobFromStream>

        // <Snippet_DownloadBlobWithChecksum>
        public static async Task DownloadBlobWithChecksumAsync(
            BlobClient blobClient,
            string localFilePath)
        {
            FileStream fileStream = File.OpenWrite(localFilePath);

            var validationOptions = new DownloadTransferValidationOptions
            {
                AutoValidateChecksum = true,
                ChecksumAlgorithm = StorageChecksumAlgorithm.Auto
            };

            BlobDownloadToOptions downloadOptions = new BlobDownloadToOptions()
            {
                TransferValidation = validationOptions
            };

            await blobClient.DownloadToAsync(fileStream, downloadOptions);

            fileStream.Close();
        }
        // </Snippet_DownloadBlobWithChecksum>

        // <Snippet_DownloadBlobWithTransferOptions>
        public static async Task DownloadBlobWithTransferOptionsAsync(
            BlobClient blobClient,
            string localFilePath)
        {
            FileStream fileStream = File.OpenWrite(localFilePath);

            var transferOptions = new StorageTransferOptions
            {
                // Set the maximum number of parallel transfer workers
                MaximumConcurrency = 2,

                // Set the initial transfer length to 8 MiB
                InitialTransferSize = 8 * 1024 * 1024,

                // Set the maximum length of a transfer to 4 MiB
                MaximumTransferSize = 4 * 1024 * 1024
            };

            BlobDownloadToOptions downloadOptions = new BlobDownloadToOptions()
            {
                TransferOptions = transferOptions
            };

            await blobClient.DownloadToAsync(fileStream, downloadOptions);

            fileStream.Close();
        }
        // </Snippet_DownloadBlobWithTransferOptions>
    }
}
