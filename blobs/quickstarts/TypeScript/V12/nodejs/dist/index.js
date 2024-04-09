"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
// <snippet_ImportLibrary>
// index.js
var storage_blob_1 = require("@azure/storage-blob");
var uuid_1 = require("uuid");
require("dotenv/config");
// </snippet_ImportLibrary>
// <snippet_StorageAcctInfo_without_secrets>
var identity_1 = require("@azure/identity");
// </snippet_StorageAcctInfo_without_secrets>
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var accountName, blobServiceClient, containerName, containerClient, createContainerResponse, blobName, blockBlobClient, data, uploadBlobResponse, _a, _b, _c, blob, tempBlockBlobClient, e_1_1, downloadBlockBlobResponse, _d, _e, _f, deleteContainerResponse, err_1;
        var _g, e_1, _h, _j;
        return __generator(this, function (_k) {
            switch (_k.label) {
                case 0:
                    _k.trys.push([0, 18, , 19]);
                    accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
                    if (!accountName)
                        throw Error('Azure Storage accountName not found');
                    blobServiceClient = new storage_blob_1.BlobServiceClient("https://".concat(accountName, ".blob.core.windows.net"), new identity_1.DefaultAzureCredential());
                    // </snippet_StorageAcctInfo_create_client>
                    console.log('Azure Blob storage v12 - JavaScript quickstart sample');
                    containerName = 'quickstart' + (0, uuid_1.v1)();
                    console.log("\nCreating container...\t".concat(containerName));
                    containerClient = blobServiceClient.getContainerClient(containerName);
                    return [4 /*yield*/, containerClient.create()];
                case 1:
                    createContainerResponse = _k.sent();
                    console.log("Container was created successfully.\n\trequestId:".concat(createContainerResponse.requestId, "\n\tURL: ").concat(containerClient.url));
                    blobName = 'quickstart' + (0, uuid_1.v1)() + '.txt';
                    blockBlobClient = containerClient.getBlockBlobClient(blobName);
                    // Display blob name and url
                    console.log("\nUploading to Azure storage as blob\n\tname: ".concat(blobName, ":\n\tURL: ").concat(blockBlobClient.url));
                    data = 'Hello, World!';
                    return [4 /*yield*/, blockBlobClient.upload(data, data.length)];
                case 2:
                    uploadBlobResponse = _k.sent();
                    console.log("Blob was uploaded successfully. requestId: ".concat(uploadBlobResponse.requestId));
                    // </snippet_UploadBlobs>
                    // <snippet_ListBlobs>
                    console.log('\nListing blobs...');
                    _k.label = 3;
                case 3:
                    _k.trys.push([3, 8, 9, 14]);
                    _a = true, _b = __asyncValues(containerClient.listBlobsFlat());
                    _k.label = 4;
                case 4: return [4 /*yield*/, _b.next()];
                case 5:
                    if (!(_c = _k.sent(), _g = _c.done, !_g)) return [3 /*break*/, 7];
                    _j = _c.value;
                    _a = false;
                    blob = _j;
                    tempBlockBlobClient = containerClient.getBlockBlobClient(blob.name);
                    // Display blob name and URL
                    console.log("\n\tname: ".concat(blob.name, "\n\tURL: ").concat(tempBlockBlobClient.url, "\n"));
                    _k.label = 6;
                case 6:
                    _a = true;
                    return [3 /*break*/, 4];
                case 7: return [3 /*break*/, 14];
                case 8:
                    e_1_1 = _k.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 14];
                case 9:
                    _k.trys.push([9, , 12, 13]);
                    if (!(!_a && !_g && (_h = _b.return))) return [3 /*break*/, 11];
                    return [4 /*yield*/, _h.call(_b)];
                case 10:
                    _k.sent();
                    _k.label = 11;
                case 11: return [3 /*break*/, 13];
                case 12:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 13: return [7 /*endfinally*/];
                case 14: return [4 /*yield*/, blockBlobClient.download(0)];
                case 15:
                    downloadBlockBlobResponse = _k.sent();
                    console.log('\nDownloaded blob content...');
                    _e = (_d = console).log;
                    _f = ['\t'];
                    return [4 /*yield*/, streamToText(downloadBlockBlobResponse.readableStreamBody)];
                case 16:
                    _e.apply(_d, _f.concat([_k.sent()]));
                    // </snippet_DownloadBlobs>
                    // <snippet_DeleteContainer>
                    // Delete container
                    console.log('\nDeleting container...');
                    return [4 /*yield*/, containerClient.delete()];
                case 17:
                    deleteContainerResponse = _k.sent();
                    console.log('Container was deleted successfully. requestId: ', deleteContainerResponse.requestId);
                    return [3 /*break*/, 19];
                case 18:
                    err_1 = _k.sent();
                    if (err_1 instanceof Error) {
                        console.error("Error: ".concat(err_1.message));
                    }
                    else {
                        console.error("Unknown error: ".concat(err_1));
                    }
                    return [3 /*break*/, 19];
                case 19: return [2 /*return*/];
            }
        });
    });
}
// <snippet_ConvertStreamToText>
// Convert stream to text
function streamToText(readable) {
    return __awaiter(this, void 0, void 0, function () {
        var data, chunk, e_2_1;
        var _a, readable_1, readable_1_1;
        var _b, e_2, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    readable.setEncoding('utf8');
                    data = '';
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 6, 7, 12]);
                    _a = true, readable_1 = __asyncValues(readable);
                    _e.label = 2;
                case 2: return [4 /*yield*/, readable_1.next()];
                case 3:
                    if (!(readable_1_1 = _e.sent(), _b = readable_1_1.done, !_b)) return [3 /*break*/, 5];
                    _d = readable_1_1.value;
                    _a = false;
                    chunk = _d;
                    data += chunk;
                    _e.label = 4;
                case 4:
                    _a = true;
                    return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 12];
                case 6:
                    e_2_1 = _e.sent();
                    e_2 = { error: e_2_1 };
                    return [3 /*break*/, 12];
                case 7:
                    _e.trys.push([7, , 10, 11]);
                    if (!(!_a && !_b && (_c = readable_1.return))) return [3 /*break*/, 9];
                    return [4 /*yield*/, _c.call(readable_1)];
                case 8:
                    _e.sent();
                    _e.label = 9;
                case 9: return [3 /*break*/, 11];
                case 10:
                    if (e_2) throw e_2.error;
                    return [7 /*endfinally*/];
                case 11: return [7 /*endfinally*/];
                case 12: return [2 /*return*/, data];
            }
        });
    });
}
// </snippet_ConvertStreamToText>
// <snippet_CallMain>
main()
    .then(function () { return console.log('Done'); })
    .catch(function (ex) { return console.log(ex.message); });
// </snippet_CallMain>
//# sourceMappingURL=index.js.map