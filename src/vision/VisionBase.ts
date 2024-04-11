import { AxisInfo, BlockInfo, InlineInfo, PageInfo, LinearInfo, WordInfo } from "../vision/VisionAlias";
import fs from 'fs';

export class VisionBase {

    public getAverageBlockHeights(blocks: BlockInfo[]) : number {
        let array = blocks.map((b: BlockInfo) => b.height);
        let total = array.reduce((acc,cur) => acc + cur,0);
        return blocks.length == 0 ? 0 : total/blocks.length;
    }

    public getAverageBlockWidths(blocks: BlockInfo[]) : number {
        let array = blocks.map((b: BlockInfo) => b.width);
        let total = array.reduce((acc,cur) => acc + cur,0);
        return blocks.length == 0 ? 0 : total/blocks.length;
    }

    public getAverageWordHeights(words: WordInfo[]) : number {
        let array = words.map((w: WordInfo) => w.height);
        let total = array.reduce((acc,cur) => acc + cur,0);
        return words.length == 0 ? 0 : total/words.length;
    }

    public getAverageWordWidths(words: WordInfo[]) : number {
        let array = words.map((w: WordInfo) => w.width);
        let total = array.reduce((acc,cur) => acc + cur,0);
        return words.length == 0 ? 0 : total/words.length;
    }
    
    public getAngleDegree(linears: LinearInfo[]) : number {
        if(linears.length == 0) return 0;
        let total = linears.length;
        linears = linears.filter((linear) => {
            return linear.degree != 0;
        });
        //if number of zero linears greater than or equal half of total then return 0 (no angle detected)
        let differ = Math.round(total/2);
        //console.log("total:",total,", differ:",differ,", linears:",linears.length);
        if(linears.length <= differ) return 0;
        let positives = linears.filter((linear) => {
            return linear.degree > 0;
        });
        let negatives = linears.filter((linear) => {
            return linear.degree < 0;
        });
        if(positives.length > 0 && positives.length >= negatives.length) {
            let sum_positive = positives.reduce((sum,linear) => {
                return sum + linear.degree;
            },0);
            return sum_positive / positives.length;
        }
        if(negatives.length > 0) {
            let sum_negative = negatives.reduce((sum,linear) => {
                return sum + linear.degree;
            },0);
            return sum_negative / negatives.length;
        }
        return 0;
    }

    public getInlineTexts(inlines: InlineInfo[]) : string {
        return inlines.map((inline: InlineInfo) => inline.texts.join('')).join('');
    }

    public async loadPages(filename: string) : Promise<PageInfo | undefined> {
        let pages = undefined
        if(fs.existsSync(filename)) {
            let filedata = fs.readFileSync(filename,'utf-8');
            return JSON.parse(filedata);
        }
        return pages;
    }

    public buildThresholds(data: number[], threshold: number = 12) : number[] {
        //try to get rid of noises by threshold and using average value from noise instead
        //ex. [53, 86, 132, 133, 136, 156, 175, 176, 179, 180, 197] => [53, 86, 134, 156, 176, 197]
        threshold = Math.trunc(threshold);
        let result = [];
        let temp = [data[0]];        
        for (let i = 1; i < data.length; i++) {
            if (Math.abs(data[i] - temp[0]) <= threshold) {
                temp.push(data[i]);
            } else {
                let avg = temp.reduce((a, b) => a + b, 0) / temp.length;
                result.push(Math.round(avg));
                temp = [data[i]];
            }
        }        
        if (temp.length > 0) {
            let avg = temp.reduce((a, b) => a + b, 0) / temp.length;
            result.push(Math.round(avg));
        }        
        return result;
    }

    public buildLines(blocks: BlockInfo[] | WordInfo[], lineHeight?: number, threshold?: number, delta?: number) : AxisInfo[] {
        if(blocks.length>0 && blocks[0].hasOwnProperty('word')) {
            return this.buildWordLines(blocks as WordInfo[],lineHeight,threshold,delta);
        }
        return this.buildBlockLines(blocks as BlockInfo[],lineHeight,threshold,delta);
    }

    public buildBlockLines(blocks: BlockInfo[], lineHeight?: number, threshold?: number, delta?: number) : AxisInfo[] {
        if(!lineHeight) lineHeight = Math.round(this.getAverageBlockHeights(blocks));
        //get only y axises
        let yAxises = blocks.map((block) => block.y);
        //sort ascending
        yAxises.sort((a,b) => a - b);
        //remove duplicates
        yAxises = yAxises.filter((item,index,array) => !index || item !== array[index - 1]);
        //if not defined threshold, use half of line height
        if(!threshold) threshold = lineHeight/2;
        yAxises = this.buildThresholds(yAxises,threshold);        
        //if not defined delta, use quarter of line height
        let q = delta?delta:Math.round(lineHeight/4);
        yAxises = yAxises.map((y) => y + q);
        let axises : AxisInfo[] = [];
        yAxises.forEach((y) => {
            let axis = {x:0,y:y};
            axises.push(axis);
        });
        return axises;
    }

    public buildWordLines(words: WordInfo[], lineHeight?: number, threshold?: number, delta?: number) : AxisInfo[] {
        if(!lineHeight) lineHeight = Math.round(this.getAverageWordHeights(words));
        //get only y axises
        let yAxises = words.map((word) => word.y);
        //sort ascending
        yAxises.sort((a,b) => a - b);
        //remove duplicates
        yAxises = yAxises.filter((item,index,array) => !index || item !== array[index - 1]);
        //if not defined threshold, use half of line height
        if(!threshold) threshold = lineHeight/2;
        yAxises = this.buildThresholds(yAxises,threshold);        
        //if not defined delta, use quarter of line height
        let q = delta?delta:Math.round(lineHeight/4);
        yAxises = yAxises.map((y) => y + q);
        let axises : AxisInfo[] = [];
        yAxises.forEach((y) => {
            let axis = {x:0,y:y};
            axises.push(axis);
        });
        return axises;
    }

    public sortBlocks(box1: BlockInfo, box2: BlockInfo) : number {
        let s1 = box1.symbol;
        let s2 = box2.symbol;
        if(s1 && s2) {
            let sb1 = s1.boundingBox as any;
            let sb2 = s2.boundingBox as any;
            let leftTop1 = sb1.vertices[0];
            let leftTop2 = sb2.vertices[0];
            if(leftTop1.x < leftTop2.x) return -1;
            if(leftTop1.x > leftTop2.x) return 1;
            return 0;
        }
        let b1 = box1 as any;
        let b2 = box2 as any;
        let leftTop1 = b1.block.boundingBox.vertices[0];
        let leftTop2 = b2.block.boundingBox.vertices[0];
        if(leftTop1.x < leftTop2.x) return -1;
        if(leftTop1.x > leftTop2.x) return 1;
        return 0;
    }
    
}
