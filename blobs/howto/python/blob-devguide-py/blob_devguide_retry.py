from azure.identity import DefaultAzureCredential
from azure.storage.blob import BlobServiceClient, ExponentialRetry, LinearRetry

class RetrySamples(object):

    def retry_policy_exponential(self):
        # <Snippet_retry_exponential>
        # Specify retry policy parameters
        retry = ExponentialRetry(initial_backoff=10, increment_base=4, max_attempts=5)

        # Create the BlobServiceClient object
        blob_service_client = BlobServiceClient(account_url, credential=credential, retry_policy=retry)
        # </Snippet_retry_exponential>

        return blob_service_client

    def retry_policy_linear(self):
        # <Snippet_retry_linear>
        # Specify retry policy parameters
        retry = LinearRetry(backoff=10, max_attempts=5, retry_to_secondary=True)

        # Create the BlobServiceClient object
        blob_service_client = BlobServiceClient(account_url, credential=credential, retry_policy=retry)
        # </Snippet_retry_linear>
        
        return blob_service_client


if __name__ == '__main__':
    # TODO: Replace <storage-account-name> with your actual storage account name
    account_url = "https://<storage-account-name>.blob.core.windows.net"
    credential = DefaultAzureCredential()

    sample = RetrySamples()

    client_exp = sample.retry_policy_exponential()
    client_lin = sample.retry_policy_linear()

    # Do something with the client

    