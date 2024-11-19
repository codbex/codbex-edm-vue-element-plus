import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface ContractTypeEntity {
    readonly Id: number;
    Name?: string;
}

export interface ContractTypeCreateEntity {
    readonly Name?: string;
}

export interface ContractTypeUpdateEntity extends ContractTypeCreateEntity {
    readonly Id: number;
}

export interface ContractTypeEntityOptions {
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
    $select?: (keyof ContractTypeEntity)[],
    $sort?: string | (keyof ContractTypeEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface ContractTypeEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<ContractTypeEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface ContractTypeUpdateEntityEvent extends ContractTypeEntityEvent {
    readonly previousEntity: ContractTypeEntity;
}

export class ContractTypeRepository {

    private static readonly DEFINITION = {
        table: "DEMO_CONTRACTTYPE",
        properties: [
            {
                name: "Id",
                column: "CONTRACTTYPE_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "CONTRACTTYPE_NAME",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(ContractTypeRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: ContractTypeEntityOptions): ContractTypeEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): ContractTypeEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: ContractTypeCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "DEMO_CONTRACTTYPE",
            entity: entity,
            key: {
                name: "Id",
                column: "CONTRACTTYPE_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: ContractTypeUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "DEMO_CONTRACTTYPE",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "CONTRACTTYPE_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: ContractTypeCreateEntity | ContractTypeUpdateEntity): number {
        const id = (entity as ContractTypeUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as ContractTypeUpdateEntity);
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
            table: "DEMO_CONTRACTTYPE",
            entity: entity,
            key: {
                name: "Id",
                column: "CONTRACTTYPE_ID",
                value: id
            }
        });
    }

    public count(options?: ContractTypeEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "DEMO_CONTRACTTYPE"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: ContractTypeEntityEvent | ContractTypeUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-edm-vue-element-plus-Settings-ContractType", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-edm-vue-element-plus-Settings-ContractType").send(JSON.stringify(data));
    }
}
