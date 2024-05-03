import vision from "@google-cloud/vision";
import { google } from "@google-cloud/vision/build/protos/protos";
import { Storage } from '@google-cloud/storage';
import { Utilities } from "@willsofts/will-util";
import fs from 'fs';

const storage = new Storage();

export class PDFDetector {
    public bucketName: string = "research-visions";

    public getFileNameFromPath(filePath: string) : string {
        if(filePath.lastIndexOf('\\') > -1) {
            return filePath.split('\\').pop() as string;
        } else {
            return filePath.split('/').pop() as string;
        }
    }

    public getNewFileName(fileName: string, settings?: {onlyTs: boolean, ext?: boolean, prefix?: string, delimiter?: string }) : string {
        let options = Object.assign({onlyTs: false, ext: true, delimiter: "_"}, settings);
        let newFileName = this.getFileNameFromPath(fileName);
        let ext = "";
        let index = newFileName.lastIndexOf('.');
        if(index > -1) {
            ext = newFileName.substring(index);
            newFileName = newFileName.substring(0, index);
        }        
        let ts = Utilities.serializeTimestamp(new Date());
        if(options.onlyTs) return (options.prefix?options.prefix + options.delimiter:"") + ts + (options.ext?ext:"");
        return newFileName + options.delimiter + ts + (options.ext?ext:"");
    }

    public async deleteFile(fileName: string) {
        const options = {
            ignoreNotFound: true
        };
        await storage.bucket(this.bucketName).file(fileName).delete(options);
        console.log(`${this.constructor.name}.deleteFile: gs://${this.bucketName}/${fileName} deleted.`);
    }
    
    public async uploadFile(localFilePath: string, newFileName?: string , destinationFolder: string = 'visions') : Promise<string> {
        if(!newFileName || newFileName.trim().length == 0) {
            newFileName = this.getFileNameFromPath(localFilePath);
        }
        const destination = destinationFolder + '/' + newFileName;
        console.log(this.constructor.name+".uploadFile: destination", destination);
        await storage.bucket(this.bucketName).upload(localFilePath, {
            destination: destination
        });
        console.log(`${this.constructor.name}.uploadFile: ${localFilePath} uploaded to ${this.bucketName}/${destination}.`);
        return destination;      
    }

    public async downloadFile(fileName: string, destFileName: string) {
        const options = {
            destination: destFileName,
        };    
        await storage.bucket(this.bucketName).file(fileName).download(options);    
        console.log(`${this.constructor.name}.downloadFile: gs://${this.bucketName}/${fileName} downloaded to ${destFileName}.`);
    }
    
    public async listFiles(destinationFolder: string = "visions") : Promise<string[]> {
        let results : string[] = [];
        const options = {
            prefix: destinationFolder+'/',
            delimiter: '/'
        };
        const [files] = await storage.bucket(this.bucketName).getFiles(options);
        console.log(this.constructor.name+".listFiles:");
        for (const file of files) {
            console.log(file.name);
            results.push(file.name);
        }
        return results;
    }

    public async detectPdfFile(pdfFileName: string, jsonFileName?: string, jsonFolderName: string = 'json') : Promise<string> {        
        if(!jsonFileName || jsonFileName.trim().length == 0) {
            jsonFileName = this.getFileNameFromPath(pdfFileName) + '.json';
        }
        const jsonFullFileName = jsonFolderName + '/' + jsonFileName;
        console.log(this.constructor.name+".detectPdfFile: pdfFileName:",pdfFileName+", jsonFullFileName:", jsonFullFileName);
        const client = new vision.ImageAnnotatorClient();
        const gcsSourceUri = `gs://${this.bucketName}/${pdfFileName}`;
        const gcsDestinationUri = `gs://${this.bucketName}/${jsonFullFileName}/`;
        const inputConfig = {
            mimeType: 'application/pdf',
            gcsSource: {
                uri: gcsSourceUri,
            }
        };
        const outputConfig = {
            gcsDestination: {
                uri: gcsDestinationUri,
            }
        };
        const features = [{type: 'DOCUMENT_TEXT_DETECTION'}];
        const request = {
            requests: [
                {
                    inputConfig: inputConfig,
                    features: features,
                    outputConfig: outputConfig,
                },
            ],
        };
        console.log(this.constructor.name+".detectPdfFile: request:",JSON.stringify(request));
        const [operation] = await client.asyncBatchAnnotateFiles(request as  google.cloud.vision.v1.IAsyncBatchAnnotateFilesRequest);
        const [filesResponse] = await operation.promise();
        if(filesResponse.responses) {
            if(filesResponse.responses[0].outputConfig && filesResponse.responses[0].outputConfig.gcsDestination) {
                const destinationUri = filesResponse.responses[0].outputConfig.gcsDestination.uri;
                console.log(this.constructor.name+".detectPdfFile: Json saved to: " + destinationUri);
             }
        }
        return jsonFullFileName;
    }
      
    public async detectText(pdfFileName: string, jsonFileName?: string, jsonFolderName: string = 'json', downloadPath: string = "./download") : Promise<string | null | undefined> {        
        let result = undefined;
        let newFileName = this.getNewFileName(pdfFileName,{onlyTs: true, prefix: 'pdf'});
        console.log(this.constructor.name+".detectText: try to upload file ...");
        let pdfFile = await this.uploadFile(pdfFileName, newFileName);
        console.log(this.constructor.name+".detectText: try to detect pdf file:",pdfFile);
        let jsonFolder = await this.detectPdfFile(pdfFile, jsonFileName, jsonFolderName);
        console.log(this.constructor.name+".detectText: try to list file from :",jsonFolder);
        let jsonFile = "";
        let downloadFileName = "";
        let jsonFiles = await this.listFiles(jsonFolder);
        console.log(this.constructor.name+".detectText: json file lists:",jsonFiles);
        if(jsonFiles.length>0) {
            jsonFile = jsonFiles[0];
            downloadFileName = downloadPath + '/' + newFileName + "_" + jsonFile.split("/").pop();
            console.log(this.constructor.name+".detectText: try to download file : ",downloadFileName);
            await this.downloadFile(jsonFile, downloadFileName);
            console.log(this.constructor.name+".detectText: try to extract json file ...");
            result = await this.extractTextFromJson(downloadFileName);
        }
        //try to remove pdf & json file after process
        if(pdfFile.length>0) { 
            this.deleteFile(pdfFile).catch((err) => {
                console.log(this.constructor.name+".detectText: deleteFile error:",err);
            });
        }
        if(jsonFile.length>0) { 
            this.deleteFile(jsonFile).catch((err) => {
                console.log(this.constructor.name+".detectText: deleteFile error:",err);
            });
        }
        if(downloadFileName.length>0) {
            fs.unlink(downloadFileName, (err) => { 
                if(err) {
                    console.log(this.constructor.name+".detectText: unlink error:",err);
                } else {
                    console.log(this.constructor.name+".detectText: "+downloadFileName+" deleted.");
                }
            });
        }
        return result;
    }
    
    public async extractTextFromJson(jsonFileName: string) : Promise<string | null | undefined> {
        console.log(this.constructor.name+".extractTextFromJson: jsonFileName:",jsonFileName);
        let result : string | null | undefined = null;
        if(fs.existsSync(jsonFileName)) {
            let filedata = fs.readFileSync(jsonFileName,'utf-8');
            let json = JSON.parse(filedata);
            let fileResponse = json as google.cloud.vision.v1.IAnnotateFileResponse;
            if(fileResponse.responses) {
                for(let response of fileResponse.responses) {
                    result = response.fullTextAnnotation?.text;
                    //console.log("text",response.fullTextAnnotation?.text);
                }
            }
        } 
        return result;         
    }

}

/*
PDF detection process:
1. Upload PDF file to Google Cloud Storage
2. Detect text from PDF file using Google Cloud Vision API
3. Download JSON file from Google Cloud Storage
4. Extract text from JSON file
*/
