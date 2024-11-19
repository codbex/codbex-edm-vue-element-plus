import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface EmployeeEntity {
    readonly Id: number;
    FullName?: string;
    Email?: string;
    PhoneNumber?: string;
    DateOfJoining?: Date;
    Department?: number;
    Status?: boolean;
}

export interface EmployeeCreateEntity {
    readonly FullName?: string;
    readonly Email?: string;
    readonly PhoneNumber?: string;
    readonly DateOfJoining?: Date;
    readonly Department?: number;
    readonly Status?: boolean;
}

export interface EmployeeUpdateEntity extends EmployeeCreateEntity {
    readonly Id: number;
}

export interface EmployeeEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            FullName?: string | string[];
            Email?: string | string[];
            PhoneNumber?: string | string[];
            DateOfJoining?: Date | Date[];
            Department?: number | number[];
            Status?: boolean | boolean[];
        };
        notEquals?: {
            Id?: number | number[];
            FullName?: string | string[];
            Email?: string | string[];
            PhoneNumber?: string | string[];
            DateOfJoining?: Date | Date[];
            Department?: number | number[];
            Status?: boolean | boolean[];
        };
        contains?: {
            Id?: number;
            FullName?: string;
            Email?: string;
            PhoneNumber?: string;
            DateOfJoining?: Date;
            Department?: number;
            Status?: boolean;
        };
        greaterThan?: {
            Id?: number;
            FullName?: string;
            Email?: string;
            PhoneNumber?: string;
            DateOfJoining?: Date;
            Department?: number;
            Status?: boolean;
        };
        greaterThanOrEqual?: {
            Id?: number;
            FullName?: string;
            Email?: string;
            PhoneNumber?: string;
            DateOfJoining?: Date;
            Department?: number;
            Status?: boolean;
        };
        lessThan?: {
            Id?: number;
            FullName?: string;
            Email?: string;
            PhoneNumber?: string;
            DateOfJoining?: Date;
            Department?: number;
            Status?: boolean;
        };
        lessThanOrEqual?: {
            Id?: number;
            FullName?: string;
            Email?: string;
            PhoneNumber?: string;
            DateOfJoining?: Date;
            Department?: number;
            Status?: boolean;
        };
    },
    $select?: (keyof EmployeeEntity)[],
    $sort?: string | (keyof EmployeeEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface EmployeeEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<EmployeeEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface EmployeeUpdateEntityEvent extends EmployeeEntityEvent {
    readonly previousEntity: EmployeeEntity;
}

export class EmployeeRepository {

    private static readonly DEFINITION = {
        table: "DEMO_EMPLOYEE",
        properties: [
            {
                name: "Id",
                column: "EMPLOYEE_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "FullName",
                column: "EMPLOYEE_FULLNAME",
                type: "VARCHAR",
            },
            {
                name: "Email",
                column: "EMPLOYEE_EMAIL",
                type: "VARCHAR",
            },
            {
                name: "PhoneNumber",
                column: "EMPLOYEE_PHONENUMBER",
                type: "VARCHAR",
            },
            {
                name: "DateOfJoining",
                column: "EMPLOYEE_DATEOFJOINING",
                type: "DATE",
            },
            {
                name: "Department",
                column: "EMPLOYEE_DEPARTMENT",
                type: "INTEGER",
            },
            {
                name: "Status",
                column: "EMPLOYEE_STATUS",
                type: "BOOLEAN",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(EmployeeRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: EmployeeEntityOptions): EmployeeEntity[] {
        return this.dao.list(options).map((e: EmployeeEntity) => {
            EntityUtils.setDate(e, "DateOfJoining");
            EntityUtils.setBoolean(e, "Status");
            return e;
        });
    }

    public findById(id: number): EmployeeEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "DateOfJoining");
        EntityUtils.setBoolean(entity, "Status");
        return entity ?? undefined;
    }

    public create(entity: EmployeeCreateEntity): number {
        EntityUtils.setLocalDate(entity, "DateOfJoining");
        EntityUtils.setBoolean(entity, "Status");
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "DEMO_EMPLOYEE",
            entity: entity,
            key: {
                name: "Id",
                column: "EMPLOYEE_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: EmployeeUpdateEntity): void {
        // EntityUtils.setLocalDate(entity, "DateOfJoining");
        EntityUtils.setBoolean(entity, "Status");
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "DEMO_EMPLOYEE",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "EMPLOYEE_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: EmployeeCreateEntity | EmployeeUpdateEntity): number {
        const id = (entity as EmployeeUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as EmployeeUpdateEntity);
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
            table: "DEMO_EMPLOYEE",
            entity: entity,
            key: {
                name: "Id",
                column: "EMPLOYEE_ID",
                value: id
            }
        });
    }

    public count(options?: EmployeeEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "DEMO_EMPLOYEE"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: EmployeeEntityEvent | EmployeeUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-edm-vue-element-plus-EmployeeManagement-Employee", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-edm-vue-element-plus-EmployeeManagement-Employee").send(JSON.stringify(data));
    }
}
