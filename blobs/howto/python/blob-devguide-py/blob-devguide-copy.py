import time
from azure.identity import DefaultAzureCredential
from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient, BlobLeaseClient

class BlobCopySamples(object):

    def copy_from_source_in_azure(self, source_blob: BlobClient, destination_blob: BlobClient):
        # Get the source blob URL and create the destination blob
        # set overwrite param to True if you want to overwrite existing blob data
        destination_blob.upload_blob_from_url(source_url=source_blob.primary_endpoint.url, overwrite=False)

    def copy_from_external_source(self, source_url: str, destination_blob: BlobClient):
        # Create the destination blob from the source URL
        # set overwrite param to True if you want to overwrite existing blob data
        destination_blob.upload_blob_from_url(source_url=source_url, overwrite=False)

    # <Snippet_copy_blob_from_azure>
    def copy_from_source_in_azure_async(self, source_blob: BlobClient, destination_blob: BlobClient):
        # Lease the source blob during copy to prevent other clients from modifying it
        lease = BlobLeaseClient(client=source_blob)

        # Create an infinite lease by passing -1 as the lease duration
        lease.acquire(lease_duration=-1)

        # Start the copy operation - specify False for the require_sync parameter
        copy_operation = dict()
        copy_operation = destination_blob.start_copy_from_url(source_url=source_blob.url, requires_sync=False)
        
        # If start_copy_from_url returns copy_status of 'pending', the operation has been started asynchronously
        # Let's wait for the copy operation to complete
        if copy_operation['copy_status'] == 'pending':
            self.wait_for_copy(destination_blob)

        # Release the lease on the source blob
        lease.break_lease()

    def wait_for_copy(self, destination_blob: BlobClient):
        # Get the destination blob properties
        copy_status = destination_blob.get_blob_properties().copy.status

        # Check the copy status and wait if pending
        if copy_status == 'pending':
            count = 0
            # Check the destination blob copy status every 5 seconds, as an example
            while copy_status == 'pending':
                count = count + 1
                # Poll the copy status a certain number of times before taking other actions
                if count > 10:
                    # Alert the user or abort the copy operation
                    break
                time.sleep(5)
                copy_status = destination_blob.get_blob_properties().copy.status
    # </Snippet_copy_blob_from_azure>

    # <Snippet_copy_blob_within_storage_account>
    def copy_blob_within_storage_account(self, source_blob: BlobClient, destination_blob: BlobClient):
        # Lease the source blob during copy to prevent other clients from modifying it
        lease = BlobLeaseClient(client=source_blob)

        # Create an infinite lease by passing -1 as the lease duration
        lease.break_lease()
        lease.acquire(lease_duration=-1)

        # Start the copy operation - specify False for the require_sync parameter
        copy_operation = dict()
        copy_operation = destination_blob.start_copy_from_url(source_url=source_blob.url, requires_sync=False)
        
        # Wait for the copy operation to complete
        # If start_copy_from_url returns copy_status of 'pending', the operation has been started asynchronously
        if copy_operation['copy_status'] == 'pending':
            print(f"Copy operation has been started asynchronously")

            count = 0
            copy_status = destination_blob.get_blob_properties().copy.status
            # Check the destination blob copy status every 5 seconds
            while copy_status == 'pending':
                count = count + 1
                # Poll the copy status a certain number of times before taking other actions
                if count > 10:
                    # Alert the user or abort the copy operation
                    break
                time.sleep(5)
                copy_status = destination_blob.get_blob_properties().copy.status

        # Release the lease on the source blob
        lease.break_lease()
    # </Snippet_copy_blob_within_storage_account>

    # <Snippet_abort_copy>
    def abort_copy(self, blob_service_client: BlobServiceClient):
        # Get the destination blob and its properties
        destination_blob = blob_service_client.get_blob_client(container="destination-container", blob="sample-blob.txt")
        destination_blob_properties = destination_blob.get_blob_properties()

        # Check the copy status and abort if pending
        if destination_blob_properties.copy.status == 'pending':
            destination_blob.abort_copy(destination_blob_properties.copy.id)
            print(f"Copy operation {destination_blob_properties.copy.id} has been aborted")
    # </Snippet_abort_copy>

if __name__ == '__main__':
    # TODO: Replace <storage-account-name> with your actual storage account name
    account_url = "https://pjstorageaccounttest.blob.core.windows.net"
    credential = DefaultAzureCredential()

    # Create the BlobServiceClient object
    blob_service_client = BlobServiceClient(account_url, credential=credential)

    sample = BlobCopySamples()

    source = blob_service_client.get_blob_client(container="source-container", blob="sample-blob.txt")
    destination = blob_service_client.get_blob_client(container="destination-container", blob="sample-blob.txt")
    sample.copy_blob_within_storage_account(source_blob=source, destination_blob=destination)
    #sample.abort_copy(blob_service_client)