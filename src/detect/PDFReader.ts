import fs from 'fs';
import PdfParse from 'pdf-parse';

export class PDFReader {

    protected renderPage(pageData: any) {
        let render_options = {
            normalizeWhitespace: false,
            disableCombineTextItems: false
        };      
        return pageData.getTextContent(render_options).then(function(textContent: any) {
            let lastY, text = '';
            for (let item of textContent.items) {
                if (lastY == item.transform[5] || !lastY){
                    text += " "+item.str;
                }  
                else{
                    text += '\n' + item.str;
                }    
                lastY = item.transform[5];
            }
            return text;
        });
    }
      
    public async detectText(filePath: string) : Promise<any> {
        const dataBuffer = fs.readFileSync(filePath);
        return this.extractText(dataBuffer);
    }

    public async extractText(dataBuffer: Buffer) : Promise<any> {
        let options = {
            pagerender: this.renderPage
        }                
        const pdfData = await PdfParse(dataBuffer, options);
        return Promise.resolve(pdfData);
    }

}
