from azure.identity import DefaultAzureCredential
from azure.storage.blob import BlobServiceClient, ContainerClient, BlobPrefix

class BlobSamples(object):

    # <Snippet_list_blobs_flat>
    def list_blobs_flat(self, blob_service_client: BlobServiceClient, container_name):
        container_client = blob_service_client.get_container_client(container=container_name)

        blob_list = container_client.list_blobs()

        for blob in blob_list:
            print(f"Name: {blob.name}")
    # </Snippet_list_blobs_flat>

    # <Snippet_list_blobs_flat_options>
    def list_blobs_flat_options(self, blob_service_client: BlobServiceClient, container_name):
        container_client = blob_service_client.get_container_client(container=container_name)

        blob_list = container_client.list_blobs(include=['tags'])

        for blob in blob_list:
            print(f"Name: {blob['name']}, Tags: {blob['tags']}")
    # </Snippet_list_blobs_flat_options> 

    # <Snippet_list_blobs_hierarchical>
    depth = 0
    indent = "  "
    def list_blobs_hierarchical(self, container_client: ContainerClient, prefix):
        for blob in container_client.walk_blobs(name_starts_with=prefix, delimiter='/'):
            if isinstance(blob, BlobPrefix):
                # Indentation is only added to show nesting in the output
                print(f"{self.indent * self.depth}{blob.name}")
                self.depth += 1
                self.list_blobs_hierarchical(container_client, prefix=blob.name)
                self.depth -= 1
            else:
                print(f"{self.indent * self.depth}{blob.name}")
    # </Snippet_list_blobs_hierarchical> 

if __name__ == '__main__':
    # TODO: Replace <storage-account-name> with your actual storage account name
    account_url = "https://<storage-account-name>.blob.core.windows.net"
    credential = DefaultAzureCredential()

    # Create the BlobServiceClient object
    blob_service_client = BlobServiceClient(account_url, credential=credential)

    sample = BlobSamples()

    sample.list_blobs_flat(blob_service_client, "sample-container")
    sample.list_blobs_flat_options(blob_service_client, "sample-container")

    container_client = blob_service_client.get_container_client(container="sample-container")
    sample.list_blobs_hierarchical(container_client, "")