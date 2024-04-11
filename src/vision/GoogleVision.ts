import vision from "@google-cloud/vision";
import { google } from "@google-cloud/vision/build/protos/protos";
import { AxisInfo, PageInfo, BlockInfo, BoundInfo, InlineInfo, LinearInfo, WordInfo } from "../vision/VisionAlias";
import { VisionBase } from "../vision/VisionBase";

export class GoogleVision extends VisionBase {

    protected getWordText(word: google.cloud.vision.v1.IWord) : string {
        if(!word.symbols) return '';
        return word.symbols.map((s: google.cloud.vision.v1.ISymbol) => {
            if(s.property) {
                if(s.property.hasOwnProperty("detectedBreak")) {
                    let detectedBreak = s.property.detectedBreak;
                    if(detectedBreak && detectedBreak.type) {
                        if(detectedBreak.type == 'SPACE') return detectedBreak.isPrefix?' '+s.text:s.text+' ';
                        if(detectedBreak.type == 'EOL_SURE_SPACE') return detectedBreak.isPrefix?'\n'+s.text:s.text+'\n';
                        if(detectedBreak.type == 'LINE_BREAK') return detectedBreak.isPrefix?'\n'+s.text:s.text+'\n';
                        if(detectedBreak.type == 'HYPHEN') return detectedBreak.isPrefix?'-'+s.text:s.text+'-';
                    }
                }
            }
            return s.text;
        }).join('');
    }
    
    protected getBoundingBox(boundingBox: google.cloud.vision.v1.IBoundingPoly|null, axis: AxisInfo) : BoundInfo {
        //find out bound box that axis y is in between top and bottom
        if(boundingBox && boundingBox.vertices) {
            let topLeft = boundingBox.vertices[0] as any;
            let topRight = boundingBox.vertices[1] as any;
            let bottomRight = boundingBox.vertices[2] as any;
            let bottomLeft = boundingBox.vertices[3] as any;
            if(topLeft && topRight && bottomLeft && bottomRight) {
                if(axis.y >= topLeft.y && axis.y <= bottomLeft.y 
                    && axis.y >= topRight.y && axis.y <= bottomRight.y) {
                    let width = topRight.x - topLeft.x;
                    let height = bottomLeft.y - topLeft.y;
                    return {bounding: true, x: topLeft.x, y: topLeft.y, width: width, height: height};
                }
            }
        }
        return {bounding: false, x:0, y:0, width: 0, height:0};
    }

    public getFirstSymbol(block: BlockInfo) : google.cloud.vision.v1.ISymbol | undefined {
        let result : google.cloud.vision.v1.ISymbol | undefined = undefined;
        if(block.block.paragraphs) {
            block.block.paragraphs.every((paragraph:google.cloud.vision.v1.IParagraph) => {
                if(paragraph.words) {
                    paragraph.words.every((word:google.cloud.vision.v1.IWord) => {
                        if(word.symbols) {
                            if(word.symbols.length > 0) {
                                result = word.symbols[0];
                            }
                        }
                        return result?false:true;
                    });
                }
                return result?false:true;
            });
        }
        return result;
    }

    protected scrapeInlineParagraphs(block: google.cloud.vision.v1.IBlock, axis: AxisInfo) : void {
        if(!block.paragraphs) return;
        block.paragraphs.forEach((paragraph:google.cloud.vision.v1.IParagraph) => {
            if(paragraph.words) {
                paragraph.words.forEach((word:google.cloud.vision.v1.IWord) => {
                    this.scrapeInlineSymbols(word,axis);
                });
            }
        });
    }

    protected scrapeInlineSymbols(word: google.cloud.vision.v1.IWord, axis: AxisInfo) : void {
        if(!word.symbols) return;
        word.symbols = word.symbols.filter((s: google.cloud.vision.v1.ISymbol) => {
            if(s.boundingBox) {
                let bound = this.getBoundingBox(s.boundingBox,axis);
                if(bound.bounding) {
                    return s;
                }
            }
            return false;
        });
    }
    
    public getBlockText(block: google.cloud.vision.v1.IBlock) : string {
        let blockText = '';
        if(block.paragraphs) {
            block.paragraphs.forEach((paragraph:google.cloud.vision.v1.IParagraph) => {
                if(paragraph.words) {
                    blockText += paragraph.words.map((word:google.cloud.vision.v1.IWord) => this.getWordText(word)).join('');
                }
            });
        }
        return blockText;
    }
    
    public getBlockLists(pageInfo: PageInfo) : BlockInfo[] {
        let blocks : BlockInfo[] = [];
        if(pageInfo.pages) {
            pageInfo.pages.forEach((page: google.cloud.vision.v1.IPage) => {
                if(page.blocks) {
                    page.blocks.forEach((block: google.cloud.vision.v1.IBlock) => {
                        if(block.boundingBox && block.boundingBox.vertices) {
                            let topLeft = block.boundingBox.vertices[0] as any;
                            let topRight = block.boundingBox.vertices[1] as any;
                            let bottomLeft = block.boundingBox.vertices[3] as any;
                            let width = topRight.x - topLeft.x;
                            let height = bottomLeft.y - topLeft.y;
                            blocks.push({x: topLeft.x, y: topLeft.y, width: width, height: height, block: block});
                        }
                    });
                }
            });
        }
        return blocks;         
    }
    
    public getInlineBlocks(pageInfo: PageInfo, axis: AxisInfo) : BlockInfo[] {
        let blocks : BlockInfo[] = [];
        if(pageInfo.pages) {
            pageInfo.pages.forEach((page: google.cloud.vision.v1.IPage) => {
                if(page.blocks) {
                    page.blocks.forEach((block: google.cloud.vision.v1.IBlock) => {
                        if(block.boundingBox) {
                            let bound = this.getBoundingBox(block.boundingBox,axis);
                            if(bound.bounding) {
                                let bi = {...bound, block: structuredClone(block) };
                                this.scrapeInlineParagraphs(bi.block,axis);
                                blocks.push(bi);
                            }
                        }
                    });
                }
            });
        }
        return blocks;         
    }
    
    public async getPages(filename: string | Buffer) : Promise<PageInfo | undefined> {
        const client = new vision.ImageAnnotatorClient();
        let pageInfo = undefined;
        let [result] = await client.documentTextDetection(filename);
        const fullTextAnnotation = result.fullTextAnnotation;
        if(fullTextAnnotation && fullTextAnnotation.pages) {
            return Promise.resolve({pages: fullTextAnnotation.pages, text: fullTextAnnotation.text as string});
        }
        return Promise.resolve(pageInfo);
    }
    
    public async getInlinePages(filename: string | Buffer, axises: AxisInfo[], sorting: boolean = true) : Promise<InlineInfo[] | undefined> {
        let pageInfo = await this.getPages(filename);
        if(pageInfo) {
            return this.getInlineInfos(pageInfo,axises,sorting);
        }
        return undefined;
    }

    public getInlineInfos(pageInfo: PageInfo, axises: AxisInfo[], sorting: boolean = true) : InlineInfo[] {
        let results : InlineInfo[] = [];
        if(axises.length==1 && pageInfo.pages.length==1 && (pageInfo.pages[0].blocks && pageInfo.pages[0].blocks.length==1)) {
            let ax = axises[0];
            let blocks = this.getInlineBlocks(pageInfo,ax);
            results.push({axis: ax, blocks: blocks, texts: [pageInfo.text]});
            return results;
        }
        axises.forEach((ax: AxisInfo) => {
            let blocks = this.getInlineBlocks(pageInfo,ax);
            let texts = this.getTextLists(blocks,sorting);
            results.push({axis: ax, blocks: blocks, texts: texts});
        });
        return results;
    }

    public getTextLists(blocks: BlockInfo[], sorting: boolean = true) : string[] {
        if(blocks.length==1) return [this.getBlockText(blocks[0].block)];
        if(sorting) {
            blocks.forEach((b: BlockInfo) => { b.symbol = this.getFirstSymbol(b); });
            blocks.sort(this.sortBlocks);
        }
        return blocks.map((b: BlockInfo) => this.getBlockText(b.block));
    }

    public getTextLines(pageInfo: PageInfo, axis: AxisInfo[], sorting: boolean = true) : string[] {
        let results : string[] = [];
        let inlines = this.getInlineInfos(pageInfo,axis,sorting);
        inlines.forEach((inline: InlineInfo) => {
            results.push(inline.texts.join(''));
        });
        return results;
    }

    public getTextAlls(pageInfo: PageInfo, axis: AxisInfo[], sorting: boolean = true) : string {
        let lines = this.getTextLines(pageInfo,axis,sorting);
        return lines.join('');
    }

    public getBlockByText(blocks: BlockInfo[], text: string) : BlockInfo | undefined {
        return blocks.find((b: BlockInfo) => this.getBlockText(b.block).includes(text));
    }
    
    public async inlineTexts(filename: string | Buffer, lineHeight?: number, threshold?: number, delta?: number, sorting: boolean = true) : Promise<InlineInfo[] | undefined> {
        let pageInfo = await this.getPages(filename);
        if(pageInfo) {
            return Promise.resolve(this.inlinePages(pageInfo,lineHeight,threshold,delta,sorting));
        }
        return Promise.resolve(undefined);
    }

    public inlinePages(pageInfo: PageInfo, lineHeight?: number, threshold?: number, delta?: number, sorting: boolean = true) : InlineInfo[] {
        //using inline word is more accurate than inline block
        return this.inlinePagesByWord(pageInfo,lineHeight,threshold,delta,sorting);
    }

    public inlinePagesByBlock(pageInfo: PageInfo, lineHeight?: number, threshold?: number, delta?: number, sorting: boolean = true) : InlineInfo[] {
        let lists = this.getBlockLists(pageInfo);
        let axises = this.buildBlockLines(lists,lineHeight,threshold,delta);
        return this.getInlineInfos(pageInfo,axises,sorting);
    }

    public inlinePagesByWord(pageInfo: PageInfo, lineHeight?: number, threshold?: number, delta?: number, sorting: boolean = true) : InlineInfo[] {
        let lists = this.getWordLists(pageInfo);
        let axises = this.buildWordLines(lists,lineHeight,threshold,delta);
        return this.getInlineInfos(pageInfo,axises,sorting);
    }

    public getWordLists(pageInfo: PageInfo) : WordInfo[] {
        let words : WordInfo[] = [];
        if(pageInfo.pages) {
            pageInfo.pages.forEach((page: google.cloud.vision.v1.IPage) => {
                if(page.blocks) {
                    page.blocks.forEach((block: google.cloud.vision.v1.IBlock) => {
                        if(block.paragraphs) {
                            block.paragraphs.forEach((paragraph: google.cloud.vision.v1.IParagraph) => {
                                if(paragraph.words) {
                                    paragraph.words.forEach((word: google.cloud.vision.v1.IWord) => {
                                        if(word.boundingBox && word.boundingBox.vertices) {
                                            let topLeft = word.boundingBox.vertices[0] as any;
                                            let topRight = word.boundingBox.vertices[1] as any;
                                            let bottomLeft = word.boundingBox.vertices[3] as any;
                                            let width = topRight.x - topLeft.x;
                                            let height = bottomLeft.y - topLeft.y;
                                            words.push({x: topLeft.x, y: topLeft.y, width: width, height: height, word: word});
                                        }
                                    });
                                }
                            });
                        }            
                    });
                }
            });
        }
        return words;         
    }

    public getWordLinears(pageInfo: PageInfo) : LinearInfo[] {
        let results : LinearInfo[] = [];
        if(pageInfo && pageInfo.pages) {
            pageInfo.pages.forEach((page: google.cloud.vision.v1.IPage) => {
                if(page.blocks) {
                    page.blocks.forEach((block: google.cloud.vision.v1.IBlock) => {
                        if(block.paragraphs) {
                            block.paragraphs.forEach((paragraph:google.cloud.vision.v1.IParagraph) => {
                                if(paragraph.words && paragraph.words.length > 0) {
                                    let wordFirst = paragraph.words[0];
                                    let wordLast = paragraph.words[paragraph.words.length-1];
                                    if(wordFirst.boundingBox && wordFirst.boundingBox.vertices && wordLast.boundingBox && wordLast.boundingBox.vertices) {
                                        let topLeft = wordFirst.boundingBox.vertices[0] as any;
                                        let topRight = wordLast.boundingBox.vertices[1] as any;
                                        let slope = (topRight.y - topLeft.y) / (topRight.x - topLeft.x);
                                        let arctan = Math.atan(slope);
                                        let degree = arctan * 180 / Math.PI;
                                        results.push({first: {x: topLeft.x, y: topLeft.y}, second: {x: topRight.x, y: topRight.y}, slope: slope, arctan: arctan, degree: degree});
                                    }
                                }                               
                            });
                        }
                    });
                }
            });
        }
        return results;         
    }

    public getWordAngle(pageInfo: PageInfo) : number {
        return this.getAngleDegree(this.getWordLinears(pageInfo));
    }

}
