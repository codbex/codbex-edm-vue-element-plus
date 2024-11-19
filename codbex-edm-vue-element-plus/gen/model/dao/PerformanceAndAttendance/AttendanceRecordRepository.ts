import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface AttendanceRecordEntity {
    readonly Id: number;
    EmployeeName?: string;
    Date?: Date;
    CheckInTime?: Date;
    CheckOutTime?: Date;
    AttendanceStatus?: number;
    Notes?: string;
}

export interface AttendanceRecordCreateEntity {
    readonly EmployeeName?: string;
    readonly Date?: Date;
    readonly CheckInTime?: Date;
    readonly CheckOutTime?: Date;
    readonly AttendanceStatus?: number;
    readonly Notes?: string;
}

export interface AttendanceRecordUpdateEntity extends AttendanceRecordCreateEntity {
    readonly Id: number;
}

export interface AttendanceRecordEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            EmployeeName?: string | string[];
            Date?: Date | Date[];
            CheckInTime?: Date | Date[];
            CheckOutTime?: Date | Date[];
            AttendanceStatus?: number | number[];
            Notes?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            EmployeeName?: string | string[];
            Date?: Date | Date[];
            CheckInTime?: Date | Date[];
            CheckOutTime?: Date | Date[];
            AttendanceStatus?: number | number[];
            Notes?: string | string[];
        };
        contains?: {
            Id?: number;
            EmployeeName?: string;
            Date?: Date;
            CheckInTime?: Date;
            CheckOutTime?: Date;
            AttendanceStatus?: number;
            Notes?: string;
        };
        greaterThan?: {
            Id?: number;
            EmployeeName?: string;
            Date?: Date;
            CheckInTime?: Date;
            CheckOutTime?: Date;
            AttendanceStatus?: number;
            Notes?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            EmployeeName?: string;
            Date?: Date;
            CheckInTime?: Date;
            CheckOutTime?: Date;
            AttendanceStatus?: number;
            Notes?: string;
        };
        lessThan?: {
            Id?: number;
            EmployeeName?: string;
            Date?: Date;
            CheckInTime?: Date;
            CheckOutTime?: Date;
            AttendanceStatus?: number;
            Notes?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            EmployeeName?: string;
            Date?: Date;
            CheckInTime?: Date;
            CheckOutTime?: Date;
            AttendanceStatus?: number;
            Notes?: string;
        };
    },
    $select?: (keyof AttendanceRecordEntity)[],
    $sort?: string | (keyof AttendanceRecordEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface AttendanceRecordEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<AttendanceRecordEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface AttendanceRecordUpdateEntityEvent extends AttendanceRecordEntityEvent {
    readonly previousEntity: AttendanceRecordEntity;
}

export class AttendanceRecordRepository {

    private static readonly DEFINITION = {
        table: "DEMO_ATTENDANCERECORD",
        properties: [
            {
                name: "Id",
                column: "ATTENDANCERECORD_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "EmployeeName",
                column: "ATTENDANCERECORD_EMPLOYEENAME",
                type: "VARCHAR",
            },
            {
                name: "Date",
                column: "ATTENDANCERECORD_DATE",
                type: "DATE",
            },
            {
                name: "CheckInTime",
                column: "ATTENDANCERECORD_CHECKINTIME",
                type: "TIME",
            },
            {
                name: "CheckOutTime",
                column: "ATTENDANCERECORD_CHECKOUTTIME",
                type: "TIME",
            },
            {
                name: "AttendanceStatus",
                column: "ATTENDANCERECORD_ATTENDANCESTATUS",
                type: "INTEGER",
            },
            {
                name: "Notes",
                column: "ATTENDANCERECORD_NOTES",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(AttendanceRecordRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: AttendanceRecordEntityOptions): AttendanceRecordEntity[] {
        return this.dao.list(options).map((e: AttendanceRecordEntity) => {
            EntityUtils.setDate(e, "Date");
            return e;
        });
    }

    public findById(id: number): AttendanceRecordEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "Date");
        return entity ?? undefined;
    }

    public create(entity: AttendanceRecordCreateEntity): number {
        EntityUtils.setLocalDate(entity, "Date");
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "DEMO_ATTENDANCERECORD",
            entity: entity,
            key: {
                name: "Id",
                column: "ATTENDANCERECORD_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: AttendanceRecordUpdateEntity): void {
        // EntityUtils.setLocalDate(entity, "Date");
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "DEMO_ATTENDANCERECORD",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "ATTENDANCERECORD_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: AttendanceRecordCreateEntity | AttendanceRecordUpdateEntity): number {
        const id = (entity as AttendanceRecordUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as AttendanceRecordUpdateEntity);
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
            table: "DEMO_ATTENDANCERECORD",
            entity: entity,
            key: {
                name: "Id",
                column: "ATTENDANCERECORD_ID",
                value: id
            }
        });
    }

    public count(options?: AttendanceRecordEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "DEMO_ATTENDANCERECORD"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: AttendanceRecordEntityEvent | AttendanceRecordUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-edm-vue-element-plus-PerformanceAndAttendance-AttendanceRecord", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-edm-vue-element-plus-PerformanceAndAttendance-AttendanceRecord").send(JSON.stringify(data));
    }
}
