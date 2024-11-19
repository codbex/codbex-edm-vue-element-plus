import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface PerformanceReviewEntity {
    readonly Id: number;
    EmployeeName?: string;
    ReviewPeriod?: Date;
    ReviewDate?: Date;
    Rating?: number;
    Comments?: string;
}

export interface PerformanceReviewCreateEntity {
    readonly EmployeeName?: string;
    readonly ReviewPeriod?: Date;
    readonly ReviewDate?: Date;
    readonly Rating?: number;
    readonly Comments?: string;
}

export interface PerformanceReviewUpdateEntity extends PerformanceReviewCreateEntity {
    readonly Id: number;
}

export interface PerformanceReviewEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            EmployeeName?: string | string[];
            ReviewPeriod?: Date | Date[];
            ReviewDate?: Date | Date[];
            Rating?: number | number[];
            Comments?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            EmployeeName?: string | string[];
            ReviewPeriod?: Date | Date[];
            ReviewDate?: Date | Date[];
            Rating?: number | number[];
            Comments?: string | string[];
        };
        contains?: {
            Id?: number;
            EmployeeName?: string;
            ReviewPeriod?: Date;
            ReviewDate?: Date;
            Rating?: number;
            Comments?: string;
        };
        greaterThan?: {
            Id?: number;
            EmployeeName?: string;
            ReviewPeriod?: Date;
            ReviewDate?: Date;
            Rating?: number;
            Comments?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            EmployeeName?: string;
            ReviewPeriod?: Date;
            ReviewDate?: Date;
            Rating?: number;
            Comments?: string;
        };
        lessThan?: {
            Id?: number;
            EmployeeName?: string;
            ReviewPeriod?: Date;
            ReviewDate?: Date;
            Rating?: number;
            Comments?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            EmployeeName?: string;
            ReviewPeriod?: Date;
            ReviewDate?: Date;
            Rating?: number;
            Comments?: string;
        };
    },
    $select?: (keyof PerformanceReviewEntity)[],
    $sort?: string | (keyof PerformanceReviewEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface PerformanceReviewEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<PerformanceReviewEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface PerformanceReviewUpdateEntityEvent extends PerformanceReviewEntityEvent {
    readonly previousEntity: PerformanceReviewEntity;
}

export class PerformanceReviewRepository {

    private static readonly DEFINITION = {
        table: "DEMO_PERFORMANCEREVIEW",
        properties: [
            {
                name: "Id",
                column: "PERFORMANCEREVIEW_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "EmployeeName",
                column: "PERFORMANCEREVIEW_EMPLOYEENAME",
                type: "VARCHAR",
            },
            {
                name: "ReviewPeriod",
                column: "PERFORMANCEREVIEW_REVIEWPERIOD",
                type: "DATE",
            },
            {
                name: "ReviewDate",
                column: "PERFORMANCEREVIEW_REVIEWDATE",
                type: "DATE",
            },
            {
                name: "Rating",
                column: "PERFORMANCEREVIEW_RATING",
                type: "INTEGER",
            },
            {
                name: "Comments",
                column: "PERFORMANCEREVIEW_COMMENTS",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(PerformanceReviewRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: PerformanceReviewEntityOptions): PerformanceReviewEntity[] {
        return this.dao.list(options).map((e: PerformanceReviewEntity) => {
            EntityUtils.setDate(e, "ReviewPeriod");
            EntityUtils.setDate(e, "ReviewDate");
            return e;
        });
    }

    public findById(id: number): PerformanceReviewEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "ReviewPeriod");
        EntityUtils.setDate(entity, "ReviewDate");
        return entity ?? undefined;
    }

    public create(entity: PerformanceReviewCreateEntity): number {
        EntityUtils.setLocalDate(entity, "ReviewPeriod");
        EntityUtils.setLocalDate(entity, "ReviewDate");
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "DEMO_PERFORMANCEREVIEW",
            entity: entity,
            key: {
                name: "Id",
                column: "PERFORMANCEREVIEW_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: PerformanceReviewUpdateEntity): void {
        // EntityUtils.setLocalDate(entity, "ReviewPeriod");
        // EntityUtils.setLocalDate(entity, "ReviewDate");
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "DEMO_PERFORMANCEREVIEW",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "PERFORMANCEREVIEW_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: PerformanceReviewCreateEntity | PerformanceReviewUpdateEntity): number {
        const id = (entity as PerformanceReviewUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as PerformanceReviewUpdateEntity);
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
            table: "DEMO_PERFORMANCEREVIEW",
            entity: entity,
            key: {
                name: "Id",
                column: "PERFORMANCEREVIEW_ID",
                value: id
            }
        });
    }

    public count(options?: PerformanceReviewEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "DEMO_PERFORMANCEREVIEW"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: PerformanceReviewEntityEvent | PerformanceReviewUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-edm-vue-element-plus-PerformanceAndAttendance-PerformanceReview", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-edm-vue-element-plus-PerformanceAndAttendance-PerformanceReview").send(JSON.stringify(data));
    }
}
