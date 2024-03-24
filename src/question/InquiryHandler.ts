import config from "@willsofts/will-util";
import { KnModel, KnTrackingInfo } from "@willsofts/will-db";
import { KnRecordSet, KnDBConnector } from "@willsofts/will-sql";
import { HTTP } from "@willsofts/will-api";
import { KnContextInfo, KnValidateInfo, VerifyError } from "@willsofts/will-core";
import { TknOperateHandler } from '@willsofts/will-serv';

export class InquiryHandler extends TknOperateHandler {

    public progid = "Inquiry";
    public model : KnModel = { 
        name: "tquestion", 
        alias: { privateAlias: this.section }, 
    };
    public handlers = [ {name: "inquire"} ];

    public async inquire(context: KnContextInfo) : Promise<KnRecordSet> {
        return this.callFunctional(context, {operate: "inquire", raw: false}, this.doInquire);
    }

    protected override validateRequireFields(context: KnContextInfo, model: KnModel, action: string) : Promise<KnValidateInfo> {
        let vi = this.validateParameters(context.params,"query");
        if(!vi.valid) {
            return Promise.reject(new VerifyError("Parameter not found ("+vi.info+")",HTTP.NOT_ACCEPTABLE,-16061));
        }
        return Promise.resolve(vi);
    }

    public override track(context: KnContextInfo, info: KnTrackingInfo): Promise<void> {
        return Promise.resolve();
    }

    public async doInquire(context: KnContextInfo, model: KnModel = this.model) : Promise<KnRecordSet> {
        let query = context.params.query;
        return this.processInquire(query, this.section, model);
    }

    public async processInquire(query: string, section: string = this.section, model: KnModel = this.model) : Promise<KnRecordSet> {
        let db = config.has(section) ? this.getConnector(section) : this.getPrivateConnector(model);
        try {
            return this.processQuery(db, query);
        } catch(ex: any) {
            this.logger.error(this.constructor.name,ex);
            return Promise.reject(this.getDBError(ex));
        } finally {
            if(db) db.close();
        }
    }

    public async processQuery(db: KnDBConnector, query: string) : Promise<KnRecordSet> {
        let rs = await db.executeQuery(query);
        this.logger.debug(this.constructor.name+".processQuery: rs",rs);
        return this.createRecordSet(rs);
    }

}
