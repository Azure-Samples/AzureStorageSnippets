# <Snippet_imports>
from azure.identity import DefaultAzureCredential
from azure.storage.blob import BlobServiceClient
# </Snippet_imports>

class ContainerSamples(object):

    # <Snippet_get_container_properties>
    def get_properties(self, blob_service_client: BlobServiceClient, container_name):
        container_client = blob_service_client.get_container_client(container=container_name)

        properties = container_client.get_container_properties()

        print(f"Public access type: {properties.public_access}")
        print(f"Lease status: {properties.lease.status}")
        print(f"Lease state: {properties.lease.state}")
        print(f"Has immutability policy: {properties.has_immutability_policy}")
    # </Snippet_get_container_properties>

    # <Snippet_set_container_metadata>
    def set_metadata(self, blob_service_client: BlobServiceClient, container_name):
        container_client = blob_service_client.get_container_client(container=container_name)

        # Retrieve existing metadata, if desired
        metadata = container_client.get_container_properties().metadata

        more_metadata = {'docType': 'text', 'docCategory': 'reference'}
        metadata.update(more_metadata)

        # Set metadata on the container
        container_client.set_container_metadata(metadata=metadata)
    # </Snippet_set_container_metadata>

    # <Snippet_get_container_metadata>
    def get_metadata(self, blob_service_client: BlobServiceClient, container_name):
        container_client = blob_service_client.get_container_client(container=container_name)

        # Retrieve existing metadata, if desired
        metadata = container_client.get_container_properties().metadata

        for k, v in metadata.items():
            print(k, v)
    # </Snippet_get_container_metadata>

if __name__ == '__main__':
    # TODO: Replace <storage-account-name> with your actual storage account name
    account_url = "https://<storage-account-name>.blob.core.windows.net"
    credential = DefaultAzureCredential()

    # Create the BlobServiceClient object
    blob_service_client = BlobServiceClient(account_url, credential=credential)

    sample = ContainerSamples()
    sample.get_properties(blob_service_client, "sample-container")
    sample.set_metadata(blob_service_client, "sample-container")
    sample.get_metadata(blob_service_client, "sample-container")