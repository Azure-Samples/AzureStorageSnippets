import asyncio
from azure.storage.blob import (
    StandardBlobTier,
    RehydratePriority
)
from azure.identity.aio import DefaultAzureCredential
from azure.storage.blob.aio import (
    BlobServiceClient,
    BlobClient
)

class BlobAccessTierSamples(object):

    # <Snippet_change_blob_access_tier>
    async def change_blob_access_tier(self, blob_client: BlobClient):
        # Change the blob access tier to cool
        await blob_client.set_standard_blob_tier(StandardBlobTier.COOL)
    # </Snippet_change_blob_access_tier>

    # <Snippet_rehydrate_using_copy>
    async def rehydrate_blob_using_copy(self, source_archive_blob: BlobClient, destination_rehydrated_blob: BlobClient):
        # Note: the destination blob must have a different name than the source blob

        # Start the copy operation - specify the rehydrate priority and blob access tier
        copy_operation = dict()
        copy_operation = await destination_rehydrated_blob.start_copy_from_url(
            source_url=source_archive_blob.url,
            standard_blob_tier=StandardBlobTier.HOT,
            rehydrate_priority=RehydratePriority.STANDARD,
            requires_sync=False)
    # </Snippet_rehydrate_using_copy>

# <Snippet_create_client_async>
async def main():
    sample = BlobAccessTierSamples()

    # TODO: Replace <storage-account-name> with an actual storage account name
    account_url = "https://<storage-account-name>.blob.core.windows.net"
    credential = DefaultAzureCredential()

    async with BlobServiceClient(account_url, credential=credential) as blob_service_client:
        # Change the blob access tier to cool
        blob_client = blob_service_client.get_blob_client(container="sample-container", blob="sample-blob.txt")
        await sample.change_blob_access_tier(blob_client=blob_client)

if __name__ == '__main__':
    asyncio.run(main())
# </Snippet_create_client_async>