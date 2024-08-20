# <Snippet_imports>
from azure.identity import DefaultAzureCredential
from azure.storage.blob import BlobServiceClient, BlobLeaseClient 
# </Snippet_imports>

class BlobSamples(object):

    # <Snippet_acquire_blob_lease>
    def acquire_blob_lease(self, blob_service_client: BlobServiceClient, container_name):
        # Instantiate a BlobClient
        blob_client = blob_service_client.get_blob_client(container=container_name, blob="sample-blob.txt")

        # Acquire a 30-second lease on the blob
        lease_client = blob_client.acquire_lease(30)

        return lease_client
    # </Snippet_acquire_blob_lease>

    # <Snippet_renew_blob_lease>
    def renew_blob_lease(self, lease_client: BlobLeaseClient):
        # Renew a lease on a blob
        lease_client.renew()
    # </Snippet_renew_blob_lease>

    # <Snippet_release_blob_lease>
    def release_blob_lease(self, lease_client: BlobLeaseClient):
        # Release a lease on a blob
        lease_client.release()
    # </Snippet_release_blob_lease>

    # <Snippet_break_blob_lease>
    def break_blob_lease(self, lease_client: BlobLeaseClient):
        # Break a lease on a blob
        lease_client.break_lease()
    # </Snippet_break_blob_lease>

if __name__ == '__main__':
    # TODO: Replace <storage-account-name> with your actual storage account name
    account_url = "https://<storage-account-name>.blob.core.windows.net"
    credential = DefaultAzureCredential()

    # Create the BlobServiceClient object
    blob_service_client = BlobServiceClient(account_url, credential=credential)

    sample = BlobSamples()

    lease_client = sample.acquire_blob_lease(blob_service_client, "sample-container")
    sample.renew_blob_lease(lease_client)
    sample.release_blob_lease(lease_client)
    sample.break_blob_lease(lease_client)