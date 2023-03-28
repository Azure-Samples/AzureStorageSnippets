using Azure;
using System.Reflection.Metadata;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Blobs.Specialized;

namespace BlobDevGuideBlobs
{
    class PutBlockFromURL
    {
        // <Snippet_CopyWithinAccount_PutBlockFromURL>
        //-------------------------------------------------
        // Copy a blob from the same storage account
        //-------------------------------------------------
        public static async Task CopyWithinStorageAccountAsync(
            BlobClient sourceBlob,
            BlockBlobClient destinationBlob)
        {
            string blockID = "";
            string[] commitList = Array.Empty<string>();

            // Get the source blob URI and 
            await destinationBlob.StageBlockFromUriAsync(sourceBlob.Uri, blockID);
            _ = commitList.Append(blockID);

            Response<BlobContentInfo> response = await destinationBlob.CommitBlockListAsync(commitList);
        }
        // </Snippet_CopyWithinAccount_PutBlockFromURL>

        // <Snippet_CopyAcrossAccounts_PutBlockFromURL>
        //-------------------------------------------------
        // Copy a blob from the same storage account
        //-------------------------------------------------
        //public static async Task CopyAcrossStorageAccountsAsync(
        //    BlobClient sourceBlob,
        //    BlockBlobClient destinationBlob)
        //{
        //    // Get the source blob URI and 
        //    await destinationBlob.StageBlockFromUriAsync(sourceBlob.Uri);
        //}
        // </Snippet_CopyAcrossAccounts_PutBlockFromURL>
    }
}
