using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace BlobDevGuideBlobs
{
    class DownloadBlob
    {
        public static async Task DownloadBlobSamples(BlobServiceClient blobServiceClient)
        {
            //BlobClient blobClient = blobServiceClient
            //    .GetBlobContainerClient("sample-container")
            //    .GetBlobClient("sample-blob.txt");
            //string filePath = "";
            
            //await DownloadBlobToFileAsync(blobClient, filePath);
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
    }
}
