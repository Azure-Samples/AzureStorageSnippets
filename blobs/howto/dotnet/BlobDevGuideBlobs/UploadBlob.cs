using System.Collections;
using System.IO.Compression;
using System.Reflection.Metadata;
using System.Security.Cryptography;
using System.Text;
using Azure.Storage;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Blobs.Specialized;
using static System.Reflection.Metadata.BlobBuilder;

namespace BlobDevGuideBlobs
{
    class UploadBlob
    {
        public static async Task UploadBlobSamples(BlobServiceClient blobServiceClient)
        {
            //BlobContainerClient containerClient = blobServiceClient.GetBlobContainerClient("sample-container");
            //string localFilePath = "<local-file-path>";

            //await UploadFromFileAsync(containerClient, localFilePath);
            //await UploadFromStreamAsync(containerClient, localFilePath);
            //await UploadFromBinaryDataAsync(containerClient, localFilePath);

            //await UploadFromStringAsync(containerClient, "sample-blob.txt");
        }

        // <Snippet_UploadFile>
        public static async Task UploadFromFileAsync(
            BlobContainerClient containerClient,
            string localFilePath)
        {
            string fileName = Path.GetFileName(localFilePath);
            BlobClient blobClient = containerClient.GetBlobClient(fileName);

            await blobClient.UploadAsync(localFilePath, true);
        }
        // </Snippet_UploadFile>

        // <Snippet_UploadStream>
        public static async Task UploadFromStreamAsync(
            BlobContainerClient containerClient,
            string localFilePath)
        {
            string fileName = Path.GetFileName(localFilePath);
            BlobClient blobClient = containerClient.GetBlobClient(fileName);

            FileStream fileStream = File.OpenRead(localFilePath);
            await blobClient.UploadAsync(fileStream, true);
            fileStream.Close();
        }
        // </Snippet_UploadStream>

        // <Snippet_UploadBinaryData>
        public static async Task UploadFromBinaryDataAsync(
            BlobContainerClient containerClient,
            string localFilePath)
        {
            string fileName = Path.GetFileName(localFilePath);
            BlobClient blobClient = containerClient.GetBlobClient(fileName);

            FileStream fileStream = File.OpenRead(localFilePath);
            BinaryReader reader = new BinaryReader(fileStream);

            byte[] buffer = new byte[fileStream.Length];
            reader.Read(buffer, 0, buffer.Length);
            BinaryData binaryData = new BinaryData(buffer);

            await blobClient.UploadAsync(binaryData, true);

            fileStream.Close();
        }
        // </Snippet_UploadBinaryData>

        // <Snippet_UploadString>
        public static async Task UploadFromStringAsync(
            BlobContainerClient containerClient,
            string blobName)
        {
            BlobClient blobClient = containerClient.GetBlobClient(blobName);
            string blobContents = "Sample blob data";

            await blobClient.UploadAsync(BinaryData.FromString(blobContents), overwrite: true);
        }
        // </Snippet_UploadString>

        // <Snippet_UploadBlobWithTags>
        public static async Task UploadBlobWithTagsAsync(
            BlobContainerClient containerClient,
            string blobName)
        {
            BlobClient blobClient = containerClient.GetBlobClient(blobName);
            string blobContents = "Sample blob data";

            BlobUploadOptions options = new BlobUploadOptions();
            options.Tags = new Dictionary<string, string>
            {
                { "Sealed", "false" },
                { "Content", "image" },
                { "Date", "2020-04-20" }
            };

            await blobClient.UploadAsync(BinaryData.FromString(blobContents), options);
        }
        // </Snippet_UploadBlobWithTags>

        // <Snippet_UploadToStream>
        public static async Task UploadToStreamAsync(
            BlobContainerClient containerClient,
            string localDirectoryPath)
        {
            string zipFileName = Path.GetFileName(
                Path.GetDirectoryName(localDirectoryPath)) + ".zip";

            BlockBlobClient blockBlobClient = containerClient.GetBlockBlobClient(zipFileName);

            using (Stream stream = await blockBlobClient.OpenWriteAsync(true))
            {
                using (ZipArchive zip = new ZipArchive(stream, ZipArchiveMode.Create, leaveOpen: false))
                {
                    foreach (var fileName in Directory.EnumerateFiles(localDirectoryPath))
                    {
                        using (var fileStream = File.OpenRead(fileName))
                        {
                            var entry = zip.CreateEntry(
                                Path.GetFileName(fileName), CompressionLevel.Optimal);
                            using (var innerFile = entry.Open())
                            {
                                await fileStream.CopyToAsync(innerFile);
                            }
                        }
                    }
                }
            }
        }
        // </Snippet_UploadToStream>

        // <Snippet_UploadBlocks>
        public static async Task UploadBlocksAsync(
            BlobContainerClient blobContainerClient,
            string localFilePath,
            int blockSize)
        {
            string fileName = Path.GetFileName(localFilePath);
            BlockBlobClient blobClient = blobContainerClient.GetBlockBlobClient(fileName);

            FileStream fileStream = File.OpenRead(localFilePath);
            ArrayList blockIDArrayList = new ArrayList();
            byte[] buffer;

            var bytesLeft = (fileStream.Length - fileStream.Position);

            while (bytesLeft > 0)
            {
                if (bytesLeft >= blockSize)
                {
                    buffer = new byte[blockSize];
                    await fileStream.ReadAsync(buffer, 0, blockSize);
                }
                else
                {
                    buffer = new byte[bytesLeft];
                    await fileStream.ReadAsync(buffer, 0, Convert.ToInt32(bytesLeft));
                    bytesLeft = (fileStream.Length - fileStream.Position);
                }

                using (var stream = new MemoryStream(buffer))
                {
                    string blockID = Convert.ToBase64String(
                        Encoding.UTF8.GetBytes(Guid.NewGuid().ToString()));

                    blockIDArrayList.Add(blockID);
                    await blobClient.StageBlockAsync(blockID, stream);
                }
                bytesLeft = (fileStream.Length - fileStream.Position);
            }

            string[] blockIDArray = (string[])blockIDArrayList.ToArray(typeof(string));

            await blobClient.CommitBlockListAsync(blockIDArray);
        }
        // </Snippet_UploadBlocks>

        // <Snippet_UploadWithChecksum>
        public static async Task UploadWithMD5Async(
            BlobContainerClient containerClient,
            string localFilePath)
        {
            string fileName = Path.GetFileName(localFilePath);
            BlobClient blobClient = containerClient.GetBlobClient(fileName);

            FileStream fileStream = File.OpenRead(localFilePath);

            // Specify the algorithm for generating a checksum to verify uploaded contents
            var uploadOptions = new BlobUploadOptions();
            uploadOptions.TransferValidation.ChecksumAlgorithm = StorageChecksumAlgorithm.Auto;

            await blobClient.UploadAsync(fileStream, uploadOptions);
            fileStream.Close();
        }
        // </Snippet_UploadWithChecksum>
    }
}
