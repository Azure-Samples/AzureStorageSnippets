# <Snippet_imports>
import asyncio
from azure.identity.aio import DefaultAzureCredential
from azure.storage.blob.aio import BlobServiceClient
# </Snippet_imports>

class BlobSamples(object):

    # <Snippet_delete_blob>
    async def delete_blob(self, blob_service_client: BlobServiceClient, container_name: str, blob_name: str):
        blob_client = blob_service_client.get_blob_client(container=container_name, blob=blob_name)
        await blob_client.delete_blob()
    # </Snippet_delete_blob>

    # <Snippet_delete_blob_snapshots>
    async def delete_blob_snapshots(self, blob_service_client: BlobServiceClient, container_name: str, blob_name: str):
        blob_client = blob_service_client.get_blob_client(container=container_name, blob=blob_name)
        await blob_client.delete_blob(delete_snapshots="include")
    # </Snippet_delete_blob_snapshots>

    # <Snippet_restore_blob>
    async def restore_blob(self, blob_service_client: BlobServiceClient, container_name: str, blob_name: str):
        blob_client = blob_service_client.get_blob_client(container=container_name, blob=blob_name)
        await blob_client.undelete_blob()
    # </Snippet_restore_blob>

    # <Snippet_restore_blob_version>
    async def restore_blob_version(self, blob_service_client: BlobServiceClient, container_name: str, blob_name: str):
        container_client = blob_service_client.get_container_client(container=container_name)

        # Get a reference to the soft-deleted base blob and list all the blob versions
        blob_client = container_client.get_blob_client(blob=blob_name)
        blob_versions = []
        async for blob in container_client.list_blobs(name_starts_with=blob_name, include=['deleted','versions']):
            blob_versions.append(blob.version_id)
        
        # Get the latest version of the soft-deleted blob
        blob_versions.sort(reverse=True)
        latest_version = blob_versions[0]

        # Build the blob URI and add the version ID as a query string
        versioned_blob_url = f"{blob_client.url}?versionId={latest_version}"

        # Restore the latest version by copying it to the base blob
        await blob_client.start_copy_from_url(versioned_blob_url)
    # </Snippet_restore_blob_version>

# <Snippet_create_client_async>
async def main():
    sample = BlobSamples()

    # TODO: Replace <storage-account-name> with your actual storage account name
    account_url = "https://<storage-account-name>.blob.core.windows.net"
    credential = DefaultAzureCredential()

    async with BlobServiceClient(account_url, credential=credential) as blob_service_client:
        await sample.delete_blob(blob_service_client, "sample-container", "sample-blob.txt")

if __name__ == '__main__':
    asyncio.run(main())
# </Snippet_create_client_async>