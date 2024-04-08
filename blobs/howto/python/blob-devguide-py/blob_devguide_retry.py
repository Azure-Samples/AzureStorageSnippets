from azure.identity import DefaultAzureCredential
from azure.storage.blob import BlobServiceClient, ExponentialRetry, LinearRetry

class RetrySamples(object):

    def retry_policy_exponential(self):
        # Specify retry policy parameters
        retry = ExponentialRetry(initial_backoff=10, increment_base=4, max_attempts=5)

        # Create the BlobServiceClient object
        blob_service_client = BlobServiceClient(account_url, credential=credential, retry_policy=retry)

        return blob_service_client

    def retry_policy_linear(self):
        # Specify retry policy parameters
        retry = LinearRetry(backoff=10, max_attempts=5, retry_to_secondary=True)

        # Create the BlobServiceClient object
        blob_service_client = BlobServiceClient(account_url, credential=credential, retry_policy=retry)

        return blob_service_client


if __name__ == '__main__':
    # TODO: Replace <storage-account-name> with your actual storage account name
    account_url = "https://<storage-account-name>.blob.core.windows.net"
    credential = DefaultAzureCredential()

    sample = RetrySamples()

    sample.retry_policy_exponential()
    sample.retry_policy_linear()

    