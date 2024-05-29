import { KnDBConnector, KnDBConfig, KnDBUtils, KnDBDialect } from "@willsofts/will-sql";

export class KnDBLibrary {

    public static getDBVersionQuery(config: KnDBConfig): string {
        let dbdialect = KnDBUtils.parseDBDialect(config.dialect);
        if(KnDBDialect.MYSQL == dbdialect) {
            return "SELECT VERSION() as versioning";
        } else if(KnDBDialect.MSSQL == dbdialect) {
            return "SELECT @@VERSION AS versioning";
        } else if(KnDBDialect.POSTGRES == dbdialect) {
            return "SELECT version() as versioning";
        } else if(KnDBDialect.ORACLE == dbdialect) {
            return "SELECT BANNER AS versioning FROM V$VERSION";
        } else if(KnDBDialect.INFORMIX == dbdialect) {
            return "SELECT DBINFO('version', 'full') as versioning FROM systables where tabname = 'systables'";
        } else if(KnDBDialect.SQLITE == dbdialect) {
            return "SELECT SQLITE_VERSION() as versioning";
        }
        return "";
    }

    public static async getDBVersion(db: KnDBConnector, config: KnDBConfig): Promise<string> {
        try {
            let sql = this.getDBVersionQuery(config);
            if(sql.trim().length > 0) {
                let rs = await db.executeQuery(sql);
                if(rs && rs.rows.length > 0) {
                    let row = rs.rows[0];
                    let keys = Object.keys(row);
                    if(keys.length > 0) {
                        return Promise.resolve(row[keys[0]]);
                    }
                }
            }
        } catch(ex) {
            console.error(ex);
        }
        return Promise.resolve("");
    }

}
