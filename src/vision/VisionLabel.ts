import fs from 'fs';
import path from 'path';
import { InlineInfo, LabelInfo, TextInfo, TrialInfo } from '../vision/VisionAlias';

export class VisionLabel {

    public static readSetting(file: string, filepath: string = path.join(process.cwd(), "configs")) : TextInfo | undefined {
        try {
            let filename = path.resolve(filepath,file);
            let filedata = fs.readFileSync(filename,'utf-8');
            return JSON.parse(filedata) as TextInfo;
        } catch(ex) {
            console.error(ex);
        }
        return undefined;
    }

    public getMatched(text: string, info: LabelInfo) : TrialInfo {
        for(let i=0; i<info.labels.length; i++) {
            let label = info.labels[i];
            let index = text.indexOf(label);
            if(index>=0) {
                let pretext = text.substring(0,index);
                let posttext = text.substring(index+label.length);
                text = text.substring(index);
                return {matched: true, index: index, code: info.code, label: label, pretext: pretext.trim(), text: text, posttext: posttext.trim(), needed: info.type===undefined || info.type==null};
            }
        }
        return {matched: false, index: -1, code: "", label: "", pretext: "", text: text, posttext: "", needed: false};
    }

    public getAnnotated(text: string, infos: LabelInfo[]) : TrialInfo {
        for(let i=0; i<infos.length; i++) {
            let info = infos[i];
            let match = this.getMatched(text, info);
            if(match.matched) {
                return match;
            }
        }
        return {matched: false, index: -1, code: "", label: "", pretext: "", text: text, posttext: "", needed: false};
    }

    public scrapeLabelValues(inline: InlineInfo, label: LabelInfo, labelLists: LabelInfo[], results: LabelInfo[]) : TrialInfo {
        let texts = inline.texts;
        for(let j=0; j<texts.length; j++) {
            let text = texts[j].trim();
            if(text.length==0) continue;
            //console.log("J="+j+", text:["+text+"], label="+label.labels.join(","));
            let match = this.getMatched(text, label);
            //console.log("@@> match:",match);
            if(match.matched) {
                if(label.lines && label.lines>0) { 
                    if(match.posttext.length>0) {
                        if(!label.value) label.value = "";
                        let annotated = this.getAnnotated(match.posttext, labelLists);
                        //console.log("--> annotated:",annotated);
                        if(annotated.matched) {
                            if(!annotated.needed) {
                                label.value += annotated.pretext;
                                texts[j] = annotated.posttext;
                            } else {
                                label.value += annotated.pretext;
                                texts[j] = annotated.text;
                            }
                        } else {
                            label.value += match.posttext;
                            texts[j] = "";                        
                        }
                    }
                } else {
                    texts[j] = match.posttext
                    if(match.posttext.length>0) {
                        if(!label.value) label.value = "";
                        let annotated = this.getAnnotated(match.posttext, labelLists);
                        //console.log("==> annotated:",annotated);
                        if(annotated.matched) {
                            if(!annotated.needed) {
                                label.value += annotated.pretext;
                                texts[j] = annotated.posttext;
                            } else {
                                label.value += annotated.pretext;
                                texts[j] = annotated.text;
                            }
                        } else {                            
                            label.value += match.posttext;
                            texts[j] = "";
                        }
                    } else {
                        if(j+1<texts.length) {
                            if(!label.value) label.value = "";
                            let annotated = this.getAnnotated(texts[j+1], labelLists);
                            //console.log("++> annotated:",annotated);
                            if(annotated.matched) {
                                if(!annotated.needed) {
                                    label.value += annotated.pretext;
                                    texts[j+1] = annotated.posttext;
                                } else {
                                    label.value += annotated.pretext;
                                    texts[j+1] = annotated.text;
                                }
                            } else {
                                label.value += texts[j+1].trim();
                                texts[j+1] = "";
                            }
                        }
                    }
                }
                results.push(label);
                //console.log("==> push texts["+j+"]=",texts[j],",label:",label);
                return match;
            }
        }
        return {matched: false, index: -1, code: "", label: "", pretext: "", text: "", posttext: "", needed: false};
    }

    public removeTextInlines(inlines: InlineInfo[], labels: LabelInfo[]) {
        labels.forEach((label) => {
            for(let i=0; i<inlines.length; i++) {
                let inline = inlines[i];
                let texts = inline.texts;
                for(let j=0; j<texts.length; j++) {
                    let text = texts[j].trim();
                    if(text.length==0) continue;
                    let match = this.getMatched(text, label);
                    if(match.matched) {
                        texts[j] = match.posttext;
                    }
                }
            }
        });
    }

    public clearTextInlines(inlines: InlineInfo[], labels: LabelInfo[]) {
        let clearingLabels : LabelInfo[] = [];
        labels.forEach((label) => { 
            if(label.type) {
                let type = label.type.toLowerCase();
                if("title"==type || "separator"==type) {
                    clearingLabels.push(label);
                }
            }
        });        
        if(clearingLabels.length>0) {
            this.removeTextInlines(inlines, clearingLabels);    
        }
    }

    public labelInlines(inlines: InlineInfo[], labels: LabelInfo[]) : LabelInfo[] {
        let results : LabelInfo[] = [];
        let scrapeLabels : LabelInfo[] = [];
        labels.forEach((label) => { 
            if(label.type===undefined || label.type==null) {
                scrapeLabels.push(label);
            }
        });        
        this.clearTextInlines(inlines, labels);
        scrapeLabels.forEach((label) => {
            label.value = null;
            let founded = false;
            let textLines = label.lines && label.lines>0 ? label.lines : 1;
            for(let i=0; i<inlines.length; i++) {
                let inline = inlines[i];
                let texts = inline.texts;
                if(founded && textLines>1) {
                    for(let j=0; j<texts.length; j++) {
                        let text = texts[j].trim();
                        if(text.length==0) continue;
                        if(!label.value) label.value = "";
                        let annotated = this.getAnnotated(text, labels);
                        if(annotated.matched) {
                            label.value += annotated.pretext.trim().length==0?"":"\n"+annotated.pretext;
                            texts[j] = annotated.posttext;
                        } else {
                            label.value += text.length==0?"":"\n"+text;
                            texts[j] = "";                        
                        }
                    }
                    textLines--;
                    if(textLines<=1) break;
                    continue;
                }
                founded = false;
                let matched = this.scrapeLabelValues(inline, label, labels, results);
                if(matched.matched) {
                    founded = true;
                    if(textLines<=1) break;
                }
            }
        });
        //inlines.forEach((inline,index) => { console.log(index,inline.texts); });
        return results;
    }

}
