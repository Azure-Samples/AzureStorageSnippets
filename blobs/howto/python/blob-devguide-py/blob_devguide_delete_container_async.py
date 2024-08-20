# <Snippet_imports>
import asyncio
from azure.identity.aio import DefaultAzureCredential
from azure.storage.blob.aio import BlobServiceClient
# </Snippet_imports>

class ContainerSamples(object):

    # <Snippet_delete_container>
    async def delete_container(self, blob_service_client: BlobServiceClient, container_name):
        container_client = blob_service_client.get_container_client(container=container_name)
        await container_client.delete_container()
    # </Snippet_delete_container>

    # <Snippet_delete_container_prefix>
    async def delete_container_prefix(self, blob_service_client: BlobServiceClient):
        async for container in blob_service_client.list_containers(name_starts_with="test-"):
            # Find containers with the specified prefix and delete
            container_client = blob_service_client.get_container_client(container=container.name)
            await container_client.delete_container()
    # </Snippet_delete_container_prefix>

    # <Snippet_restore_container>
    async def restore_deleted_container(self, blob_service_client: BlobServiceClient, container_name):
        async for container in blob_service_client.list_containers(include_deleted=True):
            # Find the deleted container and restore it
            if container.deleted and container.name == container_name:
                restored_container_client = await blob_service_client.undelete_container(
                    deleted_container_name=container.name, deleted_container_version=container.version)
    # </Snippet_restore_container>

# <Snippet_create_client_async>
async def main():
    sample = ContainerSamples()

    # TODO: Replace <storage-account-name> with your actual storage account name
    account_url = "https://<storage-account-name>.blob.core.windows.net"
    credential = DefaultAzureCredential()

    async with BlobServiceClient(account_url, credential=credential) as blob_service_client:
        await sample.delete_container(blob_service_client, "sample-container")

if __name__ == '__main__':
    asyncio.run(main())
# </Snippet_create_client_async>