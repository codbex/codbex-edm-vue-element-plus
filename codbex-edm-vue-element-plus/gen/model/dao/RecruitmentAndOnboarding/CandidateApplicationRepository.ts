import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface CandidateApplicationEntity {
    readonly Id: number;
    CandidateName?: string;
    Email?: string;
    ResumeLink?: string;
    PhoneNumber?: string;
    PreferredStartDate?: Date;
    ExpectedSalary?: number;
}

export interface CandidateApplicationCreateEntity {
    readonly CandidateName?: string;
    readonly Email?: string;
    readonly ResumeLink?: string;
    readonly PhoneNumber?: string;
    readonly PreferredStartDate?: Date;
    readonly ExpectedSalary?: number;
}

export interface CandidateApplicationUpdateEntity extends CandidateApplicationCreateEntity {
    readonly Id: number;
}

export interface CandidateApplicationEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            CandidateName?: string | string[];
            Email?: string | string[];
            ResumeLink?: string | string[];
            PhoneNumber?: string | string[];
            PreferredStartDate?: Date | Date[];
            ExpectedSalary?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            CandidateName?: string | string[];
            Email?: string | string[];
            ResumeLink?: string | string[];
            PhoneNumber?: string | string[];
            PreferredStartDate?: Date | Date[];
            ExpectedSalary?: number | number[];
        };
        contains?: {
            Id?: number;
            CandidateName?: string;
            Email?: string;
            ResumeLink?: string;
            PhoneNumber?: string;
            PreferredStartDate?: Date;
            ExpectedSalary?: number;
        };
        greaterThan?: {
            Id?: number;
            CandidateName?: string;
            Email?: string;
            ResumeLink?: string;
            PhoneNumber?: string;
            PreferredStartDate?: Date;
            ExpectedSalary?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            CandidateName?: string;
            Email?: string;
            ResumeLink?: string;
            PhoneNumber?: string;
            PreferredStartDate?: Date;
            ExpectedSalary?: number;
        };
        lessThan?: {
            Id?: number;
            CandidateName?: string;
            Email?: string;
            ResumeLink?: string;
            PhoneNumber?: string;
            PreferredStartDate?: Date;
            ExpectedSalary?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            CandidateName?: string;
            Email?: string;
            ResumeLink?: string;
            PhoneNumber?: string;
            PreferredStartDate?: Date;
            ExpectedSalary?: number;
        };
    },
    $select?: (keyof CandidateApplicationEntity)[],
    $sort?: string | (keyof CandidateApplicationEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface CandidateApplicationEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<CandidateApplicationEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface CandidateApplicationUpdateEntityEvent extends CandidateApplicationEntityEvent {
    readonly previousEntity: CandidateApplicationEntity;
}

export class CandidateApplicationRepository {

    private static readonly DEFINITION = {
        table: "DEMO_CANDIDATEAPPLICATION",
        properties: [
            {
                name: "Id",
                column: "CANDIDATEAPPLICATION_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "CandidateName",
                column: "CANDIDATEAPPLICATION_CANDIDATENAME",
                type: "VARCHAR",
            },
            {
                name: "Email",
                column: "CANDIDATEAPPLICATION_EMAIL",
                type: "VARCHAR",
            },
            {
                name: "ResumeLink",
                column: "CANDIDATEAPPLICATION_RESUMELINK",
                type: "VARCHAR",
            },
            {
                name: "PhoneNumber",
                column: "CANDIDATEAPPLICATION_PHONENUMBER",
                type: "VARCHAR",
            },
            {
                name: "PreferredStartDate",
                column: "CANDIDATEAPPLICATION_PREFERREDSTARTDATE",
                type: "DATE",
            },
            {
                name: "ExpectedSalary",
                column: "CANDIDATEAPPLICATION_EXPECTEDSALARY",
                type: "INTEGER",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(CandidateApplicationRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: CandidateApplicationEntityOptions): CandidateApplicationEntity[] {
        return this.dao.list(options).map((e: CandidateApplicationEntity) => {
            EntityUtils.setDate(e, "PreferredStartDate");
            return e;
        });
    }

    public findById(id: number): CandidateApplicationEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "PreferredStartDate");
        return entity ?? undefined;
    }

    public create(entity: CandidateApplicationCreateEntity): number {
        EntityUtils.setLocalDate(entity, "PreferredStartDate");
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "DEMO_CANDIDATEAPPLICATION",
            entity: entity,
            key: {
                name: "Id",
                column: "CANDIDATEAPPLICATION_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: CandidateApplicationUpdateEntity): void {
        // EntityUtils.setLocalDate(entity, "PreferredStartDate");
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "DEMO_CANDIDATEAPPLICATION",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "CANDIDATEAPPLICATION_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: CandidateApplicationCreateEntity | CandidateApplicationUpdateEntity): number {
        const id = (entity as CandidateApplicationUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as CandidateApplicationUpdateEntity);
            return id;
        } else {
            return this.create(entity);
        }
    }

    public deleteById(id: number): void {
        const entity = this.dao.find(id);
        this.dao.remove(id);
        this.triggerEvent({
            operation: "delete",
            table: "DEMO_CANDIDATEAPPLICATION",
            entity: entity,
            key: {
                name: "Id",
                column: "CANDIDATEAPPLICATION_ID",
                value: id
            }
        });
    }

    public count(options?: CandidateApplicationEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "DEMO_CANDIDATEAPPLICATION"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: CandidateApplicationEntityEvent | CandidateApplicationUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-edm-vue-element-plus-RecruitmentAndOnboarding-CandidateApplication", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-edm-vue-element-plus-RecruitmentAndOnboarding-CandidateApplication").send(JSON.stringify(data));
    }
}
