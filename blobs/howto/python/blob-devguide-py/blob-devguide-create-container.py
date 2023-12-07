from azure.core.exceptions import ResourceExistsError
from azure.identity import DefaultAzureCredential
from azure.storage.blob import BlobServiceClient

class ContainerSamples(object):

    # <Snippet_create_container>
    def create_blob_container(self, blob_service_client: BlobServiceClient, container_name):
        try:
            container_client = blob_service_client.create_container(name=container_name)
        except ResourceExistsError:
            print('A container with this name already exists')
    # </Snippet_create_container>

    # <Snippet_create_root_container>
    def create_blob_root_container(self, blob_service_client: BlobServiceClient):
        container_client = blob_service_client.get_container_client(container="$root")

        # Create the root container if it doesn't already exist
        if not container_client.exists():
            container_client.create_container()
    # </Snippet_create_root_container>

if __name__ == '__main__':
    # TODO: Replace <storage-account-name> with your actual storage account name
    account_url = "https://<storage-account-name>.blob.core.windows.net"
    credential = DefaultAzureCredential()

    # Create the BlobServiceClient object
    blob_service_client = BlobServiceClient(account_url, credential=credential)

    sample = ContainerSamples()
    sample.create_blob_container(blob_service_client, "sample-container")
    #sample.create_blob_root_container(blob_service_client)