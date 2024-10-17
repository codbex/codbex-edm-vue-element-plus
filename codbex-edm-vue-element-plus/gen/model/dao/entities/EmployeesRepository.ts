import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface EmployeesEntity {
    readonly Id: number;
    Name?: string;
}

export interface EmployeesCreateEntity {
    readonly Name?: string;
}

export interface EmployeesUpdateEntity extends EmployeesCreateEntity {
    readonly Id: number;
}

export interface EmployeesEntityOptions {
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
    $select?: (keyof EmployeesEntity)[],
    $sort?: string | (keyof EmployeesEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface EmployeesEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<EmployeesEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface EmployeesUpdateEntityEvent extends EmployeesEntityEvent {
    readonly previousEntity: EmployeesEntity;
}

export class EmployeesRepository {

    private static readonly DEFINITION = {
        table: "EMPLOYEES",
        properties: [
            {
                name: "Id",
                column: "EMPLOYEES_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "EMPLOYEES_NAME",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(EmployeesRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: EmployeesEntityOptions): EmployeesEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): EmployeesEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: EmployeesCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "EMPLOYEES",
            entity: entity,
            key: {
                name: "Id",
                column: "EMPLOYEES_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: EmployeesUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "EMPLOYEES",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "EMPLOYEES_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: EmployeesCreateEntity | EmployeesUpdateEntity): number {
        const id = (entity as EmployeesUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as EmployeesUpdateEntity);
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
            table: "EMPLOYEES",
            entity: entity,
            key: {
                name: "Id",
                column: "EMPLOYEES_ID",
                value: id
            }
        });
    }

    public count(options?: EmployeesEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "EMPLOYEES"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: EmployeesEntityEvent | EmployeesUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("project1234-entities-Employees", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("project1234-entities-Employees").send(JSON.stringify(data));
    }
}
