# <Snippet_ImportStatements>
from azure.storage.queue import (
        QueueClient,
        BinaryBase64EncodePolicy,
        BinaryBase64DecodePolicy
)

import os, uuid
# </Snippet_ImportStatements>

def add_messages(num_messages=1):
    # Add messages to the queue
    for i in range(num_messages):
        message = "Message " + str(i + 1)
        print("Sending message: " + message)
        queue_client.send_message(message)

try:
    # <Snippet_CreateQueue>
    # Retrieve the connection string from an environment
    # variable named AZURE_STORAGE_CONNECTION_STRING
    connect_str = os.getenv("AZURE_STORAGE_CONNECTION_STRING")

    # Create a unique name for the queue
    q_name = "queue-" + str(uuid.uuid4())

    # Instantiate a QueueClient object which will
    # be used to create and manipulate the queue
    print("Creating queue: " + q_name)
    queue_client = QueueClient.from_connection_string(connect_str, q_name)

    # Create the queue
    queue_client.create_queue()
    # </Snippet_CreateQueue>

    # <Snippet_EncodeMessage>
    # Setup Base64 encoding and decoding functions
    base64_queue_client = QueueClient.from_connection_string(
                                conn_str=connect_str, queue_name=q_name,
                                message_encode_policy = BinaryBase64EncodePolicy(),
                                message_decode_policy = BinaryBase64DecodePolicy()
                            )
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

    add_messages(10)

    # <Snippet_DequeueByPage>
    messages = queue_client.receive_messages(messages_per_page=5, visibility_timeout=5*60)

    for msg_batch in messages.by_page():
       for msg in msg_batch:
          print("Batch dequeue message: " + msg.content)
          queue_client.delete_message(msg)
    # </Snippet_DequeueByPage>

    # <Snippet_DeleteQueue>
    print("Deleting queue: " + queue_client.queue_name)
    queue_client.delete_queue()
    # </Snippet_DeleteQueue>

except Exception as ex:
    print("Exception:")
    print(ex)

