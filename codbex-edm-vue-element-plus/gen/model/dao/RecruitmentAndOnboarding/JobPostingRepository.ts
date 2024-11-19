import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface JobPostingEntity {
    readonly Id: number;
    JobTitle?: string;
    JobDescription?: string;
    Department?: number;
    PostingDate?: Date;
    ApplicationDeadline?: Date;
    RemoteOption?: boolean;
}

export interface JobPostingCreateEntity {
    readonly JobTitle?: string;
    readonly JobDescription?: string;
    readonly Department?: number;
    readonly PostingDate?: Date;
    readonly ApplicationDeadline?: Date;
    readonly RemoteOption?: boolean;
}

export interface JobPostingUpdateEntity extends JobPostingCreateEntity {
    readonly Id: number;
}

export interface JobPostingEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            JobTitle?: string | string[];
            JobDescription?: string | string[];
            Department?: number | number[];
            PostingDate?: Date | Date[];
            ApplicationDeadline?: Date | Date[];
            RemoteOption?: boolean | boolean[];
        };
        notEquals?: {
            Id?: number | number[];
            JobTitle?: string | string[];
            JobDescription?: string | string[];
            Department?: number | number[];
            PostingDate?: Date | Date[];
            ApplicationDeadline?: Date | Date[];
            RemoteOption?: boolean | boolean[];
        };
        contains?: {
            Id?: number;
            JobTitle?: string;
            JobDescription?: string;
            Department?: number;
            PostingDate?: Date;
            ApplicationDeadline?: Date;
            RemoteOption?: boolean;
        };
        greaterThan?: {
            Id?: number;
            JobTitle?: string;
            JobDescription?: string;
            Department?: number;
            PostingDate?: Date;
            ApplicationDeadline?: Date;
            RemoteOption?: boolean;
        };
        greaterThanOrEqual?: {
            Id?: number;
            JobTitle?: string;
            JobDescription?: string;
            Department?: number;
            PostingDate?: Date;
            ApplicationDeadline?: Date;
            RemoteOption?: boolean;
        };
        lessThan?: {
            Id?: number;
            JobTitle?: string;
            JobDescription?: string;
            Department?: number;
            PostingDate?: Date;
            ApplicationDeadline?: Date;
            RemoteOption?: boolean;
        };
        lessThanOrEqual?: {
            Id?: number;
            JobTitle?: string;
            JobDescription?: string;
            Department?: number;
            PostingDate?: Date;
            ApplicationDeadline?: Date;
            RemoteOption?: boolean;
        };
    },
    $select?: (keyof JobPostingEntity)[],
    $sort?: string | (keyof JobPostingEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface JobPostingEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<JobPostingEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface JobPostingUpdateEntityEvent extends JobPostingEntityEvent {
    readonly previousEntity: JobPostingEntity;
}

export class JobPostingRepository {

    private static readonly DEFINITION = {
        table: "DEMO_JOBPOSTING",
        properties: [
            {
                name: "Id",
                column: "JOBPOSTING_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "JobTitle",
                column: "JOBPOSTING_JOBTITLE",
                type: "VARCHAR",
            },
            {
                name: "JobDescription",
                column: "JOBPOSTING_JOBDESCRIPTION",
                type: "VARCHAR",
            },
            {
                name: "Department",
                column: "JOBPOSTING_DEPARTMENT",
                type: "INTEGER",
            },
            {
                name: "PostingDate",
                column: "JOBPOSTING_POSTINGDATE",
                type: "DATE",
            },
            {
                name: "ApplicationDeadline",
                column: "JOBPOSTING_APPLICATIONDEADLINE",
                type: "DATE",
            },
            {
                name: "RemoteOption",
                column: "JOBPOSTING_REMOTEOPTION",
                type: "BOOLEAN",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(JobPostingRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: JobPostingEntityOptions): JobPostingEntity[] {
        return this.dao.list(options).map((e: JobPostingEntity) => {
            EntityUtils.setDate(e, "PostingDate");
            EntityUtils.setDate(e, "ApplicationDeadline");
            EntityUtils.setBoolean(e, "RemoteOption");
            return e;
        });
    }

    public findById(id: number): JobPostingEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "PostingDate");
        EntityUtils.setDate(entity, "ApplicationDeadline");
        EntityUtils.setBoolean(entity, "RemoteOption");
        return entity ?? undefined;
    }

    public create(entity: JobPostingCreateEntity): number {
        EntityUtils.setLocalDate(entity, "PostingDate");
        EntityUtils.setLocalDate(entity, "ApplicationDeadline");
        EntityUtils.setBoolean(entity, "RemoteOption");
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "DEMO_JOBPOSTING",
            entity: entity,
            key: {
                name: "Id",
                column: "JOBPOSTING_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: JobPostingUpdateEntity): void {
        // EntityUtils.setLocalDate(entity, "PostingDate");
        // EntityUtils.setLocalDate(entity, "ApplicationDeadline");
        EntityUtils.setBoolean(entity, "RemoteOption");
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "DEMO_JOBPOSTING",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "JOBPOSTING_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: JobPostingCreateEntity | JobPostingUpdateEntity): number {
        const id = (entity as JobPostingUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as JobPostingUpdateEntity);
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
            table: "DEMO_JOBPOSTING",
            entity: entity,
            key: {
                name: "Id",
                column: "JOBPOSTING_ID",
                value: id
            }
        });
    }

    public count(options?: JobPostingEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "DEMO_JOBPOSTING"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: JobPostingEntityEvent | JobPostingUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-edm-vue-element-plus-RecruitmentAndOnboarding-JobPosting", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-edm-vue-element-plus-RecruitmentAndOnboarding-JobPosting").send(JSON.stringify(data));
    }
}
