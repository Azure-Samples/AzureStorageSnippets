# TypeScript examples for Blob Storage

This files show a variety of access methods:

* connection string
* resource name & key
* SAS token
* DefaultAzureCredential

## Install

Install dependencies with:

```bash
npm install
```

## TypeScript configuration and types

The TypeScript configuration in [tsconfig.json](./tsconfig.json) is meant to provide a starting place for you to work with Blob Storage with TypeScript. Do not infer it as an example of best practices or expected use. Every TypeScript has their own standards and practices. We assume you will change these files and the source code to meet your own needs. 

Azure SDKs provide TypeScript types within the installed package. Don't install anything from `@types/*` to work with the types provided by Azure SDKs.

## Securely accessing Blob Storage with SDK

The Azure Storage service, containers, and blobs do not need public access to run these files except when specifically called out in comment in files.

Learn more about [setting up](https://learn.microsoft.com//azure/storage/blobs/storage-blob-javascript-get-started?tabs=azure-ad) and [authenticating](https://learn.microsoft.com/azure/developer/javascript/sdk/authentication/overview?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json) to Azure Storage with the Azure SDK. 

## Anonymously access Blob Storage with SDK

Anonymous access is not considered a best practice of zero-trust and should only be used in very specific use cases. If you have to provide anonymous access, consider separating out anonymous access blobs into their own resource with migration scripts that move from your main resource, then provide SAS tokens with limited permissions and a limited start and end time for the token usage.

In order to allow [anonymous access](https://learn.microsoft.com/en-us/azure/storage/blobs/anonymous-read-access-configure?tabs=portal) to Blob Storage, you either turn on your resource for public access or you provide [SAS tokens](https://learn.microsoft.com/en-us/azure/storage/common/storage-sas-overview) which provide the access level you need. 


* connect-with-anonymous-credentials.ts


## Set up


Some Node.js files operating on containers or blobs that already exist. You can change those names to your own container and blob names, or you can create a container named `my-container` and `my-blob`. Short, sample files are available in the `./files` directory to upload.

## Run a file

These files are typically run from this folder:

```bash
# build to ./dist folder
npm run build

# run the file from this folder, not from src or dist
node ./dist./connect-with-account-name-and-key.js
```

## Success

When a file runs correctly, the last output to the console is `success`.

## Caveats

Some files work with only non-hierarical namespaces, and some files with only with hierarhical namespaces.