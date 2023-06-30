from azure.identity import DefaultAzureCredential
from azure.storage.blob import (
    BlobServiceClient,
    BlobClient,
    StandardBlobTier,
    RehydratePriority
)

class BlobAccessTierSamples(object):

    # <Snippet_rehydrate_using_copy>
    def rehydrate_blob_using_copy(self, source_archive_blob: BlobClient, destination_rehydrated_blob: BlobClient):
        # Note: the destination blob must have a different name than the source blob

        # Start the copy operation - specify the rehydrate priority and blob access tier
        copy_operation = dict()
        copy_operation = destination_rehydrated_blob.start_copy_from_url(
            source_url=source_archive_blob.url,
            standard_blob_tier=StandardBlobTier.HOT,
            rehydrate_priority=RehydratePriority.STANDARD,
            requires_sync=False)
    # </Snippet_rehydrate_using_copy>

if __name__ == '__main__':
    # TODO: Replace <storage-account-name> with an actual storage account name
    account_url = "https://<storage-account-name>.blob.core.windows.net"
    credential = DefaultAzureCredential()

    # Create the BlobServiceClient object
    blob_service_client = BlobServiceClient(account_url, credential=credential)

    sample = BlobAccessTierSamples()

    # Rehydrate a blob using copy operation
    source = blob_service_client.get_blob_client(container="sample-container", blob="sample-blob-archive.txt")
    destination = blob_service_client.get_blob_client(container="sample-container", blob="sample-blob-rehydrated-py.txt")
    sample.rehydrate_blob_using_copy(source_archive_blob=source, destination_rehydrated_blob=destination)