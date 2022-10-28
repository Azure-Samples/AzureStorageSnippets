const { BlobServiceClient } = require("@azure/storage-blob");
const { v1: uuidv1 } = require("uuid");
require("dotenv").config();

async function main() {
  try {
    console.log("Azure Blob storage v12 - JavaScript quickstart sample");

    // Quick start code goes here



  } catch (err) {
    console.err(`Error: ${err.message}`);
  }
}

main()
  .then(() => console.log("Done"))
  .catch((ex) => console.log(ex.message));
