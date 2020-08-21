# <Snippet_ImportStatements>
import os, uuid
from azure.storage.queue import (
        QueueServiceClient,
        QueueClient,
        QueueMessage,
        BinaryBase64EncodePolicy,
        BinaryBase64DecodePolicy
)
# </Snippet_ImportStatements>

def add_messages(num_messages=1):
    # Add messages to the queue
    for i in range(num_messages):
        message = "Message " + str(i + 1)
        print("Sending message: " + message)
        queue_client.send_message(message)

try:
    # <Snippet_CreateQueue>
    # Retrieve the connection string from an environment variable
    connect_str = os.getenv("AZURE_STORAGE_CONNECTION_STRING")

# Create a unique name for the queue
    queue_name = "queue-" + str(uuid.uuid4())

    print("Creating queue: " + queue_name)

    # Instantiate a QueueServiceClient which will be used to create the queue
    queue_service = QueueServiceClient.from_connection_string(connect_str)

    # Instantiate a QueueClient which will be used to manipulate the queue
    queue_client = queue_service.create_queue(queue_name)
    # </Snippet_CreateQueue>

    # <Snippet_EncodeMessage>
    # Setup Base64 encoding and decoding functions
    queue_client.message_encode_policy = BinaryBase64EncodePolicy()
    queue_client.message_decode_policy = BinaryBase64DecodePolicy()
    # </Snippet_EncodeMessage>

    # <Snippet_AddMessage>
    message = u"Hello World"
    print("Adding message: " + message)
    queue_client.send_message(message)
    # </Snippet_AddMessage>

    # <Snippet_PeekMessage>
    # Peek at the first message
    messages = queue_client.peek_messages()

    for peeked_message in messages:
        print("Peeked message: " + peeked_message.content)
    # </Snippet_PeekMessage>

    # <Snippet_ChangeMessage>
    messages = queue_client.receive_messages()
    list_result = next(messages)

    message = queue_client.update_message(
            list_result.id, list_result.pop_receipt,
            visibility_timeout=0, content=u'Hello World Again')

    print("Updated message to: " + message.content)
    # </Snippet_ChangeMessage>

    add_messages(20)

    # <Snippet_GetQueueLength>
    properties = queue_client.get_queue_properties()
    count = properties.approximate_message_count
    print("Message count: " + str(count))
    # </Snippet_GetQueueLength>

    # <Snippet_DequeueMessages>
    messages = queue_client.receive_messages()

    for message in messages:
        print("Dequeueing message: " + message.content)
        queue_client.delete_message(message.id, message.pop_receipt)
    # </Snippet_DequeueMessages>

    # <Snippet_DeleteQueue>
    print("Deleting queue: " + queue_client.queue_name)
    queue_client.delete_queue()
    # </Snippet_DeleteQueue>

except Exception as ex:
    print("Exception:")
    print(ex)

