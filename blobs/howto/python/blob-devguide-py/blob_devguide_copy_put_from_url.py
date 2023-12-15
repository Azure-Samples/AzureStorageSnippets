from azure.identity import DefaultAzureCredential
from azure.storage.blob import (
    BlobServiceClient,
    BlobClient,
)

class BlobCopySamples(object):

    # <Snippet_copy_from_azure_put_blob_from_url>
    def copy_from_source_in_azure(self, source_blob: BlobClient, destination_blob: BlobClient):
        # Get the source blob URL and create the destination blob
        # set overwrite param to True if you want to overwrite existing blob data
        destination_blob.upload_blob_from_url(source_url=source_blob.url, overwrite=False)
    # </Snippet_copy_from_azure_put_blob_from_url>

    # <Snippet_copy_from_external_source_put_blob_from_url>
    def copy_from_external_source(self, source_url: str, destination_blob: BlobClient):
        # Create the destination blob from the source URL
        # set overwrite param to True if you want to overwrite existing blob data
        destination_blob.upload_blob_from_url(source_url=source_url, overwrite=False)
    # </Snippet_copy_from_external_source_put_blob_from_url>

if __name__ == '__main__':
    # TODO: Replace <storage-account-name> with your actual storage account name
    account_url = "https://<storage-account-name>.blob.core.windows.net"
    credential = DefaultAzureCredential()

    # Create the BlobServiceClient object
    blob_service_client = BlobServiceClient(account_url, credential=credential)

    sample = BlobCopySamples()

    # Copy a blob from one container to another in the same storage account
    source = blob_service_client.get_blob_client(container="source-container", blob="sample-blob.txt")
    destination = blob_service_client.get_blob_client(container="destination-container", blob="sample-blob.txt")
    sample.copy_from_source_in_azure(source_blob=source, destination_blob=destination)

    # Copy a blob from an external source to a blob
    source_url = "<source-url>"
    destination = blob_service_client.get_blob_client(container="destination-container", blob="sample-blob-ext.txt")
    sample.copy_from_external_source(source_url=source_url, destination_blob=destination)