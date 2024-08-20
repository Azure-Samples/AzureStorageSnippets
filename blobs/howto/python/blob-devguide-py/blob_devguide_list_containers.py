# <Snippet_imports>
from azure.identity import DefaultAzureCredential
from azure.storage.blob import BlobServiceClient
# </Snippet_imports>

class ContainerSamples(object):

    # <Snippet_list_containers>
    def list_containers(self, blob_service_client: BlobServiceClient):
        containers = blob_service_client.list_containers(include_metadata=True)
        for container in containers:
            print(container['name'], container['metadata'])
    # </Snippet_list_containers>

    # <Snippet_list_containers_prefix>
    def list_containers_prefix(self, blob_service_client: BlobServiceClient):
        containers = blob_service_client.list_containers(name_starts_with='test-')
        for container in containers:
            print(container['name'])
    # </Snippet_list_containers_prefix>

    # <Snippet_list_containers_pages>
    def list_containers_pages(self, blob_service_client: BlobServiceClient):
        i=0
        all_pages = blob_service_client.list_containers(results_per_page=5).by_page()
        for container_page in all_pages:
            i += 1
            print(f"Page {i}")
            for container in container_page:
                print(container['name'])
    # </Snippet_list_containers_pages>

if __name__ == '__main__':
    # TODO: Replace <storage-account-name> with your actual storage account name
    account_url = "https://<storage-account-name>.blob.core.windows.net"
    credential = DefaultAzureCredential()

    # Create the BlobServiceClient object
    blob_service_client = BlobServiceClient(account_url, credential=credential)

    sample = ContainerSamples()
    sample.list_containers(blob_service_client)
    sample.list_containers_prefix(blob_service_client)
    sample.list_containers_pages(blob_service_client)
    