import asyncio
from azure.identity.aio import DefaultAzureCredential
from azure.storage.blob.aio import (
    BlobServiceClient,
    BlobClient,
)

class BlobCopySamples(object):

    # <Snippet_copy_from_azure_put_blob_from_url>
    async def copy_from_source_in_azure(self, source_blob: BlobClient, destination_blob: BlobClient):
        # Get the source blob URL and create the destination blob
        # set overwrite param to True if you want to overwrite existing blob data
        await destination_blob.upload_blob_from_url(source_url=source_blob.url, overwrite=False)
    # </Snippet_copy_from_azure_put_blob_from_url>

    # <Snippet_copy_from_external_source_put_blob_from_url>
    async def copy_from_external_source(self, source_url: str, destination_blob: BlobClient):
        # Create the destination blob from the source URL
        # set overwrite param to True if you want to overwrite existing blob data
        await destination_blob.upload_blob_from_url(source_url=source_url, overwrite=False)
    # </Snippet_copy_from_external_source_put_blob_from_url>

# <Snippet_create_client_async>
async def main():
    sample = BlobCopySamples()

    # TODO: Replace <storage-account-name> with your actual storage account name
    account_url = "https://<storage-account-name>.blob.core.windows.net"
    credential = DefaultAzureCredential()

    async with BlobServiceClient(account_url, credential=credential) as blob_service_client:
        # Copy a blob from one container to another in the same storage account
        source = blob_service_client.get_blob_client(container="source-container", blob="sample-blob.txt")
        destination = blob_service_client.get_blob_client(container="destination-container", blob="sample-blob.txt")
        await sample.copy_from_source_in_azure(source_blob=source, destination_blob=destination)

if __name__ == '__main__':
    asyncio.run(main())
# </Snippet_create_client_async>