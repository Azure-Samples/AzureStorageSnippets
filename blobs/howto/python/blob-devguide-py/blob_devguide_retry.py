from azure.identity import DefaultAzureCredential
from azure.storage.blob import BlobServiceClient, ExponentialRetry, LinearRetry

class RetrySamples(object):

    def retry_policy_default(self):
        # <Snippet_retry_default>
        # Create the BlobServiceClient object
        blob_service_client = BlobServiceClient(account_url, credential=credential, retry_total=5,
                                                retry_connect=5, retry_read=5, retry_status=5)
        # </Snippet_retry_default>

        return blob_service_client

    def retry_policy_exponential(self):
        # <Snippet_retry_exponential>
        # Specify retry policy parameters
        retry = ExponentialRetry(initial_backoff=10, increment_base=4, retry_total=3)

        # Create the BlobServiceClient object
        blob_service_client = BlobServiceClient(account_url, credential=credential, retry_policy=retry)
        # </Snippet_retry_exponential>

        return blob_service_client

    def retry_policy_linear(self):
        # <Snippet_retry_linear>
        # Specify retry policy parameters
        retry = LinearRetry(backoff=10, retry_total=3, retry_to_secondary=True)

        # Create the BlobServiceClient object
        blob_service_client = BlobServiceClient(account_url, credential=credential, retry_policy=retry)
        # </Snippet_retry_linear>

        return blob_service_client


if __name__ == '__main__':
    # TODO: Replace <storage-account-name> with your actual storage account name
    account_url = "https://<storage-account-name>.blob.core.windows.net"
    credential = DefaultAzureCredential()

    sample = RetrySamples()

    client_def = sample.retry_policy_default()
    client_exp = sample.retry_policy_exponential()
    client_lin = sample.retry_policy_linear()

    # Do something with the client

    