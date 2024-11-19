import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface AttendanceStatusEntity {
    readonly Id: number;
    Name?: string;
}

export interface AttendanceStatusCreateEntity {
    readonly Name?: string;
}

export interface AttendanceStatusUpdateEntity extends AttendanceStatusCreateEntity {
    readonly Id: number;
}

export interface AttendanceStatusEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
        };
        contains?: {
            Id?: number;
            Name?: string;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
        };
    },
    $select?: (keyof AttendanceStatusEntity)[],
    $sort?: string | (keyof AttendanceStatusEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface AttendanceStatusEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<AttendanceStatusEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface AttendanceStatusUpdateEntityEvent extends AttendanceStatusEntityEvent {
    readonly previousEntity: AttendanceStatusEntity;
}

export class AttendanceStatusRepository {

    private static readonly DEFINITION = {
        table: "DEMO_ATTENDANCESTATUS",
        properties: [
            {
                name: "Id",
                column: "ATTENDANCESTATUS_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "ATTENDANCESTATUS_NAME",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(AttendanceStatusRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: AttendanceStatusEntityOptions): AttendanceStatusEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): AttendanceStatusEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: AttendanceStatusCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "DEMO_ATTENDANCESTATUS",
            entity: entity,
            key: {
                name: "Id",
                column: "ATTENDANCESTATUS_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: AttendanceStatusUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "DEMO_ATTENDANCESTATUS",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "ATTENDANCESTATUS_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: AttendanceStatusCreateEntity | AttendanceStatusUpdateEntity): number {
        const id = (entity as AttendanceStatusUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as AttendanceStatusUpdateEntity);
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
            table: "DEMO_ATTENDANCESTATUS",
            entity: entity,
            key: {
                name: "Id",
                column: "ATTENDANCESTATUS_ID",
                value: id
            }
        });
    }

    public count(options?: AttendanceStatusEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "DEMO_ATTENDANCESTATUS"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: AttendanceStatusEntityEvent | AttendanceStatusUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-edm-vue-element-plus-Settings-AttendanceStatus", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-edm-vue-element-plus-Settings-AttendanceStatus").send(JSON.stringify(data));
    }
}
