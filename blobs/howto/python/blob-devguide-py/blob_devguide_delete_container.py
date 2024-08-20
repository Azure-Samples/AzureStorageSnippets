# <Snippet_imports>
from azure.identity import DefaultAzureCredential
from azure.storage.blob import BlobServiceClient
# </Snippet_imports>

class ContainerSamples(object):

    # <Snippet_delete_container>
    def delete_container(self, blob_service_client: BlobServiceClient, container_name):
        container_client = blob_service_client.get_container_client(container=container_name)
        container_client.delete_container()
    # </Snippet_delete_container>

    # <Snippet_delete_container_prefix>
    def delete_container_prefix(self, blob_service_client: BlobServiceClient):
        container_list = list(blob_service_client.list_containers(name_starts_with="test-"))
        assert len(container_list) >= 1

        for container in container_list:
            # Find containers with the specified prefix and delete
            container_client = blob_service_client.get_container_client(container=container.name)
            container_client.delete_container()
    # </Snippet_delete_container_prefix>

    # <Snippet_restore_container>
    def restore_deleted_container(self, blob_service_client: BlobServiceClient, container_name):
        container_list = list(
            blob_service_client.list_containers(include_deleted=True))
        assert len(container_list) >= 1

        for container in container_list:
            # Find the deleted container and restore it
            if container.deleted and container.name == container_name:
                restored_container_client = blob_service_client.undelete_container(
                    deleted_container_name=container.name, deleted_container_version=container.version)
    # </Snippet_restore_container>

if __name__ == '__main__':
    # TODO: Replace <storage-account-name> with your actual storage account name
    account_url = "https://<storage-account-name>.blob.core.windows.net"
    credential = DefaultAzureCredential()

    # Create the BlobServiceClient object
    blob_service_client = BlobServiceClient(account_url, credential=credential)

    sample = ContainerSamples()

    sample.delete_container(blob_service_client, "sample-container")
    #sample.delete_container(blob_service_client, "$root")
    #sample.restore_deleted_container(blob_service_client, "sample-container")