import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface EmploymentContractEntity {
    readonly Id: number;
    EmployeeName?: string;
    ContractStart?: Date;
    ContractEnd?: Date;
    Salary?: number;
    ContractType?: number;
    RenewalNoticePeriod?: number;
}

export interface EmploymentContractCreateEntity {
    readonly EmployeeName?: string;
    readonly ContractStart?: Date;
    readonly ContractEnd?: Date;
    readonly Salary?: number;
    readonly ContractType?: number;
    readonly RenewalNoticePeriod?: number;
}

export interface EmploymentContractUpdateEntity extends EmploymentContractCreateEntity {
    readonly Id: number;
}

export interface EmploymentContractEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            EmployeeName?: string | string[];
            ContractStart?: Date | Date[];
            ContractEnd?: Date | Date[];
            Salary?: number | number[];
            ContractType?: number | number[];
            RenewalNoticePeriod?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            EmployeeName?: string | string[];
            ContractStart?: Date | Date[];
            ContractEnd?: Date | Date[];
            Salary?: number | number[];
            ContractType?: number | number[];
            RenewalNoticePeriod?: number | number[];
        };
        contains?: {
            Id?: number;
            EmployeeName?: string;
            ContractStart?: Date;
            ContractEnd?: Date;
            Salary?: number;
            ContractType?: number;
            RenewalNoticePeriod?: number;
        };
        greaterThan?: {
            Id?: number;
            EmployeeName?: string;
            ContractStart?: Date;
            ContractEnd?: Date;
            Salary?: number;
            ContractType?: number;
            RenewalNoticePeriod?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            EmployeeName?: string;
            ContractStart?: Date;
            ContractEnd?: Date;
            Salary?: number;
            ContractType?: number;
            RenewalNoticePeriod?: number;
        };
        lessThan?: {
            Id?: number;
            EmployeeName?: string;
            ContractStart?: Date;
            ContractEnd?: Date;
            Salary?: number;
            ContractType?: number;
            RenewalNoticePeriod?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            EmployeeName?: string;
            ContractStart?: Date;
            ContractEnd?: Date;
            Salary?: number;
            ContractType?: number;
            RenewalNoticePeriod?: number;
        };
    },
    $select?: (keyof EmploymentContractEntity)[],
    $sort?: string | (keyof EmploymentContractEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface EmploymentContractEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<EmploymentContractEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface EmploymentContractUpdateEntityEvent extends EmploymentContractEntityEvent {
    readonly previousEntity: EmploymentContractEntity;
}

export class EmploymentContractRepository {

    private static readonly DEFINITION = {
        table: "DEMO_EMPLOYMENTCONTRACT",
        properties: [
            {
                name: "Id",
                column: "EMPLOYMENTCONTRACT_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "EmployeeName",
                column: "EMPLOYMENTCONTRACT_EMPLOYEENAME",
                type: "VARCHAR",
            },
            {
                name: "ContractStart",
                column: "EMPLOYMENTCONTRACT_CONTRACTSTART",
                type: "DATE",
            },
            {
                name: "ContractEnd",
                column: "EMPLOYMENTCONTRACT_CONTRACTEND",
                type: "DATE",
            },
            {
                name: "Salary",
                column: "EMPLOYMENTCONTRACT_SALARY",
                type: "INTEGER",
            },
            {
                name: "ContractType",
                column: "EMPLOYMENTCONTRACT_CONTRACTTYPE",
                type: "INTEGER",
            },
            {
                name: "RenewalNoticePeriod",
                column: "EMPLOYMENTCONTRACT_RENEWALNOTICEPERIOD",
                type: "INTEGER",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(EmploymentContractRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: EmploymentContractEntityOptions): EmploymentContractEntity[] {
        return this.dao.list(options).map((e: EmploymentContractEntity) => {
            EntityUtils.setDate(e, "ContractStart");
            EntityUtils.setDate(e, "ContractEnd");
            return e;
        });
    }

    public findById(id: number): EmploymentContractEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "ContractStart");
        EntityUtils.setDate(entity, "ContractEnd");
        return entity ?? undefined;
    }

    public create(entity: EmploymentContractCreateEntity): number {
        EntityUtils.setLocalDate(entity, "ContractStart");
        EntityUtils.setLocalDate(entity, "ContractEnd");
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "DEMO_EMPLOYMENTCONTRACT",
            entity: entity,
            key: {
                name: "Id",
                column: "EMPLOYMENTCONTRACT_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: EmploymentContractUpdateEntity): void {
        // EntityUtils.setLocalDate(entity, "ContractStart");
        // EntityUtils.setLocalDate(entity, "ContractEnd");
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "DEMO_EMPLOYMENTCONTRACT",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "EMPLOYMENTCONTRACT_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: EmploymentContractCreateEntity | EmploymentContractUpdateEntity): number {
        const id = (entity as EmploymentContractUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as EmploymentContractUpdateEntity);
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
            table: "DEMO_EMPLOYMENTCONTRACT",
            entity: entity,
            key: {
                name: "Id",
                column: "EMPLOYMENTCONTRACT_ID",
                value: id
            }
        });
    }

    public count(options?: EmploymentContractEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "DEMO_EMPLOYMENTCONTRACT"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: EmploymentContractEntityEvent | EmploymentContractUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-edm-vue-element-plus-EmployeeManagement-EmploymentContract", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-edm-vue-element-plus-EmployeeManagement-EmploymentContract").send(JSON.stringify(data));
    }
}
